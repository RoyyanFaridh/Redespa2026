import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type IconButtonVariant = "neutral" | "danger" | "primary" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  bordered?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<IconButtonVariant, string> = {
  neutral:
    "text-[#78827C] hover:border-[#E5EAE6] hover:bg-[#F0F4F1] hover:text-[#202824] active:bg-[#E5EAE6]",
  danger:
    "text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100",
  primary:
    "text-[#287A50] hover:border-[#65B98A]/30 hover:bg-[#E6F2EA] hover:text-[#206440] active:bg-[#c2e4cc]",
  ghost:
    "text-[#78827C] hover:bg-[#F0F4F1] hover:text-[#202824] active:bg-[#E5EAE6]",
};

const SIZE_STYLES: Record<IconButtonSize, string> = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-8 w-8 rounded-xl",
  lg: "h-9 w-9 rounded-xl",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      variant = "neutral",
      size = "md",
      bordered = false,
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const borderStyle = bordered
      ? "border border-[#E5EAE6] bg-white shadow-xs"
      : "border border-transparent";

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={label}
        title={label}
        className={[
          "inline-flex shrink-0 items-center justify-center transition-colors duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287A50] focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          SIZE_STYLES[size],
          borderStyle,
          VARIANT_STYLES[variant],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-3.5 w-3.5 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
            {children}
          </span>
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
export default IconButton;

