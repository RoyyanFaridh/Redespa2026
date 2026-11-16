import "server-only";

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

  // Ringkasan Utama
  totalKegiatan: number;
  totalPresensi: number;
  presensiHariIni: number;
  kegiatanAktif: number;

  // Pemisahan Eksplisit Data Jamaah
  jamaahStats: {
    total: number;
    lakiLaki: number;
    perempuan: number;
    kelompokDistribusi: KelompokStat[];
  };

  // Pemisahan Eksplisit Data Muda-Mudi
  mudamudiStats: {
    total: number;
    lakiLaki: number;
    perempuan: number;
    kelompokDistribusi: KelompokStat[];
    kelasDistribusi: KelasStat[];
  };

  // Legacy compatibility fields
  totalAnggota: number;
  kelompokDistribusi: KelompokStat[];
  kelasDistribusi: KelasStat[];
  genderDistribusi: {
    lakiLaki: number;
    perempuan: number;
  };

  kegiatanTerdekat: Kegiatan[];
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

  // 1. Query data Muda-Mudi
  const mudamudiPromise = supabase
    .from("mudamudi")
    .select("id, kelompok, kelas, jenis_kelamin");

  // 2. Query data Jamaah
  const jamaahPromise = supabase
    .from("jamaah")
    .select("id, kelompok, jenis_kelamin");

  // 3. Query seluruh kegiatan Desa Pandak
  const kegiatanPromise = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin, created_at",
    )
    .order("tanggal_mulai", { ascending: true })
    .order("jam_mulai", { ascending: true });

  // 4. Query total presensi keseluruhan
  const totalPresensiPromise = supabase
    .from("presensi")
    .select("id", { count: "exact", head: true });

  // 5. Query presensi hari ini
  const presensiHariIniPromise = supabase
    .from("presensi")
    .select("id", { count: "exact", head: true })
    .gte("waktu_checkin", `${today}T00:00:00+07:00`)
    .lt("waktu_checkin", `${tomorrow}T00:00:00+07:00`);

  // 6. Query status distribusi presensi
  const statusCountsPromise = Promise.all(
    STATUS_PRESENSI_TERCATAT.map((status) =>
      supabase
        .from("presensi")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  );

  // 7. Query riwayat presensi terbaru (aktivitas real-time)
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
    mudamudiResult,
    jamaahResult,
    kegiatanResult,
    totalPresensiResult,
    presensiHariIniResult,
    statusCountsResult,
    presensiTerbaruResult,
  ] = await Promise.all([
    mudamudiPromise,
    jamaahPromise,
    kegiatanPromise,
    totalPresensiPromise,
    presensiHariIniPromise,
    statusCountsPromise,
    presensiTerbaruPromise,
  ]);

  const mudamudiData = mudamudiResult.data ?? [];
  const jamaahData = jamaahResult.data ?? [];
  const kegiatanData: Kegiatan[] = (kegiatanResult.data ?? []) as Kegiatan[];

  // -------------------------------------------------------------
  // A. PENGOLAHAN DATA JAMAAH
  // -------------------------------------------------------------
  const totalJamaah = jamaahData.length;
  let jamaahLaki = 0;
  let jamaahPerempuan = 0;
  const jamaahKelompokMap = new Map<string, number>();
  KELOMPOK_OPTIONS.forEach((kel) => jamaahKelompokMap.set(kel, 0));

  jamaahData.forEach((row) => {
    const kel = row.kelompok?.trim();
    if (kel) {
      jamaahKelompokMap.set(kel, (jamaahKelompokMap.get(kel) ?? 0) + 1);
    }
    const gender = row.jenis_kelamin?.toLowerCase();
    if (gender === "laki-laki" || gender === "pria") {
      jamaahLaki++;
    } else if (gender === "perempuan" || gender === "wanita") {
      jamaahPerempuan++;
    }
  });

  const jamaahKelompokDistribusi: KelompokStat[] = KELOMPOK_OPTIONS.map((kel) => {
    const jumlah = jamaahKelompokMap.get(kel) ?? 0;
    const persentase = totalJamaah > 0 ? Math.round((jumlah / totalJamaah) * 100) : 0;
    return { kelompok: kel, jumlah, persentase };
  });

  // -------------------------------------------------------------
  // B. PENGOLAHAN DATA MUDA-MUDI
  // -------------------------------------------------------------
  const totalMudamudi = mudamudiData.length;
  let mudamudiLaki = 0;
  let mudamudiPerempuan = 0;
  const mudamudiKelompokMap = new Map<string, number>();
  KELOMPOK_OPTIONS.forEach((kel) => mudamudiKelompokMap.set(kel, 0));

  const mudamudiKelasMap = new Map<string, number>();
  KELAS_OPTIONS.forEach((k) => mudamudiKelasMap.set(k, 0));

  mudamudiData.forEach((row) => {
    // Kelompok
    const kel = row.kelompok?.trim();
    if (kel) {
      mudamudiKelompokMap.set(kel, (mudamudiKelompokMap.get(kel) ?? 0) + 1);
    }

    // Gender
    const gender = row.jenis_kelamin?.toLowerCase();
    if (gender === "laki-laki" || gender === "pria") {
      mudamudiLaki++;
    } else if (gender === "perempuan" || gender === "wanita") {
      mudamudiPerempuan++;
    }

    // Kelas: array string atau comma-separated
    if (Array.isArray(row.kelas)) {
      row.kelas.forEach((k: string) => {
        const trimmed = k?.trim();
        if (trimmed && mudamudiKelasMap.has(trimmed)) {
          mudamudiKelasMap.set(trimmed, (mudamudiKelasMap.get(trimmed) ?? 0) + 1);
        }
      });
    } else if (row.kelas) {
      const kelasList = String(row.kelas)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      kelasList.forEach((k) => {
        if (mudamudiKelasMap.has(k)) {
          mudamudiKelasMap.set(k, (mudamudiKelasMap.get(k) ?? 0) + 1);
        }
      });
    }
  });

  const mudamudiKelompokDistribusi: KelompokStat[] = KELOMPOK_OPTIONS.map((kel) => {
    const jumlah = mudamudiKelompokMap.get(kel) ?? 0;
    const persentase = totalMudamudi > 0 ? Math.round((jumlah / totalMudamudi) * 100) : 0;
    return { kelompok: kel, jumlah, persentase };
  });

  const mudamudiKelasDistribusi: KelasStat[] = KELAS_OPTIONS.map((k) => {
    const jumlah = mudamudiKelasMap.get(k) ?? 0;
    const persentase = totalMudamudi > 0 ? Math.round((jumlah / totalMudamudi) * 100) : 0;
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
      namaPeserta: mudamudiObj?.nama ?? "Peserta",
      namaKegiatan: kegiatanObj?.nama ?? "Kegiatan",
      waktuCheckin: item.waktu_checkin,
      lokasi: kegiatanObj?.lokasi ?? "",
    };
  });

  const queryError =
    mudamudiResult.error?.message ??
    jamaahResult.error?.message ??
    kegiatanResult.error?.message ??
    totalPresensiResult.error?.message ??
    presensiHariIniResult.error?.message ??
    presensiTerbaruResult.error?.message ??
    null;

  return {
    adminNama: admin.profile.nama || "Admin",

    totalKegiatan: kegiatanData.length,
    totalPresensi: totalPresensiResult.count ?? 0,
    presensiHariIni: presensiHariIniResult.count ?? 0,
    kegiatanAktif,

    jamaahStats: {
      total: totalJamaah,
      lakiLaki: jamaahLaki,
      perempuan: jamaahPerempuan,
      kelompokDistribusi: jamaahKelompokDistribusi,
    },

    mudamudiStats: {
      total: totalMudamudi,
      lakiLaki: mudamudiLaki,
      perempuan: mudamudiPerempuan,
      kelompokDistribusi: mudamudiKelompokDistribusi,
      kelasDistribusi: mudamudiKelasDistribusi,
    },

    // Legacy fields for backward compatibility
    totalAnggota: totalMudamudi,
    kelompokDistribusi: mudamudiKelompokDistribusi,
    kelasDistribusi: mudamudiKelasDistribusi,
    genderDistribusi: {
      lakiLaki: mudamudiLaki,
      perempuan: mudamudiPerempuan,
    },

    kegiatanTerdekat,
    statusDistribusi,
    presensiTerbaru,
    error: queryError,
  };
}
