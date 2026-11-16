"use client";

import { useState } from "react";
import {
  KELOMPOK_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
} from "../../backend/jamaah/constants";
import type { SortConfig, SortKey } from "../../backend/jamaah/types";
import { SearchInput, Button } from "../common";

type SortOption = {
  label: string;
  key: SortKey;
  direction: "asc" | "desc";
};

type Props = {
  search: string;
  setSearch: (value: string) => void;

  filterKelompok: string[];
  setFilterKelompok: (values: string[]) => void;

  filterJenisKelamin: string[];
  setFilterJenisKelamin: (values: string[]) => void;

  hasActiveFilters: boolean;
  sortConfig: NonNullable<SortConfig>;
  setSortConfig: (config: NonNullable<SortConfig>) => void;

  onReset: () => void;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Terbaru", key: "created_at", direction: "desc" },
  { label: "Nama A - Z", key: "nama", direction: "asc" },
  { label: "Nama Z - A", key: "nama", direction: "desc" },
];

export default function SearchFilterBar({
  search,
  setSearch,
  filterKelompok,
  setFilterKelompok,
  filterJenisKelamin,
  setFilterJenisKelamin,
  sortConfig,
  setSortConfig,
  hasActiveFilters,
  onReset,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const activeFilterCount =
    filterKelompok.length + filterJenisKelamin.length;

  function toggleArrayValue(
    value: string,
    current: string[],
    setter: (values: string[]) => void,
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function removeChip(
    value: string,
    current: string[],
    setter: (values: string[]) => void,
  ) {
    setter(current.filter((item) => item !== value));
  }

  const checkboxClass = "h-3.5 w-3.5 shrink-0 rounded accent-[#287A50]";
  const optionClass =
    "flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600 select-none";
  const sectionTitleClass = "mb-1.5 text-[11px] font-semibold text-gray-700";
  const sectionClass =
    "min-w-0 border-t border-gray-100 pt-3 first:border-t-0 first:pt-0";
  const optionGridClass =
    "grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-3 2xl:grid-cols-4";

  function renderChips(
    label: string,
    values: string[],
    setter: (values: string[]) => void,
  ) {
    return values.map((value) => (
      <span
        key={`${label}-${value}`}
        className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAE6] bg-[#E6F2EA] px-2 py-0.5 text-[11px] font-medium text-[#206440]"
      >
        <span>
          {label}: {value}
        </span>
        <button
          type="button"
          onClick={() => removeChip(value, values, setter)}
          aria-label={`Hapus filter ${label} ${value}`}
          className="ml-0.5 hover:text-red-600"
        >
          ×
        </button>
      </span>
    ));
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
        <SearchInput
          placeholder="Cari nama Jamaah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          inputSize="md"
        />

        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-[11px] font-medium shadow-xs transition ${
            showFilter || hasActiveFilters
              ? "border-[#65B98A] bg-[#E6F2EA] text-[#287A50] ring-2 ring-[#65B98A]/20"
              : "border-[#E5EAE6] bg-white text-[#202824] hover:border-[#65B98A]/40 hover:bg-[#F0F4F1]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
              clipRule="evenodd"
            />
          </svg>
          <span>Filter</span>

          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#287A50] px-1 text-[9px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {search.trim() && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAE6] bg-[#E6F2EA] px-2 py-0.5 text-[11px] font-medium text-[#206440]">
              <span>Cari: &ldquo;{search.trim()}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus filter pencarian"
                className="ml-0.5 hover:text-red-600"
              >
                ×
              </button>
            </span>
          )}

          {renderChips("Kelompok", filterKelompok, setFilterKelompok)}
          {renderChips("Gender", filterJenisKelamin, setFilterJenisKelamin)}

          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-[#78827C] underline underline-offset-2 transition hover:text-[#202824]"
          >
            Reset semua
          </button>
        </div>
      )}

      {/* Filter Popover / Panel */}
      {showFilter && (
        <div className="relative z-20 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
          <div className="border-b border-gray-100 bg-[#F5F7F5] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#202824]">
                  Filter & Urutkan
                </p>
                <p className="text-[9px] text-[#78827C]">
                  Saring data berdasarkan kelompok, jenis kelamin, dan urutan.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[11px] font-medium text-emerald-600 transition hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="min-w-0 space-y-3">
                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Urutan</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {SORT_OPTIONS.map((option) => (
                      <label
                        key={`${option.key}-${option.direction}`}
                        className={optionClass}
                      >
                        <input
                          type="radio"
                          name="sort-jamaah"
                          checked={
                            sortConfig.key === option.key &&
                            sortConfig.direction === option.direction
                          }
                          onChange={() =>
                            setSortConfig({
                              key: option.key,
                              direction: option.direction,
                            })
                          }
                          className="h-3.5 w-3.5 shrink-0 accent-[#287A50]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </section>

                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Kelompok</p>
                  <div className={optionGridClass}>
                    {KELOMPOK_OPTIONS.map((kelompok) => (
                      <label
                        key={kelompok}
                        className={optionClass}
                      >
                        <input
                          type="checkbox"
                          checked={filterKelompok.includes(kelompok)}
                          onChange={() =>
                            toggleArrayValue(
                              kelompok,
                              filterKelompok,
                              setFilterKelompok,
                            )
                          }
                          className={checkboxClass}
                        />
                        <span>{kelompok}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <div className="min-w-0 space-y-3 border-t border-gray-100 pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <section className={sectionClass}>
                  <p className={sectionTitleClass}>Jenis Kelamin</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {JENIS_KELAMIN_OPTIONS.map((jenisKelamin) => (
                      <label
                        key={jenisKelamin}
                        className={optionClass}
                      >
                        <input
                          type="checkbox"
                          checked={filterJenisKelamin.includes(jenisKelamin)}
                          onChange={() =>
                            toggleArrayValue(
                              jenisKelamin,
                              filterJenisKelamin,
                              setFilterJenisKelamin,
                            )
                          }
                          className={checkboxClass}
                        />
                        {jenisKelamin}
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-4 py-2.5">
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] text-gray-500 underline underline-offset-2 transition hover:text-gray-700"
            >
              Reset filter
            </button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowFilter(false)}
            >
              Selesai
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
