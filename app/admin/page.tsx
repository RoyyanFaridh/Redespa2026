import React from "react";
import { getDashboardData } from "../../src/backend/admin/dashboard-actions";
import { PageHeader } from "../../src/components/common";
import {
  DashboardStats,
  DashboardQuickActions,
  DashboardKelompokChart,
  DashboardAttendanceSummary,
  DashboardUpcomingEvents,
  DashboardKelasBreakdown,
  DashboardTodayStatus,
} from "../../src/components/dashboard";

export default async function AdminPage() {
  const data = await getDashboardData();

  // Format tanggal hari ini dalam bahasa Indonesia
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto flex min-h-full w-full flex-col justify-between gap-3.5 overflow-y-auto px-4 py-6 sm:px-6 md:px-7 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-8">
      {/* Header Halaman (Sesuai Standar Seluruh Halaman REDESPA) */}
      <PageHeader
        eyebrow="REDESPA"
        title="Ringkasan Dashboard"
        description={`Selamat datang, ${data.adminNama}. Pantau data Jamaah, kegiatan, dan presensi Desa Pandak.`}
        className="shrink-0 pb-1.5 sm:pb-2.5"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-[#78827C] sm:text-right">
            <span className="hidden sm:inline">Hari ini:</span>
            <span className="font-medium text-[#202824]">
              {todayFormatted}
            </span>
          </div>
        }
      />

      {/* Error alert jika ada */}
      {data.error && (
        <div
          role="alert"
          className="flex shrink-0 items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs leading-5 text-rose-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5m0 3h.01" />
          </svg>
          <span>
            Gagal memuat sebagian data dashboard. Silakan periksa koneksi database:{" "}
            {data.error}
          </span>
        </div>
      )}

      {/* 1. Stat Cards (Responsif Mobile 2 kolom, Desktop 4 kolom) */}
      <div className="shrink-0">
        <DashboardStats
          totalAnggota={data.totalAnggota}
          totalKegiatan={data.totalKegiatan}
          totalPresensi={data.totalPresensi}
          presensiHariIni={data.presensiHariIni}
          kegiatanAktif={data.kegiatanAktif}
        />
      </div>

      {/* 2. Quick Actions */}
      <div className="shrink-0">
        <DashboardQuickActions />
      </div>

      {/* 3. Panel Utama — 2 Kolom Seimbang (Kiri: Status Hari Ini & Demografi, Kanan: Distribusi Presensi & Agenda) */}
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2 lg:gap-3.5">
        {/* KOLOM KIRI: Status Presensi Hari Ini & Demografi Kelas/Gender */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:gap-3.5">
          {/* Status Presensi Hari Ini & Akses Sesi Cepat */}
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#E5EAE6] bg-white p-3 sm:p-3.5 shadow-2xs transition hover:border-[#65B98A]/30">
            <DashboardTodayStatus
              presensiHariIni={data.presensiHariIni}
              kegiatanAktif={data.kegiatanAktif}
              kegiatanTerdekat={data.kegiatanTerdekat}
            />
          </section>

          {/* Demografi: Komposisi Gender & Distribusi Kelas */}
          <section className="shrink-0 rounded-2xl border border-[#E5EAE6] bg-white p-3 sm:p-3.5 shadow-2xs transition hover:border-[#65B98A]/30">
            <DashboardKelasBreakdown
              kelasData={data.kelasDistribusi}
              genderData={data.genderDistribusi}
              totalAnggota={data.totalAnggota}
            />
          </section>
        </div>

        {/* KOLOM KANAN: Distribusi Status Kehadiran & Agenda Kegiatan Terdekat */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:gap-3.5">
          {/* Distribusi Status Kehadiran + Indikator KPI Presensi */}
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#E5EAE6] bg-white p-3 sm:p-3.5 shadow-2xs transition hover:border-[#65B98A]/30">
            <DashboardAttendanceSummary
              data={data.statusDistribusi}
              totalPresensi={data.totalPresensi}
            />
          </section>

          {/* Agenda Kegiatan Terdekat */}
          <section className="shrink-0 rounded-2xl border border-[#E5EAE6] bg-white p-3 sm:p-3.5 shadow-2xs transition hover:border-[#65B98A]/30">
            <DashboardUpcomingEvents
              kegiatan={data.kegiatanTerdekat}
              kegiatanAktif={data.kegiatanAktif}
              presensiHariIni={data.presensiHariIni}
            />
          </section>
        </div>
      </div>

      {/* 4. Section Paling Bawah: Distribusi Anggota per Kelompok (1 Kolom Full-Width Membentang Horizontal) */}
      <section className="shrink-0 rounded-2xl border border-[#E5EAE6] bg-white p-3 sm:p-3.5 shadow-2xs transition hover:border-[#65B98A]/30">
        <DashboardKelompokChart
          data={data.kelompokDistribusi}
          totalAnggota={data.totalAnggota}
        />
      </section>
    </div>
  );
}
