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

const GOLD = "#c9a227";
const GOLD_LIGHT = "#f0dfa0";
const GOLD_DARK = "#8a6b12";
const NAVY = "#0a1628";
const CREAM = "#faf6ee";

function wrapTitle(title: string, max = 16) {
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

function LaurelLeaves({ side }: { side: "left" | "right" }) {
  const leaves = [
    { x: 118, y: 248, r: -50 },
    { x: 102, y: 218, r: -58 },
    { x: 92, y: 186, r: -66 },
    { x: 88, y: 154, r: -74 },
    { x: 92, y: 124, r: -82 },
    { x: 104, y: 98, r: -88 },
  ];

  return (
    <g>
      {leaves.map((leaf, i) => {
        const x = side === "left" ? leaf.x : 400 - leaf.x;
        const r = side === "left" ? leaf.r : -leaf.r;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={leaf.y}
            rx="7"
            ry="13"
            fill={GOLD}
            opacity="0.92"
            transform={`rotate(${r} ${x} ${leaf.y})`}
          />
        );
      })}
      <path
        d={
          side === "left"
            ? "M128 262 C98 220, 84 170, 96 108 C104 88, 118 78, 132 74"
            : "M272 262 C302 220, 316 170, 304 108 C296 88, 282 78, 268 74"
        }
        fill="none"
        stroke={GOLD_DARK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  );
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
  const titleLines = wrapTitle(award.title.toUpperCase());
  const dateLabel = new Date(award.awarded_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const titleStartY = showVolunteerName && volunteerName ? 188 : 176;
  const lineHeight = titleLines.length > 2 ? 20 : 24;

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
        <linearGradient id={`gold-metal-${award.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GOLD_LIGHT} />
          <stop offset="50%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
        <radialGradient id={`cream-${award.id}`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="100%" stopColor={CREAM} />
        </radialGradient>
      </defs>

      {/* Outer navy disc */}
      <circle cx="200" cy="200" r="194" fill={NAVY} />
      <circle cx="200" cy="200" r="186" fill="none" stroke={`url(#gold-metal-${award.id})`} strokeWidth="2.5" />

      {/* Gold bead ring */}
      {Array.from({ length: 48 }).map((_, i) => {
        const angle = (i / 48) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(angle) * 178;
        const y = 200 + Math.sin(angle) * 178;
        return <circle key={i} cx={x} cy={y} r="1.8" fill={GOLD} opacity="0.85" />;
      })}

      {/* Cream face */}
      <circle cx="200" cy="200" r="156" fill={`url(#cream-${award.id})`} />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#d4cfc0" strokeWidth="1" />

      <LaurelLeaves side="left" />
      <LaurelLeaves side="right" />

      {/* Top star */}
      <polygon
        points="200,48 206,66 226,66 210,78 216,98 200,86 184,98 190,78 174,66 194,66"
        fill={`url(#gold-metal-${award.id})`}
      />

      <text
        x="200"
        y="118"
        textAnchor="middle"
        fill="#1a1a1a"
        fontSize="13"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="4"
      >
        SNS AWARD
      </text>

      {showVolunteerName && volunteerName && (
        <>
          <line x1="148" y1="132" x2="252" y2="132" stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
          <text
            x="200"
            y="148"
            textAnchor="middle"
            fill="#5c5c5c"
            fontSize="11"
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            {volunteerName}
          </text>
        </>
      )}

      {!showVolunteerName && (
        <text
          x="200"
          y="142"
          textAnchor="middle"
          fill="#888"
          fontSize="9"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="2"
        >
          — AWARDED TO —
        </text>
      )}

      {titleLines.map((line, index) => (
        <text
          key={`${line}-${index}`}
          x="200"
          y={titleStartY + index * lineHeight}
          textAnchor="middle"
          fill="#111"
          fontSize={titleLines.length > 2 ? 15 : index === 0 ? 20 : 17}
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          {line}
        </text>
      ))}

      {/* Ribbon */}
      <path
        d="M108 288 C140 310, 168 316, 200 316 C232 316, 260 310, 292 288 L282 304 C252 322, 226 328, 200 328 C174 328, 148 322, 118 304 Z"
        fill={`url(#gold-metal-${award.id})`}
      />
      <path
        d="M108 288 C140 310, 168 316, 200 316 C232 316, 260 310, 292 288"
        fill="none"
        stroke={GOLD_DARK}
        strokeWidth="0.8"
        opacity="0.5"
      />
      <text
        x="200"
        y="312"
        textAnchor="middle"
        fill="#1a1a1a"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.2"
      >
        {dateLabel.toUpperCase()}
      </text>

      <text
        x="200"
        y="348"
        textAnchor="middle"
        fill="#666"
        fontSize="10"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1"
      >
        SNS Family
      </text>

      <polygon points="194,356 200,364 206,356" fill={GOLD} />
      <circle cx="178" cy="358" r="3.2" fill={GOLD} />
      <circle cx="200" cy="361" r="3.8" fill={GOLD} />
      <circle cx="222" cy="358" r="3.2" fill={GOLD} />
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
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 active:scale-95 transition-transform"
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
