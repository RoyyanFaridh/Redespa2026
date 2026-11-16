"use client";
import React, { useState, useRef, useEffect, type ReactNode } from "react";

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  divider?: boolean;
  icon?: ReactNode;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function closeKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", close);
      document.addEventListener("keydown", closeKey);
    }
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div
          className={[
            "absolute z-50 mt-1 min-w-[180px] rounded-xl border border-[#E5EAE6] bg-white py-1 shadow-lg",
            "transition-all duration-150 motion-reduce:transition-none",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          ]
            .filter(Boolean)
            .join(" ")}
          role="menu"
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="my-1 border-t border-[#E5EAE6]" />;
            }
            return (
              <button
                key={idx}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-2 px-3.5 py-2 text-left text-[11px] transition-colors duration-100",
                  item.disabled
                    ? "cursor-not-allowed opacity-40"
                    : "text-[#202824] hover:bg-[#F5F7F5] active:bg-[#E5EAE6]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.icon && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center text-[#78827C]">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
