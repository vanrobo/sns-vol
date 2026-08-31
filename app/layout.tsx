// app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "SNS Family volunteer campaigns and digital I-Card",
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
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
          <Toaster
            position="top-center"
            containerStyle={{ zIndex: 100000 }}
            toastOptions={{
              style: { background: "#047857", color: "#fff", zIndex: 100000 },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
