"use server";

import { requireAdmin } from "../auth/admin";
import { createAdminClient } from "../supabase/admin";
import { KELOMPOK_OPTIONS, KELAS_OPTIONS } from "../mudamudi/constants";
import { buildDateTime, getToday, getTomorrow } from "../presensi/helpers";
import type { Kegiatan } from "../kegiatan/types";

const STATUS_PRESENSI_TERCATAT = [
  "hadir",
  "terlambat",
  "izin",
  "sakit",
  "alpa",
] as const;

type StatusPresensi = (typeof STATUS_PRESENSI_TERCATAT)[number];

const STATUS_LABEL: Record<StatusPresensi, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};

export type KelompokStat = {
  kelompok: string;
  jumlah: number;
  persentase: number;
};

export type KelasStat = {
  kelas: string;
  jumlah: number;
  persentase: number;
};

export type StatusPresensiStat = {
  status: StatusPresensi;
  label: string;
  jumlah: number;
};

export type PresensiTerbaruItem = {
  id: number;
  namaPeserta: string;
  namaKegiatan: string;
  waktuCheckin: string | null;
  lokasi: string;
};

export type DashboardData = {
  adminNama: string;
  totalAnggota: number;
  totalKegiatan: number;
  totalPresensi: number;
  presensiHariIni: number;
  kegiatanAktif: number;
  kegiatanTerdekat: Kegiatan[];
  kelompokDistribusi: KelompokStat[];
  kelasDistribusi: KelasStat[];
  genderDistribusi: {
    lakiLaki: number;
    perempuan: number;
  };
  statusDistribusi: StatusPresensiStat[];
  presensiTerbaru: PresensiTerbaruItem[];
  error: string | null;
};

export async function getDashboardData(): Promise<DashboardData> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const now = new Date();
  const today = getToday();
  const tomorrow = getTomorrow(today);

  // 1. Query seluruh data Jamaah Desa Pandak (tanpa kolom desa lama)
  const anggotaPromise = supabase
    .from("mudamudi")
    .select("id, kelompok, kelas, jenis_kelamin");

  // 2. Query seluruh kegiatan Desa Pandak
  const kegiatanPromise = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin, created_at",
    )
    .order("tanggal_mulai", { ascending: true })
    .order("jam_mulai", { ascending: true });

  // 3. Query total presensi keseluruhan
  const totalPresensiPromise = supabase
    .from("presensi")
    .select("id", { count: "exact", head: true });

  // 4. Query presensi hari ini
  const presensiHariIniPromise = supabase
    .from("presensi")
    .select("id", { count: "exact", head: true })
    .gte("waktu_checkin", `${today}T00:00:00+07:00`)
    .lt("waktu_checkin", `${tomorrow}T00:00:00+07:00`);

  // 5. Query status distribusi presensi
  const statusCountsPromise = Promise.all(
    STATUS_PRESENSI_TERCATAT.map((status) =>
      supabase
        .from("presensi")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  );

  // 6. Query riwayat presensi terbaru (aktivitas real-time)
  const presensiTerbaruPromise = supabase
    .from("presensi")
    .select(
      `
      id,
      waktu_checkin,
      kegiatan:kegiatan_id (
        nama,
        lokasi
      ),
      mudamudi:mudamudi_id (
        nama
      )
    `,
    )
    .order("waktu_checkin", { ascending: false })
    .limit(8);

  const [
    anggotaResult,
    kegiatanResult,
    totalPresensiResult,
    presensiHariIniResult,
    statusCountsResult,
    presensiTerbaruResult,
  ] = await Promise.all([
    anggotaPromise,
    kegiatanPromise,
    totalPresensiPromise,
    presensiHariIniPromise,
    statusCountsPromise,
    presensiTerbaruPromise,
  ]);

  const anggotaData = anggotaResult.data ?? [];
  const totalAnggota = anggotaData.length;
  const kegiatanData: Kegiatan[] = (kegiatanResult.data ?? []) as Kegiatan[];

  // --- Hitung Distribusi Kelompok Desa Pandak ---
  const kelompokCountMap = new Map<string, number>();
  // Inisialisasi seluruh kelompok resmi Desa Pandak
  KELOMPOK_OPTIONS.forEach((kel) => kelompokCountMap.set(kel, 0));

  let countLaki = 0;
  let countPerempuan = 0;
  const kelasCountMap = new Map<string, number>();
  KELAS_OPTIONS.forEach((k) => kelasCountMap.set(k, 0));

  anggotaData.forEach((row) => {
    // Kelompok
    const kel = row.kelompok?.trim();
    if (kel) {
      kelompokCountMap.set(kel, (kelompokCountMap.get(kel) ?? 0) + 1);
    }

    // Gender
    const gender = row.jenis_kelamin?.toLowerCase();
    if (gender === "laki-laki" || gender === "pria") {
      countLaki++;
    } else if (gender === "perempuan" || gender === "wanita") {
      countPerempuan++;
    }

    // Kelas (bisa comma-separated string atau nilai tunggal)
    if (row.kelas) {
      const kelasList = String(row.kelas)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      kelasList.forEach((k) => {
        if (kelasCountMap.has(k)) {
          kelasCountMap.set(k, (kelasCountMap.get(k) ?? 0) + 1);
        }
      });
    }
  });

  const kelompokDistribusi: KelompokStat[] = KELOMPOK_OPTIONS.map((kel) => {
    const jumlah = kelompokCountMap.get(kel) ?? 0;
    const persentase = totalAnggota > 0 ? Math.round((jumlah / totalAnggota) * 100) : 0;
    return { kelompok: kel, jumlah, persentase };
  });

  const kelasDistribusi: KelasStat[] = KELAS_OPTIONS.map((k) => {
    const jumlah = kelasCountMap.get(k) ?? 0;
    const persentase = totalAnggota > 0 ? Math.round((jumlah / totalAnggota) * 100) : 0;
    return { kelas: k, jumlah, persentase };
  });

  // --- Status Presensi ---
  const statusDistribusi: StatusPresensiStat[] = STATUS_PRESENSI_TERCATAT.map(
    (status, index) => ({
      status,
      label: STATUS_LABEL[status],
      jumlah: statusCountsResult[index].count ?? 0,
    }),
  );

  // --- Kegiatan Aktif Sekarang ---
  const kegiatanAktif = kegiatanData.filter((kegiatan) => {
    const mulai = buildDateTime(kegiatan.tanggal_mulai, kegiatan.jam_mulai);
    const selesai = buildDateTime(
      kegiatan.tanggal_selesai,
      kegiatan.jam_selesai,
    );
    // Terbuka 30 menit sebelum s.d. jam selesai
    const bukaMulai = new Date(mulai.getTime() - 30 * 60 * 1000);
    return now >= bukaMulai && now <= selesai;
  }).length;

  // --- Kegiatan Terdekat (yang belum berakhir) ---
  const kegiatanTerdekat = kegiatanData
    .filter((kegiatan) => {
      const selesai = buildDateTime(
        kegiatan.tanggal_selesai,
        kegiatan.jam_selesai,
      );
      return selesai >= now;
    })
    .slice(0, 4);

  // --- Presensi Terbaru (real-time check-in stream) ---
  const presensiTerbaru: PresensiTerbaruItem[] = (
    presensiTerbaruResult.data ?? []
  ).map((item) => {
    const kegiatanObj = Array.isArray(item.kegiatan)
      ? item.kegiatan[0]
      : item.kegiatan;
    const mudamudiObj = Array.isArray(item.mudamudi)
      ? item.mudamudi[0]
      : item.mudamudi;

    return {
      id: item.id,
      namaPeserta: mudamudiObj?.nama ?? "Jamaah",
      namaKegiatan: kegiatanObj?.nama ?? "Kegiatan",
      waktuCheckin: item.waktu_checkin,
      lokasi: kegiatanObj?.lokasi ?? "",
    };
  });

  const queryError =
    anggotaResult.error?.message ??
    kegiatanResult.error?.message ??
    totalPresensiResult.error?.message ??
    presensiHariIniResult.error?.message ??
    presensiTerbaruResult.error?.message ??
    null;

  return {
    adminNama: admin.profile.nama || "Admin",
    totalAnggota,
    totalKegiatan: kegiatanData.length,
    totalPresensi: totalPresensiResult.count ?? 0,
    presensiHariIni: presensiHariIniResult.count ?? 0,
    kegiatanAktif,
    kegiatanTerdekat,
    kelompokDistribusi,
    kelasDistribusi,
    genderDistribusi: {
      lakiLaki: countLaki,
      perempuan: countPerempuan,
    },
    statusDistribusi,
    presensiTerbaru,
    error: queryError,
  };
}
