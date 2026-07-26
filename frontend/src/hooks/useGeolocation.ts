import { useCallback, useEffect, useRef, useState } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  timestamp: number;
}

interface UseGeolocationOptions {
  enabled: boolean;
  isBackgrounded: boolean;
  onPosition: (pos: GeoPosition) => void;
}

export function useGeolocation({ enabled, isBackgrounded, onPosition }: UseGeolocationOptions) {
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | "unavailable">("prompt");
  const watchId = useRef<number | null>(null);
  const bgTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePosition = useCallback(
    (pos: GeolocationPosition) => {
      setError(null);
      onPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      });
    },
    [onPosition]
  );

  const handleError = useCallback((err: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: "GPS_PERMISSION_DENIED",
      2: "GPS_UNAVAILABLE",
      3: "GPS_TIMEOUT",
    };
    setError(messages[err.code] || "GPS_ERROR");
  }, []);

  const startWatch = useCallback(() => {
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000,
    });
  }, [handlePosition, handleError]);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const startBgPoll = useCallback(() => {
    if (bgTimer.current !== null) return;
    bgTimer.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: false,
        maximumAge: 30000,
        timeout: 15000,
      });
    }, 30000);
  }, [handlePosition, handleError]);

  const stopBgPoll = useCallback(() => {
    if (bgTimer.current !== null) {
      clearInterval(bgTimer.current);
      bgTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopWatch();
      stopBgPoll();
      return;
    }

    if (!navigator.geolocation) {
      setPermissionState("unavailable");
      setError("GPS_NOT_SUPPORTED");
      return;
    }

    navigator.permissions?.query({ name: "geolocation" }).then((status) => {
      setPermissionState(status.state);
      status.addEventListener("change", () => setPermissionState(status.state));
    });

    return () => {
      stopWatch();
      stopBgPoll();
    };
  }, [enabled, stopWatch, stopBgPoll]);

  useEffect(() => {
    if (!enabled) return;
    if (isBackgrounded) {
      stopWatch();
      startBgPoll();
    } else {
      stopBgPoll();
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      });
      startWatch();
    }
  }, [isBackgrounded, enabled, handlePosition, handleError, startWatch, stopWatch, startBgPoll, stopBgPoll]);

  return { error, permissionState };
}
