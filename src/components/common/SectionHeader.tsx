import React, { type ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold text-[#202824]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[11px] leading-4 text-[#78827C]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export default SectionHeader;
