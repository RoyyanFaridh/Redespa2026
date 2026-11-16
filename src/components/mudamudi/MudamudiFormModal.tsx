"use client";

import { useEffect, useState } from "react";
import type { Mudamudi, FieldErrors } from "../../backend/mudamudi/types";
import {
  JENIS_KELAMIN_OPTIONS,
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
} from "../../backend/mudamudi/constants";
import {
  ModalWrapper,
  Button,
  FormInput,
  FormSelect,
  CheckboxGroup,
} from "../common";

type Props = {
  mode: "add" | "edit";
  initialData?: Mudamudi;
  fieldErrors: FieldErrors;
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

export default function MudamudiFormModal({
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

  const [kelas, setKelas] = useState<string[]>(
    initialData?.kelas ?? [],
  );

  useEffect(() => {
    setKelompok(initialData?.kelompok ?? "");
  }, [initialData?.id, initialData?.kelompok]);

  useEffect(() => {
    setJenisKelamin(initialData?.jenis_kelamin ?? "");
  }, [initialData?.id, initialData?.jenis_kelamin]);

  useEffect(() => {
    setKelas(initialData?.kelas ?? []);
  }, [initialData?.id, initialData?.kelas]);

  const kelompokOptions = KELOMPOK_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const jenisKelaminOptions = JENIS_KELAMIN_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const kelasOptions = KELAS_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <form
        key={`${mode}-${initialData?.id ?? "new"}`}
        onSubmit={onSubmit}
        className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                mode === "add"
                  ? "bg-[#E6F2EA] text-[#287A50]"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {mode === "add" ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.5 3.5 4 4L8 20l-5 1 1-5Z"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                {mode === "add"
                  ? "Tambah Data Muda-Mudi"
                  : "Edit Data Muda-Mudi"}
              </h2>

              <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                {mode === "add"
                  ? "Tambahkan data Generus/Muda-Mudi ke database REDESPA"
                  : "Perbarui informasi data Generus/Muda-Mudi"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#78827C] transition hover:bg-[#F0F4F1] hover:text-[#202824]"
          >
            <svg
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
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3.5 sm:space-y-4 sm:px-5 sm:py-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <svg
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

              <p className="text-[10px] leading-4 text-red-600">
                {error}
              </p>
            </div>
          )}

          <FormInput
            id="nama"
            name="nama"
            type="text"
            label="Nama Lengkap *"
            required
            placeholder="Masukkan nama lengkap"
            defaultValue={initialData?.nama ?? ""}
            error={fieldErrors.nama}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormSelect
              id="kelompok"
              name="kelompok"
              label="Kelompok *"
              required
              value={kelompok}
              onChange={(e) => setKelompok(e.target.value)}
              options={kelompokOptions}
              placeholder="Pilih kelompok"
              error={fieldErrors.kelompok}
            />

            <FormSelect
              id="jenis_kelamin"
              name="jenis_kelamin"
              label="Jenis Kelamin *"
              required
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              options={jenisKelaminOptions}
              placeholder="Pilih jenis kelamin"
              error={fieldErrors.jenis_kelamin}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              id="tempat_lahir"
              name="tempat_lahir"
              type="text"
              label="Tempat Lahir"
              placeholder="Tempat lahir"
              defaultValue={initialData?.tempat_lahir ?? ""}
              error={fieldErrors.tempat_lahir}
            />

            <FormInput
              id="tahun_lahir"
              name="tahun_lahir"
              type="number"
              min="1900"
              max={currentYear}
              step="1"
              label="Tahun Lahir (Opsional)"
              placeholder={String(currentYear - 20)}
              defaultValue={
                initialData?.tahun_lahir != null
                  ? String(initialData.tahun_lahir)
                  : ""
              }
              error={fieldErrors.tahun_lahir}
            />
          </div>

          <div>
            <CheckboxGroup
              label="Kelas *"
              options={kelasOptions}
              values={kelas}
              onChange={setKelas}
              helperText="Pilih satu atau beberapa kelas yang sesuai."
              error={fieldErrors.kelas}
            />
            {/* Hidden inputs to make sure FormData picks up the selected kelas in native submit */}
            {kelas.map((k) => (
              <input key={k} type="hidden" name="kelas" value={k} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              id="pekerjaan"
              name="pekerjaan"
              type="text"
              label="Pekerjaan"
              placeholder="Masukkan pekerjaan"
              defaultValue={initialData?.pekerjaan ?? ""}
              error={fieldErrors.pekerjaan}
            />

            <FormInput
              id="no_hp"
              name="no_hp"
              type="tel"
              inputMode="numeric"
              label="No. HP"
              placeholder="Masukkan nomor HP"
              defaultValue={initialData?.no_hp ?? ""}
              error={fieldErrors.no_hp}
            />
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            {mode === "add" ? "Simpan Data" : "Simpan Perubahan"}
          </Button>
        </footer>
      </form>
    </ModalWrapper>
  );
}
