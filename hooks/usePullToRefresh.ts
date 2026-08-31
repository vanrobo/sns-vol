"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const THRESHOLD = 72;
const MAX_PULL = 120;

type UsePullToRefreshOptions = {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  scrollRef?: RefObject<HTMLElement | null>;
  /** Pass when using a callback ref so listeners re-bind after mount */
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

  const getScrollTop = useCallback(() => {
    const el = scrollElement ?? scrollRef?.current;
    if (el) return el.scrollTop;
    return window.scrollY;
  }, [scrollElement, scrollRef]);

  const setDistance = useCallback((value: number) => {
    pullDistanceRef.current = value;
    setPullDistance(value);
  }, []);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    if (disabled) return;

    const scrollEl = scrollElement ?? scrollRef?.current ?? null;
    const touchTarget: EventTarget = scrollEl ?? window;

    const onTouchStart = (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (!touch || refreshingRef.current || getScrollTop() > 0) return;
      startY.current = touch.clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (!touch || !pulling.current || refreshingRef.current) return;
      if (getScrollTop() > 0) {
        pulling.current = false;
        setDistance(0);
        return;
      }
      const delta = touch.clientY - startY.current;
      if (delta > 0) {
        if (scrollEl) e.preventDefault();
        setDistance(Math.min(delta * 0.45, MAX_PULL));
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      const dist = pullDistanceRef.current;

      if (dist >= THRESHOLD && !refreshingRef.current) {
        setRefreshing(true);
        refreshingRef.current = true;
        setDistance(THRESHOLD);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          refreshingRef.current = false;
          setDistance(0);
        }
      } else {
        setDistance(0);
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
  }, [disabled, getScrollTop, onRefresh, scrollElement, scrollRef, setDistance]);

  return {
    pullDistance,
    refreshing,
    ready: pullDistance >= THRESHOLD,
    threshold: THRESHOLD,
  };
}
