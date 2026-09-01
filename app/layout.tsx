// app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { UnsavedChangesProvider } from "@/components/UnsavedChangesProvider";
import { Toaster } from "react-hot-toast";
import PWARegister from "@/components/PWARegister";
import NotificationPoller from "@/components/NotificationPoller";
import type { Metadata, Viewport } from "next";
import { APP_NAME, LOGO_ICON_192, LOGO_ICON_512, FAVICON_SRC, LOGO_APPLE, BRAND_THEME_COLOR } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "SNS Family volunteer campaigns and digital I-Card",
  icons: {
    icon: [
      { url: FAVICON_SRC, type: "image/png", sizes: "32x32" },
      { url: LOGO_ICON_192, type: "image/png", sizes: "192x192" },
      { url: LOGO_ICON_512, type: "image/png", sizes: "512x512" },
    ],
    shortcut: [{ url: FAVICON_SRC, type: "image/png" }],
    apple: [{ url: LOGO_APPLE, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_THEME_COLOR },
    { media: "(prefers-color-scheme: dark)", color: BRAND_THEME_COLOR },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--surface-muted)] text-[var(--text)] transition-colors duration-200 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <UnsavedChangesProvider>
            <PWARegister />
            <NotificationPoller />
            {children}
          </UnsavedChangesProvider>
          <Toaster
            position="top-center"
            containerStyle={{ zIndex: 100000 }}
            toastOptions={{
              style: { background: BRAND_THEME_COLOR, color: "#fff", zIndex: 100000 },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
