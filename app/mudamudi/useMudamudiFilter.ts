import { useState, useMemo } from 'react'
import { Mudamudi, SortKey, SortConfig } from './types'

export function useMudamudiFilter(initialData: Mudamudi[]) {
  const [search, setSearch] = useState('')
  const [filterJenisKelamin, setFilterJenisKelamin] = useState('')
  const [filterJenjang, setFilterJenjang] = useState('')
  const [filterKelompok, setFilterKelompok] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)

  const displayedData = useMemo(() => {
    let result = [...initialData]

    if (search.trim()) {
      result = result.filter((s) =>
        s.nama.toLowerCase().includes(search.trim().toLowerCase())
      )
    }

    if (filterJenisKelamin) {
      result = result.filter(
        (s) => s.jenis_kelamin === filterJenisKelamin
      )
    }

    if (filterJenjang) {
      result = result.filter(
        (s) => s.jenjang === filterJenjang
      )
    }

    if (filterKelompok) {
      result = result.filter(
        (s) => s.kelompok === filterKelompok
      )
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const cmp = a[sortConfig.key].localeCompare(
          b[sortConfig.key]
        )

        return sortConfig.direction === 'asc' ? cmp : -cmp
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

  function toggleSort(key: SortKey) {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' }
      }

      if (prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }

      return null
    })
  }

  function sortIndicator(key: SortKey) {
    if (!sortConfig || sortConfig.key !== key) return ''

    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
  }

  function resetAll() {
    setSearch('')
    setFilterJenisKelamin('')
    setFilterJenjang('')
    setFilterKelompok('')
    setSortConfig(null)
  }

  const hasActiveFilters = !!(
    search ||
    filterJenisKelamin ||
    filterJenjang ||
    filterKelompok ||
    sortConfig
  )

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

    displayedData,

    toggleSort,
    sortIndicator,

    resetAll,
    hasActiveFilters,
    filterKey,
  }
}