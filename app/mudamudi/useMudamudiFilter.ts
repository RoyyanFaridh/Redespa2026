import { useState, useMemo } from 'react'
import { Mudamudi, SortKey, SortConfig } from './types'

const DEFAULT_SORT: SortConfig = {
  key: 'created_at',
  direction: 'desc',
}

export function useMudamudiFilter(initialData: Mudamudi[]) {
  const [search, setSearch] = useState('')
  const [filterJenisKelamin, setFilterJenisKelamin] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [filterKelompok, setFilterKelompok] = useState('')

  // Default: data terbaru
  const [sortConfig, setSortConfig] =
    useState<SortConfig>(DEFAULT_SORT)

  const displayedData = useMemo(() => {
    let result = [...initialData]

    // ============================================================
    // SEARCH
    // ============================================================

    if (search.trim()) {
      const keyword = search.trim().toLowerCase()

      result = result.filter((s) =>
        s.nama.toLowerCase().includes(keyword)
      )
    }

    // ============================================================
    // FILTER JENIS KELAMIN
    // ============================================================

    if (filterJenisKelamin) {
      result = result.filter(
        (s) => s.jenis_kelamin === filterJenisKelamin
      )
    }

    // ============================================================
    // FILTER JENJANG
    // ============================================================

    if (filterJenjang) {
      result = result.filter(
        (s) => s.jenjang === filterJenjang
      )
    }

    // ============================================================
    // FILTER KELOMPOK
    // ============================================================

    if (filterKelompok) {
      result = result.filter(
        (s) => s.kelompok === filterKelompok
      )
    }

    // ============================================================
    // SORT
    // ============================================================

    if (sortConfig) {
      result.sort((a, b) => {
        // --------------------------------------------------------
        // TERBARU / TERLAMA
        // --------------------------------------------------------

        if (sortConfig.key === 'created_at') {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()

          return sortConfig.direction === 'asc'
            ? dateA - dateB
            : dateB - dateA
        }

        // --------------------------------------------------------
        // NAMA
        // --------------------------------------------------------

        if (sortConfig.key === 'nama') {
          const comparison = a.nama.localeCompare(
            b.nama,
            'id',
            {
              sensitivity: 'base',
            }
          )

          return sortConfig.direction === 'asc'
            ? comparison
            : -comparison
        }

        // --------------------------------------------------------
        // JENJANG / KELOMPOK
        // --------------------------------------------------------

        const valueA = a[sortConfig.key]
        const valueB = b[sortConfig.key]

        const comparison = valueA.localeCompare(valueB)

        return sortConfig.direction === 'asc'
          ? comparison
          : -comparison
      })
    }

    return result
  }, [
    initialData,
    search,
    filterJenisKelamin,
    filterJenjang,
    filterKelompok,
    sortConfig,
  ])

  // ============================================================
  // SORT
  // ============================================================

  function toggleSort(key: SortKey) {
    setSortConfig((prev) => {
      // Memilih kolom baru
      if (!prev || prev.key !== key) {
        return {
          key,
          direction: 'asc',
        }
      }

      // ASC → DESC
      if (prev.direction === 'asc') {
        return {
          key,
          direction: 'desc',
        }
      }

      // DESC → kembali ke default Terbaru
      return DEFAULT_SORT
    })
  }

  // ============================================================
  // SORT INDICATOR
  // ============================================================

  function sortIndicator(key: SortKey) {
    if (!sortConfig || sortConfig.key !== key) {
      return ''
    }

    return sortConfig.direction === 'asc'
      ? ' ▲'
      : ' ▼'
  }

  // ============================================================
  // RESET
  // ============================================================

  function resetAll() {
    setSearch('')
    setFilterJenisKelamin('')
    setFilterJenjang('')
    setFilterKelompok('')
    setSortConfig(DEFAULT_SORT)
  }

  // ============================================================
  // ACTIVE FILTER
  // ============================================================

  // Default sorting "Terbaru" tidak dihitung sebagai filter aktif
  const hasActiveFilters = !!(
    search ||
    filterJenisKelamin ||
    filterJenjang ||
    filterKelompok
  )

  // ============================================================
  // FILTER KEY
  // ============================================================

  const filterKey = [
    search,
    filterJenisKelamin,
    filterJenjang,
    filterKelompok,
    sortConfig?.key ?? '',
    sortConfig?.direction ?? '',
  ].join('|')

  return {
    search,
    setSearch,

    filterJenisKelamin,
    setFilterJenisKelamin,

    filterJenjang,
    setFilterJenjang,

    filterKelompok,
    setFilterKelompok,

    sortConfig,
    setSortConfig,

    displayedData,

    toggleSort,
    sortIndicator,

    resetAll,
    hasActiveFilters,
    filterKey,
  }
}