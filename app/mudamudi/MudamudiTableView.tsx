'use client'

import { useEffect, useState } from 'react'
import { Mudamudi, SortKey } from './types'
import { toTitleCase } from './format'

type Props = {
  data: Mudamudi[]
  totalCount: number
  sortIndicator: (key: SortKey) => string
  toggleSort: (key: SortKey) => void
  onEdit: (s: Mudamudi) => void
  onDelete: (s: Mudamudi) => void
}

const ITEMS_PER_PAGE = 10

export default function MudamudiTableView({
  data,
  totalCount,
  sortIndicator,
  toggleSort,
  onEdit,
  onDelete,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)

  // Pastikan halaman tidak melebihi jumlah halaman
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1)
      return
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Reset ke halaman pertama ketika hasil filter berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length])

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  const paginatedData = data.slice(startIndex, endIndex)

  const displayStart = data.length === 0 ? 0 : startIndex + 1
  const displayEnd = Math.min(startIndex + ITEMS_PER_PAGE, data.length)

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return

    setCurrentPage(page)

    // Scroll sedikit ke atas ketika pindah halaman
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  /*
   * =========================================================
   * PAGE NUMBERS
   * =========================================================
   */

  function getPageNumbers() {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }

      return pages
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)

    return pages
  }

  /*
   * =========================================================
   * INITIALS
   * =========================================================
   */

  function getInitials(nama: string) {
    return toTitleCase(nama)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div>

      {/* =====================================================
          DATA COUNT
          ===================================================== */}
      <p className="mb-2.5 text-[12px] text-gray-500">
        Menampilkan{' '}
        <span className="font-medium text-gray-600">
          {displayStart}
          {data.length > 0 && displayEnd !== displayStart
            ? `–${displayEnd}`
            : ''}
        </span>{' '}
        dari{' '}
        <span className="font-medium text-gray-600">
          {totalCount}
        </span>{' '}
        data
      </p>

      {/* =====================================================
          MOBILE VIEW
          ===================================================== */}
      <div className="space-y-2.5 md:hidden">
        {paginatedData.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-[12px] text-gray-500">
            Tidak ada data yang cocok
          </div>
        ) : (
          paginatedData.map((s) => {
            const initials = getInitials(s.nama)

            return (
              <div
                key={s.id}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                {/* Informasi utama */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">

                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e87500] text-[10px] font-medium text-white">
                      {initials}
                    </div>

                    {/* Nama + Kelompok */}
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-gray-800">
                        {toTitleCase(s.nama)}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-gray-400">
                        {s.kelompok}
                      </p>
                    </div>
                  </div>

                  {/* Badge Jenjang */}
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      s.jenjang === 'Pra Nikah'
                        ? 'border-orange-200 bg-orange-50 text-orange-500'
                        : s.jenjang === 'Remaja'
                          ? 'border-teal-200 bg-teal-50 text-teal-600'
                          : 'border-blue-200 bg-blue-50 text-blue-600'
                    }`}
                  >
                    {s.jenjang}
                  </span>
                </div>

                {/* Divider */}
                <div className="my-2.5 border-t border-gray-100" />

                {/* Aksi */}
                <div className="flex items-center gap-3">

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEdit(s)}
                    className="inline-flex items-center gap-1 text-[11px] text-teal-700 transition hover:text-teal-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20h9"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
                      />
                    </svg>

                    Edit
                  </button>

                  {/* Hapus */}
                  <button
                    type="button"
                    onClick={() => onDelete(s)}
                    className="inline-flex items-center gap-1 text-[11px] text-red-500 transition hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6h18"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 6V4h8v2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 6l-1 14H6L5 6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 11v5M14 11v5"
                      />
                    </svg>

                    Hapus
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* =====================================================
          TABLET / DESKTOP VIEW
          ===================================================== */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:block">
        <table className="w-full border-collapse">

          <thead>
            <tr className="border-b border-gray-200 bg-white">

              <th className="w-12 px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500">
                NO
              </th>

              <th
                className="cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
                onClick={() => toggleSort('nama')}
              >
                NAMA{sortIndicator('nama')}
              </th>

              <th
                className="w-36.25 cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
                onClick={() => toggleSort('jenjang')}
              >
                JENJANG{sortIndicator('jenjang')}
              </th>

              <th
                className="w-47.5 cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
                onClick={() => toggleSort('kelompok')}
              >
                KELOMPOK{sortIndicator('kelompok')}
              </th>

              <th className="w-31.25 px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-gray-500">
                AKSI
              </th>

            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[12px] text-gray-500"
                >
                  Tidak ada data yang cocok
                </td>
              </tr>
            ) : (
              paginatedData.map((s, i) => {

                const initials = getInitials(s.nama)

                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >

                    {/* No */}
                    <td className="px-3 py-2.5 text-[11px] text-gray-400">
                      {startIndex + i + 1}
                    </td>

                    {/* Nama */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e87500] text-[9px] font-medium text-white">
                          {initials}
                        </div>

                        <span className="text-[11px] font-medium text-gray-800">
                          {toTitleCase(s.nama)}
                        </span>

                      </div>
                    </td>

                    {/* Jenjang */}
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          s.jenjang === 'Pra Nikah'
                            ? 'border-orange-200 bg-orange-50 text-orange-500'
                            : s.jenjang === 'Remaja'
                              ? 'border-teal-200 bg-teal-50 text-teal-600'
                              : 'border-blue-200 bg-blue-50 text-blue-600'
                        }`}
                      >
                        {s.jenjang}
                      </span>
                    </td>

                    {/* Kelompok */}
                    <td className="px-3 py-2.5 text-[11px] text-gray-600">
                      {s.kelompok}
                    </td>

                    {/* Aksi */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-3">

                        <button
                          type="button"
                          onClick={() => onEdit(s)}
                          className="inline-flex items-center gap-1 text-[11px] text-teal-700 transition hover:text-teal-900"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 20h9"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1-1 4L16.5 3.5Z"
                            />
                          </svg>

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(s)}
                          className="inline-flex items-center gap-1 text-[11px] text-red-500 transition hover:text-red-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 6h18"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 6V4h8v2"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 6l-1 14H6L5 6"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 11v5M14 11v5"
                            />
                          </svg>

                          Hapus
                        </button>

                      </div>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>

        </table>
      </div>

      {/* =====================================================
          PAGINATION
          ===================================================== */}
      {totalPages > 1 && (
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">

          {/* Info */}
          <p className="text-[10px] text-gray-400">
            Halaman{' '}
            <span className="font-medium text-gray-600">
              {currentPage}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-gray-600">
              {totalPages}
            </span>
          </p>

          {/* Controls */}
          <div className="flex items-center justify-between gap-1 sm:justify-end">

            {/* Previous */}
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 18-6-6 6-6"
                />
              </svg>

              <span className="hidden sm:inline">
                Sebelumnya
              </span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">

              {getPageNumbers().map((page, index) => {
                if (page === 'ellipsis') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-7.5 w-7.5 items-center justify-center text-[10px] text-gray-400"
                    >
                      …
                    </span>
                  )
                }

                const isActive = page === currentPage

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex h-7.5 w-7.5 items-center justify-center rounded-lg border text-[10px] font-medium transition ${
                      isActive
                        ? 'border-[#0d7f78] bg-[#0d7f78] text-white'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

            </div>

            {/* Next */}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">
                Berikutnya
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </button>

          </div>
        </div>
      )}
    </div>
  )
}