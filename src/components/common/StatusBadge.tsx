import React, { type ReactNode } from "react";
import type { BadgeVariant, BadgeSize } from "./Badge";
import { Badge } from "./Badge";

export type StatusBadgeStatus =
  | "hadir"
  | "tidak_hadir"
  | "izin"
  | "aktif"
  | "nonaktif"
  | "pending"
  | "selesai"
  | "berjalan"
  | string;

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant; dot?: boolean }> = {
  hadir: { label: "Hadir", variant: "success", dot: true },
  tidak_hadir: { label: "Tidak Hadir", variant: "danger", dot: true },
  izin: { label: "Izin", variant: "warning", dot: true },
  aktif: { label: "Aktif", variant: "success", dot: true },
  nonaktif: { label: "Nonaktif", variant: "neutral", dot: true },
  pending: { label: "Menunggu", variant: "warning", dot: true },
  selesai: { label: "Selesai", variant: "success" },
  berjalan: { label: "Berlangsung", variant: "info", dot: true },
};

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    variant: "neutral" as BadgeVariant,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
