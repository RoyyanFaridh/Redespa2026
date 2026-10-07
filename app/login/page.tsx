"use client";

import { useState } from "react";
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN DATA:", data);
    console.log("LOGIN ERROR:", error);

    setLoading(false);

    if (error) {
      setError("Email atau password tidak valid.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f6f8f7]">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_70px_-35px_rgba(0,0,0,0.18)] lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT PANEL */}
          <section className="relative hidden min-h-155 overflow-hidden bg-teal-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M8 12h8M12 8v8" strokeLinecap="round" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold tracking-tight">KMM</p>

                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-teal-100">
                    Desa Pandak
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-teal-100">
                Sistem Informasi Desa
              </p>

              <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] xl:text-5xl">
                Kelola Muda-Mudi
                <span className="block text-teal-100">Desa Pandak.</span>
              </h1>

              <p className="mt-5 max-w-md text-xs leading-5 text-teal-100">
                Sistem terpusat untuk membantu pengurus mengelola data
                Muda-Mudi, kegiatan, dan presensi secara lebih teratur.
              </p>

              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-xl font-semibold">06</p>
                  <p className="mt-0.5 text-[9px] text-teal-100">Kelompok</p>
                </div>

                <div className="h-7 w-px bg-teal-500" />

                <div>
                  <p className="text-xl font-semibold">03</p>
                  <p className="mt-0.5 text-[9px] text-teal-100">Fitur Utama</p>
                </div>

                <div className="h-7 w-px bg-teal-500" />

                <div>
                  <p className="text-xl font-semibold">2026</p>
                  <p className="mt-0.5 text-[9px] text-teal-100">Periode</p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[9px] text-teal-200">
                KMM · Sistem Informasi Muda-Mudi Desa Pandak
              </p>
            </div>

            {/* DECORATIVE SHAPE */}
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border-60 border-teal-600/40" />

            <div className="pointer-events-none absolute -right-16 top-20 h-40 w-40 rounded-full bg-teal-600/40 blur-3xl" />
          </section>

          {/* RIGHT PANEL */}
          <section className="flex min-h-155 items-center px-7 py-10 sm:px-12 lg:px-14 xl:px-20">
            <div className="mx-auto w-full max-w-sm">
              {/* MOBILE BRAND */}
              <div className="mb-10 lg:hidden">
                <p className="text-sm font-semibold tracking-tight text-gray-900">
                  KMM
                </p>

                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-gray-400">
                  Desa Pandak
                </p>
              </div>

              {/* TITLE */}
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Area Pengurus
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                  Masuk ke KMM
                </h2>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Gunakan akun admin untuk mengakses sistem pengelolaan Desa
                  Pandak.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        d="M12 8v4M12 16h.01"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <p className="text-[10px] leading-4 text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] font-medium text-gray-600"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />

                        <path
                          d="m3 7 9 6 9-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <input
                      id="email"
                      type="email"
                      placeholder="Masukkan email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[10px] font-medium text-gray-600"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      >
                        <rect x="4" y="10" width="16" height="11" rx="2" />

                        <path
                          d="M8 10V7a4 4 0 0 1 8 0v3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-[11px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-600"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M3 3l18 18" strokeLinecap="round" />

                          <path
                            d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                            strokeLinecap="round"
                          />

                          <path
                            d="M6.2 6.2C4.5 7.5 3.3 9.3 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M9.9 5.1A10.7 10.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a15.8 15.8 0 0 1 3.1 4.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle cx="12" cy="12" r="2.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 text-[11px] font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" className="opacity-25" />

                        <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round" />
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke Sistem
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 10h11M11 6l4 4-4 4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* BOTTOM INFO */}
              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-gray-400">KMM</p>

                  <p className="text-[9px] text-gray-400">Desa Pandak · 2026</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
