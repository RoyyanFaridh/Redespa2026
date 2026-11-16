import React, {
  forwardRef,
  type SelectHTMLAttributes,
} from "react";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps<T extends string | number = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  inputSize?: "sm" | "md" | "lg";
  options: SelectOption<T>[];
  placeholder?: string;
  wrapperClassName?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 px-2.5 text-[10px]",
  md: "h-9 px-3 text-[11px]",
  lg: "h-10 px-3.5 text-sm",
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      helperText,
      error,
      inputSize = "md",
      options,
      placeholder,
      wrapperClassName = "",
      className = "",
      disabled,
      ...rest
    },
    ref,
  ) => {
    const baseClasses = [
      "w-full rounded-xl border bg-white transition-colors duration-150 cursor-pointer",
      "focus:outline-none focus:ring-2 focus:ring-[#65B98A]/30 focus:border-[#287A50]",
      "disabled:cursor-not-allowed disabled:bg-[#F5F7F5] disabled:opacity-60",
      SIZE_CLASSES[inputSize],
      error
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-[#E5EAE6] hover:border-[#287A50]/40",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClassName}>
        {label && (
          <label className="mb-1 block text-[11px] font-medium text-[#202824]">
            {label}
          </label>
        )}
        <select ref={ref} disabled={disabled} className={baseClasses} {...rest}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1 text-[9px] text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-[9px] text-[#78827C]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";
export default FormSelect;
