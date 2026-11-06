
"use client";

import { useRef, useState } from "react";
import {
  importMudamudi,
  previewImportMudamudi,
} from "../../backend/mudamudi/actions";
import {
  parseImportExcel,
  type ImportRow,
  type ImportError,
  type ImportWarning,
} from "../../backend/mudamudi/importExcel";
import ModalWrapper from "./ModalWrapper";
import { UploadIcon } from "./icons";

type PreviewRow = Awaited<
  ReturnType<typeof previewImportMudamudi>
>[number];

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ImportModal({ onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportRow[]>([]);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [warnings, setWarnings] = useState<ImportWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [previewReady, setPreviewReady] = useState(false);
  const [showMobileHelp, setShowMobileHelp] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importSummary, setImportSummary] = useState("");

  const newCount = previewData.filter((item) => item.valid).length;
  const reviewCount = previewData.filter((item) => !item.valid).length;
  const totalReady = newCount;

  function resetFile() {
    if (loading) return;

    setFile(null);
    setParsedRows([]);
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setStep("upload");
    setError("");
    setPreviewReady(false);
    setShowMobileHelp(false);
    setImportCompleted(false);
    setImportSummary("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (loading) return;

    const selectedFile = e.target.files?.[0] ?? null;

    setError("");
    setParsedRows([]);
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setStep("upload");
    setPreviewReady(false);
    setImportCompleted(false);
    setImportSummary("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv")) {
      setFile(null);
      setError("File harus berformat .xlsx atau .csv.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function handlePreview() {
    if (loading) return;

    if (!file) {
      setError("Pilih file terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setParsedRows([]);
    setPreviewData([]);
    setErrors([]);
    setWarnings([]);
    setPreviewReady(false);
    setImportCompleted(false);
    setImportSummary("");

    try {
      const parseResult = await parseImportExcel(file);

      setErrors(parseResult.errors);
      setWarnings(parseResult.warnings);

      if (parseResult.data.length === 0) {
        setStep("preview");
        setPreviewReady(true);
        setParsedRows([]);

        setError(
          parseResult.errors.length > 0
            ? "Tidak ada data yang lolos validasi file. Periksa rincian kesalahan."
            : "Tidak ada data yang dapat diproses dari file.",
        );

        return;
      }

      const rows = parseResult.data;
      setParsedRows(rows);

      const result = await previewImportMudamudi(rows);

      setPreviewData(result);
      setStep("preview");
      setPreviewReady(true);

      const serverErrors: ImportError[] = result
        .filter((item) => !item.valid)
        .map((item) => {
          let message = "Data tidak memenuhi ketentuan impor.";

          if (item.duplicateInDatabase) {
            message =
              "Data sudah terdaftar di database berdasarkan pencocokan data.";
          } else if (item.duplicateInFile) {
            message = "Data terdeteksi duplikat dengan baris lain dalam file.";
          }

          return {
            rowNumber: item.row,
            message,
          };
        });

      setErrors((previous) => {
        const combined = [...previous, ...serverErrors];

        return combined.filter(
          (item, index, array) =>
            array.findIndex(
              (other) =>
                other.rowNumber === item.rowNumber &&
                other.message === item.message,
            ) === index,
        );
      });

      if (result.length === 0) {
        setError("Tidak ada data yang dapat diperiksa dari file.");
      } else if (result.every((item) => !item.valid)) {
        setError(
          "Tidak ada data yang siap diimpor. Periksa kesalahan dan duplikasi pada rincian validasi.",
        );
      }
    } catch (err) {
      console.error("Gagal memeriksa file Muda-Mudi:", err);

      setError(
        err instanceof Error
          ? `Gagal membaca file: ${err.message}`
          : "Gagal membaca file. Silakan coba lagi.",
      );

      setStep("upload");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (loading) return;

    if (!previewReady || parsedRows.length === 0) {
      setError("Periksa file terlebih dahulu.");
      return;
    }

    if (newCount === 0) {
      setError("Tidak ada data valid yang dapat diimpor.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const validRows = previewData
        .map((item, index) => ({
          valid: item.valid,
          row: parsedRows[index],
        }))
        .filter(
          (item): item is { valid: true; row: ImportRow } =>
            item.valid && item.row !== undefined,
        )
        .map((item) => item.row);

      if (validRows.length === 0) {
        setError("Tidak ada data valid yang dapat diimpor.");
        return;
      }

      const result = await importMudamudi(validRows);

      const summary = [
        result.message,
        `Data berhasil ditambahkan: ${result.imported}.`,
        `Data dilewati: ${result.skipped}.`,
      ].join(" ");

      if (result.imported > 0) {
        onSuccess();
      }

      if (!result.success || result.errors.length > 0) {
        setImportSummary(
          [
            summary,
            ...result.errors,
          ].filter(Boolean).join("\n"),
        );

        setImportCompleted(true);
        setPreviewReady(false);

        if (result.imported > 0) {
          setError(
            "Sebagian data telah berhasil disimpan. Periksa ringkasan hasil impor sebelum melanjutkan.",
          );
        } else {
          setError(
            result.message || "Tidak ada data yang berhasil diimpor.",
          );
        }

        return;
      }

      setImportSummary(summary);
      setImportCompleted(true);
      setPreviewReady(false);

      onClose();
    } catch (err) {
      console.error("Gagal mengimpor data Muda-Mudi:", err);

      setError(
        err instanceof Error
          ? `Terjadi kesalahan saat impor: ${err.message}`
          : "Terjadi kesalahan saat mengimpor data. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const canImport =
    previewReady &&
    newCount > 0 &&
    !loading &&
    !importCompleted;

  return (
    <ModalWrapper
      size="xl"
      onClose={loading ? () => { } : onClose}
    >
      <div className="flex max-h-[85dvh] min-h-0 w-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50] sm:h-9 sm:w-9">
              <UploadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-semibold tracking-tight text-[#202824]">
                Import Data Muda-Mudi
              </h2>
              <p className="mt-0.5 text-[10px] leading-4 text-[#78827C]">
                Tambahkan data Muda-Mudi dari file Excel atau CSV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 sm:py-5">
          {error && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 sm:mb-4 sm:px-3.5 sm:py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4M12 16h.01"
                />
              </svg>
              <p className="whitespace-pre-line text-[10px] leading-4 text-red-600">
                {error}
              </p>
            </div>
          )}

          {importSummary && (
            <div className="mb-3 rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] px-3 py-3 sm:mb-4 sm:px-4">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#287A50]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[#206440]">
                    Ringkasan Hasil Impor
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[9px] leading-4 text-[#206440]">
                    {importSummary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2 md:hidden">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => inputRef.current?.click()}
                  className="flex min-h-[76px] w-full items-center gap-3 rounded-xl border border-dashed border-[#C9D8CE] bg-[#F8FAF8] px-3 py-3 text-left transition hover:border-[#65B98A] hover:bg-[#E6F2EA]/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white text-[#287A50]">
                    {file ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 12 4 4L19 6"
                        />
                      </svg>
                    ) : (
                      <UploadIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-[#202824]">
                      {file ? file.name : "Pilih File Excel"}
                    </p>
                    <p className="mt-1 text-[9px] text-[#78827C]">
                      {file
                        ? "Ketuk untuk mengganti file"
                        : "Pilih file database Muda-Mudi (.xlsx atau .csv)"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-lg border border-[#E5EAE6] bg-white px-2 py-1 text-[9px] font-medium text-[#287A50]">
                    .xlsx / .csv
                  </span>
                </button>

                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 text-[9px] leading-4 text-[#9AA39D]">
                    Disarankan menggunakan file hasil Export Data.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowMobileHelp((prev) => !prev)}
                    aria-expanded={showMobileHelp}
                    className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-medium transition ${showMobileHelp
                        ? "border-[#65B98A] bg-[#E6F2EA] text-[#206440]"
                        : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F0F4F1]"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.6 9a2.4 2.4 0 1 1 4.2 1.6c-1.1 1-1.8 1.3-1.8 2.9M12 17h.01"
                      />
                    </svg>
                    {showMobileHelp ? "Tutup panduan" : "Panduan"}
                  </button>
                </div>

                {showMobileHelp && (
                  <div className="space-y-2 rounded-xl border border-[#E5EAE6] bg-[#F8FAF8] p-3">
                    <div>
                      <p className="text-[10px] font-semibold text-[#202824]">
                        Ketentuan Format Kolom
                      </p>

                      <div className="mt-1.5 space-y-1 text-[9px] leading-4 text-[#78827C]">
                        <p>
                          <span className="font-semibold text-[#287A50]">
                            Wajib:
                          </span>{" "}
                          Kelompok, Nama Lengkap, Jenis Kelamin, Kelas.
                        </p>
                        <p>
                          <span className="font-semibold text-[#287A50]">
                            Opsional:
                          </span>{" "}
                          Tempat, Tahun Lahir, No HP, Pekerjaan.
                        </p>
                        <p className="text-[#9AA39D]">
                          Kolom NO hanya digunakan sebagai nomor urut.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#E5EAE6] pt-2">
                      <p className="text-[10px] font-semibold text-[#202824]">
                        Ketentuan Impor
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-[#78827C]">
                        Proses impor hanya menambahkan data baru. Data yang
                        sudah terdaftar atau terdeteksi duplikat akan dilewati.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              <div className="hidden items-stretch gap-5 md:grid md:grid-cols-[2fr_3fr] lg:gap-6">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex-1 rounded-xl border border-[#E5EAE6] bg-[#F8FAF8] p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                        >
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 10h18M9 4v16"
                          />
                        </svg>
                      </div>

                      <p className="text-[11px] font-semibold text-[#202824]">
                        Ketentuan Format Kolom
                      </p>
                    </div>

                    <div className="mt-3 space-y-2.5 pl-10 text-[10px] leading-4">
                      <div>
                        <p className="font-semibold text-[#287A50]">
                          Kolom wajib
                        </p>
                        <p className="mt-0.5 text-[#78827C]">
                          Kelompok, Nama Lengkap, Jenis Kelamin, Kelas.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-[#287A50]">
                          Kolom opsional
                        </p>
                        <p className="mt-0.5 text-[#78827C]">
                          Tempat, Tahun Lahir, No HP, Pekerjaan.
                        </p>
                      </div>

                      <p className="border-t border-[#E5EAE6] pt-2 text-[#9AA39D]">
                        Kolom NO hanya berfungsi sebagai nomor urut dan tidak
                        digunakan dalam proses impor.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 rounded-xl border border-[#E5EAE6] bg-white p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16 16 4 4"
                          />
                        </svg>
                      </div>

                      <p className="text-[11px] font-semibold text-[#202824]">
                        Ketentuan Impor
                      </p>
                    </div>

                    <p className="mt-2 pl-10 text-[10px] leading-4 text-[#78827C]">
                      Data yang sudah terdaftar atau terdeteksi duplikat tidak
                      akan ditambahkan kembali. Proses ini hanya menambahkan
                      data baru, bukan memperbarui data lama.
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div>
                    <p className="text-[11px] font-semibold text-[#202824]">
                      Pilih File
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-[#78827C]">
                      Unggah file database Muda-Mudi untuk memeriksa dan
                      menambahkan data.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => inputRef.current?.click()}
                    className="mt-4 flex min-h-[190px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D8CE] bg-[#F8FAF8] px-5 py-5 text-center transition hover:border-[#65B98A] hover:bg-[#E6F2EA]/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-white text-[#287A50] shadow-xs">
                      {file ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      ) : (
                        <UploadIcon className="h-5 w-5" />
                      )}
                    </div>

                    <p className="mt-4 max-w-full break-all text-[11px] font-semibold text-[#202824]">
                      {file ? file.name : "Pilih file"}
                    </p>

                    <p className="mt-1 text-[9px] text-[#78827C]">
                      {file
                        ? "Klik untuk mengganti file"
                        : "Klik untuk memilih file dari perangkat"}
                    </p>

                    <span className="mt-4 rounded-lg border border-[#E5EAE6] bg-white px-3 py-1.5 text-[9px] font-medium text-[#287A50]">
                      Format .xlsx atau .csv
                    </span>
                  </button>

                  <p className="mt-2 text-[9px] leading-4 text-[#9AA39D]">
                    Disarankan menggunakan file hasil Export Data agar
                    susunan kolom tetap sesuai.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-xl border border-amber-100 bg-amber-50/70 p-3 sm:p-4 md:block">
                <div className="flex items-start gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3 2.8 19h18.4L12 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4M12 16h.01"
                    />
                  </svg>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-amber-800">
                      Perhatian
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-amber-700">
                      Proses impor hanya menambahkan data baru. Data yang
                      sudah terdaftar atau terdeteksi duplikat akan dilewati.
                      Pastikan data pada file sudah benar sebelum melanjutkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] px-2.5 py-2.5 sm:px-4 sm:py-3">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-[#206440]">
                    Siap Diimpor
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#287A50] sm:text-xl">
                    {newCount}
                  </p>
                  <p className="text-[9px] text-[#206440]">
                    data baru
                  </p>
                </div>

                <div
                  className={`rounded-xl border px-2.5 py-2.5 sm:px-4 sm:py-3 ${reviewCount > 0
                      ? "border-amber-100 bg-amber-50"
                      : "border-gray-100 bg-gray-50"
                    }`}
                >
                  <p
                    className={`text-[9px] font-medium uppercase tracking-wide ${reviewCount > 0 ? "text-amber-600" : "text-gray-500"
                      }`}
                  >
                    Dilewati
                  </p>
                  <p
                    className={`mt-1 text-lg font-semibold sm:text-xl ${reviewCount > 0 ? "text-amber-700" : "text-gray-700"
                      }`}
                  >
                    {reviewCount}
                  </p>
                  <p
                    className={`text-[9px] ${reviewCount > 0 ? "text-amber-600" : "text-gray-500"
                      }`}
                  >
                    perlu diperiksa
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11v5M12 8h.01"
                    />
                  </svg>

                  <div>
                    <p className="text-[10px] font-medium text-gray-700">
                      Hasil pemeriksaan data
                    </p>
                    <p className="mt-1 text-[9px] leading-4 text-gray-500">
                      {newCount} data siap ditambahkan. {reviewCount} data
                      tidak akan diproses karena terdeteksi duplikat atau
                      tidak memenuhi ketentuan impor.
                    </p>

                    {reviewCount > 0 && (
                      <p className="mt-1 text-[9px] leading-4 text-amber-700">
                        Periksa rincian kesalahan sebelum mengimpor data.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(errors.length > 0 || warnings.length > 0) && (
                <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
                  <p className="text-[10px] font-semibold text-gray-700">
                    Ringkasan Validasi
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-gray-500">
                    Kesalahan menyebabkan baris tidak dapat diproses.
                    Peringatan merupakan informasi tambahan yang perlu
                    diperiksa sebelum melanjutkan impor.
                  </p>
                </div>
              )}

              {errors.length > 0 && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4M12 16h.01"
                      />
                    </svg>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-red-700">
                        Baris Perlu Diperiksa
                      </p>
                      <p className="mt-0.5 text-[9px] leading-4 text-red-600">
                        Baris berikut tidak akan diproses.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto border-t border-red-100 pt-2">
                    {errors.map((item, index) => (
                      <div
                        key={`${item.rowNumber}-${index}`}
                        className="flex gap-2 text-[9px] leading-4 text-red-600"
                      >
                        <span className="shrink-0 font-semibold">
                          {item.rowNumber > 0
                            ? `Baris ${item.rowNumber}:`
                            : "Periksa:"}
                        </span>
                        <span>{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.3 3.5 2.9 16.3A2 2 0 0 0 4.6 19.3h14.8a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3M12 15h.01"
                      />
                    </svg>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-amber-700">
                        Peringatan Data
                      </p>
                      <p className="mt-0.5 text-[9px] leading-4 text-amber-600">
                        Periksa kembali tempat lahir, tahun lahir, nomor HP,
                        dan pekerjaan jika terdapat peringatan.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto border-t border-amber-100 pt-2">
                    {warnings.map((item, index) => (
                      <div
                        key={`${item.rowNumber}-${index}`}
                        className="flex gap-2 text-[9px] leading-4 text-amber-700"
                      >
                        <span className="shrink-0 font-semibold">
                          {item.rowNumber > 0
                            ? `Baris ${item.rowNumber}:`
                            : "Periksa:"}
                        </span>
                        <span>{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700">
                          Preview Data
                        </p>
                        <p className="mt-0.5 text-[9px] text-gray-400">
                          Periksa status setiap baris sebelum mengimpor.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-600">
                        {previewData.length} baris
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-[9px]">
                      <thead className="bg-white text-gray-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Baris</th>
                          <th className="px-3 py-2 font-medium">Nama</th>
                          <th className="px-3 py-2 font-medium">Kelompok</th>
                          <th className="px-3 py-2 font-medium">JK</th>
                          <th className="px-3 py-2 font-medium">
                            Tahun Lahir
                          </th>
                          <th className="px-3 py-2 font-medium">Kelas</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {previewData.slice(0, 8).map((item, index) => (
                          <tr
                            key={`${item.data.nama}-${item.data.kelompok}-${index}`}
                            className="text-gray-600"
                          >
                            <td className="px-3 py-2 text-gray-400">
                              {item.row}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-800">
                              {item.data.nama}
                            </td>
                            <td className="px-3 py-2">
                              {item.data.kelompok}
                            </td>
                            <td className="px-3 py-2">
                              {item.data.jenis_kelamin ?? "-"}
                            </td>
                            <td className="px-3 py-2">
                              {item.data.tahun_lahir ?? (
                                <span className="text-gray-400">Kosong</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {item.data.kelas.length > 0
                                ? item.data.kelas.join(", ")
                                : (
                                  <span className="text-amber-600">
                                    Kosong
                                  </span>
                                )}
                            </td>
                            <td className="px-3 py-2">
                              {item.valid ? (
                                <span className="inline-flex whitespace-nowrap rounded-md bg-[#E6F2EA] px-2 py-1 font-medium text-[#206440]">
                                  Siap Diimpor
                                </span>
                              ) : item.duplicateInDatabase ? (
                                <span className="inline-flex whitespace-nowrap rounded-md bg-red-50 px-2 py-1 font-medium text-red-700">
                                  Sudah Terdaftar
                                </span>
                              ) : item.duplicateInFile ? (
                                <span className="inline-flex whitespace-nowrap rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700">
                                  Duplikat File
                                </span>
                              ) : (
                                <span className="inline-flex whitespace-nowrap rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700">
                                  Tidak Valid
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {previewData.length > 8 && (
                    <div className="border-t border-[#E5EAE6] px-4 py-2 text-[9px] text-[#78827C]">
                      Menampilkan 8 dari {previewData.length} baris hasil
                      pemeriksaan.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
          <p className="text-[9px] leading-4 text-[#78827C]">
            {step === "preview"
              ? `${totalReady} data siap ditambahkan`
              : "Periksa data sebelum menjalankan impor."}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={step === "preview" ? resetFile : onClose}
              disabled={loading}
              className="h-9 rounded-xl border border-[#E5EAE6] bg-white px-4 text-[11px] font-medium text-[#202824] transition hover:bg-[#F0F4F1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === "preview" ? "Ganti File" : "Batal"}
            </button>

            {step === "upload" ? (
              <button
                type="button"
                onClick={handlePreview}
                disabled={!file || loading}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#206440] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Memeriksa..." : "Periksa Data"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#287A50] px-5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#206440] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Mengimpor..."
                  : importCompleted
                    ? "Impor Selesai"
                    : `Proses ${totalReady} Data`}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
