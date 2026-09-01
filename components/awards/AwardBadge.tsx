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
  showVolunteerName?: boolean;
};

function wrapTitle(title: string, max = 18) {
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

function MedallionSvg({
  award,
  volunteerName,
  size,
  svgRef,
  showVolunteerName = false,
}: {
  award: UserAward;
  volunteerName?: string;
  size: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  showVolunteerName?: boolean;
}) {
  const accent = award.color ?? "#c9a227";
  const titleLines = wrapTitle(award.title);
  const dateLabel = new Date(award.awarded_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const titleStartY = showVolunteerName && volunteerName ? 172 : 158;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      width={size}
      height={size}
      role="img"
      aria-label={`${award.title} award badge`}
      className="drop-shadow-md"
    >
      <defs>
        <radialGradient id={`glow-${award.id}`} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`gold-${award.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7e7b8" />
          <stop offset="45%" stopColor={accent} />
          <stop offset="100%" stopColor="#6b5418" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="196" fill="#0b1220" />
      <circle cx="200" cy="200" r="196" fill={`url(#glow-${award.id})`} />
      <circle
        cx="200"
        cy="200"
        r="188"
        fill="none"
        stroke={`url(#gold-${award.id})`}
        strokeWidth="3.5"
      />

      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const x = 200 + Math.cos(angle) * 176;
        const y = 200 + Math.sin(angle) * 176;
        return <circle key={i} cx={x} cy={y} r="2" fill={accent} opacity="0.9" />;
      })}

      <circle cx="200" cy="200" r="158" fill="#f8f4ea" />
      <circle cx="200" cy="200" r="152" fill="none" stroke="#1e293b" strokeWidth="1.2" opacity="0.35" />

      <path
        d="M70 232 C92 148, 118 112, 148 96"
        fill="none"
        stroke={`url(#gold-${award.id})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M330 232 C308 148, 282 112, 252 96"
        fill="none"
        stroke={`url(#gold-${award.id})`}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <polygon
        points="200,54 209,78 234,78 214,93 222,118 200,103 178,118 186,93 166,78 191,78"
        fill={`url(#gold-${award.id})`}
      />

      <text
        x="200"
        y="124"
        textAnchor="middle"
        fill="#111827"
        fontSize="15"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="3"
      >
        SNS AWARD
      </text>

      {showVolunteerName && volunteerName && (
        <text
          x="200"
          y="144"
          textAnchor="middle"
          fill="#64748b"
          fontSize="11"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          {volunteerName}
        </text>
      )}

      {titleLines.map((line, index) => (
        <text
          key={line}
          x="200"
          y={titleStartY + index * 24}
          textAnchor="middle"
          fill="#111827"
          fontSize={index === 0 ? 19 : 16}
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          {line}
        </text>
      ))}

      <path
        d="M112 286 Q200 322 288 286 L276 306 Q200 338 124 306 Z"
        fill={`url(#gold-${award.id})`}
      />
      <text
        x="200"
        y="302"
        textAnchor="middle"
        fill="#111827"
        fontSize="9.5"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.4"
      >
        {dateLabel.toUpperCase()}
      </text>

      <text
        x="200"
        y="336"
        textAnchor="middle"
        fill="#64748b"
        fontSize="10.5"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        SNS Family
      </text>

      <circle cx="176" cy="352" r="4" fill={accent} />
      <circle cx="200" cy="356" r="4.8" fill={accent} />
      <circle cx="224" cy="352" r="4" fill={accent} />
    </svg>
  );
}

export default function AwardBadge({
  award,
  volunteerName,
  size = 168,
  showActions = true,
  showVolunteerName = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

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

  return (
    <div className="flex flex-col items-center gap-1.5">
      <MedallionSvg
        award={award}
        volunteerName={volunteerName}
        size={size}
        svgRef={svgRef}
        showVolunteerName={showVolunteerName}
      />

      {showActions && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-100 dark:hover:bg-[#18181B] active:scale-95 transition-transform"
            aria-label="Save award image"
            title="Save image"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full text-[var(--brand)] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 active:scale-95 transition-transform"
            aria-label="Share award"
            title="Share"
          >
            <Share2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
