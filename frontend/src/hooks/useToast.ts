import { useCallback, useEffect, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "warning";
}

let nextId = 0;

const listeners: Array<(toast: Toast) => void> = [];

export function showToast(message: string, type: Toast["type"] = "info") {
  const toast: Toast = { id: ++nextId, message, type };
  listeners.forEach((fn) => fn(toast));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      const idx = listeners.indexOf(addToast);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [addToast]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
