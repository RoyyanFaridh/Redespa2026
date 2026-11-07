import React from "react";
import type { KelasStat } from "../../backend/admin/dashboard-actions";

type Props = {
  kelasData: KelasStat[];
  genderData: {
    lakiLaki: number;
    perempuan: number;
  };
  totalAnggota: number;
};

export function DashboardKelasBreakdown({
  kelasData,
  genderData,
}: Props) {
  const totalGender = genderData.lakiLaki + genderData.perempuan;
  const persenLaki =
    totalGender > 0 ? Math.round((genderData.lakiLaki / totalGender) * 100) : 0;
  const persenPerempuan = totalGender > 0 ? 100 - persenLaki : 0;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header Demografi */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <div>
            <p className="text-[10px] font-medium text-[#78827C]">
              Demografi Jamaah
            </p>
            <h3 className="text-xs font-semibold text-[#202824]">
              Komposisi Gender & Kelas
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-[#78827C]">
          <span className="font-medium text-blue-600">{genderData.lakiLaki} L</span> ·{" "}
          <span className="font-medium text-pink-600">{genderData.perempuan} P</span>
        </span>
      </div>

      {/* Gender Breakdown Bar */}
      <div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-medium text-[#202824]">Rasio Gender</span>
          <span className="text-[10px] text-[#78827C]">
            Laki-laki {persenLaki}% · Perempuan {persenPerempuan}%
          </span>
        </div>
        <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-[#E5EAE6]">
          <div
            className="bg-blue-600 transition-all duration-300"
            style={{ width: `${persenLaki}%` }}
            title={`Laki-laki: ${genderData.lakiLaki} (${persenLaki}%)`}
          />
          <div
            className="bg-pink-500 transition-all duration-300"
            style={{ width: `${persenPerempuan}%` }}
            title={`Perempuan: ${genderData.perempuan} (${persenPerempuan}%)`}
          />
        </div>
      </div>

      {/* Kelas Badges Grid Responsif (8 Kelas Tertampung Sempurna Tanpa Jebol) */}
      <div>
        <p className="mb-1 text-[10px] font-medium text-[#78827C]">
          Distribusi Kelas Pembinaan
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 xl:grid-cols-8">
          {kelasData.map((item) => (
            <div
              key={item.kelas}
              className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#F5F7F5]/70 px-1 py-1 text-center transition-colors hover:bg-white"
            >
              <span className="w-full truncate text-[9px] font-normal text-[#78827C]" title={item.kelas}>
                {item.kelas}
              </span>
              <span className="text-[11px] font-semibold text-[#202824]">
                {item.jumlah.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardKelasBreakdown;