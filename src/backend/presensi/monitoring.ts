"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { buildDateTime } from "./helpers";
import { isMudamudiTargeted, isJamaahTargeted } from "./target";

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
  jenis_peserta?: "jamaah" | "mudamudi" | null;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

type PesertaTarget = {
  id: number;
  nama: string;
  kelompok: string;
  kelas: string[];
  jenis_kelamin: string | null;
};

type PresensiRow = {
  id: number;
  kegiatan_id: number;
  mudamudi_id: number | null;
  jamaah_id: number | null;
  waktu_checkin: string | null;
  status: PresensiStatus;
  metode: PresensiMetode;
  keterangan: string | null;
};

async function createAutomaticAlpa(
  kegiatan: KegiatanMonitoring,
  peserta: PesertaTarget[],
  jenisPeserta: "jamaah" | "mudamudi",
) {
  const waktuSelesai = buildDateTime(
    kegiatan.tanggal_selesai,
    kegiatan.jam_selesai,
  );

  if (new Date() < waktuSelesai || peserta.length === 0) {
    return null;
  }

  const supabase = await createClient();

  if (jenisPeserta === "jamaah") {
    // Cek yang sudah punya presensi
    const { data: existing } = await supabase
      .from("presensi")
      .select("jamaah_id")
      .eq("kegiatan_id", kegiatan.id);

    const existingIds = new Set((existing ?? []).map((p) => p.jamaah_id));
    const belumHadir = peserta.filter((p) => !existingIds.has(p.id));

    if (belumHadir.length > 0) {
      const dataAlpa = belumHadir.map((p) => ({
        kegiatan_id: kegiatan.id,
        jamaah_id: p.id,
        mudamudi_id: null,
        waktu_checkin: null,
        status: "alpa" as PresensiStatus,
        metode: "manual" as PresensiMetode,
        keterangan: "Otomatis: tidak melakukan presensi hingga kegiatan selesai.",
      }));

      const { error } = await supabase.from("presensi").insert(dataAlpa);
      if (error && error.code !== "23505") {
        console.error("Gagal insert Alpa Jamaah otomatis:", error);
      }
    }
  } else {
    // Muda-Mudi
    const { data: existing } = await supabase
      .from("presensi")
      .select("mudamudi_id")
      .eq("kegiatan_id", kegiatan.id);

    const existingIds = new Set((existing ?? []).map((p) => p.mudamudi_id));
    const belumHadir = peserta.filter((p) => !existingIds.has(p.id));

    if (belumHadir.length > 0) {
      const dataAlpa = belumHadir.map((p) => ({
        kegiatan_id: kegiatan.id,
        mudamudi_id: p.id,
        jamaah_id: null,
        waktu_checkin: null,
        status: "alpa" as PresensiStatus,
        metode: "manual" as PresensiMetode,
        keterangan: "Otomatis: tidak melakukan presensi hingga kegiatan selesai.",
      }));

      const { error } = await supabase.from("presensi").insert(dataAlpa);
      if (error && error.code !== "23505") {
        console.error("Gagal insert Alpa Muda-Mudi otomatis:", error);
      }
    }
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

  const { data: withJenis } = await supabase
    .from("kegiatan")
    .select("jenis_peserta")
    .eq("id", kegiatanId)
    .maybeSingle();

  const jenisPeserta: "jamaah" | "mudamudi" =
    withJenis?.jenis_peserta ||
    (kegiatan.kelas && kegiatan.kelas.length > 0 ? "mudamudi" : "jamaah");

  const kegiatanMonitoring: KegiatanMonitoring = {
    ...kegiatan,
    jenis_peserta: jenisPeserta,
  };

  let pesertaSasaran: PesertaTarget[] = [];

  if (jenisPeserta === "jamaah") {
    let queryJamaah = supabase
      .from("jamaah")
      .select("id, nama, kelompok, jenis_kelamin")
      .order("nama", { ascending: true });

    if (kegiatanMonitoring.kelompok?.length) {
      queryJamaah = queryJamaah.in("kelompok", kegiatanMonitoring.kelompok);
    }

    if (kegiatanMonitoring.jenis_kelamin) {
      queryJamaah = queryJamaah.eq("jenis_kelamin", kegiatanMonitoring.jenis_kelamin);
    }

    const { data: jamaahList, error: jamaahError } = await queryJamaah;

    if (jamaahError) {
      return {
        success: false,
        error: "Gagal mengambil data Jamaah.",
      };
    }

    pesertaSasaran = ((jamaahList ?? []) as any[]).map((j) => ({
      id: j.id,
      nama: j.nama,
      kelompok: j.kelompok,
      kelas: [],
      jenis_kelamin: j.jenis_kelamin,
    })).filter((item) => isJamaahTargeted(kegiatanMonitoring, item));
  } else {
    // Muda-Mudi
    let queryMudamudi = supabase
      .from("mudamudi")
      .select("id, nama, kelompok, kelas, jenis_kelamin")
      .order("nama", { ascending: true });

    if (kegiatanMonitoring.kelompok?.length) {
      queryMudamudi = queryMudamudi.in("kelompok", kegiatanMonitoring.kelompok);
    }

    if (kegiatanMonitoring.kelas?.length) {
      queryMudamudi = queryMudamudi.overlaps("kelas", kegiatanMonitoring.kelas);
    }

    if (kegiatanMonitoring.jenis_kelamin) {
      queryMudamudi = queryMudamudi.eq("jenis_kelamin", kegiatanMonitoring.jenis_kelamin);
    }

    const { data: mudamudiList, error: mudamudiError } = await queryMudamudi;

    if (mudamudiError) {
      return {
        success: false,
        error: "Gagal mengambil data Muda-Mudi.",
      };
    }

    pesertaSasaran = ((mudamudiList ?? []) as any[]).map((m) => ({
      id: m.id,
      nama: m.nama,
      kelompok: m.kelompok,
      kelas: m.kelas || [],
      jenis_kelamin: m.jenis_kelamin,
    })).filter((item) => isMudamudiTargeted(kegiatanMonitoring, item));
  }

  // Alpa otomatis saat kegiatan sudah selesai
  await createAutomaticAlpa(kegiatanMonitoring, pesertaSasaran, jenisPeserta);

  // Ambil data presensi
  const { data: presensi, error: presensiError } = await supabase
    .from("presensi")
    .select(
      "id, kegiatan_id, mudamudi_id, jamaah_id, waktu_checkin, status, metode, keterangan",
    )
    .eq("kegiatan_id", kegiatanId);

  if (presensiError) {
    return {
      success: false,
      error: "Gagal mengambil data presensi.",
    };
  }

  const presensiMap = new Map<number, PresensiRow>();

  for (const item of (presensi ?? []) as PresensiRow[]) {
    if (jenisPeserta === "jamaah" && item.jamaah_id) {
      presensiMap.set(item.jamaah_id, item);
    } else if (jenisPeserta === "mudamudi" && item.mudamudi_id) {
      presensiMap.set(item.mudamudi_id, item);
    }
  }

  const data: MonitoringPeserta[] = pesertaSasaran.map((item) => {
    const presensiItem = presensiMap.get(item.id);

    return {
      peserta_id: item.id,
      mudamudi_id: jenisPeserta === "mudamudi" ? item.id : null,
      jamaah_id: jenisPeserta === "jamaah" ? item.id : null,
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

  const totalHadir = data.filter((item) => item.status === "hadir").length;
  const totalTerlambat = data.filter((item) => item.status === "terlambat").length;
  const totalIzin = data.filter((item) => item.status === "izin").length;
  const totalSakit = data.filter((item) => item.status === "sakit").length;
  const totalAlpa = data.filter((item) => item.status === "alpa").length;
  const totalBelumHadir = data.filter((item) => item.status === null).length;

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
