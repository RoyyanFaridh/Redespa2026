"use client";

import type { Mudamudi } from "../../backend/mudamudi/types";
import {
  toTitleCase,
  getInitials,
  getAvatarColor,
} from "../../backend/mudamudi/format";
import { ModalWrapper, Button, Badge, InfoRow } from "../common";

type Props = {
  data: Mudamudi;
  onClose: () => void;
};

export default function DetailModal({ data, onClose }: Props) {
  const avatarColor = getAvatarColor(data.nama);

  const kelasList: string[] = (data.kelas ?? [])
    .map((kelas: string) => kelas.trim())
    .filter((kelas: string) => kelas.length > 0);

  return (
    <ModalWrapper onClose={onClose} size="md">
      <div className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-medium text-white ring-2 ${avatarColor.ring}`}
              style={{ backgroundColor: avatarColor.bg }}
            >
              {getInitials(data.nama)}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[11px] font-semibold leading-5 text-[#202824]">
                {toTitleCase(data.nama)}
              </h2>
              <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                Detail Data Muda-Mudi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {/* Section: Kelompok & Kelas */}
          <section className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5EAE6] pb-2">
              <h3 className="text-[10px] font-semibold tracking-tight text-[#202824]">
                Kelompok & Kelas
              </h3>

              <div className="flex flex-wrap items-center gap-1">
                {kelasList.map((kelas) => (
                  <Badge key={kelas} variant="success" size="sm">
                    {kelas}
                  </Badge>
                ))}

                {kelasList.length === 0 && (
                  <span className="text-[9px] text-[#78827C]">-</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <InfoRow label="Kelompok" value={data.kelompok || "-"} />
              <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin || "-"} />
            </div>
          </section>

          {/* Section: Informasi Pribadi */}
          <section className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs space-y-3">
            <h3 className="text-[10px] font-semibold tracking-tight text-[#202824] border-b border-[#E5EAE6] pb-2">
              Informasi Pribadi
            </h3>

            <div className="space-y-2">
              <InfoRow label="Nama Lengkap" value={toTitleCase(data.nama)} />
              <InfoRow label="Tempat Lahir" value={data.tempat_lahir || "-"} />
              <InfoRow
                label="Tahun Lahir"
                value={data.tahun_lahir !== null ? String(data.tahun_lahir) : "-"}
              />
              <InfoRow label="Pekerjaan" value={data.pekerjaan || "-"} />
              <InfoRow label="No. HP" value={data.no_hp || "-"} />
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-end border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Tutup
          </Button>
        </footer>
      </div>
    </ModalWrapper>
  );
}
