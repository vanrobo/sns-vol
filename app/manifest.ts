import type { MetadataRoute } from "next";
import {
  APP_NAME,
  LOGO_APPLE,
  LOGO_ICON_192,
  LOGO_ICON_512,
  FAVICON_SRC,
  BRAND_THEME_COLOR,
} from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "SNS Family",
    description: "SNS Family volunteer campaigns and digital I-Card",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: BRAND_THEME_COLOR,
    orientation: "portrait",
    icons: [
      {
        src: FAVICON_SRC,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: LOGO_ICON_192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: LOGO_ICON_512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: LOGO_ICON_512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: LOGO_APPLE,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      { name: "Events", short_name: "Events", url: "/" },
      { name: "I-Card", short_name: "I-Card", url: "/i-card" },
      { name: "Alerts", short_name: "Alerts", url: "/notifications" },
    ],
  };
}
