import React, {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  inputSize?: "sm" | "md" | "lg";
  wrapperClassName?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 px-2.5 text-[10px]",
  md: "h-9 px-3 text-[11px]",
  lg: "h-10 px-3.5 text-sm",
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      helperText,
      error,
      inputSize = "md",
      wrapperClassName = "",
      className = "",
      disabled,
      ...rest
    },
    ref,
  ) => {
    const baseClasses = [
      "w-full rounded-xl border bg-white transition-colors duration-150",
      "placeholder:text-[#9AA39D]",
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
        <input ref={ref} disabled={disabled} className={baseClasses} {...rest} />
        {error ? (
          <p className="mt-1 text-[9px] text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-[9px] text-[#78827C]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
export default FormInput;
