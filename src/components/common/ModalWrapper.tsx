"use client";

import React, { useEffect, type ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalWrapperProps {
  children: ReactNode;
  onClose: () => void;
  size?: ModalSize;
  className?: string;
}

const SIZE_STYLES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-[1440px]",
};

export function ModalWrapper({
  children,
  onClose,
  size = "md",
  className = "",
}: ModalWrapperProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-3 backdrop-blur-xs sm:px-6 sm:py-4"
      onClick={onClose}
    >
      <div
        className={[
          "my-auto flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]",
          SIZE_STYLES[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default ModalWrapper;

