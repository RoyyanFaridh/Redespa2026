"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { isMudamudiTargeted, isJamaahTargeted } from "./target";
import type { PresensiStatus } from "./types";

type ManualPresensiInput = {
  kegiatanId: number;
  pesertaId: number;
  mudamudiId?: number; // legacy backward-compat
  status: PresensiStatus;
  keterangan?: string | null;
};

const VALID_STATUSES: PresensiStatus[] = [
  "hadir",
  "terlambat",
  "izin",
  "sakit",
  "alpa",
];

export async function createManualPresensi(input: ManualPresensiInput) {
  await requireAdmin();

  const supabase = await createClient();
  const targetPesertaId = input.pesertaId || input.mudamudiId;

  if (!Number.isInteger(input.kegiatanId) || input.kegiatanId <= 0) {
    return {
      success: false,
      error: "Kegiatan tidak valid.",
    };
  }

  if (!Number.isInteger(targetPesertaId) || targetPesertaId! <= 0) {
    return {
      success: false,
      error: "Peserta tidak valid.",
    };
  }

  if (!VALID_STATUSES.includes(input.status)) {
    return {
      success: false,
      error: "Status presensi tidak valid.",
    };
  }

  const { data: kegiatan, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .eq("id", input.kegiatanId)
    .maybeSingle();

  if (kegiatanError || !kegiatan) {
    return {
      success: false,
      error: "Kegiatan tidak ditemukan.",
    };
  }

  const { data: withJenis } = await supabase
    .from("kegiatan")
    .select("jenis_peserta")
    .eq("id", input.kegiatanId)
    .maybeSingle();

  const jenisKegiatan =
    withJenis?.jenis_peserta ||
    (kegiatan.kelas && kegiatan.kelas.length > 0 ? "mudamudi" : "jamaah");

  const waktuCheckin =
    input.status === "hadir" || input.status === "terlambat"
      ? new Date().toISOString()
      : null;

  const keterangan = input.keterangan?.trim().slice(0, 500) || null;

  if (jenisKegiatan === "jamaah") {
    const { data: jamaah, error: jamaahError } = await supabase
      .from("jamaah")
      .select("id, nama, kelompok, jenis_kelamin")
      .eq("id", targetPesertaId)
      .maybeSingle();

    if (jamaahError || !jamaah) {
      return {
        success: false,
        error: "Jamaah tidak ditemukan.",
      };
    }

    if (!isJamaahTargeted(kegiatan, jamaah)) {
      return {
        success: false,
        error: "Jamaah tidak termasuk sasaran kegiatan.",
      };
    }

    const { data: existingPresensi } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", input.kegiatanId)
      .eq("jamaah_id", targetPesertaId)
      .maybeSingle();

    if (existingPresensi) {
      return {
        success: false,
        alreadyPresent: true,
        error: "Jamaah tersebut sudah memiliki presensi pada kegiatan ini.",
      };
    }

    const { data: presensi, error: insertError } = await supabase
      .from("presensi")
      .insert({
        kegiatan_id: input.kegiatanId,
        jamaah_id: targetPesertaId,
        mudamudi_id: null,
        waktu_checkin: waktuCheckin,
        status: input.status,
        metode: "manual",
        keterangan,
      })
      .select("id, kegiatan_id, jamaah_id, waktu_checkin, status, metode, keterangan")
      .single();

    if (insertError) {
      return {
        success: false,
        error: "Presensi manual Jamaah gagal disimpan.",
      };
    }

    return {
      success: true,
      data: {
        presensiId: presensi.id,
        kegiatanId: presensi.kegiatan_id,
        pesertaId: presensi.jamaah_id,
        waktuCheckin: presensi.waktu_checkin,
        status: presensi.status as PresensiStatus,
        metode: "manual" as const,
        keterangan: presensi.keterangan,
        peserta: {
          id: jamaah.id,
          nama: jamaah.nama,
          kelompok: jamaah.kelompok,
          kelas: [],
          jenisKelamin: jamaah.jenis_kelamin,
        },
      },
    };
  } else {
    // Muda-Mudi
    const { data: mudamudi, error: mudamudiError } = await supabase
      .from("mudamudi")
      .select("id, nama, kelompok, kelas, jenis_kelamin")
      .eq("id", targetPesertaId)
      .maybeSingle();

    if (mudamudiError || !mudamudi) {
      return {
        success: false,
        error: "Muda-Mudi tidak ditemukan.",
      };
    }

    if (!isMudamudiTargeted(kegiatan, mudamudi)) {
      return {
        success: false,
        error: "Muda-Mudi tidak termasuk sasaran kegiatan.",
      };
    }

    const { data: existingPresensi } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", input.kegiatanId)
      .eq("mudamudi_id", targetPesertaId)
      .maybeSingle();

    if (existingPresensi) {
      return {
        success: false,
        alreadyPresent: true,
        error: "Muda-Mudi tersebut sudah memiliki presensi pada kegiatan ini.",
      };
    }

    const { data: presensi, error: insertError } = await supabase
      .from("presensi")
      .insert({
        kegiatan_id: input.kegiatanId,
        mudamudi_id: targetPesertaId,
        jamaah_id: null,
        waktu_checkin: waktuCheckin,
        status: input.status,
        metode: "manual",
        keterangan,
      })
      .select("id, kegiatan_id, mudamudi_id, waktu_checkin, status, metode, keterangan")
      .single();

    if (insertError) {
      return {
        success: false,
        error: "Presensi manual Muda-Mudi gagal disimpan.",
      };
    }

    return {
      success: true,
      data: {
        presensiId: presensi.id,
        kegiatanId: presensi.kegiatan_id,
        pesertaId: presensi.mudamudi_id,
        mudamudiId: presensi.mudamudi_id,
        waktuCheckin: presensi.waktu_checkin,
        status: presensi.status as PresensiStatus,
        metode: "manual" as const,
        keterangan: presensi.keterangan,
        peserta: {
          id: mudamudi.id,
          nama: mudamudi.nama,
          kelompok: mudamudi.kelompok,
          kelas: mudamudi.kelas,
          jenisKelamin: mudamudi.jenis_kelamin,
        },
      },
    };
  }
}
