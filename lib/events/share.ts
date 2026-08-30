/** Turn an event title into a URL slug, e.g. "STEM Workshop!" → "stem-workshop" */
export function slugifyEventTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "event";
}

export function getEventPublicUrl(slug: string): string {
  const base =
    (typeof window !== "undefined" ? window.location.origin : undefined) ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/event/${slug}`;
}
