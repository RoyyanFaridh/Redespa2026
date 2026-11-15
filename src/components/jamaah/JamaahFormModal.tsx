"use client";

import { useEffect, useState } from "react";
import type { Jamaah, FieldErrors } from "../../backend/jamaah/types";
import {
  JENIS_KELAMIN_OPTIONS,
  KELOMPOK_OPTIONS,
} from "../../backend/jamaah/constants";
import ModalWrapper from "../mudamudi/ModalWrapper";
import { Button } from "../common";

type Props = {
  mode: "add" | "edit";
  initialData?: Jamaah;
  fieldErrors: FieldErrors;
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

export default function JamaahFormModal({
  mode,
  initialData,
  fieldErrors,
  error,
  onSubmit,
  onClose,
}: Props) {
  const currentYear = new Date().getFullYear();

  const [kelompok, setKelompok] = useState(
    initialData?.kelompok ?? "",
  );

  useEffect(() => {
    setKelompok(initialData?.kelompok ?? "");
  }, [initialData?.id, initialData?.kelompok]);

  const inputClass =
    "w-full rounded-xl border border-[#E5EAE6] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#202824] transition placeholder:text-[#A4ACA6] hover:border-[#D1DCD4] focus:border-[#287A50] focus:outline-none focus:ring-2 focus:ring-[#287A50]/15";

  const selectClass =
    "w-full rounded-xl border border-[#E5EAE6] bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#202824] transition hover:border-[#D1DCD4] focus:border-[#287A50] focus:outline-none focus:ring-2 focus:ring-[#287A50]/15";

  const labelClass =
    "mb-1.5 block text-[11px] font-semibold text-[#202824]";

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex flex-col">
        {/* Header Modal */}
        <div className="border-b border-[#F0F4F1] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#202824]">
                {mode === "add" ? "Tambah Jamaah" : "Edit Jamaah"}
              </h2>

              <p className="text-[11px] text-[#78827C]">
                {mode === "add"
                  ? "Tambahkan data Jamaah baru ke database sistem."
                  : "Perbarui informasi data Jamaah terpilih."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-700">
              <svg
                className="h-4 w-4 shrink-0 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>

              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="nama" className={labelClass}>
                Nama Lengkap <span className="text-red-500">*</span>
              </label>

              <input
                id="nama"
                name="nama"
                type="text"
                required
                defaultValue={initialData?.nama ?? ""}
                placeholder="Contoh: Syaiful Ashari"
                className={`${inputClass} ${
                  fieldErrors.nama ? "border-red-300" : ""
                }`}
              />

              {fieldErrors.nama && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.nama}
                </p>
              )}
            </div>

            {/* Kelompok & Jenis Kelamin */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kelompok" className={labelClass}>
                  Kelompok <span className="text-red-500">*</span>
                </label>

                <select
                  id="kelompok"
                  name="kelompok"
                  value={kelompok}
                  required
                  onChange={(e) => setKelompok(e.target.value)}
                  className={`${selectClass} ${
                    fieldErrors.kelompok ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Pilih kelompok</option>

                  {KELOMPOK_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {fieldErrors.kelompok && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.kelompok}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="jenis_kelamin" className={labelClass}>
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>

                <select
                  id="jenis_kelamin"
                  name="jenis_kelamin"
                  defaultValue={initialData?.jenis_kelamin ?? ""}
                  required
                  className={`${selectClass} ${
                    fieldErrors.jenis_kelamin ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Pilih jenis kelamin</option>

                  {JENIS_KELAMIN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {fieldErrors.jenis_kelamin && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.jenis_kelamin}
                  </p>
                )}
              </div>
            </div>

            {/* Tempat & Tahun Lahir */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tempat_lahir" className={labelClass}>
                  Tempat Lahir{" "}
                  <span className="font-normal text-gray-400">(Opsional)</span>
                </label>

                <input
                  id="tempat_lahir"
                  name="tempat_lahir"
                  type="text"
                  defaultValue={initialData?.tempat_lahir ?? ""}
                  placeholder="Contoh: Bantul"
                  className={`${inputClass} ${
                    fieldErrors.tempat_lahir ? "border-red-300" : ""
                  }`}
                />

                {fieldErrors.tempat_lahir && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.tempat_lahir}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tahun_lahir" className={labelClass}>
                  Tahun Lahir{" "}
                  <span className="font-normal text-gray-400">(Opsional)</span>
                </label>

                <input
                  id="tahun_lahir"
                  name="tahun_lahir"
                  type="number"
                  min="1900"
                  max={currentYear}
                  defaultValue={initialData?.tahun_lahir ?? ""}
                  placeholder="Contoh: 1995"
                  className={`${inputClass} ${
                    fieldErrors.tahun_lahir ? "border-red-300" : ""
                  }`}
                />

                {fieldErrors.tahun_lahir && (
                  <p className="mt-1 text-[9px] text-red-500">
                    {fieldErrors.tahun_lahir}
                  </p>
                )}
              </div>
            </div>

            {/* Pekerjaan */}
            <div>
              <label htmlFor="pekerjaan" className={labelClass}>
                Pekerjaan <span className="font-normal text-gray-400">(Opsional)</span>
              </label>

              <input
                id="pekerjaan"
                name="pekerjaan"
                type="text"
                defaultValue={initialData?.pekerjaan ?? ""}
                placeholder="Contoh: Wiraswasta / Karyawan"
                className={`${inputClass} ${
                  fieldErrors.pekerjaan ? "border-red-300" : ""
                }`}
              />

              {fieldErrors.pekerjaan && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.pekerjaan}
                </p>
              )}
            </div>

            {/* Nomor HP */}
            <div>
              <label htmlFor="no_hp" className={labelClass}>
                No. HP <span className="font-normal text-gray-400">(Opsional)</span>
              </label>

              <input
                id="no_hp"
                name="no_hp"
                type="tel"
                defaultValue={initialData?.no_hp ?? ""}
                placeholder="Contoh: 081234567890"
                className={`${inputClass} ${
                  fieldErrors.no_hp ? "border-red-300" : ""
                }`}
              />

              {fieldErrors.no_hp && (
                <p className="mt-1 text-[9px] text-red-500">
                  {fieldErrors.no_hp}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t border-[#F0F4F1] pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="text-xs"
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-[#287A50] text-xs hover:bg-[#1E5E3D]"
            >
              {mode === "add" ? "Simpan Jamaah" : "Perbarui Jamaah"}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
