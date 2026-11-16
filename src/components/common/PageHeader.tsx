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
    <header className={`flex flex-col gap-2 ${className}`}>
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#287A50]">
            {eyebrow}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[#202824] sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-0.5 max-w-xl text-[10px] leading-4 text-[#78827C] sm:mt-1 sm:text-xs">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
