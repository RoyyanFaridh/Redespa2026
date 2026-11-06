
export type KegiatanTarget = {
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

export type MudamudiTarget = {
  kelompok: string | null;
  kelas: string[];
  jenis_kelamin: string | null;
};

export function isMudamudiTargeted(
  kegiatan: KegiatanTarget,
  mudamudi: MudamudiTarget,
): boolean {
  const matchesKelompok =
    !kegiatan.kelompok ||
    kegiatan.kelompok.length === 0 ||
    (mudamudi.kelompok !== null &&
      kegiatan.kelompok.includes(mudamudi.kelompok));

  const matchesKelas =
    !kegiatan.kelas ||
    kegiatan.kelas.length === 0 ||
    kegiatan.kelas.includes("Jamaah") ||
    mudamudi.kelas.some(
      (kelas) =>
        kelas !== "Jamaah" &&
        kegiatan.kelas!.includes(kelas),
    );

  const matchesJenisKelamin =
    !kegiatan.jenis_kelamin ||
    kegiatan.jenis_kelamin === mudamudi.jenis_kelamin;

  return matchesKelompok && matchesKelas && matchesJenisKelamin;
}
