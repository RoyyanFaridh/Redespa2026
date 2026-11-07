import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-outline";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#287A50] text-white hover:bg-[#206440] active:bg-[#181C1B] shadow-xs",
  secondary:
    "bg-[#E6F2EA] text-[#287A50] hover:bg-[#d4eadc] active:bg-[#c2e4cc]",
  outline:
    "border border-[#E5EAE6] bg-white text-[#202824] hover:bg-[#F0F4F1] hover:border-[#65B98A]/40 active:bg-[#E5EAE6] shadow-xs",
  ghost:
    "bg-transparent text-[#78827C] hover:bg-[#F0F4F1] hover:text-[#202824] active:bg-[#E5EAE6]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs",
  "danger-outline":
    "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-[10px] gap-1 rounded-lg",
  md: "h-9 px-3.5 text-[11px] gap-1.5 rounded-xl font-medium",
  lg: "h-10 px-4 text-xs gap-2 rounded-xl font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex shrink-0 items-center justify-center select-none font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287A50] focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
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
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;

