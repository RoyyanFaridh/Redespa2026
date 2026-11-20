
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { createManualPresensi } from "./manual";
import type { PresensiStatus } from "./types";

type UpdatePresensiStatusInput = {
  presensiId: number | null;
  kegiatanId: number;
  pesertaId?: number;
  mudamudiId?: number;
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

function normalizeKeterangan(
  value?: string | null,
): string | null {
  const result = value?.trim() || null;
  return result ? result.slice(0, 500) : null;
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
    (existingStatus === "hadir" ||
      existingStatus === "terlambat") &&
    existingWaktu
  ) {
    return existingWaktu;
  }

  return new Date().toISOString();
}

export async function updatePresensiStatus(
  input: UpdatePresensiStatusInput,
) {
  await requireAdmin();

  const supabase = await createClient();

  if (
    !Number.isInteger(input.kegiatanId) ||
    input.kegiatanId <= 0
  ) {
    return {
      success: false,
      error: "Kegiatan tidak valid.",
    };
  }

  if (!VALID_STATUSES.includes(input.status)) {
    return {
      success: false,
      error: "Status presensi tidak valid.",
    };
  }

  if (
    input.presensiId !== null &&
    (!Number.isInteger(input.presensiId) ||
      input.presensiId <= 0)
  ) {
    return {
      success: false,
      error: "Presensi tidak valid.",
    };
  }

  if (input.presensiId === null) {
    const pesertaId = input.pesertaId ?? input.mudamudiId ?? 0;

    if (!Number.isInteger(pesertaId) || pesertaId <= 0) {
      return {
        success: false,
        error: "Peserta tidak valid.",
      };
    }

    return createManualPresensi({
      kegiatanId: input.kegiatanId,
      pesertaId,
      mudamudiId: input.mudamudiId,
      status: input.status,
      keterangan: input.keterangan,
    });
  }

  const { data: existing, error: existingError } = await supabase
    .from("presensi")
    .select(
      "id, kegiatan_id, jamaah_id, mudamudi_id, status, waktu_checkin",
    )
    .eq("id", input.presensiId)
    .eq("kegiatan_id", input.kegiatanId)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      error: "Gagal mengambil data presensi.",
    };
  }

  if (!existing) {
    return {
      success: false,
      error: "Data presensi tidak ditemukan pada kegiatan tersebut.",
    };
  }

  const waktuCheckin = getWaktuCheckin(
    input.status,
    existing.status as PresensiStatus,
    existing.waktu_checkin,
  );

  const keterangan = normalizeKeterangan(input.keterangan);

  const { data: updated, error: updateError } = await supabase
    .from("presensi")
    .update({
      status: input.status,
      waktu_checkin: waktuCheckin,
      keterangan,
    })
    .eq("id", input.presensiId)
    .eq("kegiatan_id", input.kegiatanId)
    .select(
      "id, kegiatan_id, jamaah_id, mudamudi_id, status, waktu_checkin, metode, keterangan",
    )
    .maybeSingle();

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Gagal memperbarui status presensi.",
    };
  }

  if (!updated) {
    return {
      success: false,
      error: "Status presensi tidak berhasil diperbarui.",
    };
  }

  return {
    success: true,
    data: {
      presensiId: updated.id,
      kegiatanId: updated.kegiatan_id,
      pesertaId: updated.mudamudi_id ?? updated.jamaah_id,
      mudamudiId: updated.mudamudi_id,
      jamaahId: updated.jamaah_id,
      status: updated.status as PresensiStatus,
      waktuCheckin: updated.waktu_checkin,
      metode: updated.metode || "manual",
      keterangan: updated.keterangan,
    },
  };
}
