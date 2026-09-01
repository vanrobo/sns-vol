"use client";

import { useEffect } from "react";
import { applyFontScale, readFontScale } from "@/lib/font-scale";

export default function FontScaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    applyFontScale(readFontScale());
  }, []);

  return children;
}
