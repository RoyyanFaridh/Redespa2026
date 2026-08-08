'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8">
      <div className="w-full max-w-95">

        {/* ======================================================
            LOGIN CARD
        ====================================================== */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">

          {/* Header */}
          <div className="px-5 pb-5 pt-6 sm:px-6 sm:pt-7">

            {/* Logo */}
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d7f78] text-[12px] font-semibold text-white">
              MM
            </div>

            <h1 className="text-[20px] font-semibold leading-6 text-gray-900">
              Login Admin
            </h1>

            <p className="mt-1 text-[11px] leading-4 text-gray-400">
              Masuk untuk mengelola data mudamudi
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-4 px-5 py-5 sm:px-6"
          >

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4M12 16h.01"
                  />
                </svg>

                <p className="text-[11px] leading-4 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-medium text-gray-600"
              >
                Email
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4 text-gray-400"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m3 7 9 6 9-6"
                    />
                  </svg>
                </div>

                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0d7f78] focus:ring-2 focus:ring-[#0d7f78]/10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px] font-medium text-gray-600"
              >
                Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4 text-gray-400"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                    />
                  </svg>
                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0d7f78] focus:ring-2 focus:ring-[#0d7f78]/10"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#171717] text-[12px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m10 17 5-5-5-5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3"
                />
              </svg>

              Login
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 text-center sm:px-6">
            <p className="text-[10px] text-gray-400">
              Data Mudamudi 2026 · Desa Pandak
            </p>
          </div>
        </div>

        {/* Small branding */}
        <p className="mt-4 text-center text-[10px] text-gray-400">
          Sistem Informasi Data Mudamudi
        </p>
      </div>
    </main>
  )
}