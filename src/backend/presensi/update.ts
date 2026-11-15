"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { isMudamudiTargeted, isJamaahTargeted } from "./target";
import type { PresensiStatus } from "./types";

type UpdatePresensiStatusInput = {
  presensiId: number | null;
  kegiatanId: number;
  pesertaId?: number;
  mudamudiId?: number; // backward compatibility
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

function normalizeKeterangan(keterangan?: string | null): string | null {
  const value = keterangan?.trim() || null;
  return value ? value.slice(0, 500) : null;
}

function getWaktuCheckin(
  status: PresensiStatus,
  existingStatus?: PresensiStatus,
  existingWaktu?: string | null,
): string | null {
  if (status !== "hadir" && status !== "terlambat") {
    return null;
  }

  if (
    (existingStatus === "hadir" || existingStatus === "terlambat") &&
    existingWaktu
  ) {
    return existingWaktu;
  }

  return new Date().toISOString();
}

export async function updatePresensiStatus(input: UpdatePresensiStatusInput) {
  await requireAdmin();

  const supabase = await createClient();
  const targetPesertaId = input.pesertaId || input.mudamudiId;

  if (
    input.presensiId !== null &&
    (!Number.isInteger(input.presensiId) || input.presensiId <= 0)
  ) {
    return {
      success: false,
      error: "Presensi tidak valid.",
    };
  }

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
    .select("id, kelompok, kelas, jenis_kelamin")
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

  const keterangan = normalizeKeterangan(input.keterangan);

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

    if (input.presensiId !== null) {
      const { data: existing } = await supabase
        .from("presensi")
        .select("id, status, waktu_checkin")
        .eq("id", input.presensiId)
        .maybeSingle();

      const waktuCheckin = getWaktuCheckin(
        input.status,
        existing?.status as PresensiStatus,
        existing?.waktu_checkin,
      );

      const { data: updated, error: updateError } = await supabase
        .from("presensi")
        .update({
          status: input.status,
          waktu_checkin: waktuCheckin,
          keterangan,
        })
        .eq("id", input.presensiId)
        .select()
        .single();

      if (updateError) {
        return { success: false, error: "Gagal memperbarui status presensi." };
      }

      return {
        success: true,
        data: {
          presensiId: updated.id,
          kegiatanId: updated.kegiatan_id,
          pesertaId: updated.jamaah_id,
          mudamudiId: updated.jamaah_id,
          status: updated.status,
          waktuCheckin: updated.waktu_checkin,
          metode: updated.metode || "manual",
          keterangan: updated.keterangan,
        },
      };
    } else {
      // Insert baru jika belum ada record presensi
      const waktuCheckin = getWaktuCheckin(input.status);

      const { data: inserted, error: insertError } = await supabase
        .from("presensi")
        .insert({
          kegiatan_id: input.kegiatanId,
          jamaah_id: targetPesertaId,
          mudamudi_id: null,
          status: input.status,
          metode: "manual",
          waktu_checkin: waktuCheckin,
          keterangan,
        })
        .select()
        .single();

      if (insertError) {
        return { success: false, error: "Gagal menyimpan status presensi." };
      }

      return {
        success: true,
        data: {
          presensiId: inserted.id,
          kegiatanId: inserted.kegiatan_id,
          pesertaId: inserted.jamaah_id,
          mudamudiId: inserted.jamaah_id,
          status: inserted.status,
          waktuCheckin: inserted.waktu_checkin,
          metode: inserted.metode || "manual",
          keterangan: inserted.keterangan,
        },
      };
    }
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

    if (input.presensiId !== null) {
      const { data: existing } = await supabase
        .from("presensi")
        .select("id, status, waktu_checkin")
        .eq("id", input.presensiId)
        .maybeSingle();

      const waktuCheckin = getWaktuCheckin(
        input.status,
        existing?.status as PresensiStatus,
        existing?.waktu_checkin,
      );

      const { data: updated, error: updateError } = await supabase
        .from("presensi")
        .update({
          status: input.status,
          waktu_checkin: waktuCheckin,
          keterangan,
        })
        .eq("id", input.presensiId)
        .select()
        .single();

      if (updateError) {
        return { success: false, error: "Gagal memperbarui status presensi." };
      }

      return {
        success: true,
        data: {
          presensiId: updated.id,
          kegiatanId: updated.kegiatan_id,
          pesertaId: updated.mudamudi_id,
          mudamudiId: updated.mudamudi_id,
          status: updated.status,
          waktuCheckin: updated.waktu_checkin,
          metode: updated.metode || "manual",
          keterangan: updated.keterangan,
        },
      };
    } else {
      const waktuCheckin = getWaktuCheckin(input.status);

      const { data: inserted, error: insertError } = await supabase
        .from("presensi")
        .insert({
          kegiatan_id: input.kegiatanId,
          mudamudi_id: targetPesertaId,
          jamaah_id: null,
          status: input.status,
          metode: "manual",
          waktu_checkin: waktuCheckin,
          keterangan,
        })
        .select()
        .single();

      if (insertError) {
        return { success: false, error: "Gagal menyimpan status presensi." };
      }

      return {
        success: true,
        data: {
          presensiId: inserted.id,
          kegiatanId: inserted.kegiatan_id,
          pesertaId: inserted.mudamudi_id,
          mudamudiId: inserted.mudamudi_id,
          status: inserted.status,
          waktuCheckin: inserted.waktu_checkin,
          metode: inserted.metode || "manual",
          keterangan: inserted.keterangan,
        },
      };
    }
  }
}
