import React from "react";
import Link from "next/link";
import type { Kegiatan } from "../../backend/kegiatan/types";
import { formatRentangTanggal } from "../../backend/kegiatan/format";

type Props = {
  kegiatan: Kegiatan[];
  kegiatanAktif?: number;
  presensiHariIni?: number;
};

export function DashboardUpcomingEvents({
  kegiatan,
  kegiatanAktif = 0,
  presensiHariIni = 0,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] pb-2">
        <div className="flex items-center gap-2">
          {kegiatanAktif > 0 ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#287A50] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#287A50]" />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-gray-300" />
          )}
          <div>
            <p className="text-[10px] font-medium text-[#78827C]">
              Agenda Presensi
            </p>
            <h3 className="text-xs font-semibold text-[#202824]">
              Kegiatan Terdekat
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {kegiatanAktif > 0 && (
            <span className="rounded-md bg-[#E6F2EA] px-2 py-0.5 text-[9px] font-medium text-[#287A50]">
              {presensiHariIni} Check-in Hari Ini
            </span>
          )}
          <Link
            href="/admin/kegiatan"
            className="text-[10px] font-medium text-[#287A50] hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>

      {/* Konten Kegiatan / Empty State */}
      <div className="divide-y divide-[#E5EAE6]">
        {kegiatan.length === 0 ? (
          <div className="flex items-center justify-between gap-3 p-2 text-left">
            <div>
              <p className="text-[11px] font-medium text-[#202824]">
                Belum ada jadwal terdekat
              </p>
              <p className="text-[10px] font-normal text-[#8A948E]">
                Semua kegiatan telah selesai atau belum dibuat.
              </p>
            </div>
            <Link
              href="/admin/kegiatan"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#287A50] px-2.5 py-1 text-[10px] font-medium text-white transition hover:bg-[#206440]"
            >
              + Buat Kegiatan
            </Link>
          </div>
        ) : (
          kegiatan.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2.5 py-2 transition hover:bg-[#F5F7F5]/70"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#202824]">
                  {item.nama}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] font-normal text-[#78827C]">
                  <span>
                    {formatRentangTanggal(item.tanggal_mulai, item.tanggal_selesai)}
                  </span>
                  <span>·</span>
                  <span>
                    {item.jam_mulai.slice(0, 5)}–{item.jam_selesai.slice(0, 5)} WIB
                  </span>
                  {item.lokasi && (
                    <>
                      <span>·</span>
                      <span className="truncate">📍 {item.lokasi}</span>
                    </>
                  )}
                </div>
              </div>

              <Link
                href={`/admin/presensi/scan/${item.id}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#E5EAE6] bg-white px-2.5 py-1 text-[10px] font-medium text-[#287A50] shadow-2xs transition hover:border-[#65B98A]/50 hover:bg-[#E6F2EA]"
              >
                Presensi
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DashboardUpcomingEvents;
