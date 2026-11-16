import React from "react";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SPINNER_SIZES = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

export function LoadingState({
  message = "Memuat data...",
  size = "md",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={[
        "mx-auto flex flex-col items-center justify-center gap-3 py-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
      aria-label="Loading"
    >
      <svg
        className={`${SPINNER_SIZES[size]} animate-spin text-[#287A50]`}
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
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {message && (
        <p className="text-[11px] text-[#78827C]">{message}</p>
      )}
    </div>
  );
}

export default LoadingState;
