
import { FieldErrors } from "./types";
import {
  KELOMPOK_OPTIONS,
  KELAS_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
} from "../mudamudi/constants";

export function validateClient(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
  kelompok: string[],
  kelas: string[],
  jenisKelamin: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!nama.trim()) {
    errors.nama = "Nama kegiatan wajib diisi.";
  }

  if (!tanggalMulai) {
    errors.tanggal_mulai = "Tanggal mulai wajib diisi.";
  }

  if (!tanggalSelesai) {
    errors.tanggal_selesai = "Tanggal selesai wajib diisi.";
  }

  if (
    tanggalMulai &&
    tanggalSelesai &&
    tanggalSelesai < tanggalMulai
  ) {
    errors.tanggal_selesai =
      "Tanggal selesai harus setelah atau sama dengan tanggal mulai.";
  }

  if (!jamMulai) {
    errors.jam_mulai = "Jam mulai wajib diisi.";
  }

  if (!jamSelesai) {
    errors.jam_selesai = "Jam selesai wajib diisi.";
  }

  if (
    tanggalMulai &&
    tanggalSelesai &&
    tanggalMulai === tanggalSelesai &&
    jamMulai &&
    jamSelesai &&
    jamSelesai <= jamMulai
  ) {
    errors.jam_selesai = "Jam selesai harus setelah jam mulai.";
  }

  if (!lokasi.trim()) {
    errors.lokasi = "Lokasi kegiatan wajib diisi.";
  }

  if (!Array.isArray(kelompok)) {
    errors.kelompok = "Data kelompok tidak valid.";
  } else if (
    !kelompok.every((item) => KELOMPOK_OPTIONS.includes(item as (typeof KELOMPOK_OPTIONS)[number])) ||
    new Set(kelompok).size !== kelompok.length
  ) {
    errors.kelompok = "Pilihan kelompok tidak valid.";
  }

  if (!Array.isArray(kelas)) {
    errors.kelas = "Data kelas tidak valid.";
  } else if (
    !kelas.every((item) => KELAS_OPTIONS.includes(item as (typeof KELAS_OPTIONS)[number])) ||
    new Set(kelas).size !== kelas.length
  ) {
    errors.kelas = "Pilihan kelas tidak valid.";
  }

  if (
    typeof jenisKelamin !== "string" ||
    !["", ...JENIS_KELAMIN_OPTIONS].includes(jenisKelamin)
  ) {
    errors.jenis_kelamin = "Pilihan jenis kelamin tidak valid.";
  }

  return errors;
}
