import { useEffect, useState } from "react";

const STORAGE_KEY = "omw_install_dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    setDeferredPrompt(null);
    if (result.outcome === "accepted") {
      setDismissed(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
    setDeferredPrompt(null);
  };

  if (dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="glass-strong rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Install On My Way</p>
          <p className="text-xs text-text-secondary">Works better when installed</p>
        </div>
        <button
          onClick={handleInstall}
          className="btn-primary text-xs !px-4 !py-2 shrink-0"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-2 text-text-secondary hover:text-text transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
