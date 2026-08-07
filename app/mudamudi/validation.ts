import { FieldErrors } from './types'

export function validateClient(nama: string, jenjang: string, kelompok: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!nama.trim()) errors.nama = 'Nama wajib diisi'
  else if (/\d/.test(nama)) errors.nama = 'Nama tidak boleh mengandung angka'
  if (!jenjang) errors.jenjang = 'Jenjang wajib dipilih'
  if (!kelompok) errors.kelompok = 'Kelompok wajib dipilih'
  return errors
}