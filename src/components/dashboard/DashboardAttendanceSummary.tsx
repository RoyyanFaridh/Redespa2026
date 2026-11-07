"use client";

import React, { useMemo } from "react";
import type { StatusPresensiStat } from "../../backend/admin/dashboard-actions";

type Props = {
  data: StatusPresensiStat[];
  totalPresensi: number;
};

const STATUS_CONFIG: Record<
  string,
  {
    bar: string;
    barHover: string;
    text: string;
    dot: string;
    bgSoft: string;
  }
> = {
  Hadir: {
    bar: "bg-[#287A50]",
    barHover: "hover:bg-[#1f5f3e]",
    text: "text-[#287A50]",
    dot: "bg-[#287A50]",
    bgSoft: "bg-[#E6F2EA]",
  },
  Terlambat: {
    bar: "bg-amber-500",
    barHover: "hover:bg-amber-600",
    text: "text-amber-700",
    dot: "bg-amber-500",
    bgSoft: "bg-amber-50",
  },
  Izin: {
    bar: "bg-blue-500",
    barHover: "hover:bg-blue-600",
    text: "text-blue-700",
    dot: "bg-blue-500",
    bgSoft: "bg-blue-50",
  },
  Sakit: {
    bar: "bg-purple-500",
    barHover: "hover:bg-purple-600",
    text: "text-purple-700",
    dot: "bg-purple-500",
    bgSoft: "bg-purple-50",
  },
  Alpa: {
    bar: "bg-rose-500",
    barHover: "hover:bg-rose-600",
    text: "text-rose-700",
    dot: "bg-rose-500",
    bgSoft: "bg-rose-50",
  },
};

export function DashboardAttendanceSummary({ data, totalPresensi }: Props) {
  const maxJumlah = Math.max(...data.map((d) => d.jumlah), 1);

  // Hitung KPI partisipasi presensi
  const kpi = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => map.set(item.label, item.jumlah));

    const hadir = map.get("Hadir") ?? 0;
    const terlambat = map.get("Terlambat") ?? 0;
    const izin = map.get("Izin") ?? 0;
    const sakit = map.get("Sakit") ?? 0;
    const alpa = map.get("Alpa") ?? 0;

    const totalHadirDanTerlambat = hadir + terlambat;
    const tingkatKehadiran =
      totalPresensi > 0 ? Math.round((totalHadirDanTerlambat / totalPresensi) * 100) : 0;
    const rasioTepatWaktu =
      totalHadirDanTerlambat > 0 ? Math.round((hadir / totalHadirDanTerlambat) * 100) : 0;

    return {
      tingkatKehadiran,
      rasioTepatWaktu,
      totalBerhalangan: izin + sakit,
      alpa,
    };
  }, [data, totalPresensi]);

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] pb-2">
        <div>
          <p className="text-[10px] font-medium text-[#78827C]">
            Riwayat Presensi
          </p>
          <h3 className="text-xs font-semibold text-[#202824]">
            Distribusi Status Kehadiran
          </h3>
        </div>
        <span className="shrink-0 rounded-lg bg-[#F5F7F5] px-2.5 py-0.5 text-[10px] font-medium text-[#78827C]">
          Total <span className="font-semibold text-[#202824]">{totalPresensi.toLocaleString("id-ID")}</span> data
        </span>
      </div>

      {/* Stacked bar ringkas */}
      <div className="shrink-0">
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
          {data.map((item) => {
            const config = STATUS_CONFIG[item.label] ?? {
              bar: "bg-gray-400",
              dot: "bg-gray-400",
              text: "text-gray-700",
              barHover: "hover:bg-gray-500",
              bgSoft: "bg-gray-50",
            };
            const widthPercent =
              totalPresensi > 0 ? (item.jumlah / totalPresensi) * 100 : 0;
            return (
              <div
                key={item.label}
                className={`${config.bar} transition-all duration-300`}
                style={{ width: `${widthPercent}%` }}
                title={`${item.label}: ${item.jumlah.toLocaleString("id-ID")} (${Math.round(widthPercent)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Vertical Bar Chart Proporsional */}
      <div className="relative flex h-[120px] items-end gap-2 pt-2 pb-0.5 sm:gap-3">
        {/* Garis bantu horizontal */}
        <div className="pointer-events-none absolute inset-x-0 top-3 border-b border-dashed border-[#E5EAE6]/70" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-[#E5EAE6]/50" />

        {data.map((item) => {
          const config = STATUS_CONFIG[item.label] ?? {
            bar: "bg-gray-400",
            barHover: "hover:bg-gray-500",
            text: "text-gray-700",
            dot: "bg-gray-400",
            bgSoft: "bg-gray-50",
          };
          const heightPercent =
            maxJumlah > 0 ? Math.round((item.jumlah / maxJumlah) * 100) : 0;
          const percent =
            totalPresensi > 0
              ? Math.round((item.jumlah / totalPresensi) * 100)
              : 0;

          return (
            <div
              key={item.label}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              {/* Nilai & Persentase */}
              <div className="mb-1 flex shrink-0 flex-col items-center transition-transform duration-200 group-hover:-translate-y-0.5">
                <span className={`text-[11px] font-semibold leading-none ${config.text}`}>
                  {item.jumlah.toLocaleString("id-ID")}
                </span>
                <span className="text-[8px] font-normal text-[#8A948E]">
                  {percent}%
                </span>
              </div>

              {/* Batang Diagram */}
              <div className="relative flex h-full w-full flex-1 flex-col justify-end">
                {/* Background track halus */}
                <div className="absolute inset-x-0 bottom-0 top-0 mx-auto w-full max-w-[40px] rounded-t-md bg-[#F5F7F5]" />

                {/* Bar aktif */}
                <div
                  className={`relative mx-auto w-full max-w-[40px] rounded-t-md transition-all duration-500 ${config.bar} ${config.barHover} shadow-2xs`}
                  style={{
                    height: `${Math.max(heightPercent, 7)}%`,
                    minHeight: "6px",
                  }}
                  title={`${item.label}: ${item.jumlah.toLocaleString("id-ID")} (${percent}%)`}
                />
              </div>

              {/* Label Status */}
              <div className="mt-1.5 flex shrink-0 items-center justify-center gap-1 sm:gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
                <span className="truncate text-[10px] font-medium text-[#48534D]">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Kinerja Presensi (Typography Tenang) */}
      <div className="grid shrink-0 grid-cols-3 gap-1.5 rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/70 p-1.5 text-center">
        <div className="rounded-lg bg-white p-1.5 shadow-2xs">
          <p className="text-[9px] font-normal text-[#78827C]">Tingkat Hadir</p>
          <p className="mt-0.5 text-xs font-semibold text-[#287A50]">{kpi.tingkatKehadiran}%</p>
        </div>
        <div className="rounded-lg bg-white p-1.5 shadow-2xs">
          <p className="text-[9px] font-normal text-[#78827C]">Tepat Waktu</p>
          <p className="mt-0.5 text-xs font-semibold text-blue-600">{kpi.rasioTepatWaktu}%</p>
        </div>
        <div className="rounded-lg bg-white p-1.5 shadow-2xs">
          <p className="text-[9px] font-normal text-[#78827C]">Alpa</p>
          <p className="mt-0.5 text-xs font-semibold text-rose-600">{kpi.alpa}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardAttendanceSummary;
