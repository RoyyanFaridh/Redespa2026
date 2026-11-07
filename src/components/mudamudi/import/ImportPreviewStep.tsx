"use client";

import React from "react";
import type { ImportError, ImportWarning } from "../../../backend/mudamudi/importExcel";
import type { previewImportMudamudi } from "../../../backend/mudamudi/actions";

type PreviewRow = Awaited<ReturnType<typeof previewImportMudamudi>>[number];

export interface ImportPreviewStepProps {
  newCount: number;
  reviewCount: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  previewData: PreviewRow[];
}

export function ImportPreviewStep({
  newCount,
  reviewCount,
  errors,
  warnings,
  previewData,
}: ImportPreviewStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] px-2.5 py-2.5 sm:px-4 sm:py-3">
          <p className="text-[9px] font-medium uppercase tracking-wide text-[#206440]">
            Siap Diimpor
          </p>
          <p className="mt-1 text-lg font-semibold text-[#287A50] sm:text-xl">
            {newCount}
          </p>
          <p className="text-[9px] text-[#206440]">data baru</p>
        </div>

        <div
          className={`rounded-xl border px-2.5 py-2.5 sm:px-4 sm:py-3 ${
            reviewCount > 0
              ? "border-amber-100 bg-amber-50"
              : "border-gray-100 bg-gray-50"
          }`}
        >
          <p
            className={`text-[9px] font-medium uppercase tracking-wide ${
              reviewCount > 0 ? "text-amber-600" : "text-gray-500"
            }`}
          >
            Dilewati
          </p>
          <p
            className={`mt-1 text-lg font-semibold sm:text-xl ${
              reviewCount > 0 ? "text-amber-700" : "text-gray-700"
            }`}
          >
            {reviewCount}
          </p>
          <p
            className={`text-[9px] ${
              reviewCount > 0 ? "text-amber-600" : "text-gray-500"
            }`}
          >
            perlu diperiksa
          </p>
        </div>
      </div>

      {/* Info Banner */}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5M12 8h.01" />
          </svg>

          <div>
            <p className="text-[10px] font-medium text-gray-700">
              Hasil pemeriksaan data
            </p>
            <p className="mt-1 text-[9px] leading-4 text-gray-500">
              {newCount} data siap ditambahkan. {reviewCount} data tidak akan
              diproses karena terdeteksi duplikat atau tidak memenuhi ketentuan impor.
            </p>

            {reviewCount > 0 && (
              <p className="mt-1 text-[9px] leading-4 text-amber-700">
                Periksa rincian kesalahan sebelum mengimpor data.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Validation Summary note */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-[10px] font-semibold text-gray-700">
            Ringkasan Validasi
          </p>
          <p className="mt-1 text-[9px] leading-4 text-gray-500">
            Kesalahan menyebabkan baris tidak dapat diproses. Peringatan merupakan
            informasi tambahan yang perlu diperiksa sebelum melanjutkan impor.
          </p>
        </div>
      )}

      {/* Errors list */}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
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
                  {item.rowNumber > 0 ? `Baris ${item.rowNumber}:` : "Periksa:"}
                </span>
                <span>{item.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings list */}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3M12 15h.01" />
            </svg>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-700">
                Peringatan Data
              </p>
              <p className="mt-0.5 text-[9px] leading-4 text-amber-600">
                Periksa kembali tempat lahir, tahun lahir, nomor HP, dan pekerjaan
                jika terdapat peringatan.
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
                  {item.rowNumber > 0 ? `Baris ${item.rowNumber}:` : "Periksa:"}
                </span>
                <span>{item.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
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
                  <th className="px-3 py-2 font-medium">Tahun Lahir</th>
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
                    <td className="px-3 py-2 text-gray-400">{item.row}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {item.data.nama}
                    </td>
                    <td className="px-3 py-2">{item.data.kelompok}</td>
                    <td className="px-3 py-2">
                      {item.data.jenis_kelamin ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      {item.data.tahun_lahir ?? (
                        <span className="text-gray-400">Kosong</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {item.data.kelas.length > 0 ? (
                        item.data.kelas.join(", ")
                      ) : (
                        <span className="text-amber-600">Kosong</span>
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
              Menampilkan 8 dari {previewData.length} baris hasil pemeriksaan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImportPreviewStep;

