"use client";

import type { Jamaah } from "../../backend/jamaah/types";
import { toTitleCase, getInitials, getAvatarColor } from "../../backend/mudamudi/format";
import { ModalWrapper, InfoRow, Button, Badge } from "../common";

type Props = {
  data: Jamaah;
  onClose: () => void;
};

export default function JamaahDetailModal({ data, onClose }: Props) {
  const initials = getInitials(data.nama);
  const avatarColor = getAvatarColor(data.nama);

  return (
    <ModalWrapper onClose={onClose} size="md">
      {/* Header */}
      <div className="border-b border-[#E5EAE6] px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#202824]">
              Detail Data Jamaah
            </h2>
            <p className="text-[10px] text-[#78827C]">
              Informasi profil lengkap warga jamaah.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
        {/* Avatar + Name Compact Bar */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs"
            style={{ backgroundColor: avatarColor.bg }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-[#202824] truncate">
              {toTitleCase(data.nama)}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="success" size="sm">
                {data.kelompok}
              </Badge>
              {data.jenis_kelamin && (
                <span className="text-[10px] text-[#78827C]">
                  • {data.jenis_kelamin}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data Rows */}
        <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] px-3.5 py-1 divide-y divide-[#E5EAE6]">
          <InfoRow label="Nama Lengkap" value={toTitleCase(data.nama)} />
          <InfoRow
            label="Kelompok"
            value={
              <Badge variant="success" size="sm">
                {data.kelompok}
              </Badge>
            }
          />
          <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin || "—"} />
          <InfoRow
            label="Tempat, Thn Lahir"
            value={
              [data.tempat_lahir, data.tahun_lahir].filter(Boolean).join(", ") ||
              "—"
            }
          />
          <InfoRow label="Nomor HP" value={data.no_hp || "—"} />
          <InfoRow label="Pekerjaan" value={data.pekerjaan || "—"} />
        </div>

        {/* QR ID Block */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78827C]">
            ID Kode QR Presensi
          </span>
          <p className="mt-1 break-all rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-2.5 font-mono text-[10px] text-[#78827C]">
            {data.qr_id}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E5EAE6] px-4 py-3 sm:px-5 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Tutup
        </Button>
      </div>
    </ModalWrapper>
  );
}
