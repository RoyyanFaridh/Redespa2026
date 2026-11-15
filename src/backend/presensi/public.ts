"use server";

import { createAdminClient } from "../supabase/admin";
import { requireAdmin } from "../auth/admin";
import { isKegiatanAktif, buildDateTime } from "./helpers";
import { isMudamudiTargeted, isJamaahTargeted } from "./target";
import type { PresensiStatus, PresensiMetode } from "./types";

const HADIR_TOLERANCE_MINUTES = 10;
const MUDA_MUDI_QR_PREFIXES = ["SIKEMA:MUDA_MUDI:", "KMM_PANDAK:MUDA_MUDI:"];
const JAMAAH_QR_PREFIXES = ["SIKEMA:JAMAAH:", "KMM_PANDAK:JAMAAH:"];

type Kegiatan = {
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

type PesertaInfo = {
  id: number;
  nama: string;
  kelompok: string | null;
  kelas: string[];
  jenis_kelamin: string | null;
  tahun_lahir: number | null;
};

export type ScanQRResult =
  | {
      success: true;
      type: "success";
      message: string;
      presensiId: number;
      waktuCheckin: string;
      status: PresensiStatus;
      metode: PresensiMetode;
      kegiatan: Kegiatan;
      peserta: PesertaInfo;
      mudamudi?: PesertaInfo; // backward compat
    }
  | {
      success: false;
      type:
        | "invalid_qr"
        | "qr_mismatch"
        | "peserta_not_found"
        | "mudamudi_not_found"
        | "kegiatan_not_found"
        | "kegiatan_inactive"
        | "not_target"
        | "already_present"
        | "not_authorized"
        | "database_error";
      message: string;
      peserta?: PesertaInfo;
      mudamudi?: PesertaInfo;
      kegiatan?: Kegiatan;
    };

export type ScanMudamudiQRResult = ScanQRResult;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseQR(qrText: string): { type: "mudamudi" | "jamaah" | "unknown"; qrId: string | null } {
  const value = qrText.trim();

  for (const prefix of MUDA_MUDI_QR_PREFIXES) {
    if (value.startsWith(prefix)) {
      const qrId = value.slice(prefix.length).trim();
      return { type: UUID_REGEX.test(qrId) ? "mudamudi" : "unknown", qrId };
    }
  }

  for (const prefix of JAMAAH_QR_PREFIXES) {
    if (value.startsWith(prefix)) {
      const qrId = value.slice(prefix.length).trim();
      return { type: UUID_REGEX.test(qrId) ? "jamaah" : "unknown", qrId };
    }
  }

  return { type: "unknown", qrId: null };
}

function determinePresensiStatus(
  tanggalMulai: string,
  jamMulai: string,
  waktuCheckin: Date,
): PresensiStatus {
  const waktuMulai = buildDateTime(tanggalMulai, jamMulai);
  const batasHadir = new Date(
    waktuMulai.getTime() + HADIR_TOLERANCE_MINUTES * 60 * 1000,
  );

  return waktuCheckin.getTime() <= batasHadir.getTime()
    ? "hadir"
    : "terlambat";
}

export async function getKegiatanById(
  kegiatanId: number,
): Promise<Kegiatan | null> {
  await requireAdmin();

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return null;
  }

  const supabase = createAdminClient();

  // Ambil data kegiatan
  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Coba ambil jenis_peserta
  const { data: withJenis } = await supabase
    .from("kegiatan")
    .select("jenis_peserta")
    .eq("id", kegiatanId)
    .maybeSingle();

  const jenisPeserta = withJenis?.jenis_peserta ?? null;

  return {
    ...data,
    jenis_peserta: jenisPeserta,
  } as Kegiatan;
}

export async function scanQR(
  qrText: string,
  kegiatanId: number,
): Promise<ScanQRResult> {
  await requireAdmin();

  if (typeof qrText !== "string" || !qrText.trim()) {
    return {
      success: false,
      type: "invalid_qr",
      message: "QR Code tidak terbaca.",
    };
  }

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return {
      success: false,
      type: "kegiatan_not_found",
      message: "Kegiatan tidak valid.",
    };
  }

  const kegiatan = await getKegiatanById(kegiatanId);

  if (!kegiatan) {
    return {
      success: false,
      type: "kegiatan_not_found",
      message: "Kegiatan tidak ditemukan.",
    };
  }

  const { type: qrType, qrId } = parseQR(qrText);

  if (!qrId || qrType === "unknown") {
    return {
      success: false,
      type: "invalid_qr",
      message: "Format QR Code tidak dikenali oleh sistem REDESPA.",
      kegiatan,
    };
  }

  const jenisKegiatan = kegiatan.jenis_peserta || "mudamudi";

  // Validasi kecocokan jenis QR dengan jenis kegiatan
  if (jenisKegiatan === "jamaah" && qrType !== "jamaah") {
    return {
      success: false,
      type: "qr_mismatch",
      message: "QR Code ini merupakan QR Muda-Mudi. Kegiatan ini menggunakan sasaran Jamaah.",
      kegiatan,
    };
  }

  if (jenisKegiatan === "mudamudi" && qrType !== "mudamudi") {
    return {
      success: false,
      type: "qr_mismatch",
      message: "QR Code ini merupakan QR Jamaah. Kegiatan ini menggunakan sasaran Muda-Mudi.",
      kegiatan,
    };
  }

  const supabase = createAdminClient();

  if (
    !isKegiatanAktif(
      kegiatan.tanggal_mulai,
      kegiatan.tanggal_selesai,
      kegiatan.jam_mulai,
      kegiatan.jam_selesai,
    )
  ) {
    return {
      success: false,
      type: "kegiatan_inactive",
      message: "Kegiatan belum dimulai atau sudah selesai.",
      kegiatan,
    };
  }

  // Proses pencarian dan presensi sesuai jenis kegiatan
  if (jenisKegiatan === "jamaah") {
    const { data: jamaahData, error: jamaahError } = await supabase
      .from("jamaah")
      .select("id, nama, kelompok, jenis_kelamin, tahun_lahir")
      .eq("qr_id", qrId)
      .maybeSingle();

    if (jamaahError || !jamaahData) {
      return {
        success: false,
        type: "peserta_not_found",
        message: "QR Code tidak terdaftar pada data Jamaah.",
        kegiatan,
      };
    }

    const peserta: PesertaInfo = {
      id: jamaahData.id,
      nama: jamaahData.nama,
      kelompok: jamaahData.kelompok,
      kelas: [],
      jenis_kelamin: jamaahData.jenis_kelamin,
      tahun_lahir: jamaahData.tahun_lahir,
    };

    if (!isJamaahTargeted(kegiatan, peserta)) {
      return {
        success: false,
        type: "not_target",
        message: "Jamaah tidak termasuk sasaran kegiatan ini.",
        kegiatan,
        peserta,
      };
    }

    // Cek duplikasi presensi jamaah_id
    const { data: existing } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", kegiatanId)
      .eq("jamaah_id", peserta.id)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        type: "already_present",
        message: `${peserta.nama} sudah melakukan presensi.`,
        kegiatan,
        peserta,
      };
    }

    const waktuCheckin = new Date();
    const status = determinePresensiStatus(
      kegiatan.tanggal_mulai,
      kegiatan.jam_mulai,
      waktuCheckin,
    );

    const { data: presensiData, error: presensiError } = await supabase
      .from("presensi")
      .insert({
        kegiatan_id: kegiatanId,
        jamaah_id: peserta.id,
        mudamudi_id: null,
        waktu_checkin: waktuCheckin.toISOString(),
        status,
        metode: "qr",
        keterangan: null,
      })
      .select("id")
      .single();

    if (presensiError) {
      return {
        success: false,
        type: "database_error",
        message: "Presensi gagal disimpan. Silakan coba lagi.",
        kegiatan,
        peserta,
      };
    }

    return {
      success: true,
      type: "success",
      message:
        status === "hadir"
          ? `${peserta.nama} berhasil melakukan presensi.`
          : `${peserta.nama} berhasil melakukan presensi terlambat.`,
      presensiId: presensiData.id,
      waktuCheckin: waktuCheckin.toISOString(),
      status,
      metode: "qr",
      kegiatan,
      peserta,
    };
  } else {
    // Muda-Mudi
    const { data: mudamudiData, error: mudamudiError } = await supabase
      .from("mudamudi")
      .select("id, nama, kelompok, kelas, jenis_kelamin, tahun_lahir")
      .eq("qr_id", qrId)
      .maybeSingle();

    if (mudamudiError || !mudamudiData) {
      return {
        success: false,
        type: "mudamudi_not_found",
        message: "QR Code tidak terdaftar pada data Muda-Mudi.",
        kegiatan,
      };
    }

    const peserta: PesertaInfo = {
      id: mudamudiData.id,
      nama: mudamudiData.nama,
      kelompok: mudamudiData.kelompok,
      kelas: mudamudiData.kelas || [],
      jenis_kelamin: mudamudiData.jenis_kelamin,
      tahun_lahir: mudamudiData.tahun_lahir,
    };

    if (!isMudamudiTargeted(kegiatan, peserta)) {
      return {
        success: false,
        type: "not_target",
        message: "Muda-Mudi tidak termasuk sasaran kegiatan.",
        kegiatan,
        peserta,
        mudamudi: peserta,
      };
    }

    // Cek duplikasi presensi mudamudi_id
    const { data: existing } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", kegiatanId)
      .eq("mudamudi_id", peserta.id)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        type: "already_present",
        message: `${peserta.nama} sudah melakukan presensi.`,
        kegiatan,
        peserta,
        mudamudi: peserta,
      };
    }

    const waktuCheckin = new Date();
    const status = determinePresensiStatus(
      kegiatan.tanggal_mulai,
      kegiatan.jam_mulai,
      waktuCheckin,
    );

    const { data: presensiData, error: presensiError } = await supabase
      .from("presensi")
      .insert({
        kegiatan_id: kegiatanId,
        mudamudi_id: peserta.id,
        jamaah_id: null,
        waktu_checkin: waktuCheckin.toISOString(),
        status,
        metode: "qr",
        keterangan: null,
      })
      .select("id")
      .single();

    if (presensiError) {
      return {
        success: false,
        type: "database_error",
        message: "Presensi gagal disimpan. Silakan coba lagi.",
        kegiatan,
        peserta,
        mudamudi: peserta,
      };
    }

    return {
      success: true,
      type: "success",
      message:
        status === "hadir"
          ? `${peserta.nama} berhasil melakukan presensi.`
          : `${peserta.nama} berhasil melakukan presensi terlambat.`,
      presensiId: presensiData.id,
      waktuCheckin: waktuCheckin.toISOString(),
      status,
      metode: "qr",
      kegiatan,
      peserta,
      mudamudi: peserta,
    };
  }
}

// Alias untuk fungsi lama
export async function scanMudamudiQR(
  qrText: string,
  kegiatanId: number,
): Promise<ScanMudamudiQRResult> {
  return scanQR(qrText, kegiatanId);
}
