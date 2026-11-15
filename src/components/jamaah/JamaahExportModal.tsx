"use client";

import { useState } from "react";
import type { Jamaah } from "../../backend/jamaah/types";
import { exportJamaahExcel } from "../../backend/jamaah/exportExcel";
import { exportJamaahQRBatchZip } from "../../backend/jamaah/exportQRBatch";
import { Button } from "../common";

type Props = {
  data: Jamaah[];
  totalDataCount: number;
  filteredCount: number;
};

export default function JamaahExportModal({
  data,
  totalDataCount,
  filteredCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

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
      setOpen(false);
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      alert("Terjadi kesalahan saat mengekspor Excel.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportQR() {
    try {
      setLoading(true);
      setProgress({ current: 0, total: data.length });
      const blob = await exportJamaahQRBatchZip(data, (current, total) => {
        setProgress({ current, total });
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-Code-Jamaah-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error("Gagal ekspor QR Batch:", err);
      alert("Terjadi kesalahan saat mengekspor QR Code Batch.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[#202824] border-[#E5EAE6] hover:bg-[#F4F9F6]"
      >
        <svg className="h-4 w-4 text-[#78827C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Ekspor
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-[#E5EAE6]">
            <h3 className="text-sm font-bold text-gray-900">Ekspor Data Jamaah</h3>
            <p className="mt-1 text-xs text-gray-500">
              Pilih format ekspor data. ({filteredCount} data terpilih dari total {totalDataCount})
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleExportExcel}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#287A50] hover:bg-[#F4F9F6] transition text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-800">File Excel (.xlsx)</div>
                  <div className="text-[10px] text-gray-500">Tabel lengkap data warga Jamaah</div>
                </div>
                <span className="text-xs text-[#287A50] font-bold">Unduh</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleExportQR}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#287A50] hover:bg-[#F4F9F6] transition text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-800">Batch ZIP QR Code (.zip)</div>
                  <div className="text-[10px] text-gray-500">Kumpulan gambar QR personal Jamaah</div>
                </div>
                <span className="text-xs text-[#287A50] font-bold">Unduh</span>
              </button>
            </div>

            {progress && (
              <div className="mt-3 text-[11px] text-center text-[#287A50]">
                Memproses QR: {progress.current} / {progress.total}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
