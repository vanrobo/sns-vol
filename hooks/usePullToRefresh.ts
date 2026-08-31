"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const THRESHOLD = 64;
const MAX_PULL = 100;
const REFRESH_TIMEOUT_MS = 12_000;

type UsePullToRefreshOptions = {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  scrollRef?: RefObject<HTMLElement | null>;
  scrollElement?: HTMLElement | null;
};

export function usePullToRefresh({
  onRefresh,
  disabled = false,
  scrollRef,
  scrollElement,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const getScrollEl = useCallback(() => {
    return scrollElement ?? scrollRef?.current ?? null;
  }, [scrollElement, scrollRef]);

  const getScrollTop = useCallback(() => {
    const el = getScrollEl();
    if (el) return el.scrollTop;
    return window.scrollY;
  }, [getScrollEl]);

  const setDistance = useCallback((value: number) => {
    pullDistanceRef.current = value;
    setPullDistance(value);
  }, []);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    if (disabled) return;

    const scrollEl = getScrollEl();
    const touchTarget: EventTarget = scrollEl ?? window;

    const resetPull = () => {
      pulling.current = false;
      setDistance(0);
    };

    const onTouchStart = (e: Event) => {
      if (refreshingRef.current) return;
      const touch = (e as TouchEvent).touches[0];
      if (!touch || getScrollTop() > 2) return;
      startY.current = touch.clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: Event) => {
      if (refreshingRef.current) return;
      const touch = (e as TouchEvent).touches[0];
      if (!touch || !pulling.current) return;

      if (getScrollTop() > 2) {
        resetPull();
        return;
      }

      const delta = touch.clientY - startY.current;
      if (delta > 8) {
        if (scrollEl) e.preventDefault();
        setDistance(Math.min(delta * 0.4, MAX_PULL));
      } else if (delta < -4) {
        resetPull();
      }
    };

    const onTouchEnd = () => {
      if (!pulling.current || refreshingRef.current) {
        resetPull();
        return;
      }

      pulling.current = false;
      const dist = pullDistanceRef.current;
      setDistance(0);

      if (dist >= THRESHOLD) {
        setRefreshing(true);
        refreshingRef.current = true;

        const timeout = window.setTimeout(() => {
          setRefreshing(false);
          refreshingRef.current = false;
        }, REFRESH_TIMEOUT_MS);

        onRefreshRef
          .current()
          .catch(() => {
            /* keep UI responsive even if refresh fails */
          })
          .finally(() => {
            window.clearTimeout(timeout);
            setRefreshing(false);
            refreshingRef.current = false;
          });
      }
    };

    touchTarget.addEventListener("touchstart", onTouchStart, { passive: true });
    touchTarget.addEventListener("touchmove", onTouchMove, { passive: false });
    touchTarget.addEventListener("touchend", onTouchEnd, { passive: true });
    touchTarget.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      touchTarget.removeEventListener("touchstart", onTouchStart);
      touchTarget.removeEventListener("touchmove", onTouchMove);
      touchTarget.removeEventListener("touchend", onTouchEnd);
      touchTarget.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [disabled, getScrollEl, getScrollTop, setDistance]);

  return {
    pullDistance,
    refreshing,
    ready: pullDistance >= THRESHOLD,
    threshold: THRESHOLD,
  };
}
