import { Mudamudi, SortKey } from './types'
import { toTitleCase, getInitials, getAvatarColor } from './format'
import { getJenjangBadgeClass } from './jenjangBadge'
import { EditIcon, DeleteIcon } from './icons'

type Props = {
  data: Mudamudi[]
  startIndex: number
  sortIndicator: (key: SortKey) => string
  toggleSort: (key: SortKey) => void
  onEdit: (s: Mudamudi) => void
  onDelete: (s: Mudamudi) => void
}

export default function DesktopTable({
  data,
  startIndex,
  sortIndicator,
  toggleSort,
  onEdit,
  onDelete,
}: Props) {
  function SortIcon({ sortKey }: { sortKey: SortKey }) {
    const indicator = sortIndicator(sortKey)

    if (!indicator) {
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-3 w-3 text-gray-300"
          aria-hidden="true"
        >
          <path
            d="M5 6l3-3 3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 10l3 3 3-3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }

    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-3 w-3 text-teal-700"
        aria-hidden="true"
      >
        {indicator === ' ▲' ? (
          <path
            d="M4 10l4-4 4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M4 6l4 4 4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    )
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/60">
            {/* NO */}
            <th className="w-12 px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500">
              NO
            </th>

            {/* NAMA */}
            <th
              className="cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort('nama')}
            >
              <div className="flex items-center gap-1.5">
                <span>NAMA</span>
                <SortIcon sortKey="nama" />
              </div>
            </th>

            {/* JENIS KELAMIN */}
            <th className="w-32 px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500">
              JENIS KELAMIN
            </th>

            {/* JENJANG */}
            <th
              className="w-36.25 cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort('jenjang')}
            >
              <div className="flex items-center gap-1.5">
                <span>JENJANG</span>
                <SortIcon sortKey="jenjang" />
              </div>
            </th>

            {/* KELOMPOK */}
            <th
              className="w-47.5 cursor-pointer select-none px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-gray-500 transition hover:text-gray-800"
              onClick={() => toggleSort('kelompok')}
            >
              <div className="flex items-center gap-1.5">
                <span>KELOMPOK</span>
                <SortIcon sortKey="kelompok" />
              </div>
            </th>

            {/* AKSI */}
            <th className="w-31.25 px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-gray-500">
              AKSI
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-[12px] text-gray-500"
              >
                Tidak ada data yang cocok
              </td>
            </tr>
          ) : (
            data.map((s, i) => {
              const avatarColor = getAvatarColor(s.nama)

              return (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50/50 last:border-b-0"
                >
                  {/* NO */}
                  <td className="px-3 py-2.5 text-[11px] text-gray-400">
                    {startIndex + i + 1}
                  </td>

                  {/* NAMA */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white ring-2 ${avatarColor.ring}`}
                        style={{ backgroundColor: avatarColor.bg }}
                      >
                        {getInitials(s.nama)}
                      </div>

                      <span className="text-[11px] font-medium text-gray-800">
                        {toTitleCase(s.nama)}
                      </span>
                    </div>
                  </td>

                  {/* JENIS KELAMIN */}
                  <td className="px-3 py-2.5 text-[11px] text-gray-600">
                    {s.jenis_kelamin}
                  </td>

                  {/* JENJANG */}
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${getJenjangBadgeClass(
                        s.jenjang
                      )}`}
                    >
                      {s.jenjang}
                    </span>
                  </td>

                  {/* KELOMPOK */}
                  <td className="px-3 py-2.5 text-[11px] text-gray-600">
                    {s.kelompok}
                  </td>

                  {/* AKSI */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        className="inline-flex items-center gap-1 text-[11px] text-teal-700 transition hover:text-teal-900"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(s)}
                        className="inline-flex items-center gap-1 text-[11px] text-red-500 transition hover:text-red-700"
                      >
                        <DeleteIcon className="h-3.5 w-3.5" />
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
  )
}