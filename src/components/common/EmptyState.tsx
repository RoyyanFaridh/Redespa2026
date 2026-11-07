import React, { type ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 text-[#287A50]"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );

  return (
    <div
      className={[
        "mx-auto flex max-w-sm flex-col items-center px-6 py-8 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EA]">
        {icon ?? defaultIcon}
      </div>

      <p className="text-[12px] font-semibold text-[#202824]">{title}</p>

      {description && (
        <p className="mt-1 text-[11px] leading-4.5 text-[#78827C]">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;

