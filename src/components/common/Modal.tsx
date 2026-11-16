"use client";
import React, { useEffect, type ReactNode } from "react";
import { IconButton } from "./IconButton";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: ModalSize;
  headerIcon?: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
}

const SIZE_STYLES: Record<ModalSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-[1440px]",
};

export function Modal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  size = "md",
  headerIcon,
  className = "",
  closeOnBackdropClick = true,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog modal"}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-3 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none sm:px-6 sm:py-4"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        className={[
          "my-auto flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]",
          "transition-all duration-200 transform scale-100 motion-reduce:transition-none",
          SIZE_STYLES[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || headerIcon) && (
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              {headerIcon && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
                  {headerIcon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <IconButton label="Tutup" size="sm" variant="ghost" onClick={onClose}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </IconButton>
          </header>
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export default Modal;
