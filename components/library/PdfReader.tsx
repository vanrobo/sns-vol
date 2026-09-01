"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  publicationId: string;
  title: string;
  sourceUrl?: string;
};

type Layout = {
  spread: boolean;
  pageWidth: number;
};

function measureLayout(width: number, height: number): Layout {
  const landscape = width > height;
  const spread = landscape && width >= 520;
  const gutter = spread ? 12 : 16;

  const pageWidth = spread
    ? Math.floor((width - gutter) / 2)
    : Math.min(Math.floor(width - gutter), 520);

  return { spread, pageWidth: Math.max(pageWidth, 160) };
}

export default function PdfReader({ publicationId, title, sourceUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>({ spread: false, pageWidth: 300 });
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileUrl = useMemo(
    () => `/api/library/pdf/${publicationId}`,
    [publicationId],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setLayout(measureLayout(rect.width, rect.height));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNumPages(0);
    setPage(1);
  }, [publicationId]);

  const onLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setPage(1);
    setLoading(false);
    setError(null);
  }, []);

  const onLoadError = useCallback(() => {
    setLoading(false);
    setError("Could not load this PDF. Check the link or try again later.");
  }, []);

  const { spread, pageWidth } = layout;
  const rightPage = spread && page + 1 <= numPages ? page + 1 : null;

  const prev = () => {
    if (!spread) {
      setPage((p) => Math.max(1, p - 1));
      return;
    }
    if (page === numPages && numPages % 2 === 1) {
      setPage(Math.max(1, numPages - 2));
      return;
    }
    setPage((p) => Math.max(1, p - 2));
  };

  const next = () => {
    if (!spread) {
      setPage((p) => Math.min(numPages, p + 1));
      return;
    }
    if (page + 2 <= numPages) {
      setPage((p) => p + 2);
      return;
    }
    if (page < numPages) {
      setPage(numPages);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.15).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.15).toFixed(2)));

  const pageLabel = rightPage ? `${page}–${rightPage}` : String(page);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--surface-muted)]">
      <div className="shrink-0 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <BookOpen size={18} className="text-[var(--brand)] shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{title}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {spread ? "Landscape · 2-page spread" : "Portrait · single page"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={zoomOut}
            disabled={!!error}
            className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-bold w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={!!error}
            className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto flex justify-center items-start p-3 sm:p-4"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 gap-3 m-auto">
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
        ) : (
          <div className="relative w-full max-w-full flex justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
              </div>
            )}
            <Document
              file={fileUrl}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              loading=""
              className={`bg-white shadow-xl rounded-lg overflow-hidden ${
                spread ? "inline-flex flex-row gap-1.5 shrink-0" : ""
              }`}
            >
              <Page
                pageNumber={page}
                width={pageWidth}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
                className="shrink-0"
              />
              {rightPage && (
                <Page
                  pageNumber={rightPage}
                  width={pageWidth}
                  scale={scale}
                  renderTextLayer
                  renderAnnotationLayer
                  className="shrink-0"
                />
              )}
            </Document>
          </div>
        )}
      </div>

      <div className="shrink-0 mt-auto px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={prev}
          disabled={page <= 1 || !!error}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border)] font-bold text-sm disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <p className="text-xs font-bold text-[var(--text-muted)] text-center">
          Page {pageLabel} of {numPages || "—"}
        </p>
        <button
          type="button"
          onClick={next}
          disabled={page >= numPages || !!error}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--brand)] text-white font-bold text-sm disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
