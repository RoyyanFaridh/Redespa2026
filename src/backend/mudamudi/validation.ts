import { FieldErrors } from "./types";

export function validateClient(
  nama: string,
  kelas: string,
  kelompok: string,
  jenisKelamin: string,
  tanggalLahir: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!nama.trim()) {
    errors.nama = "Nama wajib diisi";
  } else if (/\d/.test(nama)) {
    errors.nama = "Nama tidak boleh mengandung angka";
  }

  if (!kelas) {
    errors.kelas = "Kelas wajib dipilih";
  }

  if (!kelompok) {
    errors.kelompok = "Kelompok wajib dipilih";
  }

  if (!jenisKelamin) {
    errors.jenis_kelamin = "Jenis kelamin wajib dipilih";
  }

  // Tanggal lahir bersifat opsional.
  // Jika diisi, validasi format/tanggal dilakukan di server.
  if (tanggalLahir) {
    const date = new Date(`${tanggalLahir}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(date.getTime())) {
      errors.tanggal_lahir = "Format tanggal lahir tidak valid";
    } else if (date > today) {
      errors.tanggal_lahir = "Tanggal lahir tidak boleh di masa depan";
    }
  }

  return errors;
}
