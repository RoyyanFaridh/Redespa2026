import React from "react";
import {
  type ActivityForm,
  type GroupMode,
  formStyles,
  formatDate,
  formatTime,
} from "./types";

export interface StepKonfirmasiProps {
  activity: ActivityForm;
  groupMode: GroupMode;
  effectiveKelompok: string[];
  selectedKelasForSummary: string[];
  kelasLabel: string;
  jenisKelaminLabel: string;
  loading: boolean;
  onGoToStep: (step: number) => void;
}

export function StepKonfirmasi({
  activity,
  groupMode,
  effectiveKelompok,
  selectedKelasForSummary,
  kelasLabel,
  jenisKelaminLabel,
  loading,
  onGoToStep,
}: StepKonfirmasiProps) {
  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 12 2 2 4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold leading-4 text-[#202824]">
              Ringkasan & Konfirmasi
            </h3>
            <p className="text-[8px] leading-4 text-[#78827C]">
              Periksa kembali informasi dan sasaran sebelum menyimpan.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Ringkasan Info Kegiatan */}
        <div className="rounded-xl border border-[#E5EAE6] bg-white p-3 shadow-xs sm:p-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className={formStyles.subheading}>Informasi Kegiatan</h4>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              disabled={loading}
              className={formStyles.action}
            >
              Ubah
            </button>
          </div>

          <div className="space-y-2.5">
            <div>
              <p className="text-[9px] text-[#78827C]">Nama kegiatan</p>
              <p className="mt-0.5 wrap-break-word text-[9px] font-semibold leading-4 text-[#202824]">
                {activity.nama.trim() || "Belum diisi"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="text-[9px] text-[#78827C]">Tanggal mulai</p>
                <p className="mt-0.5 wrap-break-word text-[9px] font-medium leading-4 text-[#202824]">
                  {formatDate(activity.tanggal_mulai)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] text-[#78827C]">Tanggal selesai</p>
                <p className="mt-0.5 wrap-break-word text-[9px] font-medium leading-4 text-[#202824]">
                  {formatDate(activity.tanggal_selesai)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] text-[#78827C]">Jam mulai</p>
                <p className="mt-0.5 text-[9px] font-medium text-[#202824]">
                  {formatTime(activity.jam_mulai)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] text-[#78827C]">Jam selesai</p>
                <p className="mt-0.5 text-[9px] font-medium text-[#202824]">
                  {formatTime(activity.jam_selesai)}
                </p>
              </div>
            </div>

            <div className="border-t border-[#E5EAE6] pt-2.5">
              <p className="text-[9px] text-[#78827C]">Lokasi</p>
              <p className="mt-0.5 wrap-break-word text-[9px] font-medium leading-4 text-[#202824]">
                {activity.lokasi.trim() || "Belum diisi"}
              </p>
            </div>
          </div>
        </div>

        {/* Ringkasan Sasaran */}
        <div className="rounded-xl border border-[#E5EAE6] bg-white p-3 shadow-xs sm:p-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className={formStyles.subheading}>Sasaran Peserta</h4>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              disabled={loading}
              className={formStyles.action}
            >
              Ubah
            </button>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[9px] font-medium text-[#202824]">Kelompok</p>
                {groupMode === "specific" && (
                  <span className="text-[9px] text-[#78827C]">
                    {effectiveKelompok.length} dipilih
                  </span>
                )}
              </div>

              {groupMode === "all" ? (
                <p className="text-[9px] leading-4 text-[#202824]">
                  Semua kelompok
                </p>
              ) : effectiveKelompok.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {effectiveKelompok.map((kelompok) => (
                    <span
                      key={kelompok}
                      className="max-w-full wrap-break-word rounded-md bg-[#E6F2EA] px-2 py-1 text-[9px] font-medium text-[#206440]"
                    >
                      {kelompok}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-red-600">
                  Belum ada kelompok yang dipilih.
                </p>
              )}
            </div>

            <div className="border-t border-[#E5EAE6] pt-3">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[9px] font-medium text-[#202824]">
                  Kelas peserta
                </p>
                <span className="text-[9px] text-[#78827C]">{kelasLabel}</span>
              </div>

              {selectedKelasForSummary.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedKelasForSummary.map((kelas) => (
                    <span
                      key={kelas}
                      className="max-w-full wrap-break-word rounded-md bg-[#F5F7F5] px-2 py-1 text-[9px] font-medium text-[#202824]"
                    >
                      {kelas}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-[#78827C]">
                  Tidak ada kelas yang tersedia.
                </p>
              )}
            </div>

            <div className="border-t border-[#E5EAE6] pt-3">
              <p className="text-[9px] font-medium text-[#202824]">
                Jenis kelamin
              </p>
              <p className="mt-0.5 text-[9px] text-[#202824]">
                {jenisKelaminLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] px-3 py-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#287A50]"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 4h.01M10.3 3.86 1.82 18.5A2 2 0 0 0 3.55 21h16.9a2 2 0 0 0 1.73-2.5L13.7 3.86a2 2 0 0 0-3.4 0Z"
            />
          </svg>

          <p className="text-[9px] leading-4 text-[#206440]">
            Pastikan informasi dan sasaran sudah sesuai. Data hanya dikirim
            setelah kamu menekan tombol simpan.
          </p>
        </div>
      </div>
    </section>
  );
}

export default StepKonfirmasi;

