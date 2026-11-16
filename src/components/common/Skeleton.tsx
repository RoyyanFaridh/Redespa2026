import React from "react";

export interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
}

export function Skeleton({ className = "", count = 1, circle = false }: SkeletonProps) {
  const base = [
    "animate-pulse bg-[#E5EAE6]",
    circle ? "rounded-full" : "rounded-lg",
    className || (circle ? "h-10 w-10" : "h-4 w-full"),
  ]
    .filter(Boolean)
    .join(" ");

  if (count === 1) return <div className={base} aria-hidden="true" />;

  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={base} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-xs sm:p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <div className="mb-3 h-4 w-2/5 animate-pulse rounded-lg bg-[#E5EAE6]" />
      <div className="mb-2 h-7 w-3/5 animate-pulse rounded-lg bg-[#E5EAE6]" />
      <div className="h-3 w-4/5 animate-pulse rounded-lg bg-[#E5EAE6]" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs" aria-hidden="true">
      <div className="border-b border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 flex-1 animate-pulse rounded bg-[#E5EAE6]" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[#E5EAE6] px-4 py-3 last:border-0">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 flex-1 animate-pulse rounded bg-[#E5EAE6]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
