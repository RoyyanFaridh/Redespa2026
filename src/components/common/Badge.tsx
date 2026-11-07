import React, { type ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<
  BadgeVariant,
  { container: string; dot: string }
> = {
  success: {
    container: "bg-[#E6F2EA] text-[#206440] border border-[#65B98A]/30",
    dot: "bg-[#287A50]",
  },
  warning: {
    container: "bg-amber-50 text-amber-800 border border-amber-200",
    dot: "bg-amber-500",
  },
  danger: {
    container: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  info: {
    container: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  neutral: {
    container: "bg-[#F5F7F5] text-[#78827C] border border-[#E5EAE6]",
    dot: "bg-[#9AA39D]",
  },
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[9px] gap-1",
  md: "px-2.5 py-1 text-[10px] gap-1.5",
};

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center font-medium rounded-full select-none",
        SIZE_STYLES[size],
        styles.container,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: "currentColor" }}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;

