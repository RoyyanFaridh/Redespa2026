import React from "react";

type StatItemProps = {
  label: string;
  value: number;
  description: string;
  variant: "teal" | "emerald" | "amber" | "dark";
  icon: React.ReactNode;
};

function StatCardItem({ label, value, description, variant, icon }: StatItemProps) {
  const styles = {
    teal: {
      dot: "bg-[#287A50]",
      box: "bg-[#E6F2EA] text-[#287A50] border-[#65B98A]/30",
    },
    emerald: {
      dot: "bg-emerald-600",
      box: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    amber: {
      dot: "bg-amber-500",
      box: "bg-amber-50 text-amber-700 border-amber-200",
    },
    dark: {
      dot: "bg-[#262D29]",
      box: "bg-[#F0F4F1] text-[#202824] border-[#E5EAE6]",
    },
  };

  const current = styles[variant];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E5EAE6] bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-[#65B98A]/40 hover:shadow-xs">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${current.dot}`} />
          <p className="truncate text-[10px] sm:text-[11px] font-medium text-[#78827C]">
            {label}
          </p>
        </div>

        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${current.box}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-1.5 sm:mt-2">
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#202824]">
          {value.toLocaleString("id-ID")}
        </p>
        <p className="mt-0.5 truncate text-[9px] sm:text-[10px] font-normal text-[#8A948E]">
          {description}
        </p>
      </div>
    </div>
  );
}

export type DashboardStatsProps = {
  totalKegiatan: number;
  totalPresensi: number;
  presensiHariIni: number;
  kegiatanAktif: number;
  totalAnggota?: number;
};

export function DashboardStats({
  totalKegiatan,
  presensiHariIni,
  kegiatanAktif,
  totalPresensi,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      <StatCardItem
        label="Presensi Hari Ini"
        value={presensiHariIni}
        description="Kehadiran hari ini"
        variant="emerald"
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        }
      />

      <StatCardItem
        label="Kegiatan Aktif"
        value={kegiatanAktif}
        description="Jendela buka presensi"
        variant="amber"
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
      />

      <StatCardItem
        label="Total Kegiatan"
        value={totalKegiatan}
        description="Seluruh agenda terdaftar"
        variant="dark"
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        }
      />

      <StatCardItem
        label="Total Presensi"
        value={totalPresensi}
        description="Akumulasi kehadiran"
        variant="teal"
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" />
          </svg>
        }
      />
    </div>
  );
}

export default DashboardStats;
