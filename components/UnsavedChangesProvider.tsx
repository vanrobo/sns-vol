"use client";

import { createContext, useCallback, useContext, useState } from "react";

type UnsavedCtx = {
  hasUnsaved: boolean;
  setHasUnsaved: (v: boolean) => void;
  triggerShake: () => void;
  shaking: boolean;
};

const Ctx = createContext<UnsavedCtx | null>(null);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [shaking, setShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 650);
  }, []);

  return (
    <Ctx.Provider value={{ hasUnsaved, setHasUnsaved, triggerShake, shaking }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUnsavedChangesOptional() {
  return useContext(Ctx);
}
