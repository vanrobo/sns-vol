/** Colored strip backgrounds for event list cards / detail headers. */
export function getEventCardColor(category?: string | null) {
  const key = (category ?? "").trim().toLowerCase();
  if (/^class\s*canc?el$/.test(key)) {
    return "bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800";
  }
  switch (key) {
    case "stem":
      return "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900";
    case "education":
      return "bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900";
    case "environment":
      return "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900";
    case "community":
      return "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900";
    default:
      return "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900";
  }
}
