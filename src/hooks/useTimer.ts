"use client";

import { useSyncExternalStore, useEffect, useRef, useCallback } from "react";
import { TIMER_DURATION_SECONDS } from "@/lib/constants";

export function useTimer(
  active: boolean,
  onExpire: () => void,
  disabled: boolean = false
): { secondsLeft: number } {
  const startTimeRef = useRef<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const notify = useCallback(() => {
    listenersRef.current.forEach((l) => l());
  }, []);

  useEffect(() => {
    if (active && !disabled) {
      startTimeRef.current = Date.now();
      expiredRef.current = false;
      notify();

      intervalRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed >= TIMER_DURATION_SECONDS && !expiredRef.current) {
          expiredRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          onExpireRef.current();
        }
        notify();
      }, 200);
    } else {
      startTimeRef.current = null;
      expiredRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      notify();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, disabled, notify]);

  const getSnapshot = useCallback(() => {
    if (!active || !startTimeRef.current) return TIMER_DURATION_SECONDS;
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    return Math.max(0, TIMER_DURATION_SECONDS - elapsed);
  }, [active]);

  const secondsLeft = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return { secondsLeft };
}
