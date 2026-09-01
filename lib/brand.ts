export const APP_NAME = "SNS Family";
export const APP_NAME_ACCENT = "Family";

/** Bump when replacing logo/favicon assets so browsers refresh cached icons. */
export const ICON_VERSION = "sns-official-v2";

const withIconVersion = (path: string) => `${path}?v=${ICON_VERSION}`;

export const LOGO_SRC = "/branding/logo.png";
export const LOGO_ICON_192 = withIconVersion("/branding/icon-192.png");
export const LOGO_ICON_512 = withIconVersion("/branding/icon-512.png");
export const LOGO_APPLE = withIconVersion("/branding/apple-touch-icon.png");
export const FAVICON_SRC = withIconVersion("/branding/favicon.png");

/** Matches the official SNS logo green */
export const BRAND_THEME_COLOR = "#34c759";

/** Stand N Stride Foundation — official Google review link */
export const GOOGLE_REVIEW_URL =
  "https://g.page/r/CY98E0HsTIUWEA0/review";

/** Stand N Stride Foundation — donations */
export const DONATE_URL =
  process.env.NEXT_PUBLIC_DONATE_URL?.trim() ||
  "https://dev.standnstride.org/donate";

/** Public site host for QR footers and share links (no protocol). */
export const APP_SITE_HOST =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
  "sns-vol.vercel.app";
