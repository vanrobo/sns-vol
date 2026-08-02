// app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNS Vol",
  description: "SNS volunteer campaigns and digital I-Card",
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
            toastOptions={{
              style: { background: "#047857", color: "#fff" },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
