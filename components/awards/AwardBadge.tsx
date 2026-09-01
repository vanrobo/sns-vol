"use client";

import { useRef } from "react";
import { Download, Share2 } from "lucide-react";
import type { UserAward } from "@/types";
import toast from "react-hot-toast";

type Props = {
  award: UserAward;
  volunteerName?: string;
  size?: number;
  showActions?: boolean;
  iconOnlyActions?: boolean;
  variant?: "compact" | "full";
};

function wrapTitle(title: string, max = 20) {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function exportSvgAsPng(svg: SVGSVGElement, filename: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  image.onload = () => {
    const exportSize = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportSize, exportSize);
    ctx.drawImage(image, 0, 0, exportSize, exportSize);
    URL.revokeObjectURL(url);

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);
    toast.error("Could not export award image.");
  };

  image.src = url;
}

function CompactMedallion({
  award,
  size,
  svgRef,
}: {
  award: UserAward;
  size: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const accent = award.color ?? "#34c759";

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-hidden
      className="drop-shadow-md"
    >
      <defs>
        <linearGradient id={`ring-${award.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#ring-${award.id})`} />
      <circle cx="100" cy="100" r="82" fill="#faf8f3" />
      <circle cx="100" cy="100" r="78" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.45" />
      <polygon
        points="100,34 104,46 117,46 107,54 111,66 100,58 89,66 93,54 83,46 96,46"
        fill={accent}
      />
      <circle cx="100" cy="96" r="28" fill={accent} opacity="0.12" />
      <text
        x="100"
        y="103"
        textAnchor="middle"
        fill={accent}
        fontSize="26"
        fontWeight="700"
        fontFamily="Georgia, serif"
      >
        ★
      </text>
      <path
        d="M62 142 Q100 156 138 142 L132 152 Q100 164 68 152 Z"
        fill={accent}
        opacity="0.9"
      />
      <text
        x="100"
        y="149"
        textAnchor="middle"
        fill="#fff"
        fontSize="7"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="1"
      >
        SNS FAMILY
      </text>
    </svg>
  );
}

function FullMedallion({
  award,
  volunteerName,
  size,
  svgRef,
}: {
  award: UserAward;
  volunteerName?: string;
  size: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const accent = award.color ?? "#c9a227";
  const titleLines = wrapTitle(award.title);
  const dateLabel = new Date(award.awarded_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      width={size}
      height={size}
      role="img"
      aria-label={`${award.title} award badge`}
      className="drop-shadow-lg"
    >
      <defs>
        <linearGradient id={`gold-${award.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6b8" />
          <stop offset="50%" stopColor={accent} />
          <stop offset="100%" stopColor="#5b4a12" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="194" fill="#0f172a" />
      <circle cx="200" cy="200" r="188" fill="none" stroke={`url(#gold-${award.id})`} strokeWidth="3" />
      <circle cx="200" cy="200" r="162" fill="#faf8f3" />
      <polygon
        points="200,52 208,74 232,74 213,88 221,112 200,98 179,112 187,88 168,74 192,74"
        fill={`url(#gold-${award.id})`}
      />
      <text
        x="200"
        y="118"
        textAnchor="middle"
        fill="#334155"
        fontSize="16"
        fontWeight="700"
        fontFamily="Georgia, serif"
        letterSpacing="2.5"
      >
        SNS AWARD
      </text>
      {volunteerName && (
        <text
          x="200"
          y="140"
          textAnchor="middle"
          fill="#64748b"
          fontSize="12"
          fontFamily="Georgia, serif"
        >
          {volunteerName}
        </text>
      )}
      {titleLines.map((line, index) => (
        <text
          key={line}
          x="200"
          y={168 + index * 26}
          textAnchor="middle"
          fill="#111827"
          fontSize={index === 0 ? 20 : 17}
          fontWeight="700"
          fontFamily="Georgia, serif"
        >
          {line}
        </text>
      ))}
      <path
        d="M118 286 Q200 318 282 286 L272 304 Q200 332 128 304 Z"
        fill={`url(#gold-${award.id})`}
      />
      <text
        x="200"
        y="300"
        textAnchor="middle"
        fill="#111827"
        fontSize="10"
        fontWeight="700"
        fontFamily="Georgia, serif"
        letterSpacing="1.2"
      >
        {dateLabel.toUpperCase()}
      </text>
      <text x="200" y="336" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="Georgia, serif">
        SNS Family
      </text>
    </svg>
  );
}

export default function AwardBadge({
  award,
  volunteerName,
  size,
  showActions = true,
  iconOnlyActions = false,
  variant = "full",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const displaySize = size ?? (variant === "compact" ? 132 : 220);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const safeName = award.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    exportSvgAsPng(svgRef.current, `sns-award-${safeName}.png`);
    toast.success("Award image saved");
  };

  const handleShare = async () => {
    if (!svgRef.current) return;
    const safeName = award.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    try {
      const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const serialized = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
      const file = new File([blob], `sns-award-${safeName}.svg`, {
        type: "image/svg+xml",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: award.title,
          text: `I earned the ${award.title} award with SNS Family!`,
          files: [file],
        });
        return;
      }
    } catch {
      /* fall through */
    }

    handleDownload();
  };

  const actionBtnClass = iconOnlyActions
    ? "p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--brand)] active:scale-95 transition-transform"
    : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-bold";

  const shareBtnClass = iconOnlyActions
    ? "p-2 rounded-full bg-[var(--brand)] text-white active:scale-95 transition-transform"
    : "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--brand)] text-white text-xs font-bold";

  return (
    <div className="flex flex-col items-center gap-2">
      {variant === "compact" ? (
        <CompactMedallion award={award} size={displaySize} svgRef={svgRef} />
      ) : (
        <FullMedallion
          award={award}
          volunteerName={volunteerName}
          size={displaySize}
          svgRef={svgRef}
        />
      )}

      {showActions && (
        <div className={`flex items-center ${iconOnlyActions ? "gap-1.5" : "gap-2"}`}>
          <button
            type="button"
            onClick={handleDownload}
            className={actionBtnClass}
            aria-label="Save award image"
            title="Save image"
          >
            <Download size={iconOnlyActions ? 16 : 14} />
            {!iconOnlyActions && "Save image"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className={shareBtnClass}
            aria-label="Share award"
            title="Share"
          >
            <Share2 size={iconOnlyActions ? 16 : 14} />
            {!iconOnlyActions && "Share"}
          </button>
        </div>
      )}
    </div>
  );
}
