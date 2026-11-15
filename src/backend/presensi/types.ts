export type PresensiStatus =
  | "hadir"
  | "terlambat"
  | "izin"
  | "sakit"
  | "alpa";

export type PresensiMetode = "qr" | "manual";

export type PresensiSummary = {
  totalHariIni: number;
  kegiatanAktif: number;
  totalKegiatanHariIni: number;
};

export type KegiatanPresensi = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  totalPresensi: number;
};

export type PresensiTerbaru = {
  id: number;
  namaPeserta: string;
  namaKegiatan: string;
  waktuCheckin: string;
  lokasi: string;
};

export type MonitoringPeserta = {
  presensi_id: number | null;
  peserta_id: number; // ID di tabel mudamudi atau jamaah
  mudamudi_id: number | null;
  jamaah_id?: number | null;
  nama: string;
  kelompok: string;
  kelas: string[]; // Kosong [] untuk Jamaah
  jenis_kelamin: string | null;
  waktu_checkin: string | null;
  status: PresensiStatus | null;
  metode: PresensiMetode | null;
  keterangan: string | null;
};

export type MonitoringPresensi = {
  kegiatan: {
    id: number;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    jam_mulai: string;
    jam_selesai: string;
    lokasi: string;
    jenis_peserta?: "jamaah" | "mudamudi" | null;
  };
  totalPeserta: number;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  totalBelumHadir: number;
  peserta: MonitoringPeserta[];
};

export type UpdatePresensiStatusInput = {
  presensiId: number;
  status: PresensiStatus;
};

export type RekapitulasiPeserta = {
  id: number;
  nama: string;
  kelompok: string | null;
  kelas: string[];
  jenis_kelamin: string | null;
};

// Aliaskan untuk backwards compatibility
export type RekapitulasiMudaMudi = RekapitulasiPeserta;

export type RekapitulasiStatus = PresensiStatus | "tidak_berlaku";

export type RekapitulasiKegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  jenis_peserta?: "jamaah" | "mudamudi" | null;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

export type RekapitulasiKehadiran = {
  kegiatan_id: number;
  peserta_id: number;
  mudamudi_id?: number | null;
  jamaah_id?: number | null;
  status: RekapitulasiStatus;
  metode: PresensiMetode | null;
  waktu_checkin: string | null;
  keterangan: string | null;
};

export type RekapitulasiPresensi = {
  peserta: RekapitulasiPeserta[];
  mudamudi: RekapitulasiMudaMudi[]; // legacy alias
  kegiatan: RekapitulasiKegiatan[];
  kehadiran: RekapitulasiKehadiran[];
  jenis_peserta?: "jamaah" | "mudamudi";
};
