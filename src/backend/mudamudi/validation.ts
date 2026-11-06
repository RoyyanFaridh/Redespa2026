
import type { FieldErrors } from "./types";
import {
  KELOMPOK_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
} from "./constants";

export function validateClient(
  nama: string,
  kelas: string,
  kelompok: string,
  jenisKelamin: string,
  tahunLahirRaw: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!nama.trim()) {
    errors.nama = "Nama wajib diisi";
  } else if (/\d/.test(nama)) {
    errors.nama = "Nama tidak boleh mengandung angka";
  }

  if (!kelompok) {
    errors.kelompok = "Kelompok wajib dipilih";
  } else if (
    !(KELOMPOK_OPTIONS as readonly string[]).includes(kelompok)
  ) {
    errors.kelompok = "Kelompok tidak valid";
  }

  if (!jenisKelamin) {
    errors.jenis_kelamin = "Jenis kelamin wajib dipilih";
  } else if (
    !(JENIS_KELAMIN_OPTIONS as readonly string[]).includes(jenisKelamin)
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid";
  }

  if (!kelas) {
    errors.kelas = "Kelas wajib dipilih";
  } else if (!(KELAS_OPTIONS as readonly string[]).includes(kelas)) {
    errors.kelas = "Kelas tidak valid";
  }

  if (tahunLahirRaw.trim() !== "") {
    const tahunLahir = Number(tahunLahirRaw);
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(tahunLahir) ||
      tahunLahir < 1900 ||
      tahunLahir > currentYear
    ) {
      errors.tahun_lahir = `Tahun lahir harus berupa angka antara 1900 dan ${currentYear}`;
    }
  }

  return errors;
}
