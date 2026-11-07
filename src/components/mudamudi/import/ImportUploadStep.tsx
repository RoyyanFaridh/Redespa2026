"use client";

import React, { type RefObject } from "react";
import { UploadIcon } from "../icons";

export interface ImportUploadStepProps {
  file: File | null;
  loading: boolean;
  showMobileHelp: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onToggleMobileHelp: () => void;
  onFileSelectClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportUploadStep({
  file,
  loading,
  showMobileHelp,
  inputRef,
  onToggleMobileHelp,
  onFileSelectClick,
  onFileChange,
}: ImportUploadStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile view */}
      <div className="space-y-2 md:hidden">
        <button
          type="button"
          disabled={loading}
          onClick={onFileSelectClick}
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
                : "Pilih file database Jamaah (.xlsx atau .csv)"}
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
            onClick={onToggleMobileHelp}
            aria-expanded={showMobileHelp}
            className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-medium transition ${
              showMobileHelp
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
                  <span className="font-semibold text-[#287A50]">Wajib:</span>{" "}
                  Kelompok, Nama Lengkap, Jenis Kelamin, Kelas.
                </p>
                <p>
                  <span className="font-semibold text-[#287A50]">Opsional:</span>{" "}
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
                Proses impor hanya menambahkan data baru. Data yang sudah
                terdaftar atau terdeteksi duplikat akan dilewati.
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        onChange={onFileChange}
        disabled={loading}
        className="hidden"
      />

      {/* Desktop view */}
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
                <p className="font-semibold text-[#287A50]">Kolom wajib</p>
                <p className="mt-0.5 text-[#78827C]">
                  Kelompok, Nama Lengkap, Jenis Kelamin, Kelas.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#287A50]">Kolom opsional</p>
                <p className="mt-0.5 text-[#78827C]">
                  Tempat, Tahun Lahir, No HP, Pekerjaan.
                </p>
              </div>

              <p className="border-t border-[#E5EAE6] pt-2 text-[#9AA39D]">
                Kolom NO hanya berfungsi sebagai nomor urut dan tidak digunakan
                dalam proses impor.
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
              Data yang sudah terdaftar atau terdeteksi duplikat tidak akan
              ditambahkan kembali. Proses ini hanya menambahkan data baru, bukan
              memperbarui data lama.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div>
            <p className="text-[11px] font-semibold text-[#202824]">
              Pilih File
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#78827C]">
              Unggah file database Jamaah untuk memeriksa dan menambahkan data.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onFileSelectClick}
            className="mt-4 flex min-h-[190px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D8CE] bg-[#F8FAF8] px-5 py-5 text-center transition hover:border-[#65B98A] hover:bg-[#E6F2EA]/40 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
            Disarankan menggunakan file hasil Export Data agar susunan kolom tetap
            sesuai.
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
              Proses impor hanya menambahkan data baru. Data yang sudah
              terdaftar atau terdeteksi duplikat akan dilewati. Pastikan data
              pada file sudah benar sebelum melanjutkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportUploadStep;

