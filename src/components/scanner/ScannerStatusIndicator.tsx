"use client";

import React from "react";
import type { ScannerStatus } from "./types";

type Props = {
  status: ScannerStatus;
  modeLabel?: string;
};

export default function ScannerStatusIndicator({ status, modeLabel }: Props) {
  const config = {
    idle: {
      dot: "bg-gray-400",
      text: "text-gray-600",
      label: "Tidak Aktif",
      animate: false,
    },
    ready: {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      label: "Siap Memindai",
      animate: true,
    },
    processing: {
      dot: "bg-amber-500",
      text: "text-amber-700",
      label: "Memproses Presensi...",
      animate: true,
    },
    success: {
      dot: "bg-[#287A50]",
      text: "text-[#287A50]",
      label: "Presensi Berhasil",
      animate: false,
    },
    error: {
      dot: "bg-rose-500",
      text: "text-rose-700",
      label: "Pemindaian Gagal",
      animate: false,
    },
  }[status];

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#E5EAE6] bg-white px-3 py-1.5 shadow-2xs">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        {config.animate && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`}
        />
      </span>

      <span className={`text-[11px] font-semibold ${config.text}`}>
        {config.label}
      </span>

      {modeLabel && (
        <>
          <span className="text-gray-300">|</span>
          <span className="text-[10px] text-[#78827C]">{modeLabel}</span>
        </>
      )}
    </div>
  );
}
