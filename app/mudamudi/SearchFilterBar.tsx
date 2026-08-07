import { JENJANG_OPTIONS, KELOMPOK_OPTIONS } from './constants'

type Props = {
  search: string
  setSearch: (v: string) => void
  filterJenjang: string
  setFilterJenjang: (v: string) => void
  filterKelompok: string
  setFilterKelompok: (v: string) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export default function SearchFilterBar({
  search,
  setSearch,
  filterJenjang,
  setFilterJenjang,
  filterKelompok,
  setFilterKelompok,
  hasActiveFilters,
  onReset,
}: Props) {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[minmax(0,1fr)_132px_132px] md:gap-2.5">
        {/* Search */}
        <div className="relative col-span-2 md:col-span-1">
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

        {/* Filter Jenjang */}
        <select
          value={filterJenjang}
          onChange={(e) => setFilterJenjang(e.target.value)}
          className="h-9.5 w-full min-w-0 appearance-none rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-600 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200 md:px-3.5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '14px',
          }}
        >
          <option value="">Semua Jenjang</option>
          {JENJANG_OPTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        {/* Filter Kelompok */}
        <select
          value={filterKelompok}
          onChange={(e) => setFilterKelompok(e.target.value)}
          className="h-9.5 w-full min-w-0 appearance-none rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-600 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200 md:px-3.5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '14px',
          }}
        >
          <option value="">Semua Kelompok</option>
          {KELOMPOK_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* Reset hanya muncul ketika filter aktif */}
      {hasActiveFilters && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-gray-500 underline underline-offset-2 transition hover:text-gray-700"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  )
}