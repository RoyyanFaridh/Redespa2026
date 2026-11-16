"use client";

import type { Jamaah, SortKey } from "../../backend/jamaah/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { DetailIcon, EditIcon, DeleteIcon, QRIcon } from "./icons";
import { IconButton } from "../common/IconButton";
import { Badge } from "../common/Badge";

type Props = {
  data: Jamaah[];
  startIndex: number;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  onDetail: (s: Jamaah) => void;
  onEdit: (s: Jamaah) => void;
  onDelete: (s: Jamaah) => void;
  onShowQR: (s: Jamaah) => void;
};

const HEADER_CELL =
  "px-3.5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.07em] text-[#78827C]";

function SortIndicator({ indicator }: { indicator: string }) {
  const active = Boolean(indicator);

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded",
        "transition-colors",
        active
          ? "bg-[#E6F2EA] text-[#287A50]"
          : "text-gray-300 group-hover:text-gray-400",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-2.5 w-2.5"
      >
        {indicator === " ▲" ? (
          <path d="M8 4.5l4 5H4z" />
        ) : indicator === " ▼" ? (
          <path d="M8 11.5l-4-5h8z" />
        ) : (
          <path
            d="M8 3.5l3.5 4.5h-7L8 3.5zm0 9l-3.5-4.5h7L8 12.5z"
            opacity="0.4"
          />
        )}
      </svg>
    </span>
  );
}

export default function DesktopTable({
  data,
  startIndex,
  sortIndicator,
  toggleSort,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs md:block">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-[#E5EAE6] bg-[#F5F7F5]">
              <th scope="col" className={`${HEADER_CELL} w-12`}>
                No
              </th>

              <th scope="col" className="px-3.5 py-3 text-left">
                <button
                  type="button"
                  onClick={() => toggleSort("nama")}
                  className="group inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#78827C] transition hover:text-[#287A50]"
                >
                  <span>Nama Jamaah</span>
                  <SortIndicator indicator={sortIndicator("nama")} />
                </button>
              </th>

              <th scope="col" className="px-3.5 py-3 text-left">
                <button
                  type="button"
                  onClick={() => toggleSort("kelompok")}
                  className="group inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#78827C] transition hover:text-[#287A50]"
                >
                  <span>Kelompok</span>
                  <SortIndicator indicator={sortIndicator("kelompok")} />
                </button>
              </th>

              <th scope="col" className="px-3.5 py-3 text-left">
                <button
                  type="button"
                  onClick={() => toggleSort("jenis_kelamin")}
                  className="group inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#78827C] transition hover:text-[#287A50]"
                >
                  <span>Jenis Kelamin</span>
                  <SortIndicator indicator={sortIndicator("jenis_kelamin")} />
                </button>
              </th>

              <th scope="col" className={`${HEADER_CELL} w-36`}>
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5EAE6]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-xs text-[#78827C]"
                >
                  Tidak ada data jamaah yang cocok dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const avatarColor = getAvatarColor(item.nama);
                const displayIndex = startIndex + index + 1;

                return (
                  <tr
                    key={item.id}
                    className="group transition-colors duration-150 hover:bg-[#F5F7F5]"
                  >
                    <td className="px-3.5 py-2.5 text-center font-mono text-[10px] text-[#78827C]">
                      {displayIndex}
                    </td>

                    <td className="px-3.5 py-2.5 font-medium text-[#202824]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ${avatarColor.ring}`}
                          style={{
                            backgroundColor: avatarColor.bg,
                          }}
                        >
                          {getInitials(item.nama)}
                        </div>

                        <span className="truncate font-semibold text-[#202824] transition-colors group-hover:text-[#287A50]">
                          {toTitleCase(item.nama)}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5 text-[#202824]">
                      {item.kelompok ? (
                        <Badge variant="success" size="sm">
                          {item.kelompok}
                        </Badge>
                      ) : (
                        <span className="text-[#78827C]">-</span>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 text-[#202824]">
                      <span className="text-[11px] text-[#78827C]">
                        {item.jenis_kelamin || "-"}
                      </span>
                    </td>

                    <td className="px-3.5 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <IconButton
                          label={`Tampilkan QR ${item.nama}`}
                          onClick={() => onShowQR(item)}
                          variant="neutral"
                        >
                          <QRIcon className="h-3.5 w-3.5" />
                        </IconButton>

                        <IconButton
                          label={`Detail ${item.nama}`}
                          onClick={() => onDetail(item)}
                          variant="neutral"
                        >
                          <DetailIcon className="h-3.5 w-3.5" />
                        </IconButton>

                        <IconButton
                          label={`Edit ${item.nama}`}
                          onClick={() => onEdit(item)}
                          variant="neutral"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </IconButton>

                        <IconButton
                          label={`Hapus ${item.nama}`}
                          onClick={() => onDelete(item)}
                          variant="danger"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
