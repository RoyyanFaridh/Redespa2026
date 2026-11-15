"use client";

import { useState } from "react";
import { parseJamaahExcel, type ImportRow } from "../../backend/jamaah/importExcel";
import { importJamaah } from "../../backend/jamaah/actions";
import { Button } from "../common";

type Props = {
  onSuccess: () => void;
};

export default function JamaahImportModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [mode, setMode] = useState<"insert_only" | "upsert">("insert_only");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setParsing(true);
    setErrors([]);

    try {
      const buffer = await selected.arrayBuffer();
      const result = await parseJamaahExcel(buffer);

      if (result.errors.length > 0) {
        setErrors(result.errors.map((e) => `Baris ${e.rowNumber}: ${e.message}`));
      } else {
        setPreviewRows(result.data);
      }
    } catch (err: any) {
      setErrors([err.message || "Gagal membaca file Excel."]);
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (previewRows.length === 0) return;

    try {
      setUploading(true);
      const res = await importJamaah(previewRows, mode);
      if (res.errors.length > 0) {
        setErrors(res.errors);
      } else {
        alert(`Berhasil mengimpor ${res.insertedCount} data baru dan memperbarui ${res.updatedCount} data.`);
        setOpen(false);
        setFile(null);
        setPreviewRows([]);
        onSuccess();
      }
    } catch (err: any) {
      setErrors([err.message || "Terjadi kesalahan saat menyimpan data."]);
    } finally {
      setUploading(false);
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Impor
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#E5EAE6]">
            <h3 className="text-sm font-bold text-gray-900">Impor Data Jamaah dari Excel</h3>
            <p className="mt-1 text-xs text-gray-500">
              Unggah file Excel dengan kolom No, Kelompok, Nama Lengkap, Jenis Kelamin, dll.
            </p>

            <div className="mt-4">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={parsing || uploading}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E6F2EA] file:text-[#287A50] hover:file:bg-[#d1e8da]"
              />
            </div>

            {parsing && <p className="mt-2 text-xs text-[#287A50]">Membaca file Excel...</p>}

            {errors.length > 0 && (
              <div className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] text-red-700 space-y-1">
                {errors.map((e, idx) => (
                  <div key={idx}>{e}</div>
                ))}
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-800">
                  Terbaca {previewRows.length} baris data valid.
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === "insert_only"}
                      onChange={() => setMode("insert_only")}
                    />
                    Hanya data baru
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === "upsert"}
                      onChange={() => setMode("upsert")}
                    />
                    Perbarui jika ada (Upsert)
                  </label>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setFile(null);
                  setPreviewRows([]);
                  setErrors([]);
                }}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={previewRows.length === 0 || uploading}
                onClick={handleImport}
                className="bg-[#287A50] text-xs hover:bg-[#1E5E3D]"
              >
                {uploading ? "Mengimpor..." : `Simpan ${previewRows.length} Data`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
