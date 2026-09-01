const STORAGE_KEY = "sns-font-scale-v1";
const MIN = 0.85;
const MAX = 1.25;
const STEP = 0.05;
const DEFAULT = 1;

/** Snap to 5% steps so 100% is always reachable (85–125). */
export function snapFontScale(value: number) {
  const pct = Math.round(value * 100);
  const snapped = Math.round(pct / (STEP * 100)) * (STEP * 100);
  return Math.min(MAX, Math.max(MIN, snapped / 100));
}

export function clampFontScale(value: number) {
  return snapFontScale(value);
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
  const clamped = snapFontScale(scale);
  document.documentElement.style.setProperty("--font-scale", String(clamped));
  if (clamped === DEFAULT) {
    document.documentElement.style.fontSize = "";
  } else {
    document.documentElement.style.fontSize = `${clamped * 100}%`;
  }
  document.documentElement.dataset.fontScale = String(clamped);
}

export function setFontScale(scale: number): number {
  const clamped = snapFontScale(scale);
  writeFontScale(clamped);
  applyFontScale(clamped);
  return clamped;
}

export function bumpFontScale(delta: number): number {
  return setFontScale(readFontScale() + delta);
}

export const FONT_SCALE = { MIN, MAX, STEP, DEFAULT };
