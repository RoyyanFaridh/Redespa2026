"use client";
import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 ${className}`}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[10px] text-[#78827C] transition-colors hover:text-[#287A50]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-[10px] ${
                  isLast
                    ? "font-medium text-[#202824]"
                    : "text-[#78827C]"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-2.5 w-2.5 text-[#9AA39D]"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 18 6-6-6-6"
                />
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
