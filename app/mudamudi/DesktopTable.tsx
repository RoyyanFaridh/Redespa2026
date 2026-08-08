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

export default function DesktopTable({ data, startIndex, sortIndicator, toggleSort, onEdit, onDelete }: Props) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/60">
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-gray-500">
                Tidak ada data yang cocok
              </td>
            </tr>
          ) : (
            data.map((s, i) => {
              const avatarColor = getAvatarColor(s.nama)

              return (
                <tr key={s.id} className="border-b border-gray-100 transition hover:bg-gray-50/50 last:border-b-0">
                  <td className="px-3 py-2.5 text-[11px] text-gray-400">
                    {startIndex + i + 1}
                  </td>

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

                  <td className="px-3 py-2.5">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${getJenjangBadgeClass(s.jenjang)}`}>
                      {s.jenjang}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-[11px] text-gray-600">
                    {s.kelompok}
                  </td>

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