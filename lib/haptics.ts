export type HapticPattern = "light" | "medium" | "success" | "warning" | "selection";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  success: [10, 50, 10],
  warning: [20, 40, 20],
  selection: 5,
};

export function haptic(pattern: HapticPattern = "light") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* unsupported or blocked */
  }
}
