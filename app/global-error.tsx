"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-zinc-400">
            The app hit an unexpected error. Try again or reload the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-[#34c759] text-black font-semibold text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
