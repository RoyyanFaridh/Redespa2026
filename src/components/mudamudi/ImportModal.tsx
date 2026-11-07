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

import { ModalWrapper } from "../common/ModalWrapper";
import { Button } from "../common/Button";
import { IconButton } from "../common/IconButton";
import { UploadIcon } from "./icons";

import { ImportUploadStep } from "./import/ImportUploadStep";
import { ImportPreviewStep } from "./import/ImportPreviewStep";

type PreviewRow = Awaited<ReturnType<typeof previewImportMudamudi>>[number];

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
    setPreviewReady(false);
    setImportCompleted(false);
    setImportSummary("");

    try {
      const parsed = await parseImportExcel(file);
      setParsedRows(parsed.data);
      setErrors(parsed.errors);
      setWarnings(parsed.warnings);

      const preview = await previewImportMudamudi(parsed.data);
      setPreviewData(preview);
      setPreviewReady(true);
      setStep("preview");
    } catch (err) {
      console.error("Gagal memeriksa file Jamaah:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Format file tidak valid atau data gagal diproses.",
      );
      setPreviewReady(false);
      setParsedRows([]);
      setPreviewData([]);
      setErrors([]);
      setWarnings([]);
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
          [summary, ...result.errors].filter(Boolean).join("\n"),
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
      console.error("Gagal mengimpor data Jamaah:", err);

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
    previewReady && newCount > 0 && !loading && !importCompleted;

  return (
    <ModalWrapper size="xl" onClose={loading ? () => {} : onClose}>
      <div className="flex max-h-[85dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50] sm:h-9 sm:w-9">
              <UploadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-semibold tracking-tight text-[#202824]">
                Import Data Jamaah
              </h2>
              <p className="mt-0.5 text-[10px] leading-4 text-[#78827C]">
                Tambahkan data Jamaah dari file Excel atau CSV
              </p>
            </div>
          </div>

          <IconButton
            label="Tutup"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
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
          </IconButton>
        </div>

        {/* Content */}
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
            <ImportUploadStep
              file={file}
              loading={loading}
              showMobileHelp={showMobileHelp}
              inputRef={inputRef}
              onToggleMobileHelp={() => setShowMobileHelp((prev) => !prev)}
              onFileSelectClick={() => inputRef.current?.click()}
              onFileChange={handleFileChange}
            />
          )}

          {step === "preview" && (
            <ImportPreviewStep
              newCount={newCount}
              reviewCount={reviewCount}
              errors={errors}
              warnings={warnings}
              previewData={previewData}
            />
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-[#E5EAE6] bg-[#F5F7F5] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
          <p className="text-[9px] leading-4 text-[#78827C]">
            {step === "preview"
              ? `${totalReady} data siap ditambahkan`
              : "Periksa data sebelum menjalankan impor."}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={step === "preview" ? resetFile : onClose}
              disabled={loading}
            >
              {step === "preview" ? "Ganti File" : "Batal"}
            </Button>

            {step === "upload" ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handlePreview}
                disabled={!file || loading}
                isLoading={loading}
              >
                {loading ? "Memeriksa..." : "Periksa Data"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleImport}
                disabled={!canImport}
                isLoading={loading}
              >
                {loading
                  ? "Mengimpor..."
                  : importCompleted
                    ? "Impor Selesai"
                    : `Proses ${totalReady} Data`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
