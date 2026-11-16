"use client";

import { useState } from "react";
import { parseJamaahExcel, type ImportRow } from "../../backend/jamaah/importExcel";
import { importJamaah } from "../../backend/jamaah/actions";
import { Button } from "../common";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [mode, setMode] = useState<"insert_only" | "upsert">("insert_only");

  if (!isOpen) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setParsing(true);
    setErrors([]);

    try {
      const buffer = await selected.arrayBuffer();
      const res = await parseJamaahExcel(buffer);
      if (res.errors && res.errors.length > 0) {
        setErrors(res.errors.map((err) => `Baris ${err.rowNumber}: ${err.message}`));
        setPreviewRows([]);
      } else {
        setPreviewRows(res.data);
      }
    } catch (err) {
      console.error("Gagal parsing Excel:", err);
      setErrors(["Gagal membaca file Excel. Pastikan file valid."]);
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (previewRows.length === 0) return;
    setUploading(true);
    try {
      const res = await importJamaah(previewRows, mode);
      if (!res.success) {
        alert(res.errors?.join(", ") || "Gagal mengimpor data.");
      } else {
        handleClose();
        onSuccess();
      }
    } catch (err) {
      console.error("Gagal mengimpor data:", err);
      alert("Terjadi kesalahan saat menyimpan data ke database.");
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    setFile(null);
    setPreviewRows([]);
    setErrors([]);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Impor Data Jamaah"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-3 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none sm:p-4"
      onClick={() => !uploading && handleClose()}
    >
      <div
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#202824]">Impor Data Jamaah Excel</h3>
              <p className="text-[10px] text-[#78827C]">
                Unggah file Excel .xlsx dengan template data jamaah
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            aria-label="Tutup"
            className="rounded-lg p-1 text-[#78827C] transition-colors duration-150 hover:bg-[#F0F4F1] hover:text-[#202824] disabled:opacity-40 motion-reduce:transition-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* File upload drag-drop visual area */}
          <div className="relative rounded-xl border-2 border-dashed border-[#E5EAE6] bg-[#F5F7F5]/50 p-5 text-center transition-colors hover:border-[#287A50]/40 hover:bg-[#F4F9F6]">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={parsing || uploading}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50] mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#202824]">
                {file ? file.name : "Klik atau seret file Excel ke sini"}
              </p>
              <p className="mt-0.5 text-[10px] text-[#78827C]">
                Hanya format .xlsx yang didukung
              </p>
            </div>
          </div>

          {/* Parsing status */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#287A50]">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Membaca dan memvalidasi file Excel...</span>
            </div>
          )}

          {/* Errors list */}
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-[11px] text-red-700">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <span>Ditemukan kesalahan:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview & mode selector */}
          {previewRows.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#287A50]/20 bg-[#E6F2EA]/60 p-2.5 text-xs text-[#287A50] font-semibold flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Terbaca {previewRows.length} baris data valid siap diimpor</span>
              </div>

              {/* Mode options */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#78827C] block mb-1.5">
                  Mode Penyimpanan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      mode === "insert_only"
                        ? "border-[#287A50] bg-[#E6F2EA]/30 text-[#202824]"
                        : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F5F7F5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      className="mt-0.5 text-[#287A50] focus:ring-[#287A50]"
                      checked={mode === "insert_only"}
                      onChange={() => setMode("insert_only")}
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#202824]">Hanya Data Baru</div>
                      <div className="text-[10px] text-[#78827C]">Lewati data yang sudah ada di database</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      mode === "upsert"
                        ? "border-[#287A50] bg-[#E6F2EA]/30 text-[#202824]"
                        : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F5F7F5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      className="mt-0.5 text-[#287A50] focus:ring-[#287A50]"
                      checked={mode === "upsert"}
                      onChange={() => setMode("upsert")}
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#202824]">Perbarui / Tambah</div>
                      <div className="text-[10px] text-[#78827C]">Update data yang sama, tambahkan yang baru</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-2.5 sm:px-5 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={handleClose}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={previewRows.length === 0 || uploading}
            onClick={handleImport}
            isLoading={uploading}
            className="bg-[#287A50] text-xs hover:bg-[#1E5E3D]"
          >
            {uploading ? "Mengimpor..." : `Simpan ${previewRows.length} Data`}
          </Button>
        </div>
      </div>
    </div>
  );
}
