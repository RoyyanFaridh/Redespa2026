"use client";
import React, { forwardRef, type InputHTMLAttributes } from "react";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  inputSize?: "sm" | "md" | "lg";
  wrapperClassName?: string;
  onClear?: () => void;
}

const SIZE_CLASSES = {
  sm: "h-8 pl-8 pr-8 text-[10px]",
  md: "h-9 pl-9 pr-9 text-[11px]",
  lg: "h-10 pl-10 pr-10 text-sm",
};

const ICON_SIZES = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const ICON_POSITIONS = {
  sm: "left-2.5",
  md: "left-3",
  lg: "left-3.5",
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      inputSize = "md",
      wrapperClassName = "",
      className = "",
      onClear,
      value,
      ...rest
    },
    ref,
  ) => {
    const baseClasses = [
      "w-full rounded-xl border border-[#E5EAE6] bg-white transition-colors duration-150",
      "placeholder:text-[#9AA39D]",
      "focus:outline-none focus:ring-2 focus:ring-[#65B98A]/30 focus:border-[#287A50]",
      "hover:border-[#287A50]/40",
      "disabled:cursor-not-allowed disabled:bg-[#F5F7F5] disabled:opacity-60",
      SIZE_CLASSES[inputSize],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`relative ${wrapperClassName}`}>
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#9AA39D] ${ICON_POSITIONS[inputSize]}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={ICON_SIZES[inputSize]}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          ref={ref}
          type="search"
          value={value}
          className={baseClasses}
          {...rest}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Hapus pencarian"
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA39D] hover:text-[#78827C]`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={ICON_SIZES[inputSize]}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 6 6 18M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
export default SearchInput;
