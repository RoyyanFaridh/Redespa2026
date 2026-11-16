import React, { type ReactNode } from "react";

export interface InfoRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className = "" }: InfoRowProps) {
  return (
    <div
      className={[
        "flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="shrink-0 text-[10px] font-medium text-[#78827C] sm:w-32">
        {label}
      </span>
      <span className="text-[11px] text-[#202824]">{value}</span>
    </div>
  );
}

export default InfoRow;
