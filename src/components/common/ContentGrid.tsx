import React, { type ReactNode } from "react";

export interface ContentGridProps {
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: "gap-1.5" | "gap-2" | "gap-3" | "gap-4" | "gap-6";
  children: ReactNode;
  className?: string;
}

const COL_STYLES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export function ContentGrid({
  columns = 3,
  gap = "gap-3",
  children,
  className = "",
}: ContentGridProps) {
  return (
    <div
      className={[
        "grid",
        COL_STYLES[columns] ?? COL_STYLES[3],
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

export default ContentGrid;
