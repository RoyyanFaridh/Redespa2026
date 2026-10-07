import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Muda-Mudi",
    description: "Kelola data Muda-Mudi Desa Pandak.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="9" cy="8" r="3" />
        <path
          d="M3.5 19a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0 0-6M16.5 14a4.5 4.5 0 0 1 4 5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Kegiatan",
    description: "Atur jadwal dan sasaran kegiatan.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" strokeLinecap="round" />
        <path
          d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Presensi",
    description: "Catat kehadiran dengan QR personal.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
        <path d="M14 14h2v2h-2zM18 18h2v2h-2z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-[#f8faf9]">
      <div className="mx-auto flex h-full w-full max-w-9xl flex-col px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-gray-900">
              KMM
            </p>

            <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400">
              Desa Pandak
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3.5 text-[10px] font-medium text-gray-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          >
            Login Admin
          </Link>
        </header>

        {/* MAIN HERO */}
        <section className="flex min-h-0 flex-1 items-center">
          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            {/* LEFT */}
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />

                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-teal-700">
                  Sistem Informasi Desa Pandak
                </span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-[60px]">
                Muda-Mudi Desa
                <span className="block text-teal-700">dalam satu sistem.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-6 text-gray-500">
                Kelola data Muda-Mudi, kegiatan, dan presensi secara lebih
                teratur dalam satu sistem informasi untuk Desa Pandak.
              </p>

              <div className="mt-7 flex items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-5 text-[10px] font-medium text-white transition hover:bg-teal-800"
                >
                  Masuk sebagai Admin
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
                </Link>

                <span className="text-[9px] text-gray-400">
                  Khusus pengurus Desa Pandak
                </span>
              </div>
            </div>

            {/* RIGHT VISUAL */}
            <div className="hidden lg:flex lg:justify-end">
              <div className="w-full max-w-md">
                <div className="border-l-2 border-teal-600 pl-7">
                  <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-gray-400">
                    Tentang Sistem
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                    Sederhana untuk digunakan.
                  </h2>

                  <p className="mt-3 max-w-sm text-xs leading-5 text-gray-500">
                    KMM dirancang untuk membantu pengurus mengelola administrasi
                    Muda-Mudi Desa Pandak tanpa proses yang rumit.
                  </p>

                  <div className="mt-7 grid grid-cols-3 border-y border-gray-200 py-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">01</p>
                      <p className="mt-0.5 text-[9px] text-gray-400">Desa</p>
                    </div>

                    <div className="border-l border-gray-200 pl-5">
                      <p className="text-lg font-semibold text-gray-900">06</p>
                      <p className="mt-0.5 text-[9px] text-gray-400">
                        Kelompok
                      </p>
                    </div>

                    <div className="border-l border-gray-200 pl-5">
                      <p className="text-lg font-semibold text-gray-900">03</p>
                      <p className="mt-0.5 text-[9px] text-gray-400">
                        Fitur Utama
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-[9px] leading-4 text-gray-400">
                    Data Muda-Mudi · Kegiatan · Presensi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="shrink-0 border-t border-gray-200 py-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  {feature.icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-semibold text-gray-300">
                      {feature.number}
                    </span>

                    <h2 className="text-[10px] font-semibold text-gray-800">
                      {feature.title}
                    </h2>
                  </div>

                  <p className="mt-0.5 text-[9px] leading-4 text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex h-10 shrink-0 items-center justify-between text-[8px] text-gray-400">
          <span>KMM · Desa Pandak</span>

          <span>2026</span>
        </footer>
      </div>
    </main>
  );
}
