import React from "react";

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  helperText?: string;
  error?: string;
  className?: string;
}

export function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  helperText,
  error,
  className = "",
}: CheckboxGroupProps) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div className={className}>
      {label && (
        <p className="mb-2 text-[11px] font-medium text-[#202824]">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={[
                "flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-colors duration-150 select-none",
                opt.disabled ? "cursor-not-allowed opacity-50" : "",
                checked
                  ? "border-[#287A50] bg-[#E6F2EA] text-[#287A50]"
                  : "border-[#E5EAE6] bg-white text-[#202824] hover:border-[#287A50]/40",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={opt.disabled}
                onChange={() => toggle(opt.value)}
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`h-3 w-3 transition-opacity duration-100 ${
                  checked ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6 9 17l-5-5"
                />
              </svg>
              {opt.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1.5 text-[9px] text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-[9px] text-[#78827C]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default CheckboxGroup;
