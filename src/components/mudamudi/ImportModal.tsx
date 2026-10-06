"use client";

import { useRef, useState } from "react";
import {
  importMudamudi,
  previewImportMudamudi,
} from "../../backend/mudamudi/actions";
import {
  parseImportFile,
  type ImportRow,
} from "../../backend/mudamudi/importExcel";
import ModalWrapper from "./ModalWrapper";
import { UploadIcon } from "./icons";

type PreviewData = {
  kelompok: string;
  nama: string;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  umur: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  kelas: string;
  nama_ayah: string | null;
  nama_ibu: string | null;
  no_hp_ortu: string | null;
  alamat: string | null;
};

type PreviewRow = {
  row: number;
  data: PreviewData;
  duplicateInDatabase: boolean;
  duplicateInFile: boolean;
  valid: boolean;
};

type ImportError = {
  rowNumber: number;
  message: string;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

function parseImportError(message: string): ImportError {
  const match = message.match(/^Baris\s+(\d+):\s*(.*)$/i);

  if (match) {
    return {
      rowNumber: Number(match[1]),
      message: match[2],
    };
  }

  return {
    rowNumber: 0,
    message,
  };
}

export default function ImportModal({ onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");

  function resetFile() {
    setFile(null);
    setRows([]);
    setPreviewData([]);
    setErrors([]);
    setStep("upload");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null;

    setError("");
    setRows([]);
    setPreviewData([]);
    setErrors([]);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv")) {
      setFile(null);
      setError("File harus berformat .xlsx atau .csv");

      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function handlePreview() {
    if (!file) {
      setError("Pilih file Excel atau CSV terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setErrors([]);
    setRows([]);
    setPreviewData([]);

    try {
      /*
       * Parser hanya digunakan untuk membaca file dan melakukan
       * validasi struktur/isi file.
       *
       * Pengecekan data yang sudah ada di database dilakukan
       * oleh previewImportMudamudi().
       */
      const parsed = await parseImportFile(file, []);

      const parserErrors = parsed.errors.map(parseImportError);

      setErrors(parserErrors);

      if (parsed.data.length === 0) {
        if (parserErrors.length === 0) {
          setError("Tidak ada data yang ditemukan di file.");
        }

        return;
      }

      /*
       * Preview mengecek data hasil parsing terhadap database.
       */
      const preview = await previewImportMudamudi(parsed.data);

      setRows(parsed.data);
      setPreviewData(preview);

      if (preview.length === 0 && parserErrors.length === 0) {
        setError("Tidak ada data yang dapat ditampilkan.");
        return;
      }

      setStep("preview");
    } catch (err) {
      console.error(err);
      setError("Gagal membaca atau memeriksa file.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    const validPreview = previewData.filter((item) => item.valid);

    if (validPreview.length === 0) {
      setError("Tidak ada data yang valid untuk diimport.");
      return;
    }

    /*
     * Ambil data asli berdasarkan hasil preview yang valid.
     * Karena row pada preview merupakan nomor baris Excel/CSV,
     * kita menggunakan index preview untuk mengambil data yang
     * sesuai dari rows.
     */
    const validRows: ImportRow[] = [];

    for (const item of validPreview) {
      const sourceRowIndex = item.row - 2;

      if (sourceRowIndex >= 0 && sourceRowIndex < rows.length) {
        validRows.push(rows[sourceRowIndex]);
      }
    }

    /*
     * Fallback berdasarkan data preview jika nomor baris tidak
     * cocok dengan index akibat adanya baris yang dilewati parser.
     */
    if (validRows.length !== validPreview.length) {
      validRows.length = 0;

      for (const item of validPreview) {
        const matchingRow = rows.find(
          (row) =>
            row.nama.trim() === item.data.nama.trim() &&
            row.kelompok.trim() === item.data.kelompok.trim() &&
            row.kelas.trim() === item.data.kelas.trim(),
        );

        if (matchingRow) {
          validRows.push(matchingRow);
        }
      }
    }

    if (validRows.length === 0) {
      setError("Tidak ada data yang valid untuk diimport.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await importMudamudi(validRows);

      if (!result.success) {
        setError(result.message);

        if (result.errors.length > 0) {
          setErrors(result.errors.map(parseImportError));
        }

        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat melakukan import.");
    } finally {
      setLoading(false);
    }
  }

  const validCount = previewData.filter((item) => item.valid).length;

  const duplicateDatabaseCount = previewData.filter(
    (item) => item.duplicateInDatabase,
  ).length;

  const duplicateFileCount = previewData.filter(
    (item) => item.duplicateInFile,
  ).length;

  const skippedCount =
    previewData.filter((item) => !item.valid).length + errors.length;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="w-full max-w-150 overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-600">
              <UploadIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold leading-5 text-gray-800">
                Import Data Muda Mudi
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                Masukkan data anggota dari file Excel atau CSV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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

        {/* BODY */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
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

              <p className="text-[10px] leading-4 text-red-600">{error}</p>
            </div>
          )}

          {step === "upload" && (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-teal-400 hover:bg-teal-50/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm ring-1 ring-gray-100">
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
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 2v6h6"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 13h8M8 17h6"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-[11px] font-medium text-gray-700">
                  {file ? file.name : "Pilih file Excel atau CSV"}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Format yang didukung: .xlsx dan .csv
                </p>
              </button>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                <p className="text-[10px] font-semibold text-gray-700">
                  Format kolom
                </p>

                <p className="mt-1 text-[10px] leading-4 text-gray-500">
                  <span className="font-medium text-gray-700">Wajib:</span>{" "}
                  Kelompok, Nama Lengkap, Jenis Kelamin.
                </p>

                <p className="mt-1 text-[10px] leading-4 text-gray-500">
                  <span className="font-medium text-gray-700">Opsional:</span>{" "}
                  Tempat, Tanggal Lahir, Umur, No HP, Pekerjaan, Kelas, Nama
                  Ayah, Nama Ibu, No HP Orangtua, Alamat.
                </p>

                <p className="mt-2 text-[9px] leading-4 text-gray-400">
                  Kolom NO dari file Export tidak diperlukan untuk proses
                  import.
                </p>
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              {/* SUMMARY */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-teal-600">
                    Siap diimport
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-teal-700">
                    {validCount}
                  </p>

                  <p className="text-[9px] text-teal-600">data</p>
                </div>

                <div
                  className={`rounded-lg border px-3 py-2.5 ${
                    skippedCount > 0
                      ? "border-red-100 bg-red-50"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-[9px] font-medium uppercase tracking-wide ${
                      skippedCount > 0 ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    Dilewati
                  </p>

                  <p
                    className={`mt-0.5 text-lg font-semibold ${
                      skippedCount > 0 ? "text-red-700" : "text-gray-700"
                    }`}
                  >
                    {skippedCount}
                  </p>

                  <p
                    className={`text-[9px] ${
                      skippedCount > 0 ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    baris
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 sm:col-span-1">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                    Total Data
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-gray-700">
                    {previewData.length + errors.length}
                  </p>

                  <p className="text-[9px] text-gray-500">baris terbaca</p>
                </div>
              </div>

              {/* DUPLICATE INFO */}
              {(duplicateDatabaseCount > 0 || duplicateFileCount > 0) && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-3">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
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
                        Data duplikat ditemukan
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-amber-600">
                        {duplicateDatabaseCount > 0 &&
                          `${duplicateDatabaseCount} data sudah ada di database.`}

                        {duplicateDatabaseCount > 0 &&
                          duplicateFileCount > 0 &&
                          " "}

                        {duplicateFileCount > 0 &&
                          `${duplicateFileCount} data duplikat dalam file.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ERRORS */}
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
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
                        Baris tidak dapat diimport
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-red-600">
                        Periksa kembali data pada baris yang ditampilkan.
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto border-t border-red-100 pt-2">
                    {errors.map((item, index) => (
                      <div
                        key={`${item.rowNumber}-${index}`}
                        className="flex gap-2 text-[9px] leading-4 text-red-600"
                      >
                        {item.rowNumber > 0 && (
                          <span className="shrink-0 font-semibold">
                            Baris {item.rowNumber}:
                          </span>
                        )}

                        <span>{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PREVIEW TABLE */}
              {previewData.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-700">
                          Preview Data
                        </p>

                        <p className="mt-0.5 text-[9px] text-gray-400">
                          Data yang ditampilkan merupakan hasil pemeriksaan file
                          dan database.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md bg-teal-50 px-2 py-1 text-[9px] font-medium text-teal-600">
                        {validCount} siap
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-125 text-left text-[9px]">
                      <thead className="bg-white text-gray-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">#</th>

                          <th className="px-3 py-2 font-medium">Nama</th>

                          <th className="px-3 py-2 font-medium">Kelompok</th>

                          <th className="px-3 py-2 font-medium">JK</th>

                          <th className="px-3 py-2 font-medium">Kelas</th>

                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {previewData.slice(0, 8).map((item) => (
                          <tr
                            key={`${item.row}-${item.data.nama}`}
                            className="text-gray-600"
                          >
                            <td className="px-3 py-2 text-gray-400">
                              {item.row}
                            </td>

                            <td className="px-3 py-2 font-medium text-gray-800">
                              {item.data.nama}
                            </td>

                            <td className="px-3 py-2">{item.data.kelompok}</td>

                            <td className="px-3 py-2">
                              {item.data.jenis_kelamin}
                            </td>

                            <td className="px-3 py-2">
                              {item.data.kelas || (
                                <span className="text-gray-300">Kosong</span>
                              )}
                            </td>

                            <td className="px-3 py-2">
                              {item.valid ? (
                                <span className="inline-flex rounded-md bg-teal-50 px-1.5 py-0.5 font-medium text-teal-600">
                                  Siap
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                                  Dilewati
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {previewData.length > 8 && (
                    <div className="border-t border-gray-100 px-3 py-2 text-[9px] text-gray-400">
                      Menampilkan 8 dari {previewData.length} data hasil
                      pemeriksaan.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={step === "preview" ? resetFile : onClose}
            disabled={loading}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step === "preview" ? "Ganti File" : "Batal"}
          </button>

          {step === "upload" ? (
            <button
              type="button"
              onClick={handlePreview}
              disabled={!file || loading}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Memeriksa..." : "Periksa Data"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || validCount === 0}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Mengimport..." : `Import ${validCount} Data`}
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
