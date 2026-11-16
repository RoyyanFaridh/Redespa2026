"use client";

import { useMemo, useState } from "react";
import {
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
} from "../../../backend/mudamudi/constants";
import { SearchInput } from "../../common";

type BulanOption = {
  value: string;
  label: string;
};

type Props = {
  search: string;
  selectedMonth: string;
  selectedKegiatan: string;
  selectedKelompok: string;
  selectedKelas: string;
  kegiatan: {
    id: number;
    nama: string;
    tanggal_mulai: string;
  }[];
  bulanOptions: BulanOption[];
  mudamudi: unknown[];
  onSearchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onKegiatanChange: (value: string) => void;
  onKelompokChange: (value: string) => void;
  onKelasChange: (value: string) => void;
};

const CONTROL_CLASS =
  "h-9 w-full min-w-0 rounded-xl border border-[#E5EAE6] bg-white px-3 text-xs text-[#202824] placeholder:text-[#9AA39D] outline-none transition focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20";

const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[#78827C]";

export default function RekapitulasiFilter({
  search,
  selectedMonth,
  selectedKegiatan,
  selectedKelompok,
  selectedKelas,
  kegiatan,
  bulanOptions,
  onSearchChange,
  onMonthChange,
  onKegiatanChange,
  onKelompokChange,
  onKelasChange,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);

  const activeFilterCount = [
    selectedKelompok,
    selectedKelas,
  ].filter(Boolean).length;

  const hasActiveFilter = activeFilterCount > 0;

  const handleReset = () => {
    onKelompokChange("");
    onKelasChange("");
  };

  const filteredKegiatan = useMemo(
    () =>
      [...kegiatan].sort(
        (a, b) =>
          b.tanggal_mulai.localeCompare(a.tanggal_mulai) || b.id - a.id,
      ),
    [kegiatan],
  );

  return (
    <section className="mb-3 space-y-2.5">
      <div className="rounded-2xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px] items-end gap-x-3 gap-y-3 lg:grid-cols-[minmax(180px,1.35fr)_minmax(140px,0.8fr)_minmax(170px,1fr)_auto] lg:gap-x-4 lg:gap-y-3">
          <div className="col-span-3 min-w-0 lg:col-span-1">
            <label htmlFor="rekap-search" className={LABEL_CLASS}>
              Cari Jamaah
            </label>

            <SearchInput
              id="rekap-search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange("")}
              placeholder="Cari nama Jamaah..."
              inputSize="md"
            />
          </div>

          <div className="min-w-0">
            <label htmlFor="rekap-month" className={LABEL_CLASS}>
              Periode
            </label>

            <select
              id="rekap-month"
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Semua Periode</option>
              {bulanOptions.map((bulan) => (
                <option key={bulan.value} value={bulan.value}>
                  {bulan.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label htmlFor="rekap-kegiatan" className={LABEL_CLASS}>
              Kegiatan
            </label>

            <select
              id="rekap-kegiatan"
              value={selectedKegiatan}
              onChange={(event) => onKegiatanChange(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Semua Kegiatan</option>
              {filteredKegiatan.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowFilter((current) => !current)}
            aria-label={
              showFilter ? "Tutup filter lanjutan" : "Buka filter lanjutan"
            }
            aria-expanded={showFilter}
            aria-controls="rekap-filter-tambahan"
            title="Filter lanjutan"
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors lg:h-9 lg:w-auto lg:min-w-28 lg:gap-2 lg:px-3 ${
              showFilter || hasActiveFilter
                ? "border-[#287A50] bg-[#E6F2EA] text-[#287A50] font-medium"
                : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F5F7F5] hover:text-[#202824]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M4 7h16M7 12h10m-7 5h4" />
            </svg>

            <span className="hidden text-xs font-medium lg:inline">
              Filter
            </span>

            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#287A50] px-1 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className={`hidden h-3 w-3 shrink-0 transition-transform lg:inline ${
                showFilter ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {(hasActiveFilter || search.trim().length > 0) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5EAE6] pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-[10px] font-medium text-[#78827C]">
                Filter aktif:
              </span>

              {search.trim().length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-medium text-[#206440]">
                  <span>Cari: &ldquo;{search}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="ml-0.5 font-bold hover:text-[#144229]"
                    title="Hapus pencarian"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedKelompok && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-medium text-[#206440]">
                  <span>Kelompok: {selectedKelompok}</span>
                  <button
                    type="button"
                    onClick={() => onKelompokChange("")}
                    className="ml-0.5 font-bold hover:text-[#144229]"
                    title="Hapus filter kelompok"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedKelas && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-medium text-[#206440]">
                  <span>Kelas: {selectedKelas}</span>
                  <button
                    type="button"
                    onClick={() => onKelasChange("")}
                    className="ml-0.5 font-bold hover:text-[#144229]"
                    title="Hapus filter kelas"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] font-medium text-rose-600 transition hover:text-rose-700"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {showFilter && (
        <div
          id="rekap-filter-tambahan"
          className="rounded-2xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-[#202824]">
              Filter Lanjutan
            </h3>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-medium text-rose-600 hover:text-rose-700"
              >
                Hapus pilihan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="rekap-kelompok" className={LABEL_CLASS}>
                Kelompok
              </label>

              <select
                id="rekap-kelompok"
                value={selectedKelompok}
                onChange={(event) => onKelompokChange(event.target.value)}
                className={CONTROL_CLASS}
              >
                <option value="">Semua Kelompok</option>
                {KELOMPOK_OPTIONS.map((kelompok) => (
                  <option key={kelompok} value={kelompok}>
                    {kelompok}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="rekap-kelas" className={LABEL_CLASS}>
                Kelas
              </label>

              <select
                id="rekap-kelas"
                value={selectedKelas}
                onChange={(event) => onKelasChange(event.target.value)}
                className={CONTROL_CLASS}
              >
                <option value="">Semua Kelas</option>
                {KELAS_OPTIONS.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
