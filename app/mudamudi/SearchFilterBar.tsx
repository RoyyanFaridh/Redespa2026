'use client'

import { useState } from 'react'
import {
  JENJANG_OPTIONS,
  KELOMPOK_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
} from './constants'
import { SortConfig } from './types'

type Props = {
  search: string
  setSearch: (v: string) => void
  filterJenjang: string
  setFilterJenjang: (v: string) => void
  filterKelompok: string
  setFilterKelompok: (v: string) => void
  filterJenisKelamin: string
  setFilterJenisKelamin: (v: string) => void
  hasActiveFilters: boolean
  sortConfig: SortConfig
  setSortConfig: (config: SortConfig) => void
  onReset: () => void
}

export default function SearchFilterBar({
  search,
  setSearch,
  filterJenjang,
  setFilterJenjang,
  filterKelompok,
  setFilterKelompok,
  filterJenisKelamin,
  setFilterJenisKelamin,
  sortConfig,
  setSortConfig,
  hasActiveFilters,
  onReset,
}: Props) {
  const [showFilter, setShowFilter] = useState(false)

  const activeFilterCount = [
    filterJenisKelamin,
    filterJenjang,
    filterKelompok,
  ].filter(Boolean).length

  return (
    <div className="mb-4">
      {/* ==================================================
        SEARCH + FILTER BUTTON
        ================================================== */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
        
        {/* Search */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9.5 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* ==================================================
          FILTER BUTTON
          ================================================== */}
        <button
          type="button"
          onClick={() => setShowFilter((prev) => !prev)}
          className={`
            flex h-9.5 items-center justify-center gap-1.5
            rounded-lg border px-3 text-[12px]
            transition
            ${
              showFilter || hasActiveFilters
                ? 'border-teal-200 bg-teal-50 text-teal-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          {/* Filter Icon */}
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

          Filter

          {/* Active Filter Count */}
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-700 px-1 text-[9px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ==================================================
        FILTER PANEL
        ================================================== */}
      {showFilter && (
        <div className="mt-2.5 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          
          {/* ==================================================
            HEADER
            ================================================== */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[12px] font-semibold text-gray-800">
                Filter Data
              </h3>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Pilih kriteria untuk menyaring data
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              aria-label="Tutup filter"
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* ==================================================
            FILTER OPTIONS
            ================================================== */}
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            <div>
              <div className="mb-4 border-b border-gray-100 pb-4">
                <p className="mb-2 text-[11px] font-medium text-gray-600">
                  Urutkan
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="radio"
                      name="sort"
                      checked={
                        sortConfig?.key === 'created_at' &&
                        sortConfig?.direction === 'desc'
                      }
                      onChange={() =>
                        setSortConfig({
                          key: 'created_at',
                          direction: 'desc',
                        })
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    Terbaru
                  </label>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="radio"
                      name="sort"
                      checked={
                        sortConfig?.key === 'nama' &&
                        sortConfig?.direction === 'asc'
                      }
                      onChange={() =>
                        setSortConfig({
                          key: 'nama',
                          direction: 'asc',
                        })
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    Nama A - Z
                  </label>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="radio"
                      name="sort"
                      checked={
                        sortConfig?.key === 'nama' &&
                        sortConfig?.direction === 'desc'
                      }
                      onChange={() =>
                        setSortConfig({
                          key: 'nama',
                          direction: 'desc',
                        })
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    Nama Z - A
                  </label>
                </div>
              </div>
              
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                Jenis Kelamin
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {/* Semua */}
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="jenis-kelamin"
                    value=""
                    checked={filterJenisKelamin === ''}
                    onChange={(e) =>
                      setFilterJenisKelamin(e.target.value)
                    }
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {JENIS_KELAMIN_OPTIONS.map((jk) => (
                  <label
                    key={jk}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="jenis-kelamin"
                      value={jk}
                      checked={filterJenisKelamin === jk}
                      onChange={(e) =>
                        setFilterJenisKelamin(e.target.value)
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {jk}
                  </label>
                ))}
              </div>
            </div>

            {/* ==================================================
              JENJANG
              ================================================== */}
            <div className="border-t border-gray-100 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                Jenjang
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {/* Semua */}
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="jenjang"
                    value=""
                    checked={filterJenjang === ''}
                    onChange={(e) =>
                      setFilterJenjang(e.target.value)
                    }
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {JENJANG_OPTIONS.map((j) => (
                  <label
                    key={j}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="jenjang"
                      value={j}
                      checked={filterJenjang === j}
                      onChange={(e) =>
                        setFilterJenjang(e.target.value)
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {j}
                  </label>
                ))}
              </div>
            </div>

            {/* ==================================================
              KELOMPOK
              ================================================== */}
            <div className="border-t border-gray-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="mb-2 text-[11px] font-medium text-gray-600">
                Kelompok
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {/* Semua */}
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600">
                  <input
                    type="radio"
                    name="kelompok"
                    value=""
                    checked={filterKelompok === ''}
                    onChange={(e) =>
                      setFilterKelompok(e.target.value)
                    }
                    className="h-3.5 w-3.5 accent-teal-600"
                  />
                  Semua
                </label>

                {KELOMPOK_OPTIONS.map((k) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-600"
                  >
                    <input
                      type="radio"
                      name="kelompok"
                      value={k}
                      checked={filterKelompok === k}
                      onChange={(e) =>
                        setFilterKelompok(e.target.value)
                      }
                      className="h-3.5 w-3.5 accent-teal-600"
                    />
                    {k}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
            FOOTER
            ================================================== */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] text-gray-500 underline underline-offset-2 transition hover:text-gray-700"
            >
              Reset filter
            </button>

            <button
              type="button"
              onClick={() => setShowFilter(false)}
              className="rounded-lg bg-teal-700 px-3.5 py-2 text-[11px] font-medium text-white transition hover:bg-teal-800"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  )
}