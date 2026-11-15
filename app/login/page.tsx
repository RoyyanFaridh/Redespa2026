"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "../../src/backend/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError("Email atau kata sandi tidak valid. Silakan periksa kembali.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#F4F6F4] text-[#202824] selection:bg-[#287A50]/20 selection:text-[#287A50]">
      {/* Background Decorative Patterns */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Soft Radial Ambient Lights */}
        <div className="absolute -top-32 left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-[#E6F2EA]/70 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-[350px] w-[350px] rounded-full bg-[#E6F2EA]/50 blur-3xl" />

        {/* Civic Watermark Line Accents */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#287A50 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Header */}
      <header className="mx-auto flex h-16 w-full max-w-9xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-xl border border-[#DCE3DE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#78827C] shadow-2xs transition hover:border-[#287A50]/40 hover:text-[#287A50]"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            <path
              d="M15.833 10H4.167m4.166 4.167L4.167 10l4.166-4.167"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Civic Identifier Tag */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#78827C]">
          <span className="flex h-2 w-2 rounded-full bg-[#287A50]" />
          <span>Desa Pandak • DI Yogyakarta</span>
        </div>
      </header>

      {/* Main Container: The Civic Access Passcard */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[430px]">
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-3xl border border-[#DCE3DE] bg-white shadow-xl shadow-[#202824]/5">
            {/* 1. Header Band: Official Civic Pass Style */}
            <div className="relative bg-gradient-to-r from-[#1C5E3B] via-[#287A50] to-[#206440] p-6 text-white sm:p-7">
              {/* Subtle Guilloche / Line Accent */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 12px)`,
                }}
              />

              <div className="relative z-10 flex items-start justify-between gap-3">
                {/* Logo & Identity */}
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-2 ring-white/30">
                    <Image
                      src="/icon.webp"
                      alt="REDESPA"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6F2EA]">
                      Kartu Akses Petugas
                    </span>
                    <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                      REDESPA PANDAK
                    </h1>
                  </div>
                </div>

                {/* Simulated Security Smart Chip */}
                <div className="flex flex-col items-end">
                  <div className="flex h-7 w-9 items-center justify-center rounded-md border border-amber-300/40 bg-gradient-to-br from-amber-200/30 to-amber-400/20 shadow-2xs">
                    <div className="grid h-3 w-5 grid-cols-2 gap-0.5 rounded-xs border border-amber-300/60 bg-amber-200/40 p-0.5" />
                  </div>
                  <span className="mt-1 text-[8px] font-mono tracking-wider text-emerald-100/70">
                    SEC-ID
                  </span>
                </div>
              </div>

              {/* Sub-strip: Kelompok Binaan */}
              <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-[10px] text-emerald-100/80">
                <span>Cakupan: 6 Kelompok Wilayah</span>
                <span className="font-semibold text-white">Portal Resmi</span>
              </div>
            </div>

            {/* 2. Card Body: Formulir Otorisasi */}
            <div className="p-6 sm:p-7">
              <div className="mb-5">
                <h2 className="text-sm font-bold tracking-tight text-[#202824]">
                  Otorisasi Petugas
                </h2>
                <p className="mt-0.5 text-xs text-[#78827C]">
                  Masukkan akun admin untuk membuka rekapitulasi data.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="leading-5">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Field Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold text-[#202824]"
                  >
                    Email Akun Petugas
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#78827C]">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                        <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@redespa.desa.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="h-11 w-full rounded-xl border border-[#DCE3DE] bg-[#F9FAF9] pl-10 pr-3.5 text-xs text-[#202824] placeholder:text-[#8E9892] transition hover:bg-white focus:border-[#287A50] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#287A50]/20"
                    />
                  </div>
                </div>

                {/* Field Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold text-[#202824]"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#78827C]">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="h-11 w-full rounded-xl border border-[#DCE3DE] bg-[#F9FAF9] pl-10 pr-12 text-xs text-[#202824] placeholder:text-[#8E9892] transition hover:bg-white focus:border-[#287A50] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#287A50]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center px-1 text-xs font-medium text-[#78827C] transition hover:text-[#287A50]"
                    >
                      {showPassword ? "Tutup" : "Lihat"}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#287A50] text-xs font-semibold text-white shadow-sm transition hover:bg-[#206440] hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <span>Buka Dashboard Petugas</span>
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
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 3. Card Bottom Stub: Perforated Pass Strip */}
            <div className="relative border-t border-dashed border-[#DCE3DE] bg-[#FBFDFB] px-6 py-3.5">
              {/* Left & Right Perforation Cutout Accents */}
              <div
                aria-hidden="true"
                className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-[#DCE3DE] bg-[#F4F6F4]"
              />
              <div
                aria-hidden="true"
                className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full border border-[#DCE3DE] bg-[#F4F6F4]"
              />

              <div className="flex items-center justify-between text-[10px] text-[#78827C]">
                {/* Simulated Barcode Motif */}
                <div className="flex items-center gap-0.5">
                  <span className="h-4 w-0.5 bg-[#202824]" />
                  <span className="h-4 w-1 bg-[#202824]" />
                  <span className="h-4 w-0.5 bg-[#78827C]" />
                  <span className="h-4 w-1.5 bg-[#202824]" />
                  <span className="h-4 w-0.5 bg-[#202824]" />
                  <span className="h-4 w-1 bg-[#287A50]" />
                  <span className="h-4 w-0.5 bg-[#202824]" />
                  <span className="h-4 w-1 bg-[#202824]" />
                </div>

                <div className="text-right">
                  <p className="font-mono font-semibold text-[#202824]">
                    REDESPA-2026-PANDAK
                  </p>
                  <p className="text-[9px]">Enkripsi Terverifikasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-9xl px-4 py-4 text-center text-[11px] text-[#78827C] sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} REDESPA Desa Pandak. Seluruh hak cipta
        dilindungi.
      </footer>
    </div>
  );
}
