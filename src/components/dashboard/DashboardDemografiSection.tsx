import React from "react";
import type { KelompokStat, KelasStat } from "../../backend/admin/dashboard-actions";

type Props = {
  jamaahStats: {
    total: number;
    lakiLaki: number;
    perempuan: number;
    kelompokDistribusi: KelompokStat[];
  };
  mudamudiStats: {
    total: number;
    lakiLaki: number;
    perempuan: number;
    kelompokDistribusi: KelompokStat[];
    kelasDistribusi: KelasStat[];
  };
};

const KELOMPOK_COLOR_MAP: Record<
  string,
  { text: string; bgSoft: string; dot: string; bar: string }
> = {
  Carikan: {
    text: "text-[#287A50]",
    bgSoft: "bg-[#E6F2EA]",
    dot: "bg-[#287A50]",
    bar: "bg-[#287A50]",
  },
  "Pandak 1": {
    text: "text-blue-600",
    bgSoft: "bg-blue-50",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
  },
  "Pandak 2": {
    text: "text-emerald-600",
    bgSoft: "bg-emerald-50",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  "Pandak 3": {
    text: "text-amber-600",
    bgSoft: "bg-amber-50",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  "Pandak 4": {
    text: "text-purple-600",
    bgSoft: "bg-purple-50",
    dot: "bg-purple-500",
    bar: "bg-purple-500",
  },
  Payungan: {
    text: "text-cyan-600",
    bgSoft: "bg-cyan-50",
    dot: "bg-cyan-500",
    bar: "bg-cyan-500",
  },
};

export function DashboardDemografiSection({ jamaahStats, mudamudiStats }: Props) {
  // Jamaah gender ratio
  const totalJamaahGender = jamaahStats.lakiLaki + jamaahStats.perempuan;
  const persenJamaahLaki =
    totalJamaahGender > 0 ? Math.round((jamaahStats.lakiLaki / totalJamaahGender) * 100) : 0;
  const persenJamaahPerempuan = totalJamaahGender > 0 ? 100 - persenJamaahLaki : 0;

  // Muda-Mudi gender ratio
  const totalMudamudiGender = mudamudiStats.lakiLaki + mudamudiStats.perempuan;
  const persenMudamudiLaki =
    totalMudamudiGender > 0 ? Math.round((mudamudiStats.lakiLaki / totalMudamudiGender) * 100) : 0;
  const persenMudamudiPerempuan = totalMudamudiGender > 0 ? 100 - persenMudamudiLaki : 0;

  // Max counts for proportional mini bars
  const maxJamaahKelompok = Math.max(
    ...jamaahStats.kelompokDistribusi.map((k) => k.jumlah),
    1,
  );
  const maxMudamudiKelompok = Math.max(
    ...mudamudiStats.kelompokDistribusi.map((k) => k.jumlah),
    1,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-3.5 lg:grid-cols-2">
      {/* ======================================================== */}
      {/* 1. SECTION DATA JAMAAH                                   */}
      {/* ======================================================== */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#E5EAE6] bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-[#65B98A]/30">
        <div>
          {/* Header Section Jamaah */}
          <div className="flex items-center justify-between border-b border-[#E5EAE6] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21c.5-4 3.5-6 6.5-6s6 2 6.5 6" />
                </svg>
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#202824]">
                  Ringkasan Data Jamaah
                </h3>
                <p className="text-[10px] text-[#78827C]">
                  Warga Jamaah Desa Pandak
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-[#E6F2EA] px-2 py-0.5 text-xs font-bold text-[#287A50]">
              {jamaahStats.total} Orang
            </span>
          </div>

          {/* Metric Cards Jamaah: Total, Laki-Laki, Perempuan */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/80 p-2">
              <span className="block text-[9px] font-medium text-[#78827C]">Total</span>
              <span className="text-base font-bold text-[#202824]">
                {jamaahStats.total}
              </span>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2">
              <span className="block text-[9px] font-medium text-blue-600">Laki-laki</span>
              <span className="text-base font-bold text-blue-700">
                {jamaahStats.lakiLaki}
              </span>
            </div>
            <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-2">
              <span className="block text-[9px] font-medium text-pink-600">Perempuan</span>
              <span className="text-base font-bold text-pink-700">
                {jamaahStats.perempuan}
              </span>
            </div>
          </div>

          {/* Gender Ratio Bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[9px] text-[#78827C]">
              <span>Rasio Gender</span>
              <span>
                L {persenJamaahLaki}% · P {persenJamaahPerempuan}%
              </span>
            </div>
            <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
              <div
                className="bg-blue-600 transition-all duration-300"
                style={{ width: `${persenJamaahLaki}%` }}
                title={`Laki-laki: ${jamaahStats.lakiLaki}`}
              />
              <div
                className="bg-pink-500 transition-all duration-300"
                style={{ width: `${persenJamaahPerempuan}%` }}
                title={`Perempuan: ${jamaahStats.perempuan}`}
              />
            </div>
          </div>

          {/* Distribusi Jamaah per Kelompok */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-semibold text-[#202824]">
                Distribusi Jamaah per Kelompok
              </h4>
              <span className="text-[9px] text-[#78827C]">6 Kelompok</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {jamaahStats.kelompokDistribusi.map((item) => {
                const color = KELOMPOK_COLOR_MAP[item.kelompok] ?? {
                  text: "text-[#287A50]",
                  bgSoft: "bg-[#E6F2EA]",
                  dot: "bg-[#287A50]",
                  bar: "bg-[#287A50]",
                };
                const barRatio =
                  maxJamaahKelompok > 0
                    ? Math.round((item.jumlah / maxJamaahKelompok) * 100)
                    : 0;

                return (
                  <div
                    key={item.kelompok}
                    className="flex flex-col justify-between rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/50 p-2 transition hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot}`} />
                        <span className="truncate text-[10px] font-medium text-[#202824]">
                          {item.kelompok}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-[#202824]">
                        {item.jumlah}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
                      <div
                        className={`h-full rounded-full ${color.bar}`}
                        style={{ width: `${Math.max(barRatio, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECTION DATA MUDA-MUDI                                */}
      {/* ======================================================== */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#E5EAE6] bg-white p-3.5 sm:p-4 shadow-2xs transition hover:border-[#65B98A]/30">
        <div>
          {/* Header Section Muda-Mudi */}
          <div className="flex items-center justify-between border-b border-[#E5EAE6] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#202824]">
                  Ringkasan Data Muda-Mudi
                </h3>
                <p className="text-[10px] text-[#78827C]">
                  Generasi Penerus Desa Pandak
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              {mudamudiStats.total} Orang
            </span>
          </div>

          {/* Metric Cards Muda-Mudi: Total, Laki-Laki, Perempuan */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/80 p-2">
              <span className="block text-[9px] font-medium text-[#78827C]">Total</span>
              <span className="text-base font-bold text-[#202824]">
                {mudamudiStats.total}
              </span>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2">
              <span className="block text-[9px] font-medium text-blue-600">Laki-laki</span>
              <span className="text-base font-bold text-blue-700">
                {mudamudiStats.lakiLaki}
              </span>
            </div>
            <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-2">
              <span className="block text-[9px] font-medium text-pink-600">Perempuan</span>
              <span className="text-base font-bold text-pink-700">
                {mudamudiStats.perempuan}
              </span>
            </div>
          </div>

          {/* Gender Ratio Bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[9px] text-[#78827C]">
              <span>Rasio Gender</span>
              <span>
                L {persenMudamudiLaki}% · P {persenMudamudiPerempuan}%
              </span>
            </div>
            <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
              <div
                className="bg-blue-600 transition-all duration-300"
                style={{ width: `${persenMudamudiLaki}%` }}
                title={`Laki-laki: ${mudamudiStats.lakiLaki}`}
              />
              <div
                className="bg-pink-500 transition-all duration-300"
                style={{ width: `${persenMudamudiPerempuan}%` }}
                title={`Perempuan: ${mudamudiStats.perempuan}`}
              />
            </div>
          </div>

          {/* Distribusi Muda-Mudi per Kelompok */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-semibold text-[#202824]">
                Distribusi Muda-Mudi per Kelompok
              </h4>
              <span className="text-[9px] text-[#78827C]">6 Kelompok</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {mudamudiStats.kelompokDistribusi.map((item) => {
                const color = KELOMPOK_COLOR_MAP[item.kelompok] ?? {
                  text: "text-[#287A50]",
                  bgSoft: "bg-[#E6F2EA]",
                  dot: "bg-[#287A50]",
                  bar: "bg-[#287A50]",
                };
                const barRatio =
                  maxMudamudiKelompok > 0
                    ? Math.round((item.jumlah / maxMudamudiKelompok) * 100)
                    : 0;

                return (
                  <div
                    key={item.kelompok}
                    className="flex flex-col justify-between rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/50 p-2 transition hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot}`} />
                        <span className="truncate text-[10px] font-medium text-[#202824]">
                          {item.kelompok}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-[#202824]">
                        {item.jumlah}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
                      <div
                        className={`h-full rounded-full ${color.bar}`}
                        style={{ width: `${Math.max(barRatio, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribusi Kelas Muda-Mudi */}
          <div className="mt-3.5 border-t border-[#E5EAE6] pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-semibold text-[#202824]">
                Distribusi Kelas Muda-Mudi
              </h4>
              <span className="text-[9px] text-[#78827C]">Tingkat Usia</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {mudamudiStats.kelasDistribusi.map((item) => (
                <div
                  key={item.kelas}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/70 px-1 py-1 text-center transition hover:bg-white"
                >
                  <span className="w-full truncate text-[9px] font-normal text-[#78827C]" title={item.kelas}>
                    {item.kelas}
                  </span>
                  <span className="text-[11px] font-semibold text-[#202824]">
                    {item.jumlah}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardDemografiSection;
