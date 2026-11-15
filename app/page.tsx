import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const kelompokList = [
    { name: "Carikan", kode: "CRK", deskripsi: "Wilayah barat daya" },
    { name: "Pandak 1", kode: "PD1", deskripsi: "Wilayah pusat utara" },
    { name: "Pandak 2", kode: "PD2", deskripsi: "Wilayah timur laut" },
    { name: "Pandak 3", kode: "PD3", deskripsi: "Wilayah barat laut" },
    { name: "Pandak 4", kode: "PD4", deskripsi: "Wilayah tengah" },
    { name: "Payungan", kode: "PYN", deskripsi: "Wilayah tenggara" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7F5] text-[#202824] selection:bg-[#287A50]/20 selection:text-[#287A50]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#E5EAE6] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-9xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#287A50] shadow-sm ring-1 ring-black/5 transition group-hover:scale-105">
              <Image
                src="/icon.webp"
                alt="REDESPA"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-[#202824]">
                  REDESPA
                </span>
                <span className="rounded-full bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-semibold text-[#287A50]">
                  Desa Pandak
                </span>
              </div>
              <p className="text-[11px] text-[#78827C]">
                Rekap Data Jamaah & Presensi Terpadu
              </p>
            </div>
          </Link>

          {/* Nav Links & CTA */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden items-center gap-5 text-xs font-medium text-[#78827C] md:flex">
              <a href="#fitur" className="transition hover:text-[#287A50]">
                Fitur Sistem
              </a>
              <a href="#kelompok" className="transition hover:text-[#287A50]">
                6 Kelompok
              </a>
              <a href="#alur" className="transition hover:text-[#287A50]">
                Alur Presensi
              </a>
            </nav>

            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#287A50] px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#206440] hover:shadow-sm"
            >
              <span>Portal Admin</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  d="M4.167 10h11.666m-4.166-4.167 4.166 4.167-4.166 4.167"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[#E5EAE6] bg-gradient-to-b from-white via-white to-[#F5F7F5] py-12 sm:py-20 lg:py-24">
          {/* Subtle Ambient Decorative Circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#E6F2EA]/60 blur-3xl"
          />

          <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Kolom Kiri: Headline & Value Prop */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#287A50]/20 bg-[#E6F2EA]/80 px-3 py-1 text-xs font-medium text-[#287A50]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#287A50] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#287A50]" />
                  </span>
                  <span>Sistem Digital Terpusat Desa Pandak</span>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#202824] sm:text-4xl lg:text-5xl">
                  Satu Data Jamaah,{" "}
                  <span className="text-[#287A50]">Presensi Presisi</span> Tanpa
                  Kertas.
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-[#78827C] sm:text-base">
                  REDESPA menghubungkan pendataan warga 6 kelompok wilayah Desa
                  Pandak dengan sistem absensi kegiatan berbasis QR Code
                  personal. Lebih cepat, akurat, dan tercatat otomatis.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#287A50] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#206440] hover:shadow-md"
                  >
                    <span>Masuk ke Portal Petugas</span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        d="M4.167 10h11.666m-4.166-4.167 4.166 4.167-4.166 4.167"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <a
                    href="#alur"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white px-5 text-xs font-medium text-[#202824] transition hover:bg-[#F5F7F5]"
                  >
                    Lihat Cara Kerja QR
                  </a>
                </div>

                {/* Quick Metric Badges */}
                <div className="mt-10 grid grid-cols-3 gap-3 border-t border-[#E5EAE6] pt-6">
                  <div>
                    <p className="text-xl font-bold text-[#202824] sm:text-2xl">
                      6
                    </p>
                    <p className="text-[11px] font-medium text-[#78827C]">
                      Kelompok Terpadu
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#287A50] sm:text-2xl">
                      100%
                    </p>
                    <p className="text-[11px] font-medium text-[#78827C]">
                      Presensi QR Digital
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#202824] sm:text-2xl">
                      Realtime
                    </p>
                    <p className="text-[11px] font-medium text-[#78827C]">
                      Rekap & Monitoring
                    </p>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Visual Artifact Kartu Jamaah & Scan Preview */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-sm sm:max-w-md">
                  {/* Backdrop Glow */}
                  <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-[#287A50]/20 to-[#65B98A]/20 blur-xl" />

                  {/* Mock Kartu Jamaah Digital REDESPA */}
                  <div className="relative rounded-2xl border border-[#E5EAE6] bg-white p-5 shadow-xl sm:p-6">
                    {/* Header Kartu */}
                    <div className="flex items-center justify-between border-b border-[#E5EAE6] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#287A50] text-[10px] font-bold text-white">
                          RD
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#202824]">
                            Kartu Presensi Jamaah
                          </p>
                          <p className="text-[9px] text-[#78827C]">
                            Desa Pandak • SIKEMA
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F2EA] px-2 py-0.5 text-[9px] font-semibold text-[#287A50]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
                        Aktif
                      </span>
                    </div>

                    {/* Badan Kartu: Profil & QR */}
                    <div className="mt-4 flex items-center gap-4">
                      {/* Simulated QR Code Graphic */}
                      <div className="relative flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-2">
                        {/* Mini corner brackets to feel like a real scanner */}
                        <div className="grid h-full w-full grid-cols-4 gap-1 rounded bg-white p-1.5 shadow-2xs">
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#287A50]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#E6F2EA]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#287A50]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#287A50]" />
                          <div className="rounded-xs bg-[#202824]" />
                          <div className="rounded-xs bg-[#202824]" />
                        </div>
                        <span className="mt-1 text-[8px] font-mono text-[#78827C]">
                          QR PERSONAL
                        </span>
                      </div>

                      {/* Detail Data */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <p className="text-[10px] text-[#78827C]">
                            Nama Lengkap
                          </p>
                          <p className="truncate text-xs font-bold text-[#202824]">
                            Ahmad Fauzan
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#78827C]">Kelompok</p>
                          <span className="inline-block rounded-md bg-[#F5F7F5] px-2 py-0.5 text-[10px] font-semibold text-[#202824]">
                            Pandak 1
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#78827C]">
                            Jenjang Pembinaan
                          </p>
                          <p className="text-[10px] font-medium text-[#287A50]">
                            Muda-Mudi / Usia Nikah
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Floating Toast Scan Terverifikasi */}
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#287A50]/20 bg-[#E6F2EA] px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#287A50] text-white">
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#202824]">
                            Presensi Berhasil
                          </p>
                          <p className="text-[9px] text-[#78827C]">
                            Pengajian Rutin Desa • Hari Ini
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#287A50]">
                        Tercatat
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 KELOMPOK WILAYAH DESA PANDAK */}
        <section id="kelompok" className="py-14 sm:py-18">
          <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <span className="rounded-full bg-[#E6F2EA] px-3 py-1 text-[11px] font-semibold text-[#287A50]">
                Cakupan Wilayah
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#202824] sm:text-3xl">
                6 Kelompok Wilayah Desa Pandak
              </h2>
              <p className="mt-2 max-w-2xl text-xs text-[#78827C] sm:text-sm">
                Seluruh data warga terintegrasi dalam satu sistem database untuk
                memudahkan koordinasi antar kelompok dan rekapitulasi desa.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {kelompokList.map((kelompok) => (
                <div
                  key={kelompok.name}
                  className="group rounded-2xl border border-[#E5EAE6] bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-[#287A50]/40 hover:shadow-xs"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F5] text-xs font-bold text-[#287A50] transition group-hover:bg-[#E6F2EA]">
                    {kelompok.kode}
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-[#202824]">
                    {kelompok.name}
                  </h3>
                  <p className="mt-1 text-[10px] text-[#78827C]">
                    {kelompok.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 PILAR MODUL SISTEM */}
        <section
          id="fitur"
          className="border-t border-[#E5EAE6] bg-white py-14 sm:py-18"
        >
          <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <span className="rounded-full bg-[#E6F2EA] px-3 py-1 text-[11px] font-semibold text-[#287A50]">
                Fitur Utama
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#202824] sm:text-3xl">
                Arsitektur Modul REDESPA
              </h2>
              <p className="mt-2 max-w-xl text-xs text-[#78827C] sm:text-sm">
                Dirancang khusus untuk kebutuhan pengurus dalam mengelola data
                jamaah dan presensi kegiatan secara efisien.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-2xl border border-[#E5EAE6] bg-[#F5F7F5] p-6 transition hover:border-[#287A50]/30 hover:bg-white hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287A50] text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-5 w-5"
                  >
                    <path
                      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="7" r="4" />
                    <path
                      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#202824]">
                  Pusat Data Jamaah
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#78827C]">
                  Manajemen biodata, filter jenjang (usia nikah, pra-remaja,
                  remaja, MT), status keaktifan, dan pengelompokan wilayah yang
                  terstruktur rapi.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-[#E5EAE6] bg-[#F5F7F5] p-6 transition hover:border-[#287A50]/30 hover:bg-white hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287A50] text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-5 w-5"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#202824]">
                  Penjadwalan & Kegiatan
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#78827C]">
                  Atur agenda pengajian, pembinaan kelompok, atau pertemuan desa
                  lengkap dengan target peserta dan kuota kehadiran yang jelas.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-[#E5EAE6] bg-[#F5F7F5] p-6 transition hover:border-[#287A50]/30 hover:bg-white hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287A50] text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-5 w-5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h3v1h-3z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#202824]">
                  Presensi Scan QR & Ekspor
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#78827C]">
                  Check-in instan dengan kamera scanner. Dilengkapi fitur batch
                  export kartu QR terstruktur per folder kelompok serta unduh
                  laporan Excel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ALUR KERJA QR */}
        <section id="alur" className="py-14 sm:py-18">
          <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <span className="rounded-full bg-[#E6F2EA] px-3 py-1 text-[11px] font-semibold text-[#287A50]">
                Proses Sederhana
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#202824] sm:text-3xl">
                Alur Presensi Presisi 3 Langkah
              </h2>
              <p className="mt-2 max-w-xl text-xs text-[#78827C] sm:text-sm">
                Bagaimana sistem QR Code REDESPA mengeliminasi antrean dan
                kesalahan pencatatan manual.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="relative rounded-2xl border border-[#E5EAE6] bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F2EA] text-xs font-bold text-[#287A50]">
                  01
                </span>
                <h3 className="mt-4 text-xs font-bold text-[#202824]">
                  Generate & Download QR
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-[#78827C]">
                  Sistem otomatis membuat kartu QR unik untuk tiap jamaah. Admin
                  dapat mengunduh file batch ZIP terkelompok per wilayah.
                </p>
              </div>

              <div className="relative rounded-2xl border border-[#E5EAE6] bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F2EA] text-xs font-bold text-[#287A50]">
                  02
                </span>
                <h3 className="mt-4 text-xs font-bold text-[#202824]">
                  Scan Saat Masuk Acara
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-[#78827C]">
                  Petugas mengarahkan kamera scanner ke kartu QR jamaah.
                  Verifikasi berlangsung dalam hitungan detik.
                </p>
              </div>

              <div className="relative rounded-2xl border border-[#E5EAE6] bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F2EA] text-xs font-bold text-[#287A50]">
                  03
                </span>
                <h3 className="mt-4 text-xs font-bold text-[#202824]">
                  Rekapitulasi Otomatis
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-[#78827C]">
                  Data kehadiran langsung masuk ke database rekapitulasi, siap
                  ditinjau secara real-time dan dianalisis persentasenya.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BANNER CTA PORTAL PETUGAS */}
        <section className="mx-auto max-w-9xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#181C1B] px-6 py-10 text-white sm:px-12 sm:py-14">
            <div className="relative z-10 max-w-xl">
              <span className="rounded-full bg-[#287A50]/40 px-3 py-1 text-[11px] font-semibold text-[#65B98A]">
                Portal Khusus Petugas
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Kelola data jamaah dan jalankan presensi sekarang.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#8E9892]">
                Akses dashboard administrasi untuk input kegiatan, cetak QR
                Code, pantau kehadiran, dan ekspor laporan berkala.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#287A50] px-5 text-xs font-semibold text-white transition hover:bg-[#206440]"
                >
                  <span>Buka Portal Login Admin</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-3.5 w-3.5"
                  >
                    <path
                      d="M4.167 10h11.666m-4.166-4.167 4.166 4.167-4.166 4.167"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5EAE6] bg-white py-6">
        <div className="mx-auto flex max-w-9xl flex-col items-center justify-between gap-4 px-4 text-xs text-[#78827C] sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#202824]">REDESPA</span>
            <span>&bull;</span>
            <span>Rekap Data Jamaah Desa Pandak</span>
          </div>

          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Desa Pandak</span>
            <Link
              href="/login"
              className="font-medium text-[#287A50] hover:underline"
            >
              Login Petugas &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
