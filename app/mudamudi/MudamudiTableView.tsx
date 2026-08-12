'use client'

import { useEffect, useState } from 'react'
import { Mudamudi, SortKey, PerPageOption } from './types'
import MobileList from './MobileList'
import DesktopTable from './DesktopTable'
import Pagination from './Pagination'

type Props = {
  data: Mudamudi[]
  totalCount: number
  sortIndicator: (key: SortKey) => string
  toggleSort: (key: SortKey) => void
  onEdit: (s: Mudamudi) => void
  onDelete: (s: Mudamudi) => void
  filterKey: string
}

const PER_PAGE_OPTIONS: PerPageOption[] = [10, 50, 100]

export default function MudamudiTableView({
  data,
  totalCount,
  sortIndicator,
  toggleSort,
  onEdit,
  onDelete,
  filterKey,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PerPageOption>(10)

  const totalPages = Math.ceil(data.length / itemsPerPage)

  // Jaring pengaman: halaman tidak boleh melebihi total halaman
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1)
      return
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Reset ke halaman 1 kalau search/filter/sort berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [filterKey])

  // Reset ke halaman 1 kalau jumlah item per halaman diubah
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

  const displayStart = data.length === 0 ? 0 : startIndex + 1
  const displayEnd = Math.min(startIndex + itemsPerPage, data.length)

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <p className="mb-2.5 text-[12px] text-gray-500">
        Menampilkan{' '}
        <span className="font-medium text-gray-600">
          {displayStart}
          {data.length > 0 && displayEnd !== displayStart ? `–${displayEnd}` : ''}
        </span>{' '}
        dari{' '}
        <span className="font-medium text-gray-600">{totalCount}</span>{' '}
        data
      </p>

      <MobileList
        data={paginatedData}
        onEdit={onEdit}
        onDelete={onDelete}
        startIndex={(currentPage - 1) * itemsPerPage}
      />

      <DesktopTable
        data={paginatedData}
        startIndex={startIndex}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        perPageOptions={PER_PAGE_OPTIONS}
        onItemsPerPageChange={setItemsPerPage}
        onGoToPage={goToPage}
      />
    </div>
  )
}