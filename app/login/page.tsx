
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "../../src/backend/supabase/client";
import { Button } from "../../src/components/common/Button";

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

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setError(
          "Email atau kata sandi tidak valid. Periksa kembali kredensial Anda."
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Login gagal:", err);
      setError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F6F3] px-4 py-8 text-[#202824] sm:px-6">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#DCEADF]/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#E2EBE3]/70 blur-3xl"
      />

      <div className="relative w-full max-w-[960px]">
        {/* Back navigation */}
        <div className="mb-5 flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-medium text-[#78827C] transition-colors hover:text-[#287A50]"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M15.5 10H4.5m4 4-4-4 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kembali ke Beranda
          </Link>

          <span className="text-[10px] font-medium tracking-[0.14em] text-[#89938C]">
            DESA PANDAK
          </span>
        </div>

        {/* Login Card */}
        <div className="grid overflow-hidden rounded-2xl border border-[#E3E9E4] bg-white shadow-[0_20px_70px_rgba(35,65,43,0.09)] md:min-h-[550px] md:grid-cols-[0.95fr_1.05fr]">
          {/* Left: Brand Panel */}
          <section className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-[#245D40] p-6 text-white sm:p-9 md:min-h-[550px] md:p-10">
            {/* Subtle background pattern */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/[0.10]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/[0.10]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/[0.08]"
            />

            {/* Brand */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
                  <path
                    d="M8 8h8M8 12h8M8 16h4"
                    strokeLinecap="round"
                  />
                  <circle cx="17" cy="16" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-[0.16em]">
                  REDESPA
                </p>
                <p className="mt-0.5 text-[9px] tracking-[0.08em] text-white/60">
                  DESA PANDAK
                </p>
              </div>
            </div>

            {/* Main identity */}
            <div className="relative z-10 mt-9 md:mt-0">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-[2px] w-7 rounded-full bg-[#A9D1B2]" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C4DDCA]">
                  Sistem Informasi
                </span>
              </div>

              <h1 className="max-w-[340px] text-[27px] font-semibold leading-[1.3] tracking-tight sm:text-[32px]">
                Data Generus dan Jamaah,
                <span className="text-[#B8D9C0]">
                  {" "}
                  lebih tertata.
                </span>
              </h1>

              <p className="mt-5 max-w-[310px] text-[12px] leading-[1.9] text-white/70">
                REDESPA membantu pengelolaan data, kegiatan, dan presensi
                dalam satu sistem informasi terpadu.
              </p>

              {/* Feature labels */}
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-md border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-medium text-white/80">
                  Data Generus
                </span>
                <span className="rounded-md border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-medium text-white/80">
                  Data Jamaah
                </span>
                <span className="rounded-md border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-medium text-white/80">
                  Presensi
                </span>
              </div>
            </div>

            {/* Bottom information */}
            <div className="relative z-10 mt-8 hidden items-center justify-between border-t border-white/15 pt-5 md:flex">
              <p className="text-[10px] text-white/50">
                Portal Pengelolaan Data
              </p>
              <p className="text-[10px] tracking-wide text-white/50">
                REDESPA
              </p>
            </div>

            <div className="relative z-10 mt-7 flex items-center justify-between border-t border-white/15 pt-4 md:hidden">
              <p className="text-[9px] text-white/50">
                Portal Pengelolaan Data
              </p>
              <p className="text-[9px] text-white/50">
                REDESPA
              </p>
            </div>
          </section>

          {/* Right: Login Form */}
          <section className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 md:px-12 lg:px-14">
            <div className="mx-auto w-full max-w-[350px]">
              {/* Heading */}
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-[#EAF3EC] px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#287A50]">
                    Portal Petugas
                  </span>
                </div>

                <h2 className="text-[25px] font-semibold tracking-tight text-[#202824]">
                  Masuk ke REDESPA
                </h2>

                <p className="mt-2 text-[12px] leading-[1.8] text-[#78827C]">
                  Silakan masuk menggunakan akun petugas yang telah
                  terdaftar.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-semibold text-[#37423B]"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#929D95]">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <rect
                          x="2.5"
                          y="4"
                          width="15"
                          height="12"
                          rx="2"
                        />
                        <path
                          d="m3.5 5 6.5 5 6.5-5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      disabled={loading}
                      className="h-11 w-full rounded-lg border border-[#E2E8E3] bg-[#FAFCFA] pl-10 pr-3 text-xs text-[#202824] outline-none transition-all placeholder:text-[#A5ADA7] hover:border-[#C6D4C9] focus:border-[#287A50] focus:bg-white focus:ring-4 focus:ring-[#287A50]/[0.07] disabled:cursor-not-allowed disabled:bg-[#F5F7F5]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[11px] font-semibold text-[#37423B]"
                  >
                    Kata Sandi
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#929D95]">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <rect
                          x="3.5"
                          y="8.5"
                          width="13"
                          height="9"
                          rx="2"
                        />
                        <path
                          d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 12v2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      className="h-11 w-full rounded-lg border border-[#E2E8E3] bg-[#FAFCFA] pl-10 pr-[76px] text-xs text-[#202824] outline-none transition-all placeholder:text-[#A5ADA7] hover:border-[#C6D4C9] focus:border-[#287A50] focus:bg-white focus:ring-4 focus:ring-[#287A50]/[0.07] disabled:cursor-not-allowed disabled:bg-[#F5F7F5]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Sembunyikan kata sandi"
                          : "Tampilkan kata sandi"
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-[10px] font-medium text-[#78827C] transition-colors hover:text-[#287A50] disabled:cursor-not-allowed"
                    >
                      {showPassword ? "Sembunyikan" : "Lihat"}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] leading-5 text-red-700"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={loading}
                    disabled={loading}
                    className="h-11 w-full justify-center !rounded-lg !text-xs font-semibold shadow-[0_3px_9px_rgba(40,122,80,0.16)] transition-all"
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </div>
              </form>

              {/* Access information */}
              <div className="mt-8 flex items-start gap-2.5 border-t border-[#EDF0ED] pt-5">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#89958D]"
                  aria-hidden="true"
                >
                  <path
                    d="M10 2.5 3.5 5v4.5c0 4.1 2.8 6.7 6.5 8 3.7-1.3 6.5-3.9 6.5-8V5L10 2.5Z"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m7.5 10 1.7 1.7 3.5-3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p className="text-[10px] leading-[1.8] text-[#929D95]">
                  Halaman ini hanya dapat diakses oleh petugas REDESPA
                  dengan akun yang telah terdaftar.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-5 flex items-center justify-center px-2 text-[10px] text-[#9AA39D]">
          © {new Date().getFullYear()} REDESPA Desa Pandak
        </footer>
      </div>
    </main>
  );
}
