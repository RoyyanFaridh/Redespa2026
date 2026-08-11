import { Mudamudi } from './types'
import { toTitleCase, getInitials, getAvatarColor } from './format'
import { getJenjangBadgeClass } from './jenjangBadge'
import { EditIcon, DeleteIcon } from './icons'

type Props = {
  data: Mudamudi[]
  onEdit: (s: Mudamudi) => void
  onDelete: (s: Mudamudi) => void
}

export default function MobileList({ data, onEdit, onDelete }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-[12px] text-gray-500 md:hidden">
        Tidak ada data yang cocok
      </div>
    )
  }

  return (
    <div className="space-y-2.5 md:hidden">
      {data.map((s) => {
        const avatarColor = getAvatarColor(s.nama)

        return (
          <div
            key={s.id}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white ring-2 ${avatarColor.ring}`}
                  style={{ backgroundColor: avatarColor.bg }}
                >
                  {getInitials(s.nama)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-gray-800">
                    {toTitleCase(s.nama)}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-gray-400">
                    {s.jenis_kelamin} · {s.kelompok}
                  </p>
                </div>
              </div>

              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getJenjangBadgeClass(s.jenjang)}`}>
                {s.jenjang}
              </span>
            </div>

            <div className="my-2.5 border-t border-gray-100" />

            <div className="flex items-center gap-3">
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
          </div>
        )
      })}
    </div>
  )
}