import React from "react";
import Link from "next/link";

export function DashboardQuickActions() {
  const actions = [
    {
      title: "Data Jamaah",
      description: "Kelola & tambah data Jamaah",
      href: "/admin/mudamudi",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="9" cy="7" r="4" />
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <path d="M16 11h6m-3-3v6" />
        </svg>
      ),
      bg: "bg-[#E6F2EA] text-[#287A50] hover:bg-[#d5ebdd]",
    },
    {
      title: "Kegiatan",
      description: "Jadwal & presensi kegiatan",
      href: "/admin/kegiatan",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M12 14h.01M16 14h.01M8 14h.01" />
        </svg>
      ),
      bg: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    },
    {
      title: "Monitoring Presensi",
      description: "Pantau kehadiran real-time",
      href: "/admin/presensi/monitoring",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M2 12h5l3 7 4-14 3 7h5" />
        </svg>
      ),
      bg: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    },
    {
      title: "Rekapitulasi Presensi",
      description: "Laporan & ekspor data Excel",
      href: "/admin/presensi/rekapitulasi",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      bg: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group flex items-center gap-3 rounded-2xl border border-[#E5EAE6] bg-white p-3 shadow-2xs transition hover:border-[#65B98A]/40 hover:shadow-xs"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${action.bg}`}
          >
            {action.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-[#202824] group-hover:text-[#287A50]">
              {action.title}
            </p>
            <p className="truncate text-[10px] font-normal text-[#8A948E]">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default DashboardQuickActions;
