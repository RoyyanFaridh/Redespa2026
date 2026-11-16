import React, { type ReactNode } from "react";

export interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  description?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
  size?: "sm" | "md";
}

export function StatCard({
  icon,
  label,
  value,
  description,
  trend,
  className = "",
  size = "md",
}: StatCardProps) {
  const isCompact = size === "sm";

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white transition-shadow duration-200 hover:shadow-xs",
        isCompact ? "p-3 sm:p-3.5" : "p-3.5 sm:p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[#78827C]">
            {label}
          </p>
          <p
            className={[
              "font-bold tracking-tight text-[#202824]",
              isCompact ? "mt-0.5 text-lg sm:text-xl" : "mt-1 text-xl sm:text-2xl",
            ].join(" ")}
          >
            {value}
          </p>
          {description && (
            <p className="mt-0.5 truncate text-[9px] text-[#78827C]">
              {description}
            </p>
          )}
          {trend && (
            <p
              className={`mt-0.5 text-[9px] font-medium ${
                trend.positive ? "text-[#287A50]" : "text-red-600"
              }`}
            >
              {trend.positive ? "▲" : "▼"} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={[
              "flex shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]",
              isCompact ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10",
            ].join(" ")}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
