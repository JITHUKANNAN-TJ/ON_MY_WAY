import { useToast } from "@/hooks/useToast";

const typeStyles = {
  info: "bg-primary/10 text-primary ring-1 ring-primary/20",
  success: "bg-primary/10 text-primary ring-1 ring-primary/20",
  warning: "bg-warning/10 text-warning ring-1 ring-warning/20",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl shadow-2xl animate-slide-down ${typeStyles[toast.type]}`}
        >
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
