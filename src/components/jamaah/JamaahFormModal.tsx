"use client";

import { useEffect, useState } from "react";
import type { Jamaah, FieldErrors } from "../../backend/jamaah/types";
import {
  JENIS_KELAMIN_OPTIONS,
  KELOMPOK_OPTIONS,
} from "../../backend/jamaah/constants";
import { ModalWrapper, Button, FormInput, FormSelect } from "../common";

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

  const [jenisKelamin, setJenisKelamin] = useState(
    initialData?.jenis_kelamin ?? "",
  );

  useEffect(() => {
    setKelompok(initialData?.kelompok ?? "");
  }, [initialData?.id, initialData?.kelompok]);

  useEffect(() => {
    setJenisKelamin(initialData?.jenis_kelamin ?? "");
  }, [initialData?.id, initialData?.jenis_kelamin]);

  const kelompokOptions = KELOMPOK_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const jenisKelaminOptions = JENIS_KELAMIN_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <div className="flex flex-col">
        {/* Header Modal */}
        <div className="border-b border-[#E5EAE6] px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#202824]">
                {mode === "add" ? "Tambah Jamaah" : "Edit Jamaah"}
              </h2>
              <p className="text-[10px] text-[#78827C]">
                {mode === "add"
                  ? "Tambahkan data Jamaah baru ke database sistem."
                  : "Perbarui informasi data Jamaah terpilih."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-4 sm:p-5">
          {error && (
            <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-2.5 text-xs text-red-700">
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

              <span className="text-[11px]">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Nama Lengkap */}
            <FormInput
              id="nama"
              name="nama"
              type="text"
              label="Nama Lengkap *"
              required
              defaultValue={initialData?.nama ?? ""}
              placeholder="Contoh: Syaiful Ashari"
              error={fieldErrors.nama}
            />

            {/* Kelompok & Jenis Kelamin */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormSelect
                id="kelompok"
                name="kelompok"
                label="Kelompok *"
                value={kelompok}
                required
                onChange={(e) => setKelompok(e.target.value)}
                options={kelompokOptions}
                placeholder="Pilih kelompok"
                error={fieldErrors.kelompok}
              />

              <FormSelect
                id="jenis_kelamin"
                name="jenis_kelamin"
                label="Jenis Kelamin *"
                value={jenisKelamin}
                required
                onChange={(e) => setJenisKelamin(e.target.value)}
                options={jenisKelaminOptions}
                placeholder="Pilih jenis kelamin"
                error={fieldErrors.jenis_kelamin}
              />
            </div>

            {/* Tempat & Tahun Lahir */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormInput
                id="tempat_lahir"
                name="tempat_lahir"
                type="text"
                label="Tempat Lahir (Opsional)"
                defaultValue={initialData?.tempat_lahir ?? ""}
                placeholder="Contoh: Bantul"
                error={fieldErrors.tempat_lahir}
              />

              <FormInput
                id="tahun_lahir"
                name="tahun_lahir"
                type="number"
                min="1900"
                max={currentYear}
                label="Tahun Lahir (Opsional)"
                defaultValue={initialData?.tahun_lahir ?? ""}
                placeholder="Contoh: 1995"
                error={fieldErrors.tahun_lahir}
              />
            </div>

            {/* Pekerjaan */}
            <FormInput
              id="pekerjaan"
              name="pekerjaan"
              type="text"
              label="Pekerjaan (Opsional)"
              defaultValue={initialData?.pekerjaan ?? ""}
              placeholder="Contoh: Wiraswasta / Karyawan"
              error={fieldErrors.pekerjaan}
            />

            {/* Nomor HP */}
            <FormInput
              id="no_hp"
              name="no_hp"
              type="tel"
              label="No. HP (Opsional)"
              defaultValue={initialData?.no_hp ?? ""}
              placeholder="Contoh: 081234567890"
              error={fieldErrors.no_hp}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex justify-end gap-2 border-t border-[#E5EAE6] pt-3.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
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
