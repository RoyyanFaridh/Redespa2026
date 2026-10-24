"use server";

import { requireAdmin } from "../auth/admin";
import { createAdminClient } from "../supabase/admin";

import { isMudamudiTargeted } from "./target";

import type { PresensiStatus } from "./types";

type UpdatePresensiStatusInput = {
  presensiId: number | null;
  kegiatanId: number;
  mudamudiId: number;
  status: PresensiStatus;
  keterangan?: string | null;
};

type PresensiRow = {
  id: number;
  kegiatan_id: number;
  mudamudi_id: number;
  waktu_checkin: string | null;
  status: string;
  metode: string;
  keterangan: string | null;
};

const VALID_STATUSES: PresensiStatus[] = [
  "hadir",
  "terlambat",
  "izin",
  "sakit",
  "alpa",
];

function getWaktuCheckin(status: PresensiStatus) {
  if (status === "izin" || status === "sakit" || status === "alpa") {
    return null;
  }

  return new Date().toISOString();
}

function normalizeKeterangan(keterangan?: string | null) {
  const value = keterangan?.trim() || null;

  return value ? value.slice(0, 500) : null;
}

function successResult(presensi: PresensiRow) {
  return {
    success: true as const,
    data: {
      presensiId: presensi.id,
      kegiatanId: presensi.kegiatan_id,
      mudamudiId: presensi.mudamudi_id,
      waktuCheckin: presensi.waktu_checkin,
      status: presensi.status as PresensiStatus,
      metode: presensi.metode as "qr" | "manual",
      keterangan: presensi.keterangan,
    },
  };
}

function errorResult(error: string) {
  return {
    success: false as const,
    error,
  };
}

async function validateTarget(
  supabase: ReturnType<typeof createAdminClient>,
  kegiatanId: number,
  mudamudiId: number,
) {
  const { data: kegiatan, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select("id, kelas, jenis_kelamin")
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError) {
    console.error("Gagal mengambil sasaran kegiatan:", kegiatanError);

    return {
      valid: false as const,
      error: "Gagal memeriksa sasaran kegiatan.",
    };
  }

  if (!kegiatan) {
    return {
      valid: false as const,
      error: "Kegiatan tidak ditemukan.",
    };
  }

  const { data: mudamudi, error: mudamudiError } = await supabase
    .from("mudamudi")
    .select("id, kelas, jenis_kelamin")
    .eq("id", mudamudiId)
    .maybeSingle();

  if (mudamudiError) {
    console.error("Gagal mengambil data Muda-Mudi:", mudamudiError);

    return {
      valid: false as const,
      error: "Gagal memeriksa data Muda-Mudi.",
    };
  }

  if (!mudamudi) {
    return {
      valid: false as const,
      error: "Muda-Mudi tidak ditemukan.",
    };
  }

  if (!isMudamudiTargeted(kegiatan, mudamudi)) {
    return {
      valid: false as const,
      error: "Muda-Mudi tidak termasuk sasaran kegiatan.",
    };
  }

  return {
    valid: true as const,
  };
}

export async function updatePresensiStatus(
  input: UpdatePresensiStatusInput,
) {
  // Pastikan pengguna terautentikasi dan memiliki hak admin.
  await requireAdmin();

  const supabase = createAdminClient();

  // 1. Validasi input.
  if (
    input.presensiId !== null &&
    (!Number.isInteger(input.presensiId) || input.presensiId <= 0)
  ) {
    return errorResult("Presensi tidak valid.");
  }

  if (!Number.isInteger(input.kegiatanId) || input.kegiatanId <= 0) {
    return errorResult("Kegiatan tidak valid.");
  }

  if (!Number.isInteger(input.mudamudiId) || input.mudamudiId <= 0) {
    return errorResult("Muda-Mudi tidak valid.");
  }

  if (!VALID_STATUSES.includes(input.status)) {
    return errorResult("Status presensi tidak valid.");
  }

  // 2. Pastikan kegiatan dan peserta valid serta peserta termasuk sasaran.
  const targetValidation = await validateTarget(
    supabase,
    input.kegiatanId,
    input.mudamudiId,
  );

  if (!targetValidation.valid) {
    return errorResult(targetValidation.error);
  }

  const keterangan = normalizeKeterangan(input.keterangan);

  /*
   * 3. Cari presensi yang sudah ada.
   *
   * Prioritas:
   * - Cari berdasarkan presensiId jika tersedia.
   * - Jika ID tidak ditemukan, cari berdasarkan kegiatanId + mudamudiId.
   * - Jika ditemukan berdasarkan ID tetapi milik peserta/kegiatan lain,
   *   hentikan proses untuk mencegah perubahan data yang salah.
   */
  let existingPresensi: PresensiRow | null = null;

  if (input.presensiId !== null) {
    const { data, error } = await supabase
      .from("presensi")
      .select(
        `
          id,
          kegiatan_id,
          mudamudi_id,
          waktu_checkin,
          status,
          metode,
          keterangan
        `,
      )
      .eq("id", input.presensiId)
      .maybeSingle();

    if (error) {
      console.error("Gagal memeriksa presensi berdasarkan ID:", error);

      return errorResult("Gagal memeriksa data presensi.");
    }

    if (data) {
      if (
        data.kegiatan_id !== input.kegiatanId ||
        data.mudamudi_id !== input.mudamudiId
      ) {
        return errorResult(
          "Data presensi tidak sesuai dengan peserta atau kegiatan.",
        );
      }

      existingPresensi = data as PresensiRow;
    }
  }

  // Fallback untuk ID yang sudah tidak ditemukan atau tidak dikirim.
  if (!existingPresensi) {
    const { data, error } = await supabase
      .from("presensi")
      .select(
        `
          id,
          kegiatan_id,
          mudamudi_id,
          waktu_checkin,
          status,
          metode,
          keterangan
        `,
      )
      .eq("kegiatan_id", input.kegiatanId)
      .eq("mudamudi_id", input.mudamudiId)
      .maybeSingle();

    if (error) {
      console.error("Gagal memeriksa presensi peserta:", error);

      return errorResult("Gagal memeriksa data presensi peserta.");
    }

    if (data) {
      existingPresensi = data as PresensiRow;
    }
  }

  /*
   * 4. Jika presensi sudah ada, perbarui status dan keterangan.
   *
   * waktu_checkin dan metode dipertahankan agar perubahan status
   * tidak mengubah riwayat waktu maupun metode pencatatan sebelumnya.
   */
  if (existingPresensi) {
    const { data: updatedPresensi, error: updateError } = await supabase
      .from("presensi")
      .update({
        status: input.status,
        keterangan,
      })
      .eq("id", existingPresensi.id)
      .eq("kegiatan_id", input.kegiatanId)
      .eq("mudamudi_id", input.mudamudiId)
      .select(
        `
          id,
          kegiatan_id,
          mudamudi_id,
          waktu_checkin,
          status,
          metode,
          keterangan
        `,
      )
      .maybeSingle();

    if (updateError) {
      console.error("Gagal memperbarui presensi:", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      });

      return errorResult("Status dan keterangan gagal diperbarui.");
    }

    if (!updatedPresensi) {
      return errorResult(
        "Data presensi tidak ditemukan saat proses pembaruan.",
      );
    }

    return successResult(updatedPresensi as PresensiRow);
  }

  /*
   * 5. Jika belum ada presensi, buat presensi manual.
   */
  const waktuCheckin = getWaktuCheckin(input.status);

  const { data: newPresensi, error: insertError } = await supabase
    .from("presensi")
    .insert({
      kegiatan_id: input.kegiatanId,
      mudamudi_id: input.mudamudiId,
      waktu_checkin: waktuCheckin,
      status: input.status,
      metode: "manual",
      keterangan,
    })
    .select(
      `
        id,
        kegiatan_id,
        mudamudi_id,
        waktu_checkin,
        status,
        metode,
        keterangan
      `,
    )
    .maybeSingle();

  if (insertError) {
    console.error("Gagal membuat presensi manual:", {
      code: insertError.code,
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
    });

    /*
     * Jika terjadi konflik karena presensi dibuat bersamaan,
     * ambil data yang sudah ada lalu perbarui statusnya.
     */
    if (insertError.code === "23505") {
      const { data: concurrentPresensi, error: concurrentError } =
        await supabase
          .from("presensi")
          .select(
            `
              id,
              kegiatan_id,
              mudamudi_id,
              waktu_checkin,
              status,
              metode,
              keterangan
            `,
          )
          .eq("kegiatan_id", input.kegiatanId)
          .eq("mudamudi_id", input.mudamudiId)
          .maybeSingle();

      if (concurrentError) {
        console.error(
          "Gagal mengambil presensi setelah konflik:",
          concurrentError,
        );

        return errorResult(
          "Presensi mengalami konflik. Silakan muat ulang data dan coba lagi.",
        );
      }

      if (!concurrentPresensi) {
        return errorResult(
          "Presensi mengalami konflik. Silakan muat ulang data dan coba lagi.",
        );
      }

      const { data: updatedPresensi, error: updateError } = await supabase
        .from("presensi")
        .update({
          status: input.status,
          keterangan,
        })
        .eq("id", concurrentPresensi.id)
        .eq("kegiatan_id", input.kegiatanId)
        .eq("mudamudi_id", input.mudamudiId)
        .select(
          `
            id,
            kegiatan_id,
            mudamudi_id,
            waktu_checkin,
            status,
            metode,
            keterangan
          `,
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "Gagal memperbarui presensi setelah konflik:",
          updateError,
        );

        return errorResult("Status dan keterangan gagal diperbarui.");
      }

      if (!updatedPresensi) {
        return errorResult(
          "Presensi tidak berhasil diperbarui setelah konflik.",
        );
      }

      return successResult(updatedPresensi as PresensiRow);
    }

    return errorResult(
      "Presensi manual gagal dibuat. Periksa log server untuk detail kesalahan.",
    );
  }

  if (!newPresensi) {
    return errorResult("Presensi manual gagal dibuat.");
  }

  return successResult(newPresensi as PresensiRow);
}