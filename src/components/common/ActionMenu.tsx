"use client";
import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { IconButton } from "./IconButton";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  icon?: ReactNode;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function ActionMenu({
  items,
  trigger,
  align = "right",
  className = "",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((v) => !v)}>
        {trigger ?? (
          <IconButton variant="neutral" size="sm" label="Menu opsi" bordered>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </IconButton>
        )}
      </div>

      {open && (
        <div
          className={[
            "absolute z-50 mt-1 min-w-[160px] rounded-xl border border-[#E5EAE6] bg-white py-1 shadow-lg",
            "transition-all duration-150 motion-reduce:transition-none",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          ]
            .filter(Boolean)
            .join(" ")}
          role="menu"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2 px-3.5 py-2 text-left text-[11px] transition-colors duration-100",
                item.disabled
                  ? "cursor-not-allowed opacity-40"
                  : item.variant === "danger"
                  ? "text-red-600 hover:bg-red-50 active:bg-red-100"
                  : "text-[#202824] hover:bg-[#F5F7F5] active:bg-[#E5EAE6]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.icon && (
                <span className="flex h-3.5 w-3.5 items-center justify-center">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionMenu;
