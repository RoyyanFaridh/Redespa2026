
import React from "react";
import Link from "next/link";
import Image from "next/image";

const kelompokList = [
  { name: "Carikan", code: "CRK" },
  { name: "Pandak 1", code: "PD1" },
  { name: "Pandak 2", code: "PD2" },
  { name: "Pandak 3", code: "PD3" },
  { name: "Pandak 4", code: "PD4" },
  { name: "Payungan", code: "PYN" },
];

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path
        d="M16 2v4M8 2v4M3 10h18"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM19 19h2v2h-2zM19 14h2M14 19v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m4 10 4 4 8-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#F5F7F5] text-[#202824]">
      {/* HEADER */}
      <header className="z-20 shrink-0 border-b border-[#E8ECE9] bg-white">
        <div className="flex h-[64px] w-full items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-[#245D40]">
              <Image
                src="/icon.webp"
                alt="REDESPA"
                fill
                priority
                sizes="36px"
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-[#202824]">
                REDESPA
              </p>
              <p className="text-[10px] text-[#78827C]">
                Desa Pandak
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 text-[11px] text-[#78827C] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#65B98A]" />
            Sistem Informasi Data dan Presensi
          </div>

          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#245D40] px-4 text-[11px] font-semibold text-white transition hover:bg-[#206440]"
          >
            Portal Petugas
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-0 flex-1 items-center overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#E6F2EA] opacity-70 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-[#E6F2EA] opacity-50 blur-3xl"
        />

        <div className="relative grid w-full grid-cols-1 items-center gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-12 xl:px-20 2xl:px-24">
          {/* HERO CONTENT */}
          <div className="w-full lg:pr-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-px w-7 bg-[#65B98A]" />
              <span className="text-[10px] font-semibold tracking-[0.16em] text-[#287A50]">
                SISTEM INFORMASI DESA PANDAK
              </span>
            </div>

            <h1 className="max-w-2xl text-[clamp(30px,4.2vw,58px)] font-bold leading-[1.12] tracking-[-0.045em] text-[#202824]">
              Mengelola Data,
              <br />
              Membangun
              <br />
              <span className="text-[#287A50]">Keterhubungan.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[12px] leading-6 text-[#78827C] sm:text-[13px] sm:leading-7">
              REDESPA membantu pengurus Desa Pandak mengelola data Jamaah,
              Muda-Mudi, kegiatan, dan presensi dalam satu sistem informasi
              yang terstruktur dan terintegrasi.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center gap-3 rounded-lg bg-[#245D40] px-5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#206440] sm:h-12 sm:px-6 sm:text-xs"
              >
                Masuk ke Portal Petugas
                <ArrowIcon className="h-4 w-4" />
              </Link>

              <span className="text-[10px] text-[#9AA39D]">
                Akses khusus petugas
              </span>
            </div>

            {/* QUICK INFORMATION */}
            <div className="mt-8 flex items-center gap-6 border-t border-[#E8ECE9] pt-6 sm:mt-10 sm:gap-10">
              <div>
                <p className="text-2xl font-bold tracking-tight text-[#245D40]">
                  06
                </p>
                <p className="mt-1 text-[10px] text-[#78827C]">
                  Kelompok Wilayah
                </p>
              </div>

              <div className="h-9 w-px bg-[#E8ECE9]" />

              <div>
                <p className="text-2xl font-bold tracking-tight text-[#202824]">
                  QR
                </p>
                <p className="mt-1 text-[10px] text-[#78827C]">
                  Presensi Digital
                </p>
              </div>

              <div className="h-9 w-px bg-[#E8ECE9]" />

              <div>
                <p className="text-2xl font-bold tracking-tight text-[#202824]">
                  Terpadu
                </p>
                <p className="mt-1 text-[10px] text-[#78827C]">
                  Satu Sistem
                </p>
              </div>
            </div>
          </div>

          {/* SYSTEM OVERVIEW */}
          <div className="relative mx-auto hidden w-full max-w-[560px] lg:block">
            <div className="rounded-2xl border border-[#E8ECE9] bg-[#FAFBFA] p-5 xl:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.13em] text-[#78827C]">
                    PLATFORM DIGITAL
                  </p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-[#202824]">
                    REDESPA
                  </h2>
                  <p className="mt-1 text-[10px] text-[#78827C]">
                    Sistem Informasi Desa Pandak
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
                  <QrIcon />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#E8ECE9] bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                    <UsersIcon />
                  </div>
                  <p className="mt-4 text-[10px] text-[#78827C]">
                    Data Peserta
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#202824]">
                    Jamaah & Muda-Mudi
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8ECE9] bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                    <CalendarIcon />
                  </div>
                  <p className="mt-4 text-[10px] text-[#78827C]">
                    Manajemen Agenda
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#202824]">
                    Kegiatan
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#E8ECE9] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#202824]">
                      Wilayah Pengelolaan
                    </p>
                    <p className="mt-1 text-[10px] text-[#78827C]">
                      Enam kelompok di Desa Pandak
                    </p>
                  </div>
                  <span className="text-lg font-bold text-[#287A50]">
                    06
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {kelompokList.map((kelompok) => (
                    <div
                      key={kelompok.code}
                      className="flex items-center gap-2 rounded-lg bg-[#F5F7F5] px-3 py-2.5"
                    >
                      <span className="text-[10px] font-bold text-[#287A50]">
                        {kelompok.code}
                      </span>
                      <span className="text-[9px] font-medium text-[#58645D]">
                        {kelompok.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#245D40] px-4 py-3.5 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <QrIcon />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold">
                    Presensi Digital
                  </p>
                  <p className="mt-1 text-[9px] text-white/65">
                    Pencatatan kehadiran dengan QR Code personal
                  </p>
                </div>

                <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-5 flex items-center gap-2.5 rounded-xl border border-[#E8ECE9] bg-white px-4 py-3 shadow-lg shadow-[#202824]/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                <CheckIcon />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#202824]">
                  Data Terorganisasi
                </p>
                <p className="mt-0.5 text-[9px] text-[#78827C]">
                  Dalam satu sistem
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="shrink-0 border-t border-[#E8ECE9] bg-[#F5F7F5]">
        <div className="flex w-full flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 xl:px-16">
          <div>
            <h2 className="text-xs font-semibold text-[#202824] sm:text-sm">
              Satu langkah menuju pengelolaan yang lebih terstruktur.
            </h2>
            <p className="mt-1 text-[10px] text-[#78827C]">
              Gunakan REDESPA untuk mendukung administrasi Desa Pandak.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-[#D8E3DB] bg-white px-4 text-[10px] font-semibold text-[#245D40] transition hover:border-[#287A50] hover:bg-[#E6F2EA] sm:self-center"
          >
            Portal Petugas
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="shrink-0 border-t border-[#E8ECE9] bg-white">
        <div className="flex h-11 w-full items-center justify-between gap-3 px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-5 w-5 overflow-hidden rounded-md">
              <Image
                src="/icon.webp"
                alt="REDESPA"
                fill
                sizes="20px"
                className="object-cover"
              />
            </div>
            <span className="text-[9px] font-semibold text-[#78827C]">
              REDESPA · Desa Pandak
            </span>
          </Link>

          <p className="text-right text-[9px] text-[#9AA39D]">
            © {new Date().getFullYear()} REDESPA
          </p>
        </div>
      </footer>
    </main>
  );
}
