import React from "react";
import Link from "next/link";

export function DashboardQuickActions() {
  const actions = [
    {
      title: "Data Jamaah",
      description: "Warga jamaah desa",
      href: "/admin/jamaah",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21c.5-4 3.5-6 6.5-6s6 2 6.5 6" />
        </svg>
      ),
      bg: "bg-[#E6F2EA] text-[#287A50] hover:bg-[#d5ebdd]",
    },
    {
      title: "Data Muda-Mudi",
      description: "Generasi penerus",
      href: "/admin/mudamudi",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    },
    {
      title: "Kegiatan",
      description: "Jadwal & presensi",
      href: "/admin/kegiatan",
      icon: (
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
      ),
      bg: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    },
    {
      title: "Monitoring",
      description: "Pantau real-time",
      href: "/admin/presensi/monitoring",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M2 12h5l3 7 4-14 3 7h5" />
        </svg>
      ),
      bg: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group flex items-center gap-2.5 rounded-2xl border border-[#E5EAE6] bg-white p-2.5 sm:p-3 shadow-2xs transition hover:border-[#65B98A]/40 hover:shadow-xs"
        >
          <div
            className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl transition ${action.bg}`}
          >
            {action.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] sm:text-[11px] font-semibold text-[#202824] group-hover:text-[#287A50]">
              {action.title}
            </p>
            <p className="truncate text-[9px] font-normal text-[#8A948E]">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default DashboardQuickActions;
