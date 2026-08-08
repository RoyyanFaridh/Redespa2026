import { useState, useMemo } from 'react'
import { Mudamudi, SortKey, SortConfig } from './types'

export function useMudamudiFilter(initialData: Mudamudi[]) {
  const [search, setSearch] = useState('')
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
    if (filterJenjang) result = result.filter((s) => s.jenjang === filterJenjang)
    if (filterKelompok) result = result.filter((s) => s.kelompok === filterKelompok)

    if (sortConfig) {
      result.sort((a, b) => {
        const cmp = a[sortConfig.key].localeCompare(b[sortConfig.key])
        return sortConfig.direction === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [initialData, search, filterJenjang, filterKelompok, sortConfig])

  function toggleSort(key: SortKey) {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }

  function sortIndicator(key: SortKey) {
    if (!sortConfig || sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
  }

  function resetAll() {
    setSearch('')
    setFilterJenjang('')
    setFilterKelompok('')
    setSortConfig(null)
  }

  const hasActiveFilters = !!(search || filterJenjang || filterKelompok || sortConfig)


  const filterKey = `${search}|${filterJenjang}|${filterKelompok}|${sortConfig?.key ?? ''}|${sortConfig?.direction ?? ''}`

  return {
    search, setSearch,
    filterJenjang, setFilterJenjang,
    filterKelompok, setFilterKelompok,
    displayedData,
    toggleSort, sortIndicator,
    resetAll, hasActiveFilters,
    filterKey,
  }
}