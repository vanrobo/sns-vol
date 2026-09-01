const STORAGE_KEY = "sns-font-scale-v1";
const MIN = 0.85;
const MAX = 1.25;
const STEP = 0.1;
const DEFAULT = 1;

export function clampFontScale(value: number) {
  return Math.min(MAX, Math.max(MIN, Math.round(value * 100) / 100));
}

export function readFontScale(): number {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const n = Number(raw);
    return Number.isFinite(n) ? clampFontScale(n) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function writeFontScale(scale: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(clampFontScale(scale)));
  } catch {
    /* ignore */
  }
}

export function applyFontScale(scale: number) {
  if (typeof document === "undefined") return;
  const clamped = clampFontScale(scale);
  document.documentElement.style.setProperty("--font-scale", String(clamped));
  // Scale root rem so Tailwind text-* utilities resize with accessibility setting
  if (clamped === DEFAULT) {
    document.documentElement.style.fontSize = "";
  } else {
    document.documentElement.style.fontSize = `${clamped * 100}%`;
  }
  document.documentElement.dataset.fontScale = String(clamped);
}

export function bumpFontScale(delta: number): number {
  const next = clampFontScale(readFontScale() + delta);
  writeFontScale(next);
  applyFontScale(next);
  return next;
}

export const FONT_SCALE = { MIN, MAX, STEP, DEFAULT };
