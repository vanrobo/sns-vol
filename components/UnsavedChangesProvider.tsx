"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type MouseEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const LEAVE_MESSAGE =
  "You have unsaved profile changes. Leave without saving?";

type UnsavedCtx = {
  hasUnsaved: boolean;
  setHasUnsaved: (v: boolean) => void;
  triggerShake: () => void;
  shaking: boolean;
  guardNavigation: (e: MouseEvent, href: string) => void;
  confirmLeave: () => boolean;
};

const Ctx = createContext<UnsavedCtx | null>(null);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [shaking, setShaking] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const triggerShake = useCallback(() => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 650);
  }, []);

  const confirmLeave = useCallback(() => {
    if (pathname !== "/profile" || !hasUnsaved) return true;
    triggerShake();
    const ok = window.confirm(LEAVE_MESSAGE);
    if (ok) setHasUnsaved(false);
    return ok;
  }, [pathname, hasUnsaved, triggerShake]);

  const guardNavigation = useCallback(
    (e: MouseEvent, href: string) => {
      if (href === pathname) {
        e.preventDefault();
        return;
      }
      if (pathname !== "/profile" || !hasUnsaved) return;
      e.preventDefault();
      triggerShake();
      if (window.confirm(LEAVE_MESSAGE)) {
        setHasUnsaved(false);
        router.push(href);
      }
    },
    [pathname, hasUnsaved, router, triggerShake],
  );

  return (
    <Ctx.Provider
      value={{
        hasUnsaved,
        setHasUnsaved,
        triggerShake,
        shaking,
        guardNavigation,
        confirmLeave,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useUnsavedChangesOptional() {
  return useContext(Ctx);
}
