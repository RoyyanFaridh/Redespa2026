
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import type { PresensiStatus } from "./types";

type ManualPresensiInput = {
  kegiatanId: number;
  pesertaId: number;
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

function normalizeKeterangan(value?: string | null): string | null {
  const result = value?.trim() || null;
  return result ? result.slice(0, 500) : null;
}

export async function createManualPresensi(
  input: ManualPresensiInput,
) {
  await requireAdmin();

  const supabase = await createClient();

  const pesertaId = input.pesertaId || input.mudamudiId;

  if (!Number.isInteger(input.kegiatanId) || input.kegiatanId <= 0) {
    return {
      success: false,
      error: "Kegiatan tidak valid.",
    };
  }

  if (!Number.isInteger(pesertaId) || pesertaId! <= 0) {
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
    .select("id, nama, jenis_peserta, deleted_at")
    .eq("id", input.kegiatanId)
    .maybeSingle();

  if (kegiatanError || !kegiatan) {
    return {
      success: false,
      error: "Kegiatan tidak ditemukan.",
    };
  }

  if (kegiatan.deleted_at) {
    return {
      success: false,
      error: "Kegiatan sudah dihapus dan tidak menerima presensi baru.",
    };
  }

  const jenisPeserta = kegiatan.jenis_peserta as
    | "jamaah"
    | "mudamudi"
    | null;

  if (!jenisPeserta) {
    return {
      success: false,
      error: "Jenis peserta kegiatan belum ditentukan.",
    };
  }

  const keterangan = normalizeKeterangan(input.keterangan);

  const waktuCheckin =
    input.status === "hadir" || input.status === "terlambat"
      ? new Date().toISOString()
      : null;

  const { data: snapshot, error: snapshotError } = await supabase
    .from("kegiatan_peserta")
    .select(
      "id, kegiatan_id, jenis_peserta, jamaah_id, mudamudi_id, qr_id_snapshot, nama_snapshot, kelompok_snapshot, kelas_snapshot, jenis_kelamin_snapshot, is_target",
    )
    .eq("kegiatan_id", input.kegiatanId)
    .eq("jenis_peserta", jenisPeserta)
    .eq(
      jenisPeserta === "mudamudi" ? "mudamudi_id" : "jamaah_id",
      pesertaId,
    )
    .eq("is_target", true)
    .maybeSingle();

  if (snapshotError) {
    return {
      success: false,
      error: "Gagal memeriksa snapshot peserta kegiatan.",
    };
  }

  if (!snapshot) {
    return {
      success: false,
      error:
        "Peserta tidak tercatat sebagai sasaran kegiatan. Periksa snapshot kegiatan terlebih dahulu.",
    };
  }

  if (jenisPeserta === "jamaah") {
    const { data: jamaah, error: jamaahError } = await supabase
      .from("jamaah")
      .select("id, nama, kelompok, jenis_kelamin, deleted_at")
      .eq("id", pesertaId)
      .maybeSingle();

    if (jamaahError || !jamaah || jamaah.deleted_at) {
      return {
        success: false,
        error: "Jamaah tidak ditemukan atau sudah dihapus.",
      };
    }

    const { data: existing, error: existingError } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", input.kegiatanId)
      .eq("jamaah_id", pesertaId)
      .maybeSingle();

    if (existingError) {
      return {
        success: false,
        error: "Gagal memeriksa presensi sebelumnya.",
      };
    }

    if (existing) {
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
        jamaah_id: pesertaId,
        mudamudi_id: null,
        waktu_checkin: waktuCheckin,
        status: input.status,
        metode: "manual",
        keterangan,
      })
      .select(
        "id, kegiatan_id, jamaah_id, mudamudi_id, waktu_checkin, status, metode, keterangan",
      )
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
        jamaahId: presensi.jamaah_id,
        mudamudiId: null,
        waktuCheckin: presensi.waktu_checkin,
        status: presensi.status as PresensiStatus,
        metode: "manual" as const,
        keterangan: presensi.keterangan,
        peserta: {
          id: snapshot.jamaah_id!,
          nama: snapshot.nama_snapshot ?? jamaah.nama,
          kelompok: snapshot.kelompok_snapshot ?? jamaah.kelompok,
          kelas: snapshot.kelas_snapshot ?? [],
          jenisKelamin:
            snapshot.jenis_kelamin_snapshot ?? jamaah.jenis_kelamin,
        },
      },
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select("id, nama, kelompok, kelas, jenis_kelamin, deleted_at")
    .eq("id", pesertaId)
    .maybeSingle();

  if (mudamudiError || !mudamudi || mudamudi.deleted_at) {
    return {
      success: false,
      error: "Muda-Mudi tidak ditemukan atau sudah dihapus.",
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from("presensi")
    .select("id")
    .eq("kegiatan_id", input.kegiatanId)
    .eq("mudamudi_id", pesertaId)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      error: "Gagal memeriksa presensi sebelumnya.",
    };
  }

  if (existing) {
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
      mudamudi_id: pesertaId,
      jamaah_id: snapshot.jamaah_id ?? null,
      waktu_checkin: waktuCheckin,
      status: input.status,
      metode: "manual",
      keterangan,
    })
    .select(
      "id, kegiatan_id, jamaah_id, mudamudi_id, waktu_checkin, status, metode, keterangan",
    )
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
        id: snapshot.mudamudi_id!,
        nama: snapshot.nama_snapshot ?? mudamudi.nama,
        kelompok: snapshot.kelompok_snapshot ?? mudamudi.kelompok,
        kelas: snapshot.kelas_snapshot ?? mudamudi.kelas ?? [],
        jenisKelamin:
          snapshot.jenis_kelamin_snapshot ?? mudamudi.jenis_kelamin,
      },
    },
  };
}
