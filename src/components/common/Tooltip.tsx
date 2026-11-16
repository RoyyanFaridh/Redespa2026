"use client";
import React, { useState, type ReactNode } from "react";

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const POSITION_STYLES: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={[
            "pointer-events-none absolute z-50 max-w-[220px] rounded-lg bg-[#181C1B] px-2.5 py-1.5 text-[10px] leading-4 text-white shadow-md whitespace-nowrap",
            "transition-opacity duration-150 motion-reduce:transition-none",
            POSITION_STYLES[position],
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
