
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { buildDateTime } from "./helpers";
import { isMudamudiTargeted } from "./target";

import type {
  MonitoringPresensi,
  MonitoringPeserta,
  PresensiStatus,
  PresensiMetode,
} from "./types";

type KegiatanMonitoring = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

type MudamudiMonitoring = {
  id: number;
  nama: string;
  kelompok: string;
  kelas: string[];
  jenis_kelamin: string | null;
};

type PresensiMonitoring = {
  id: number;
  kegiatan_id: number;
  mudamudi_id: number;
  waktu_checkin: string | null;
  status: PresensiStatus;
  metode: PresensiMetode;
  keterangan: string | null;
};

async function createAutomaticAlpa(
  kegiatan: KegiatanMonitoring,
  peserta: MudamudiMonitoring[],
) {
  const waktuSelesai = buildDateTime(
    kegiatan.tanggal_selesai,
    kegiatan.jam_selesai,
  );

  if (new Date() < waktuSelesai || peserta.length === 0) {
    return null;
  }

  const supabase = await createClient();

  const dataAlpa = peserta.map((item) => ({
    kegiatan_id: kegiatan.id,
    mudamudi_id: item.id,
    waktu_checkin: null,
    status: "alpa" as PresensiStatus,
    metode: "manual" as PresensiMetode,
    keterangan:
      "Otomatis: tidak melakukan presensi hingga kegiatan selesai.",
  }));

  const { error } = await supabase
    .from("presensi")
    .upsert(dataAlpa, {
      onConflict: "kegiatan_id,mudamudi_id",
      ignoreDuplicates: true,
    });

  if (error) {
    console.error("Gagal membuat Alpa otomatis:", error);
    return "Gagal memperbarui status Alpa otomatis.";
  }

  return null;
}

export async function getMonitoringPresensi(
  kegiatanId: number,
): Promise<{
  success: boolean;
  data?: MonitoringPresensi;
  error?: string;
}> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: kegiatan, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .eq("id", kegiatanId)
    .single();

  if (kegiatanError || !kegiatan) {
    return {
      success: false,
      error: "Data kegiatan tidak ditemukan.",
    };
  }

  const kegiatanMonitoring = kegiatan as KegiatanMonitoring;

  let queryMudamudi = supabase
    .from("mudamudi")
    .select("id, nama, kelompok, kelas, jenis_kelamin")
    .order("nama", { ascending: true });

  if (kegiatanMonitoring.kelompok?.length) {
    queryMudamudi = queryMudamudi.in(
      "kelompok",
      kegiatanMonitoring.kelompok,
    );
  }

  if (kegiatanMonitoring.kelas?.length) {
    queryMudamudi = queryMudamudi.overlaps(
      "kelas",
      kegiatanMonitoring.kelas,
    );
  }

  if (kegiatanMonitoring.jenis_kelamin) {
    queryMudamudi = queryMudamudi.eq(
      "jenis_kelamin",
      kegiatanMonitoring.jenis_kelamin,
    );
  }

  const { data: mudamudi, error: mudamudiError } =
    await queryMudamudi;

  if (mudamudiError) {
    return {
      success: false,
      error: "Gagal mengambil data Muda-Mudi.",
    };
  }

  const mudamudiSasaran = (
    (mudamudi ?? []) as MudamudiMonitoring[]
  ).filter((item) =>
    isMudamudiTargeted(kegiatanMonitoring, item),
  );

  const alpaError = await createAutomaticAlpa(
    kegiatanMonitoring,
    mudamudiSasaran,
  );

  if (alpaError) {
    return {
      success: false,
      error: alpaError,
    };
  }

  const { data: presensi, error: presensiError } = await supabase
    .from("presensi")
    .select(
      "id, kegiatan_id, mudamudi_id, waktu_checkin, status, metode, keterangan",
    )
    .eq("kegiatan_id", kegiatanId);

  if (presensiError) {
    return {
      success: false,
      error: "Gagal mengambil data presensi.",
    };
  }

  const presensiMap = new Map<number, PresensiMonitoring>();

  for (const item of (presensi ?? []) as PresensiMonitoring[]) {
    presensiMap.set(item.mudamudi_id, item);
  }

  const data: MonitoringPeserta[] = mudamudiSasaran.map((item) => {
    const presensiItem = presensiMap.get(item.id);

    return {
      mudamudi_id: item.id,
      nama: item.nama,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
      presensi_id: presensiItem?.id ?? null,
      status: presensiItem?.status ?? null,
      waktu_checkin: presensiItem?.waktu_checkin ?? null,
      metode: presensiItem?.metode ?? null,
      keterangan: presensiItem?.keterangan ?? null,
    };
  });

  const totalHadir = data.filter(
    (item) => item.status === "hadir",
  ).length;

  const totalTerlambat = data.filter(
    (item) => item.status === "terlambat",
  ).length;

  const totalIzin = data.filter(
    (item) => item.status === "izin",
  ).length;

  const totalSakit = data.filter(
    (item) => item.status === "sakit",
  ).length;

  const totalAlpa = data.filter(
    (item) => item.status === "alpa",
  ).length;

  const totalBelumHadir = data.filter(
    (item) => item.status === null,
  ).length;

  return {
    success: true,
    data: {
      kegiatan: kegiatanMonitoring,
      peserta: data,
      totalPeserta: data.length,
      totalHadir,
      totalTerlambat,
      totalIzin,
      totalSakit,
      totalAlpa,
      totalBelumHadir,
    },
  };
}
