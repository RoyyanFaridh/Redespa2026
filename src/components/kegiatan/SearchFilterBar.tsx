"use client";

import { useState } from "react";
import { SortConfig } from "../../backend/kegiatan/types";
import { SearchInput } from "../common/SearchInput";
import { Button } from "../common/Button";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  hasActiveFilters: boolean;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  onReset: () => void;
};

export default function SearchFilterBar({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  hasActiveFilters,
  sortConfig,
  setSortConfig,
  onReset,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const activeFilterCount = [filterStatus].filter(Boolean).length;

  const STATUS_LABEL_MAP: Record<string, string> = {
    akan_berlangsung: "Akan berlangsung",
    sedang_berlangsung: "Sedang berlangsung",
    selesai: "Selesai",
  };

  return (
    <div className="mb-4 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <SearchInput
            placeholder="Cari kegiatan atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            inputSize="lg"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`
            flex h-10 items-center justify-center gap-2
            rounded-xl border px-3.5 text-[11px] font-medium
            transition shadow-xs select-none
            ${
              showFilter || hasActiveFilters
                ? "border-[#65B98A] bg-[#E6F2EA] text-[#287A50] ring-2 ring-[#65B98A]/20"
                : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F5F7F5] hover:border-[#D5E0D6]"
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
          >
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#287A50] px-1 text-[9px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter badges / chips */}
      {(activeFilterCount > 0 || search.trim().length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-medium text-[#9AA39D] mr-1">
            Filter aktif:
          </span>

          {search.trim().length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-medium text-[#206440]">
              <span>Cari: &ldquo;{search}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-[#287A50] font-bold ml-0.5"
                title="Hapus filter cari"
              >
                ×
              </button>
            </span>
          )}

          {filterStatus && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-medium text-[#206440]">
              <span>Status: {STATUS_LABEL_MAP[filterStatus] ?? filterStatus}</span>
              <button
                type="button"
                onClick={() => setFilterStatus("")}
                className="hover:text-[#287A50] font-bold ml-0.5"
                title="Hapus filter status"
              >
                ×
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            className="text-[10px] font-medium text-red-600 hover:text-red-700 ml-1 transition"
          >
            Reset Semua
          </button>
        </div>
      )}

      {showFilter && (
        <div className="rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-sm animate-in fade-in duration-150">
          <div className="mb-4 flex items-center justify-between border-b border-[#E5EAE6] pb-3">
            <div>
              <h3 className="text-[11px] font-semibold text-[#202824]">
                Filter & Pengurutan
              </h3>
              <p className="mt-0.5 text-[9px] text-[#78827C]">
                Saring dan atur urutan tampilan data kegiatan
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              aria-label="Tutup filter"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9AA39D] transition hover:bg-[#F0F4F1] hover:text-[#78827C]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3.5 w-3.5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#202824]">
                Urutkan Berdasarkan
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="sort"
                    checked={
                      sortConfig?.key === "created_at" &&
                      sortConfig?.direction === "desc"
                    }
                    onChange={() =>
                      setSortConfig({
                        key: "created_at",
                        direction: "desc",
                      })
                    }
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Terbaru dibuat
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="sort"
                    checked={
                      sortConfig?.key === "tanggal_mulai" &&
                      sortConfig?.direction === "asc"
                    }
                    onChange={() =>
                      setSortConfig({
                        key: "tanggal_mulai",
                        direction: "asc",
                      })
                    }
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Tanggal terdekat
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="sort"
                    checked={
                      sortConfig?.key === "nama" &&
                      sortConfig?.direction === "asc"
                    }
                    onChange={() =>
                      setSortConfig({
                        key: "nama",
                        direction: "asc",
                      })
                    }
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Nama A - Z
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="sort"
                    checked={
                      sortConfig?.key === "nama" &&
                      sortConfig?.direction === "desc"
                    }
                    onChange={() =>
                      setSortConfig({
                        key: "nama",
                        direction: "desc",
                      })
                    }
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Nama Z - A
                </label>
              </div>
            </div>

            <div className="border-t border-[#E5EAE6] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="mb-2 text-[10px] font-semibold text-[#202824]">
                Status Kegiatan
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="status"
                    value=""
                    checked={filterStatus === ""}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Semua
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="status"
                    value="akan_berlangsung"
                    checked={filterStatus === "akan_berlangsung"}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Akan berlangsung
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="status"
                    value="sedang_berlangsung"
                    checked={filterStatus === "sedang_berlangsung"}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Sedang berlangsung
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#78827C] hover:text-[#202824]">
                  <input
                    type="radio"
                    name="status"
                    value="selesai"
                    checked={filterStatus === "selesai"}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-3.5 w-3.5 accent-[#287A50]"
                  />
                  Selesai
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#E5EAE6] pt-3">
            <button
              type="button"
              onClick={onReset}
              className="text-[10px] font-medium text-[#78827C] hover:text-red-600 transition"
            >
              Reset filter
            </button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowFilter(false)}
            >
              Terapkan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
