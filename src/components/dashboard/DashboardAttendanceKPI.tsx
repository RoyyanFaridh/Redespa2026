"use client";

import React, { useMemo } from "react";
import type { StatusPresensiStat } from "../../backend/admin/dashboard-actions";

type Props = {
  data: StatusPresensiStat[];
  totalPresensi: number;
};

export function DashboardAttendanceKPI({ data, totalPresensi }: Props) {
  const stats = useMemo(() => {
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
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#78827C]">
          Kinerja & Kedisiplinan
        </p>
        <span className="text-[10px] font-semibold text-[#287A50]">
          {stats.tingkatKehadiran}% Kehadiran
        </span>
      </div>

      {/* Progress Bar Partisipasi */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
        <div
          className="h-full rounded-full bg-[#287A50] transition-all duration-500"
          style={{ width: `${Math.max(stats.tingkatKehadiran, 2)}%` }}
          title={`Tingkat Kehadiran: ${stats.tingkatKehadiran}%`}
        />
      </div>

      {/* Grid 3 Kartu Mini Indikator */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
        <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-2">
          <p className="text-[9px] font-medium text-[#78827C]">Tingkat Hadir</p>
          <p className="mt-0.5 text-sm font-bold text-[#287A50]">
            {stats.tingkatKehadiran}%
          </p>
        </div>

        <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-2">
          <p className="text-[9px] font-medium text-[#78827C]">Tepat Waktu</p>
          <p className="mt-0.5 text-sm font-bold text-blue-600">
            {stats.rasioTepatWaktu}%
          </p>
        </div>

        <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-2">
          <p className="text-[9px] font-medium text-[#78827C]">Alpa / Tanpa Kabar</p>
          <p className="mt-0.5 text-sm font-bold text-rose-600">
            {stats.alpa}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardAttendanceKPI;

