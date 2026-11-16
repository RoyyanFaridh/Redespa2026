import type { ReactNode } from "react";
import {
  getKegiatanStatus,
  getKegiatanStatusLabel,
} from "../../backend/kegiatan/format";
import type { Kegiatan } from "../../backend/kegiatan/types";
import { StatusBadge as CommonStatusBadge } from "../common/StatusBadge";
import { IconButton as CommonIconButton } from "../common/IconButton";
import { EmptyState as CommonEmptyState } from "../common/EmptyState";

type IconProps = { className?: string };
type KegiatanStatus = ReturnType<typeof getKegiatanStatus>;

export function QrIcon({ className = "h-3.5 w-3.5 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <rect
        x="2.5"
        y="2.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.5"
        y="2.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2.5"
        y="11.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 12h2v2h-2zM16 12h1.5M12 16h2M16 15v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "h-3 w-3 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <rect
        x="3"
        y="4.5"
        width="14"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 2.8v3.4M13.5 2.8v3.4M3.5 8h13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClockIcon({ className = "h-3 w-3 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 6v4.3l2.8 1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LocationIcon({ className = "h-3 w-3 shrink-0" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M16 8.2c0 4.2-6 9-6 9s-6-4.8-6-9a6 6 0 1 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function StatusBadge({ status }: { status: KegiatanStatus }) {
  if (status === "sedang_berlangsung") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#65B98A]/30 bg-[#E6F2EA] px-2.5 py-0.5 text-[10px] font-medium text-[#206440] select-none">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#287A50] animate-pulse" />
        <span>{getKegiatanStatusLabel(status)}</span>
      </span>
    );
  }

  if (status === "akan_berlangsung") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800 select-none">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
        <span>{getKegiatanStatusLabel(status)}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5EAE6] bg-[#F5F7F5] px-2.5 py-0.5 text-[10px] font-medium text-[#78827C] select-none">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9AA39D]" />
      <span>{getKegiatanStatusLabel(status)}</span>
    </span>
  );
}

export function CreatorText({
  kegiatan,
  className = "",
}: {
  kegiatan: Kegiatan;
  className?: string;
}) {
  const label = kegiatan.creator_label?.trim() || "Belum tercatat";
  const recorded = Boolean(kegiatan.created_by);

  return (
    <p
      title={label}
      className={`text-[10px] leading-4 text-[#78827C] ${className}`}
    >
      Dibuat oleh{" "}
      <span className={recorded ? "font-medium text-[#202824]" : "italic"}>
        {label}
      </span>
    </p>
  );
}

export function EmptyState() {
  return (
    <div className="py-8">
      <CommonEmptyState
        title="Tidak ada kegiatan"
        description="Belum ada kegiatan yang tersedia, atau tidak ada yang cocok dengan pencarian dan filter saat ini."
        icon={
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <CalendarIcon className="h-5 w-5" />
          </span>
        }
      />
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  variant = "neutral",
  size = "md",
  bordered = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  variant?: "neutral" | "danger";
  size?: "md" | "lg";
  bordered?: boolean;
}) {
  return (
    <CommonIconButton
      label={label}
      onClick={onClick}
      variant={variant === "danger" ? "danger" : "neutral"}
      size={size === "lg" ? "lg" : "md"}
      bordered={bordered}
    >
      {children}
    </CommonIconButton>
  );
}

export function ScanButton({
  label,
  onClick,
  large = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  large?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={
        disabled
          ? "Scan QR hanya tersedia saat kegiatan sedang berlangsung (atau 30 menit sebelumnya)"
          : label
      }
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium select-none shadow-xs",
        "transition-all duration-150 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287A50] focus-visible:ring-offset-1",
        large ? "h-9 w-full flex-1 text-[11px] px-3" : "h-8 px-2.5 text-[10px]",
        disabled
          ? "cursor-not-allowed bg-[#F5F7F5] text-[#9AA39D] border border-[#E5EAE6] shadow-none"
          : "bg-[#287A50] text-white hover:bg-[#206440] active:bg-[#206440]",
      ].join(" ")}
    >
      <QrIcon />
      <span>{large ? "Scan QR Presensi" : "Scan QR"}</span>
    </button>
  );
}
