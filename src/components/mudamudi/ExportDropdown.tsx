"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../common";
import { DownloadIcon } from "./icons";

type Props = {
  onExportData: () => void;
  onExportQR: () => void;
  isExportingQR?: boolean;
};

export default function ExportDropdown({
  onExportData,
  onExportQR,
  isExportingQR = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown jika user klik di luar elemen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Menutup dengan tombol Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={() => !isExportingQR && setIsOpen((prev) => !prev)}
        disabled={isExportingQR}
        isLoading={isExportingQR}
        aria-label="Export data atau QR Code"
        title="Export data atau QR Code"
        aria-haspopup="true"
        aria-expanded={isOpen}
        leftIcon={<DownloadIcon />}
        rightIcon={
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-3.5 w-3.5 text-[#78827C] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#287A50]" : ""
            }`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        <span className="hidden md:inline">Export</span>
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-50 mt-1.5 w-44 origin-top-right rounded-2xl border border-[#E5EAE6] bg-white p-1.5 shadow-lg shadow-black/5 ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* Pilihan 1: Export Data */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onExportData();
            }}
            className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#202824] transition hover:bg-[#E6F2EA] hover:text-[#287A50]"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F7F5] text-[#78827C] group-hover:bg-[#d8eedf] group-hover:text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">Data</p>
              <p className="truncate text-[10px] font-normal text-[#78827C] group-hover:text-[#287A50]/80">
                Format Excel (.xlsx)
              </p>
            </div>
          </button>

          {/* Pilihan 2: Export QR */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onExportQR();
            }}
            className="group mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#202824] transition hover:bg-[#E6F2EA] hover:text-[#287A50]"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F7F5] text-[#78827C] group-hover:bg-[#d8eedf] group-hover:text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <path strokeLinecap="round" d="M14 14h3m-3 3h3m0 4h4m-4-7v3" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">QR</p>
              <p className="truncate text-[10px] font-normal text-[#78827C] group-hover:text-[#287A50]/80">
                Batch ZIP (.png)
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

