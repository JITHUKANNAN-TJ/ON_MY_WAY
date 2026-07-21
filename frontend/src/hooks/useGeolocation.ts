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
  onPosition: (pos: GeoPosition) => void;
}

export function useGeolocation({ enabled, onPosition }: UseGeolocationOptions) {
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | "unavailable">("prompt");
  const watchId = useRef<number | null>(null);

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

  useEffect(() => {
    if (!enabled) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
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

    watchId.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000,
    });

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled, handlePosition, handleError]);

  return { error, permissionState };
}
