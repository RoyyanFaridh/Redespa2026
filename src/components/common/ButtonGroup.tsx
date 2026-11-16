import React, { type ReactNode } from "react";

export interface ButtonGroupProps {
  children: ReactNode;
  gap?: "gap-1" | "gap-2" | "gap-3";
  className?: string;
}

export function ButtonGroup({
  children,
  gap = "gap-2",
  className = "",
}: ButtonGroupProps) {
  return (
    <div
      className={[
        "flex items-center",
        gap,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default ButtonGroup;
