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
import { pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
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

async function renderPdfPages(
  url: string,
  targetWidth: number,
  onProgress?: (done: number, total: number) => void,
): Promise<{ images: string[]; pageWidth: number; pageHeight: number }> {
  const pdf = await pdfjs.getDocument({ url }).promise;
  const total = pdf.numPages;
  const images: string[] = [];
  let pageWidth = targetWidth;
  let pageHeight = Math.round(targetWidth * 1.414);

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = targetWidth / base.width;
    const viewport = page.getViewport({ scale });
    pageWidth = Math.floor(viewport.width);
    pageHeight = Math.floor(viewport.height);

    const canvas = document.createElement("canvas");
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.88));
    onProgress?.(i, total);
  }

  return { images, pageWidth, pageHeight };
}

export default function PdfReader({ publicationId, title, sourceUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipApi | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState({ width: 320, height: 452 });
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [bookKey, setBookKey] = useState(0);

  const fileUrl = useMemo(
    () => `/api/library/pdf/${publicationId}`,
    [publicationId],
  );

  const measureTargetWidth = useCallback((fullscreenMode: boolean) => {
    const el = containerRef.current;
    if (!el) return fullscreenMode ? 420 : 320;
    const rect = el.getBoundingClientRect();
    const landscape = rect.width > rect.height;
    if (landscape) {
      return Math.max(180, Math.floor((rect.width - 24) / 2));
    }
    return Math.max(200, Math.floor(rect.width - (fullscreenMode ? 8 : 24)));
  }, []);

  const loadBook = useCallback(
    async (fullscreenMode: boolean) => {
      setLoading(true);
      setError(null);
      setImages([]);
      setPageIndex(0);
      setProgress({ done: 0, total: 0 });
      try {
        const targetWidth = measureTargetWidth(fullscreenMode);
        const result = await renderPdfPages(fileUrl, targetWidth, (done, total) =>
          setProgress({ done, total }),
        );
        setImages(result.images);
        setPageSize({ width: result.pageWidth, height: result.pageHeight });
        setBookKey((k) => k + 1);
      } catch {
        setError("Could not load this PDF. Check the link or try again later.");
      } finally {
        setLoading(false);
      }
    },
    [fileUrl, measureTargetWidth],
  );

  useEffect(() => {
    void loadBook(fullscreen);
  }, [loadBook, fullscreen, publicationId]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") bookRef.current?.pageFlip().flipNext();
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const onFlip = useCallback((e: { data: number }) => {
    setPageIndex(e.data);
  }, []);

  const flipPrev = () => bookRef.current?.pageFlip().flipPrev();
  const flipNext = () => bookRef.current?.pageFlip().flipNext();

  const pageLabel = `${pageIndex + 1}`;
  const chrome = !fullscreen;
  const usePortrait =
    typeof window === "undefined"
      ? true
      : window.innerWidth < window.innerHeight || window.innerWidth < 700;

  return (
    <div
      className={`flex min-h-0 flex-col bg-[var(--surface-muted)] ${
        fullscreen
          ? "fixed inset-0 z-[10000] h-[100dvh] w-screen max-w-none"
          : "h-full"
      }`}
    >
      {chrome && (
        <div className="shrink-0 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2">
            <BookOpen size={18} className="text-[var(--brand)] shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{title}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Flipbook · drag or tap page corners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            disabled={!!error || loading}
            className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-40"
            aria-label="Full screen"
            title="Full screen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`flex-1 min-h-0 overflow-hidden flex justify-center items-center ${
          fullscreen ? "p-1 bg-neutral-950" : "p-3 sm:p-4 bg-slate-200/60 dark:bg-[#0c0c0c]"
        }`}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 gap-3">
            <p className="text-sm text-red-600">{error}</p>
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
              Preparing flipbook…
              {progress.total > 0
                ? ` ${progress.done}/${progress.total} pages`
                : ""}
            </p>
          </div>
        ) : (
          // @ts-expect-error react-pageflip props are loosely typed for dynamic import
          <HTMLFlipBook
            key={bookKey}
            ref={bookRef}
            width={pageSize.width}
            height={pageSize.height}
            size="fixed"
            minWidth={180}
            maxWidth={pageSize.width}
            minHeight={240}
            maxHeight={pageSize.height}
            drawShadow
            flippingTime={900}
            usePortrait={usePortrait}
            startZIndex={0}
            autoSize
            maxShadowOpacity={0.55}
            showCover
            mobileScrollSupport
            clickEventForward={false}
            useMouseEvents
            swipeDistance={25}
            showPageCorners
            disableFlipByClick={false}
            className="sns-flipbook shadow-2xl"
            style={{ margin: "0 auto" }}
            onFlip={onFlip}
          >
            {images.map((src, i) => (
              <FlipPage key={`${bookKey}-${i}`} hard={i === 0 || i === images.length - 1}>
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

      {chrome ? (
        <div className="shrink-0 mt-auto px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={flipPrev}
            disabled={loading || pageIndex <= 0 || !!error}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border)] font-bold text-sm disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <p className="text-xs font-bold text-[var(--text-muted)] text-center">
            Page {pageLabel} of {images.length || "—"}
          </p>
          <button
            type="button"
            onClick={flipNext}
            disabled={loading || pageIndex >= images.length - 1 || !!error}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--brand)] text-white font-bold text-sm disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
          <p className="text-[11px] font-bold text-white/90 bg-black/50 px-2 py-1 rounded-lg">
            {pageLabel}/{images.length || "—"}
          </p>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={flipPrev}
              className="p-2 rounded-lg bg-black/60 text-white border border-white/20"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={flipNext}
              className="p-2 rounded-lg bg-black/60 text-white border border-white/20"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="p-2 rounded-lg bg-black/60 text-white border border-white/20"
              aria-label="Exit full screen"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
