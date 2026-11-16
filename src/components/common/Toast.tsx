"use client";
import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-[#287A50] bg-[#E6F2EA] text-[#206440]",
  error: "border-red-300 bg-red-50 text-red-700",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
  info: "border-blue-300 bg-blue-50 text-blue-700",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "M20 6 9 17l-5-5",
  error: "M18 6 6 18M6 6l12 12",
  warning: "M12 8v4M12 16h.01",
  info: "M13 16h-1v-4h-1m1-4h.01",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      const dur = toast.duration ?? 4000;
      setTimeout(() => removeToast(id), dur);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const variant = toast.variant ?? "info";
          return (
            <div
              key={toast.id}
              role="alert"
              className={[
                "pointer-events-auto flex min-w-[260px] max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg",
                "transition-all duration-200 motion-reduce:transition-none",
                VARIANT_STYLES[variant],
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={VARIANT_ICONS[variant]}
                />
              </svg>
              <p className="flex-1 text-[11px] font-medium leading-4">
                {toast.message}
              </p>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => removeToast(toast.id)}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6 6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
