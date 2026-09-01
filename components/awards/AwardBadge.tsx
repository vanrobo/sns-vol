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
};

function wrapTitle(title: string, max = 22) {
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
  return lines.slice(0, 3);
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

export default function AwardBadge({
  award,
  volunteerName,
  size = 260,
  showActions = true,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const accent = award.color ?? "#c9a227";
  const titleLines = wrapTitle(award.title);
  const dateLabel = new Date(award.awarded_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

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
      /* fall through to download */
    }

    handleDownload();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        width={size}
        height={size}
        role="img"
        aria-label={`${award.title} award badge`}
        className="drop-shadow-xl"
      >
        <defs>
          <radialGradient id={`badgeGlow-${award.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`gold-${award.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e6b8" />
            <stop offset="50%" stopColor={accent} />
            <stop offset="100%" stopColor="#8a6a12" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="200" r="196" fill="#0b1220" />
        <circle cx="200" cy="200" r="196" fill={`url(#badgeGlow-${award.id})`} />
        <circle
          cx="200"
          cy="200"
          r="188"
          fill="none"
          stroke={`url(#gold-${award.id})`}
          strokeWidth="4"
        />

        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          const x = 200 + Math.cos(angle) * 176;
          const y = 200 + Math.sin(angle) * 176;
          return <circle key={i} cx={x} cy={y} r="2.2" fill={accent} opacity="0.85" />;
        })}

        <circle cx="200" cy="200" r="158" fill="#f8f4ea" />
        <circle cx="200" cy="200" r="152" fill="none" stroke="#1e293b" strokeWidth="1.5" />

        <path
          d="M72 228 C95 150, 118 118, 145 102"
          fill="none"
          stroke={`url(#gold-${award.id})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M328 228 C305 150, 282 118, 255 102"
          fill="none"
          stroke={`url(#gold-${award.id})`}
          strokeWidth="5"
          strokeLinecap="round"
        />

        <polygon
          points="200,58 208,78 230,78 213,91 220,112 200,99 180,112 187,91 170,78 192,78"
          fill={`url(#gold-${award.id})`}
        />

        <text
          x="200"
          y="128"
          textAnchor="middle"
          fill="#111827"
          fontSize="18"
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="3"
        >
          SNS AWARD
        </text>

        {volunteerName && (
          <text
            x="200"
            y="150"
            textAnchor="middle"
            fill="#475569"
            fontSize="12"
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            {volunteerName}
          </text>
        )}

        {titleLines.map((line, index) => (
          <text
            key={line}
            x="200"
            y={178 + index * 24}
            textAnchor="middle"
            fill="#111827"
            fontSize={index === 0 ? 22 : 18}
            fontWeight="700"
            fontFamily="Georgia, 'Times New Roman', serif"
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
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1.5"
        >
          {dateLabel.toUpperCase()}
        </text>

        <text
          x="200"
          y="338"
          textAnchor="middle"
          fill="#64748b"
          fontSize="11"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          SNS Family
        </text>

        <polygon points="188,348 200,360 212,348" fill={accent} />
        <circle cx="176" cy="352" r="4" fill={accent} />
        <circle cx="200" cy="356" r="4.5" fill={accent} />
        <circle cx="224" cy="352" r="4" fill={accent} />
      </svg>

      {showActions && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-bold"
          >
            <Download size={14} />
            Save image
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--brand)] text-white text-xs font-bold"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      )}
    </div>
  );
}
