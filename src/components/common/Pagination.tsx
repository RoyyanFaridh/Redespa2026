"use client";

import React from "react";

export interface PaginationProps<T extends number = number> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: T;
  perPageOptions: readonly T[] | T[];
  onItemsPerPageChange: (value: T) => void;
  onGoToPage: (page: number) => void;
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (currentPage > 3) pages.push("ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}

export function Pagination<T extends number = number>({
  currentPage,
  totalPages,
  itemsPerPage,
  perPageOptions,
  onItemsPerPageChange,
  onGoToPage,
  className = "",
}: PaginationProps<T>) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={[
        "mt-4 flex flex-col gap-3 rounded-xl border border-[#E5EAE6] bg-white px-3.5 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-[#78827C]">
        <label htmlFor="per-page-select">Tampilkan</label>
        <select
          id="per-page-select"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value) as T)}
          className="rounded-lg border border-[#E5EAE6] bg-white px-2 py-1 text-[11px] text-[#202824] transition hover:border-[#287A50] focus:border-[#287A50] focus:ring-1 focus:ring-[#65B98A]/30 outline-none cursor-pointer"
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>per halaman</span>
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <button
          type="button"
          onClick={() => onGoToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAE6] bg-white text-[#78827C] transition hover:border-[#287A50] hover:text-[#287A50] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-[11px] text-[#78827C]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onGoToPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium transition ${
                  p === currentPage
                    ? "bg-[#287A50] text-white shadow-xs"
                    : "border border-[#E5EAE6] bg-white text-[#202824] hover:border-[#287A50] hover:text-[#287A50]"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onGoToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Halaman berikutnya"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAE6] bg-white text-[#78827C] transition hover:border-[#287A50] hover:text-[#287A50] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;

