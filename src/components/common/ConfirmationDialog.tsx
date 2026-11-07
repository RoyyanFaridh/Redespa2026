"use client";

import React, { type ReactNode } from "react";
import ModalWrapper from "./ModalWrapper";
import Button from "./Button";
import IconButton from "./IconButton";

export interface ConfirmationDialogProps {
  title: string;
  subtitle?: string;
  message: ReactNode;
  warningNote?: string;
  error?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  icon?: ReactNode;
}

export function ConfirmationDialog({
  title,
  subtitle,
  message,
  warningNote,
  error,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  confirmVariant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
  icon,
}: ConfirmationDialogProps) {
  const defaultIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
    </svg>
  );

  return (
    <ModalWrapper onClose={onClose} size="sm">
      <div className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                confirmVariant === "danger"
                  ? "bg-red-50 text-red-600"
                  : "bg-[#E6F2EA] text-[#287A50]"
              }`}
            >
              {icon ?? defaultIcon}
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <IconButton
            label="Tutup"
            size="sm"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
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

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="text-[10px] leading-relaxed text-[#78827C]">
            {message}
          </div>

          {warningNote && (
            <p className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[9px] leading-relaxed text-amber-800">
              {warningNote}
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-600"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </ModalWrapper>
  );
}

export default ConfirmationDialog;

