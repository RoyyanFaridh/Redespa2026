import React, { type ReactNode } from "react";

export interface ResponsiveCardProps {
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  className?: string;
}

export function ResponsiveCard({
  title,
  description,
  headerAction,
  children,
  footer,
  bordered = true,
  hoverable = false,
  className = "",
}: ResponsiveCardProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl bg-white shadow-xs",
        bordered ? "border border-[#E5EAE6]" : "",
        hoverable ? "transition-shadow duration-200 hover:shadow-md" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[12px] font-semibold text-[#202824]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-[10px] leading-4 text-[#78827C]">
                {description}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex shrink-0 items-center gap-2">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>

      {footer && (
        <div className="border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          {footer}
        </div>
      )}
    </div>
  );
}

export default ResponsiveCard;
