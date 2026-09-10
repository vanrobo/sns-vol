"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { pdfjs } from "react-pdf";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

type Props = {
  publicationId: string;
  title: string;
  sourceUrl?: string;
};

type FlipApi = {
  pageFlip: () => {
    flipNext: (corner?: string) => void;
    flipPrev: (corner?: string) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
};

const FlipPage = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; hard?: boolean }
>(function FlipPage({ children, hard }, ref) {
  return (
    <div
      ref={ref}
      data-density={hard ? "hard" : "soft"}
      className="bg-white overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </div>
  );
});

function viewportSize() {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  return {
    w: Math.floor(vv?.width ?? window.innerWidth),
    h: Math.floor(vv?.height ?? window.innerHeight),
  };
}

/** Fit one page (or half of a spread) into the viewport with almost no margin. */
function fitPageSize(
  containerW: number,
  containerH: number,
  aspect: number,
  spread: boolean,
) {
  const pad = 2;
  const availW = Math.max(120, containerW - pad);
  const availH = Math.max(160, containerH - pad);

  let pageW: number;
  if (spread) {
    pageW = Math.min(availW / 2, availH / aspect);
  } else {
    // Prefer filling the phone width; shrink only if height would clip.
    pageW = Math.min(availW, availH / aspect);
  }
  pageW = Math.floor(Math.max(120, pageW));
  const pageH = Math.floor(pageW * aspect);
  return { pageW, pageH };
}

async function renderPdfPages(
  url: string,
  displayWidth: number,
  onProgress?: (done: number, total: number) => void,
): Promise<{ images: string[]; aspect: number }> {
  const pdf = await pdfjs.getDocument({ url }).promise;
  const total = pdf.numPages;
  const images: string[] = [];

  const first = await pdf.getPage(1);
  const base0 = first.getViewport({ scale: 1 });
  const aspect = base0.height / base0.width;
  const renderWidth = Math.min(1400, Math.max(640, Math.floor(displayWidth * 2)));

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = renderWidth / base.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.9));
    onProgress?.(i, total);
  }

  return { images, aspect };
}

export default function PdfReader({ publicationId, title, sourceUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipApi | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState({ width: 280, height: 396 });
  const [aspect, setAspect] = useState(1.414);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [bookKey, setBookKey] = useState(0);
  const [spread, setSpread] = useState(false);
  const [showChrome, setShowChrome] = useState(false);

  const fileUrl = useMemo(
    () => `/api/library/pdf/${publicationId}`,
    [publicationId],
  );

  const remeasureDisplay = useCallback((pageAspect: number) => {
    const el = containerRef.current;
    const { w: vw, h: vh } = viewportSize();
    const rect = el?.getBoundingClientRect();
    const width = Math.floor(rect?.width || vw);
    const height = Math.floor(rect?.height || vh);
    const isSpread = width > height && width >= 560;
    const { pageW, pageH } = fitPageSize(width, height, pageAspect, isSpread);
    return { width: pageW, height: pageH, spread: isSpread };
  }, []);

  const applyFit = useCallback(
    (pageAspect: number) => {
      const fitted = remeasureDisplay(pageAspect);
      setPageSize({ width: fitted.width, height: fitted.height });
      setSpread(fitted.spread);
      setBookKey((k) => k + 1);
    },
    [remeasureDisplay],
  );

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImages([]);
    setPageIndex(0);
    setProgress({ done: 0, total: 0 });

    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 50));

    try {
      const probe = remeasureDisplay(1.414);
      const result = await renderPdfPages(fileUrl, probe.width, (done, total) =>
        setProgress({ done, total }),
      );
      setAspect(result.aspect);
      const fitted = remeasureDisplay(result.aspect);
      setPageSize({ width: fitted.width, height: fitted.height });
      setSpread(fitted.spread);
      setImages(result.images);
      setBookKey((k) => k + 1);
      // Second pass after layout settles (mobile browser chrome)
      requestAnimationFrame(() => applyFit(result.aspect));
    } catch {
      setError("Could not load this PDF. Check the link or try again later.");
    } finally {
      setLoading(false);
    }
  }, [fileUrl, remeasureDisplay, applyFit]);

  useEffect(() => {
    void loadBook();
  }, [loadBook, publicationId]);

  useEffect(() => {
    if (!images.length) return;
    const onResize = () => applyFit(aspect);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [images.length, aspect, applyFit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") bookRef.current?.pageFlip().flipNext();
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bumpChrome = useCallback(() => {
    setShowChrome(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowChrome(false), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setPageIndex(e.data);
  }, []);

  const flipPrev = () => bookRef.current?.pageFlip().flipPrev();
  const flipNext = () => bookRef.current?.pageFlip().flipNext();

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col h-[100dvh] w-screen max-w-none bg-slate-100 dark:bg-[#121212]">
      {/* Tap empty area to briefly show controls — hidden by default on mobile */}
      {showChrome && (
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between gap-2 p-2 bg-gradient-to-b from-black/35 to-transparent">
          <Link
            href="/library"
            className="inline-flex items-center gap-1 rounded-full bg-white/95 text-[var(--text)] text-xs font-bold px-3 py-2 shadow-sm"
          >
            <ArrowLeft size={14} />
            Library
          </Link>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-white/95 text-[var(--text)] text-[11px] font-bold px-2.5 py-2 shadow-sm tabular-nums">
              {images.length ? `${pageIndex + 1}/${images.length}` : "—"}
            </span>
            <button
              type="button"
              onClick={flipPrev}
              disabled={loading || pageIndex <= 0 || !!error}
              className="p-2 rounded-full bg-white/95 shadow-sm disabled:opacity-35"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={flipNext}
              disabled={loading || pageIndex >= images.length - 1 || !!error}
              className="p-2 rounded-full bg-white/95 shadow-sm disabled:opacity-35"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-hidden flex justify-center items-center"
        onClick={(e) => {
          // Don't steal flips from the book — only empty margins toggle chrome
          if (e.target === e.currentTarget) bumpChrome();
        }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <Link href="/library" className="text-sm font-bold text-[var(--brand)]">
              Back to library
            </Link>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] underline"
              >
                Open original PDF
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : loading || images.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
            <p className="text-sm font-medium text-[var(--text-muted)]">
              Preparing…
              {progress.total > 0 ? ` ${progress.done}/${progress.total}` : ""}
            </p>
          </div>
        ) : (
          <div
            className="relative"
            onClick={(e) => {
              e.stopPropagation();
              bumpChrome();
            }}
          >
            {/* @ts-expect-error react-pageflip dynamic import typing */}
            <HTMLFlipBook
              key={bookKey}
              ref={bookRef}
              width={pageSize.width}
              height={pageSize.height}
              size="fixed"
              minWidth={100}
              maxWidth={pageSize.width}
              minHeight={140}
              maxHeight={pageSize.height}
              drawShadow
              flippingTime={800}
              usePortrait={!spread}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.4}
              showCover={false}
              mobileScrollSupport
              clickEventForward={false}
              useMouseEvents
              swipeDistance={20}
              showPageCorners
              disableFlipByClick={false}
              className="sns-flipbook"
              style={{ margin: "0 auto" }}
              onFlip={onFlip}
            >
              {images.map((src, i) => (
                <FlipPage key={`${bookKey}-${i}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${title} — page ${i + 1}`}
                    draggable={false}
                    className="block w-full h-full object-contain select-none pointer-events-none"
                  />
                </FlipPage>
              ))}
            </HTMLFlipBook>
          </div>
        )}
      </div>

      {!showChrome && !loading && !error && (
        <p className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-[10px] text-[var(--text-muted)]">
          Tap page for controls · swipe to flip
        </p>
      )}
    </div>
  );
}
