import React from "react";
import Link from "next/link";
import type { PresensiTerbaruItem } from "../../backend/admin/dashboard-actions";

type Props = {
  presensi: PresensiTerbaruItem[];
};

function formatWaktu(waktuStr: string | null): string {
  if (!waktuStr) return "-";
  try {
    const date = new Date(waktuStr);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
      timeZone: "Asia/Jakarta",
    }).format(date);
  } catch {
    return waktuStr;
  }
}

export function DashboardRecentActivity({ presensi }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#E5EAE6] px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="text-[12px] font-bold tracking-tight text-[#202824]">
            Aktivitas Presensi Terbaru
          </h2>
          <p className="text-[10px] leading-4 text-[#78827C]">
            Catatan check-in kehadiran terkini oleh Jamaah
          </p>
        </div>
        <Link
          href="/admin/presensi/monitoring"
          className="text-[10px] font-semibold text-[#287A50] hover:underline"
        >
          Monitoring →
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[#E5EAE6] overflow-y-auto">
        {presensi.length === 0 ? (
          <div className="flex h-full min-h-28 items-center justify-center p-6 text-center">
            <div>
              <p className="text-xs font-medium text-[#202824]">
                Belum ada aktivitas presensi
              </p>
              <p className="mt-1 text-[10px] text-[#78827C]">
                Data kehadiran akan muncul di sini secara real-time saat Jamaah melakukan scan.
              </p>
            </div>
          </div>
        ) : (
          presensi.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-5 py-2.5 transition hover:bg-[#F5F7F5]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F2EA] text-[10px] font-bold text-[#287A50]">
                  ✓
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#202824]">
                    {item.namaPeserta}
                  </p>
                  <p className="truncate text-[10px] text-[#78827C]">
                    {item.namaKegiatan}
                    {item.lokasi ? ` · ${item.lokasi}` : ""}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-[10px] font-medium text-[#78827C]">
                {formatWaktu(item.waktuCheckin)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default DashboardRecentActivity;

