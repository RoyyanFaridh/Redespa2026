"use client";

import React, { useEffect, useState } from "react";
import type { ScannerNotification } from "./types";

type Props = {
  notification: ScannerNotification | null;
  durationMs?: number;
};

export default function ScannerResultBanner({
  notification,
  durationMs = 2800,
}: Props) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!notification) {
      setRunning(false);
      return;
    }

    setRunning(false);
    const frame = window.setTimeout(() => setRunning(true), 25);
    return () => window.clearTimeout(frame);
  }, [notification?.id]);

  if (!notification) return null;

  const toneConfig = {
    emerald: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/70",
      badge: "border border-emerald-300 bg-[#E6F2EA] text-[#206440]",
      iconBg: "bg-emerald-100 text-[#287A50]",
      progress: "bg-[#287A50]",
      titleColor: "text-[#202824]",
      textColor: "text-[#287A50]",
      subtextColor: "text-[#59645D]",
    },
    amber: {
      border: "border-amber-200",
      bg: "bg-amber-50/70",
      badge: "border border-amber-300 bg-amber-100/70 text-amber-800",
      iconBg: "bg-amber-100 text-amber-700",
      progress: "bg-amber-500",
      titleColor: "text-[#202824]",
      textColor: "text-amber-800",
      subtextColor: "text-[#59645D]",
    },
    rose: {
      border: "border-rose-200",
      bg: "bg-rose-50/70",
      badge: "border border-rose-300 bg-rose-100/70 text-rose-800",
      iconBg: "bg-rose-100 text-rose-700",
      progress: "bg-rose-500",
      titleColor: "text-[#202824]",
      textColor: "text-rose-800",
      subtextColor: "text-[#59645D]",
    },
  }[notification.tone];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`overflow-hidden rounded-2xl border ${toneConfig.border} ${toneConfig.bg} shadow-xs transition-all duration-150 animate-in fade-in-0`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneConfig.iconBg}`}
          >
            {notification.tone === "emerald" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className={`text-xs font-medium ${toneConfig.titleColor}`}>
                {notification.title}
              </h3>

              {notification.statusBadge && (
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${toneConfig.badge}`}
                >
                  Status: {notification.statusBadge}
                </span>
              )}
            </div>

            {notification.namaPeserta && (
              <p className={`mt-0.5 text-xs font-medium ${toneConfig.textColor}`}>
                {notification.namaPeserta}
              </p>
            )}

            <p className={`mt-0.5 text-[10px] leading-4 ${toneConfig.subtextColor}`}>
              {notification.message}
            </p>
          </div>
        </div>

        {/* Technical Detail (opsional) */}
        {notification.technicalDetail && (
          <div className="mt-2 border-t border-black/5 pt-1.5 font-mono text-[9px] text-[#78827C]">
            Detail: {notification.technicalDetail}
          </div>
        )}

        {/* Auto-dismiss Timer Bar */}
        <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-black/5">
          <div
            className={`h-full rounded-full ${toneConfig.progress} transition-[width] ease-linear`}
            style={{
              width: running ? "0%" : "100%",
              transitionDuration: `${durationMs}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
