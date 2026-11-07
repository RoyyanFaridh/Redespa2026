"use client";

import React from "react";
import Link from "next/link";
import type { Kegiatan } from "../../backend/kegiatan/types";

type Props = {
  presensiHariIni: number;
  kegiatanAktif: number;
  kegiatanTerdekat: Kegiatan[];
};

export function DashboardTodayStatus({
  presensiHariIni,
  kegiatanAktif,
  kegiatanTerdekat,
}: Props) {
  // Cari kegiatan yang sedang aktif hari ini jika ada
  const activeEvent = kegiatanAktif > 0 && kegiatanTerdekat.length > 0 ? kegiatanTerdekat[0] : null;

  return (
    <div className="flex h-full flex-col justify-between gap-2.5">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              kegiatanAktif > 0 ? "animate-pulse bg-[#287A50]" : "bg-gray-400"
            }`}
          />
          <div>
            <p className="text-[10px] font-medium text-[#78827C]">
              Presensi Hari Ini
            </p>
            <h3 className="text-xs font-semibold text-[#202824]">
              Status Aktivitas Presensi
            </h3>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium ${
            kegiatanAktif > 0
              ? "bg-[#E6F2EA] text-[#287A50]"
              : "bg-[#F0F4F1] text-[#78827C]"
          }`}
        >
          {kegiatanAktif > 0 ? "Jendela Terbuka" : "Tidak Ada Sesi Aktif"}
        </span>
      </div>

      {/* Konten Status & Counter */}
      <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/80 p-3">
        <div>
          <p className="text-[10px] font-normal text-[#78827C]">
            Kehadiran Tercatat Hari Ini
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-[#202824]">
              {presensiHariIni.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] font-medium text-[#287A50]">
              Jamaah check-in
            </span>
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] text-[#287A50]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>

      {/* Aksi Cepat Presensi Hari Ini */}
      <div className="flex shrink-0 items-center justify-between gap-2 pt-0.5 text-[10px]">
        {activeEvent ? (
          <>
            <span className="truncate text-[#78827C]">
              Aktif: <span className="font-medium text-[#202824]">{activeEvent.nama}</span>
            </span>
            <Link
              href={`/admin/presensi/scan/${activeEvent.id}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#287A50] px-2.5 py-1 font-medium text-white transition hover:bg-[#206440]"
            >
              Scan QR →
            </Link>
          </>
        ) : (
          <>
            <span className="text-[#78827C]">
              {kegiatanAktif === 0
                ? "Belum ada presensi yang berlangsung saat ini"
                : `${kegiatanAktif} kegiatan aktif`}
            </span>
            <Link
              href="/admin/presensi/monitoring"
              className="font-medium text-[#287A50] hover:underline"
            >
              Monitoring →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardTodayStatus;