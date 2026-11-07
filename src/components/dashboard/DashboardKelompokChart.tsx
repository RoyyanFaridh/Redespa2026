"use client";

import React, { useMemo } from "react";
import type { KelompokStat } from "../../backend/admin/dashboard-actions";

type Props = {
  data: KelompokStat[];
  totalAnggota: number;
};

const KELOMPOK_COLOR_MAP: Record<
  string,
  { bar: string; barHover: string; text: string; bgSoft: string; dot: string; border: string }
> = {
  Carikan: {
    bar: "bg-[#287A50]",
    barHover: "hover:bg-[#1f5f3e]",
    text: "text-[#287A50]",
    bgSoft: "bg-[#E6F2EA]",
    dot: "bg-[#287A50]",
    border: "border-[#65B98A]/30",
  },
  "Pandak 1": {
    bar: "bg-[#3B82F6]",
    barHover: "hover:bg-[#2563EB]",
    text: "text-blue-600",
    bgSoft: "bg-blue-50",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  "Pandak 2": {
    bar: "bg-[#10B981]",
    barHover: "hover:bg-[#059669]",
    text: "text-emerald-600",
    bgSoft: "bg-emerald-50",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  "Pandak 3": {
    bar: "bg-[#F59E0B]",
    barHover: "hover:bg-[#D97706]",
    text: "text-amber-600",
    bgSoft: "bg-amber-50",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  "Pandak 4": {
    bar: "bg-[#8B5CF6]",
    barHover: "hover:bg-[#7C3AED]",
    text: "text-purple-600",
    bgSoft: "bg-purple-50",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
  Payungan: {
    bar: "bg-[#06B6D4]",
    barHover: "hover:bg-[#0891B2]",
    text: "text-cyan-600",
    bgSoft: "bg-cyan-50",
    dot: "bg-cyan-500",
    border: "border-cyan-200",
  },
};

export function DashboardKelompokChart({ data, totalAnggota }: Props) {
  const maxJumlah = Math.max(...data.map((d) => d.jumlah), 1);

  // Cari kelompok dengan jumlah anggota terbanyak
  const kelompokTerbanyak = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) => b.jumlah - a.jumlah)[0];
  }, [data]);

  const rataRata = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.round(totalAnggota / data.length);
  }, [data, totalAnggota]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header Full-Width */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#287A50]" />
          <div>
            <h3 className="text-xs font-semibold text-[#202824]">
              Distribusi Anggota per Kelompok Desa Pandak
            </h3>
            <p className="text-[10px] font-normal text-[#78827C]">
              Sebaran populasi Jamaah di 6 kelompok wilayah Desa Pandak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="hidden text-[#78827C] sm:inline">
            Terbanyak:{" "}
            <span className="font-medium text-[#202824]">
              {kelompokTerbanyak?.kelompok ?? "-"} ({kelompokTerbanyak?.jumlah ?? 0} Jamaah)
            </span>
            {" · "}Rata-rata:{" "}
            <span className="font-medium text-[#202824]">{rataRata}</span> / kelompok
          </span>
          <span className="rounded-lg bg-[#E6F2EA] px-2.5 py-0.5 font-medium text-[#287A50]">
            Total {totalAnggota} Jamaah
          </span>
        </div>
      </div>

      {/* Grid 6 Kelompok Membentang Horizontal Penuh (Full-Width) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {data.map((item) => {
          const colors = KELOMPOK_COLOR_MAP[item.kelompok] ?? {
            bar: "bg-[#287A50]",
            barHover: "hover:bg-[#206440]",
            text: "text-[#287A50]",
            bgSoft: "bg-[#E6F2EA]",
            dot: "bg-[#287A50]",
            border: "border-[#65B98A]/30",
          };
          const widthPercent =
            totalAnggota > 0 ? Math.round((item.jumlah / totalAnggota) * 100) : 0;
          const barRatio =
            maxJumlah > 0 ? Math.round((item.jumlah / maxJumlah) * 100) : 0;

          return (
            <div
              key={item.kelompok}
              className="flex flex-col justify-between rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/60 p-2.5 transition hover:border-[#65B98A]/40 hover:bg-white"
            >
              {/* Header Kelompok */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
                  <span className="truncate text-[11px] font-medium text-[#202824]">
                    {item.kelompok}
                  </span>
                </div>
                <span className="text-[10px] font-normal text-[#8A948E]">
                  {widthPercent}%
                </span>
              </div>

              {/* Angka Utama */}
              <div className="my-1.5 flex items-baseline justify-between">
                <span className={`text-lg font-semibold tracking-tight ${colors.text}`}>
                  {item.jumlah}
                </span>
                <span className="text-[9px] font-normal text-[#78827C]">
                  Jamaah
                </span>
              </div>

              {/* Progress Bar Horizontal Proporsional */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${Math.max(barRatio, 6)}%` }}
                  title={`${item.kelompok}: ${item.jumlah} Jamaah (${widthPercent}%)`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardKelompokChart;
