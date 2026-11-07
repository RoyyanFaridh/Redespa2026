import React, { type ReactNode } from "react";
import {
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
} from "../../../backend/mudamudi/constants";
import { type GroupMode, formStyles, JEMAAH_CLASS } from "./types";

export interface StepSasaranProps {
  groupMode: GroupMode;
  effectiveKelompok: string[];
  allKelompokSelected: boolean;
  selectedKelas: string[];
  allKelasSelected: boolean;
  isJamaahSelected: boolean;
  kelasLabel: string;
  jenisKelamin: string;
  jenisKelaminLabel: string;
  loading: boolean;
  onChangeGroupMode: (mode: GroupMode) => void;
  onToggleKelompok: (kelompok: string) => void;
  onToggleAllKelompok: () => void;
  onToggleKelas: (kelas: string) => void;
  onToggleAllKelas: () => void;
  onSetJenisKelamin: (option: string) => void;
  kelompokError?: string;
  kelasError?: string;
  jenisKelaminError?: string;
  renderError: (message?: string) => ReactNode;
}

export function StepSasaran({
  groupMode,
  effectiveKelompok,
  allKelompokSelected,
  selectedKelas,
  allKelasSelected,
  isJamaahSelected,
  kelasLabel,
  jenisKelamin,
  jenisKelaminLabel,
  loading,
  onChangeGroupMode,
  onToggleKelompok,
  onToggleAllKelompok,
  onToggleKelas,
  onToggleAllKelas,
  onSetJenisKelamin,
  kelompokError,
  kelasError,
  jenisKelaminError,
  renderError,
}: StepSasaranProps) {
  function optionClass(checked: boolean) {
    return `${formStyles.option} ${
      checked
        ? "border-[#287A50] bg-[#E6F2EA]"
        : "border-[#E5EAE6] bg-white hover:border-[#65B98A]/40 hover:bg-[#F5F7F5]"
    } ${loading ? "cursor-not-allowed opacity-60" : ""}`;
  }

  function modeCardClass(checked: boolean) {
    return `flex min-h-[52px] min-w-0 cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-left transition ${
      checked
        ? "border-[#287A50] bg-[#E6F2EA]"
        : "border-[#E5EAE6] bg-white hover:border-[#65B98A]/40 hover:bg-[#F5F7F5]"
    } ${loading ? "cursor-not-allowed opacity-60" : ""}`;
  }

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
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
              <path d="M12 21s-7-4.5-7-11a7 7 0 1 1 14 0c0 6.5-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold leading-4 text-[#202824]">
              Sasaran Kegiatan
            </h3>
            <p className="text-[8px] leading-4 text-[#78827C]">
              Tentukan kelompok dan kriteria peserta kegiatan.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Kelompok */}
          <div className="rounded-xl border border-[#E5EAE6] bg-white p-3">
            <div className="mb-2.5">
              <h4 className={formStyles.subheading}>Kelompok</h4>
              <p className={`mt-1 ${formStyles.description}`}>
                Pilih semua kelompok atau tentukan kelompok tertentu.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: "all",
                    title: "Semua kelompok",
                    description: "Berlaku untuk seluruh kelompok.",
                  },
                  {
                    value: "specific",
                    title: "Kelompok tertentu",
                    description: "Pilih kelompok sesuai sasaran.",
                  },
                ] as const
              ).map((item) => {
                const checked = groupMode === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChangeGroupMode(item.value)}
                    disabled={loading}
                    aria-pressed={checked}
                    className={modeCardClass(checked)}
                  >
                    <span
                      className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        checked ? "border-[#287A50]" : "border-[#E5EAE6]"
                      }`}
                    >
                      {checked && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block wrap-break-word text-[9px] font-semibold text-[#202824]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[9px] leading-4 text-[#78827C]">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {groupMode === "specific" && (
              <div className="mt-3 rounded-xl border border-[#E5EAE6] p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-[#202824]">
                      Pilih kelompok
                    </p>
                    <p className="mt-0.5 text-[9px] text-[#78827C]">
                      {effectiveKelompok.length} dari {KELOMPOK_OPTIONS.length}{" "}
                      dipilih
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onToggleAllKelompok}
                    disabled={loading}
                    className={formStyles.action}
                  >
                    {allKelompokSelected ? "Hapus semua" : "Pilih semua"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {KELOMPOK_OPTIONS.map((kelompok) => {
                    const checked = effectiveKelompok.includes(kelompok);

                    return (
                      <label key={kelompok} className={optionClass(checked)}>
                        <input
                          type="checkbox"
                          name="kelompok"
                          value={kelompok}
                          checked={checked}
                          onChange={() => onToggleKelompok(kelompok)}
                          disabled={loading}
                          className="h-3.5 w-3.5 shrink-0 accent-[#287A50]"
                        />
                        <span className={formStyles.optionText}>{kelompok}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {groupMode === "all" && (
              <p className="mt-2.5 rounded-xl bg-[#F5F7F5] px-3 py-2 text-[9px] leading-4 text-[#78827C]">
                Kegiatan berlaku untuk seluruh kelompok yang terdaftar.
              </p>
            )}

            {renderError(kelompokError)}
          </div>

          {/* Kelas Peserta */}
          <div className="rounded-xl border border-[#E5EAE6] bg-white p-3">
            <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className={formStyles.subheading}>Kelas peserta</h4>
                <p className={`mt-1 ${formStyles.description}`}>
                  Pilih Jamaah untuk menyertakan semua peserta. Jika memilih kelas khusus, peserta harus memiliki salah satu kelas tersebut.
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-[#F5F7F5] px-2 py-1 text-[8px] font-medium text-[#78827C]">
                {kelasLabel}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5EAE6] bg-white p-3 shadow-xs sm:p-3.5">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[9px] font-medium text-[#202824]">
                  Pilih kelas
                </p>
                <button
                  type="button"
                  onClick={onToggleAllKelas}
                  disabled={loading}
                  className={formStyles.action}
                >
                  {allKelasSelected ? "Hapus semua" : "Pilih semua"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {KELAS_OPTIONS.map((kelas) => {
                  const checked = selectedKelas.includes(kelas);

                  return (
                    <label key={kelas} className={optionClass(checked)}>
                      <input
                        type="checkbox"
                        name="kelas"
                        value={kelas}
                        checked={checked}
                        onChange={() => onToggleKelas(kelas)}
                        disabled={loading}
                        className="h-3.5 w-3.5 shrink-0 accent-[#287A50]"
                      />
                      <span className={formStyles.optionText}>{kelas}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {isJamaahSelected && (
              <p className="mt-2.5 rounded-xl bg-[#E6F2EA] px-3 py-2 text-[9px] leading-4 text-[#206440]">
                Sasaran Jamaah mencakup seluruh peserta. Pilihan kelas khusus lainnya otomatis dinonaktifkan.
              </p>
            )}

            {renderError(kelasError)}
          </div>

          {/* Jenis Kelamin */}
          <div className="rounded-xl border border-[#E5EAE6] bg-white p-3">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className={formStyles.subheading}>Jenis kelamin</h4>
                <p className={`mt-1 ${formStyles.description}`}>
                  Tentukan peserta berdasarkan jenis kelamin.
                </p>
              </div>

              <span className="shrink-0 text-[9px] text-[#78827C]">
                {jenisKelaminLabel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {(["", ...JENIS_KELAMIN_OPTIONS] as string[]).map((option) => {
                const checked = jenisKelamin === option;

                return (
                  <label
                    key={option || "semua"}
                    className={`flex min-h-9 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 transition ${
                      checked
                        ? "border-[#287A50] bg-[#E6F2EA] text-[#206440]"
                        : "border-[#E5EAE6] text-[#202824] hover:border-[#65B98A]/40 hover:bg-[#F5F7F5]"
                    } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value={option}
                      checked={checked}
                      onChange={() => onSetJenisKelamin(option)}
                      disabled={loading}
                      className="h-3.5 w-3.5 shrink-0 accent-[#287A50]"
                    />
                    <span className="wrap-break-word text-center text-[9px] font-medium">
                      {option || "Semua"}
                    </span>
                  </label>
                );
              })}
            </div>

            {renderError(jenisKelaminError)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StepSasaran;

