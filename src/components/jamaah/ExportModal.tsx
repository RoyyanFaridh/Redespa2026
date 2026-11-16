"use client";

import { useState } from "react";
import type { Jamaah } from "../../backend/jamaah/types";
import { exportJamaahExcel } from "../../backend/jamaah/exportExcel";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: Jamaah[];
  totalCount: number;
};

export default function ExportModal({
  isOpen,
  onClose,
  data,
  totalCount,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleExportExcel() {
    try {
      setLoading(true);
      const blob = await exportJamaahExcel({ data });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Data-Jamaah-REDESPA-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      alert("Terjadi kesalahan saat mengekspor Excel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ekspor Data Jamaah"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-3 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none sm:p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#202824]">Ekspor Data Jamaah</h3>
              <p className="text-[10px] text-[#78827C]">
                {data.length} dipilih dari {totalCount} data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="rounded-lg p-1 text-[#78827C] transition-colors duration-150 hover:bg-[#F0F4F1] hover:text-[#202824] disabled:opacity-40 motion-reduce:transition-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          <button
            type="button"
            disabled={loading}
            onClick={handleExportExcel}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5EAE6] bg-white text-left transition-colors duration-150 hover:border-[#287A50]/50 hover:bg-[#F4F9F6] disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#202824]">File Excel (.xlsx)</div>
              <div className="text-[10px] text-[#78827C]">Tabel data lengkap jamaah</div>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-[#287A50]">
              {loading ? "Mengunduh..." : "Unduh"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
