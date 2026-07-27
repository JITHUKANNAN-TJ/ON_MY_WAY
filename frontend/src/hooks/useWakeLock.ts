import { useCallback, useEffect, useRef, useState } from "react";

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!navigator.wakeLock || wakeRef.current) return;
    try {
      const wake = await navigator.wakeLock.request("screen");
      wakeRef.current = wake;
      setIsActive(true);
      wake.addEventListener("release", () => {
        wakeRef.current = null;
        setIsActive(false);
      });
    } catch {
      wakeRef.current = null;
      setIsActive(false);
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeRef.current) {
      try {
        await wakeRef.current.release();
      } catch {
        // ignore
      }
      wakeRef.current = null;
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && wakeRef.current === null) {
        request();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [request]);

  useEffect(() => {
    return () => { release(); };
  }, [release]);

  return { isActive, requestWakeLock: request, releaseWakeLock: release };
}
