import React from "react";
import { getDashboardData } from "../../src/backend/admin/dashboard-actions";
import { PageHeader, PageContainer } from "../../src/components/common";
import {
  DashboardStats,
  DashboardQuickActions,
  DashboardAttendanceSummary,
  DashboardUpcomingEvents,
  DashboardTodayStatus,
  DashboardDemografiSection,
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
    <PageContainer maxWidth="9xl">
      {/* Header Halaman */}
      <PageHeader
        eyebrow="REDESPA"
        title="Ringkasan Dashboard"
        description={`Selamat datang, ${data.adminNama}. Pantau data Jamaah, Muda-Mudi, kegiatan, dan presensi Desa Pandak.`}
        actions={
          <div className="flex items-center gap-1.5 text-xs text-[#78827C] sm:text-right">
            <span className="hidden sm:inline">Hari ini:</span>
            <span className="font-semibold text-[#202824]">
              {todayFormatted}
            </span>
          </div>
        }
      />

      {/* Error alert jika ada */}
      {data.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs leading-5 text-rose-700"
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

      {/* 1. Stat Cards Utama (Presensi Hari Ini, Kegiatan Aktif, Total Kegiatan, Total Presensi) */}
      <DashboardStats
        totalKegiatan={data.totalKegiatan}
        totalPresensi={data.totalPresensi}
        presensiHariIni={data.presensiHariIni}
        kegiatanAktif={data.kegiatanAktif}
      />

      {/* 2. Quick Actions */}
      <DashboardQuickActions />

      {/* 3. PEMISAHAN DATA UTAMA: JAMAAH vs MUDA-MUDI (Demografi & Distribusi per Kelompok) */}
      <DashboardDemografiSection
        jamaahStats={data.jamaahStats}
        mudamudiStats={data.mudamudiStats}
      />

      {/* 4. Panel Presensi & Kegiatan: 2 Kolom Seimbang */}
      <div className="grid grid-cols-1 gap-3 sm:gap-3.5 lg:grid-cols-2">
        {/* Status Presensi Hari Ini */}
        <section className="flex flex-col justify-between rounded-2xl border border-[#E5EAE6] bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-[#65B98A]/30">
          <DashboardTodayStatus
            presensiHariIni={data.presensiHariIni}
            kegiatanAktif={data.kegiatanAktif}
            kegiatanTerdekat={data.kegiatanTerdekat}
          />
        </section>

        {/* Distribusi Kehadiran */}
        <section className="flex flex-col justify-between rounded-2xl border border-[#E5EAE6] bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-[#65B98A]/30">
          <DashboardAttendanceSummary
            data={data.statusDistribusi}
            totalPresensi={data.totalPresensi}
          />
        </section>
      </div>

      {/* 5. Agenda Terdekat */}
      <section className="rounded-2xl border border-[#E5EAE6] bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-[#65B98A]/30">
        <DashboardUpcomingEvents
          kegiatan={data.kegiatanTerdekat}
          kegiatanAktif={data.kegiatanAktif}
          presensiHariIni={data.presensiHariIni}
        />
      </section>
    </PageContainer>
  );
}
