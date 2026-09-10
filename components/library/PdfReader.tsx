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
  Maximize2,
  Minimize2,
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

function fitPageSize(
  containerW: number,
  containerH: number,
  aspect: number,
  spread: boolean,
) {
  const pad = 8;
  const availW = Math.max(120, containerW - pad);
  const availH = Math.max(160, containerH - pad);

  // aspect = pageHeight / pageWidth
  let pageW: number;
  if (spread) {
    // two pages side by side
    pageW = Math.min(availW / 2, availH / aspect);
  } else {
    pageW = Math.min(availW, availH / aspect);
  }
  pageW = Math.floor(Math.max(140, pageW));
  const pageH = Math.floor(pageW * aspect);
  return { pageW, pageH };
}

async function renderPdfPages(
  url: string,
  displayWidth: number,
  onProgress?: (done: number, total: number) => void,
): Promise<{
  images: string[];
  pageWidth: number;
  pageHeight: number;
  aspect: number;
}> {
  const pdf = await pdfjs.getDocument({ url }).promise;
  const total = pdf.numPages;
  const images: string[] = [];

  const first = await pdf.getPage(1);
  const base0 = first.getViewport({ scale: 1 });
  const aspect = base0.height / base0.width;

  // Render a bit sharper than display size for crisp text
  const renderWidth = Math.min(1200, Math.floor(displayWidth * 1.5));

  let pageWidth = displayWidth;
  let pageHeight = Math.round(displayWidth * aspect);

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

  pageWidth = displayWidth;
  pageHeight = Math.floor(displayWidth * aspect);

  return { images, pageWidth, pageHeight, aspect };
}

export default function PdfReader({ publicationId, title, sourceUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipApi | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState({ width: 280, height: 396 });
  const [aspect, setAspect] = useState(1.414);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [immersive, setImmersive] = useState(true);
  const [bookKey, setBookKey] = useState(0);
  const [spread, setSpread] = useState(false);

  const fileUrl = useMemo(
    () => `/api/library/pdf/${publicationId}`,
    [publicationId],
  );

  const remeasureDisplay = useCallback(
    (pageAspect: number) => {
      const el = containerRef.current;
      if (!el) return { width: 280, height: 396, spread: false };
      const rect = el.getBoundingClientRect();
      const isSpread = rect.width > rect.height && rect.width >= 560;
      const { pageW, pageH } = fitPageSize(
        rect.width,
        rect.height,
        pageAspect,
        isSpread,
      );
      return { width: pageW, height: pageH, spread: isSpread };
    },
    [],
  );

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImages([]);
    setPageIndex(0);
    setProgress({ done: 0, total: 0 });

    // Wait a frame so container has real size (especially immersive)
    await new Promise((r) => requestAnimationFrame(() => r(null)));

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
    } catch {
      setError("Could not load this PDF. Check the link or try again later.");
    } finally {
      setLoading(false);
    }
  }, [fileUrl, remeasureDisplay]);

  useEffect(() => {
    void loadBook();
  }, [loadBook, publicationId]);

  // Refit when rotating / resizing without full re-render of images
  useEffect(() => {
    if (!images.length) return;
    const onResize = () => {
      const fitted = remeasureDisplay(aspect);
      setPageSize({ width: fitted.width, height: fitted.height });
      setSpread(fitted.spread);
      setBookKey((k) => k + 1);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [images.length, aspect, remeasureDisplay]);

  useEffect(() => {
    if (!immersive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImmersive(false);
      if (e.key === "ArrowRight") bookRef.current?.pageFlip().flipNext();
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive]);

  const onFlip = useCallback((e: { data: number }) => {
    setPageIndex(e.data);
  }, []);

  const flipPrev = () => bookRef.current?.pageFlip().flipPrev();
  const flipNext = () => bookRef.current?.pageFlip().flipNext();

  return (
    <div
      className={`flex min-h-0 flex-col ${
        immersive
          ? "fixed inset-0 z-[10000] h-[100dvh] w-screen max-w-none bg-neutral-950"
          : "h-full bg-[var(--surface-muted)]"
      }`}
    >
      {/* Floating chrome — does not steal layout height from the book */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between gap-2 p-2 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <Link
            href="/library"
            className="inline-flex items-center gap-1 rounded-lg bg-black/55 text-white text-xs font-bold px-2.5 py-2 border border-white/15 backdrop-blur-sm"
          >
            <ArrowLeft size={14} />
            Library
          </Link>
          {!immersive && (
            <span className="hidden sm:inline max-w-[40vw] truncate rounded-lg bg-black/45 text-white text-[11px] font-semibold px-2 py-2 border border-white/10">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className="rounded-lg bg-black/55 text-white text-[11px] font-bold px-2 py-2 border border-white/15 tabular-nums">
            {images.length
              ? `${pageIndex + 1}/${images.length}`
              : "—"}
          </span>
          <button
            type="button"
            onClick={flipPrev}
            disabled={loading || pageIndex <= 0 || !!error}
            className="p-2 rounded-lg bg-black/55 text-white border border-white/15 disabled:opacity-35"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={flipNext}
            disabled={loading || pageIndex >= images.length - 1 || !!error}
            className="p-2 rounded-lg bg-black/55 text-white border border-white/15 disabled:opacity-35"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => setImmersive((v) => !v)}
            disabled={!!error || loading}
            className="p-2 rounded-lg bg-black/55 text-white border border-white/15 disabled:opacity-35"
            aria-label={immersive ? "Exit full screen" : "Full screen"}
            title={immersive ? "Exit full screen" : "Full screen"}
          >
            {immersive ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-hidden flex justify-center items-center"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 gap-3">
            <p className="text-sm text-red-500">{error}</p>
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
            <p className="text-sm font-medium text-white/80">
              Preparing flipbook…
              {progress.total > 0
                ? ` ${progress.done}/${progress.total}`
                : ""}
            </p>
          </div>
        ) : (
          // @ts-expect-error react-pageflip dynamic import typing
          <HTMLFlipBook
            key={bookKey}
            ref={bookRef}
            width={pageSize.width}
            height={pageSize.height}
            size="fixed"
            minWidth={120}
            maxWidth={pageSize.width}
            minHeight={160}
            maxHeight={pageSize.height}
            drawShadow
            flippingTime={850}
            usePortrait={!spread}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.5}
            showCover
            mobileScrollSupport
            clickEventForward={false}
            useMouseEvents
            swipeDistance={22}
            showPageCorners
            disableFlipByClick={false}
            className="sns-flipbook"
            style={{ margin: "0 auto" }}
            onFlip={onFlip}
          >
            {images.map((src, i) => (
              <FlipPage
                key={`${bookKey}-${i}`}
                hard={i === 0 || i === images.length - 1}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Page ${i + 1}`}
                  draggable={false}
                  className="block w-full h-full object-contain select-none pointer-events-none"
                />
              </FlipPage>
            ))}
          </HTMLFlipBook>
        )}
      </div>
    </div>
  );
}
