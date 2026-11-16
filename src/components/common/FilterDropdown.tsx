"use client";
import React, { useState, useRef, useEffect, type ReactNode } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Semua",
  className = "",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E5EAE6] bg-white px-3 text-[11px] text-[#202824] shadow-xs transition hover:border-[#287A50]/40 focus:outline-none focus:ring-2 focus:ring-[#65B98A]/30"
      >
        <span className="text-[9px] font-medium text-[#78827C]">{label}:</span>
        <span className="font-medium">{selected?.label ?? placeholder}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 min-w-[160px] rounded-xl border border-[#E5EAE6] bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full px-3.5 py-2 text-left text-[11px] hover:bg-[#F5F7F5] ${!value ? "font-medium text-[#287A50]" : "text-[#202824]"}`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3.5 py-2 text-left text-[11px] hover:bg-[#F5F7F5] ${opt.value === value ? "font-medium text-[#287A50]" : "text-[#202824]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
