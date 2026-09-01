"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — feedback now lives on Home → Closed tab event modal. */
export default function FeedbacksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
