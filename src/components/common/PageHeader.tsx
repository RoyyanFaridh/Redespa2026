import React, { type ReactNode } from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow = "REDESPA",
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-3 ${className}`}>
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#287A50]">
            {eyebrow}
          </p>
        )}

        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[#202824] sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-1 max-w-xl text-[11px] leading-4 text-[#78827C] sm:text-xs">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default PageHeader;

