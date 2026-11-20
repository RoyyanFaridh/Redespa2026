
"use server";

import { createAdminClient } from "../supabase/admin";
import { requireAdmin } from "../auth/admin";
import { isKegiatanAktif, buildDateTime } from "./helpers";
import { isMudamudiTargeted, isJamaahTargeted } from "./target";
import type { PresensiStatus, PresensiMetode } from "./types";

const HADIR_TOLERANCE_MINUTES = 10;

const MUDA_MUDI_QR_PREFIXES = [
  "SIKEMA:MUDA_MUDI:",
  "KMM_PANDAK:MUDA_MUDI:",
];

const JAMAAH_QR_PREFIXES = [
  "SIKEMA:JAMAAH:",
  "KMM_PANDAK:JAMAAH:",
];

type JenisPeserta = "jamaah" | "mudamudi";

type Kegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  jenis_peserta: JenisPeserta | null;
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
    mudamudi?: PesertaInfo;
  }
  | {
    success: false;
    type:
    | "invalid_qr"
    | "qr_mismatch"
    | "invalid_kegiatan_type"
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "object" && error !== null) {
    const value = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

    return [
      value.message,
      value.code ? `Code: ${value.code}` : null,
      value.details ? `Details: ${value.details}` : null,
      value.hint ? `Hint: ${value.hint}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return String(error);
}

function parseQR(
  qrText: string,
): {
  type: "mudamudi" | "jamaah" | "unknown";
  qrId: string | null;
} {
  const value = qrText.trim();

  for (const prefix of MUDA_MUDI_QR_PREFIXES) {
    if (value.startsWith(prefix)) {
      const qrId = value.slice(prefix.length).trim();

      return {
        type: UUID_REGEX.test(qrId) ? "mudamudi" : "unknown",
        qrId,
      };
    }
  }

  for (const prefix of JAMAAH_QR_PREFIXES) {
    if (value.startsWith(prefix)) {
      const qrId = value.slice(prefix.length).trim();

      return {
        type: UUID_REGEX.test(qrId) ? "jamaah" : "unknown",
        qrId,
      };
    }
  }

  return {
    type: "unknown",
    qrId: null,
  };
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

function createDatabaseError(
  stage: string,
  error: unknown,
  kegiatan?: Kegiatan,
  peserta?: PesertaInfo,
): ScanQRResult {
  const detail = getErrorMessage(error);

  console.error(`[SCAN QR] ${stage}:`, error);

  return {
    success: false,
    type: "database_error",
    message: `Gagal pada tahap ${stage}. ${detail}`,
    ...(kegiatan ? { kegiatan } : {}),
    ...(peserta
      ? {
        peserta,
        mudamudi: peserta,
      }
      : {}),
  };
}

async function getKegiatanInternal(
  kegiatanId: number,
): Promise<Kegiatan | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin, jenis_peserta",
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Gagal mengambil data kegiatan: ${getErrorMessage(error)}`,
    );
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    jenis_peserta: data.jenis_peserta ?? null,
  } as Kegiatan;
}

export async function getKegiatanById(
  kegiatanId: number,
): Promise<Kegiatan | null> {
  try {
    await requireAdmin();

    if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
      return null;
    }

    return await getKegiatanInternal(kegiatanId);
  } catch (error) {
    console.error("[GET KEGIATAN] Error:", error);
    return null;
  }
}

async function scanJamaah(
  supabase: ReturnType<typeof createAdminClient>,
  qrId: string,
  kegiatan: Kegiatan,
  kegiatanId: number,
): Promise<ScanQRResult> {
  let jamaahData;

  try {
    const result = await supabase
      .from("jamaah")
      .select("id, nama, kelompok, jenis_kelamin, tahun_lahir")
      .eq("qr_id", qrId)
      .maybeSingle();

    if (result.error) {
      return createDatabaseError(
        "pencarian data Jamaah",
        result.error,
        kegiatan,
      );
    }

    jamaahData = result.data;
  } catch (error) {
    return createDatabaseError(
      "pencarian data Jamaah",
      error,
      kegiatan,
    );
  }

  if (!jamaahData) {
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

  try {
    const { data: existing, error: existingError } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", kegiatanId)
      .eq("jamaah_id", peserta.id)
      .maybeSingle();

    if (existingError) {
      return createDatabaseError(
        "pemeriksaan presensi Jamaah",
        existingError,
        kegiatan,
        peserta,
      );
    }

    if (existing) {
      return {
        success: false,
        type: "already_present",
        message: `${peserta.nama} sudah melakukan presensi.`,
        kegiatan,
        peserta,
      };
    }
  } catch (error) {
    return createDatabaseError(
      "pemeriksaan presensi Jamaah",
      error,
      kegiatan,
      peserta,
    );
  }

  const waktuCheckin = new Date();

  const status = determinePresensiStatus(
    kegiatan.tanggal_mulai,
    kegiatan.jam_mulai,
    waktuCheckin,
  );

  try {
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
      return createDatabaseError(
        "penyimpanan presensi Jamaah",
        presensiError,
        kegiatan,
        peserta,
      );
    }

    if (!presensiData) {
      return createDatabaseError(
        "penyimpanan presensi Jamaah",
        new Error("Server tidak mengembalikan ID presensi."),
        kegiatan,
        peserta,
      );
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
  } catch (error) {
    return createDatabaseError(
      "penyimpanan presensi Jamaah",
      error,
      kegiatan,
      peserta,
    );
  }
}

async function scanMudamudi(
  supabase: ReturnType<typeof createAdminClient>,
  qrId: string,
  kegiatan: Kegiatan,
  kegiatanId: number,
): Promise<ScanQRResult> {
  let mudamudiData;

  try {
    const result = await supabase
      .from("mudamudi")
      .select("id, nama, kelompok, kelas, jenis_kelamin, tahun_lahir")
      .eq("qr_id", qrId)
      .maybeSingle();

    if (result.error) {
      return createDatabaseError(
        "pencarian data Muda-Mudi",
        result.error,
        kegiatan,
      );
    }

    mudamudiData = result.data;
  } catch (error) {
    return createDatabaseError(
      "pencarian data Muda-Mudi",
      error,
      kegiatan,
    );
  }

  if (!mudamudiData) {
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

  try {
    const { data: existing, error: existingError } = await supabase
      .from("presensi")
      .select("id")
      .eq("kegiatan_id", kegiatanId)
      .eq("mudamudi_id", peserta.id)
      .maybeSingle();

    if (existingError) {
      return createDatabaseError(
        "pemeriksaan presensi Muda-Mudi",
        existingError,
        kegiatan,
        peserta,
      );
    }

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
  } catch (error) {
    return createDatabaseError(
      "pemeriksaan presensi Muda-Mudi",
      error,
      kegiatan,
      peserta,
    );
  }

  const waktuCheckin = new Date();

  const status = determinePresensiStatus(
    kegiatan.tanggal_mulai,
    kegiatan.jam_mulai,
    waktuCheckin,
  );

  try {
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
      return createDatabaseError(
        "penyimpanan presensi Muda-Mudi",
        presensiError,
        kegiatan,
        peserta,
      );
    }

    if (!presensiData) {
      return createDatabaseError(
        "penyimpanan presensi Muda-Mudi",
        new Error("Server tidak mengembalikan ID presensi."),
        kegiatan,
        peserta,
      );
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
  } catch (error) {
    return createDatabaseError(
      "penyimpanan presensi Muda-Mudi",
      error,
      kegiatan,
      peserta,
    );
  }
}

export async function scanQR(
  qrText: string,
  kegiatanId: number,
): Promise<ScanQRResult> {
  try {
    try {
      await requireAdmin();
    } catch (error) {
      console.error("[SCAN QR] Autentikasi gagal:", error);

      return {
        success: false,
        type: "not_authorized",
        message: "Akses ditolak. Silakan login kembali sebagai admin.",
      };
    }

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

    const { qrId } = parseQR(qrText);

    if (!qrId || !UUID_REGEX.test(qrId)) {
      return {
        success: false,
        type: "invalid_qr",
        message: "Format QR Code tidak dikenali oleh sistem REDESPA.",
      };
    }

    let kegiatan: Kegiatan | null;

    try {
      kegiatan = await getKegiatanInternal(kegiatanId);
    } catch (error) {
      return createDatabaseError(
        "pengambilan data kegiatan",
        error,
      );
    }

    if (!kegiatan) {
      return {
        success: false,
        type: "kegiatan_not_found",
        message: "Kegiatan tidak ditemukan.",
      };
    }

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

    if (
      kegiatan.jenis_peserta !== "jamaah" &&
      kegiatan.jenis_peserta !== "mudamudi"
    ) {
      return {
        success: false,
        type: "invalid_kegiatan_type",
        message:
          "Jenis peserta kegiatan belum ditentukan. Silakan perbarui data kegiatan sebelum melakukan presensi.",
        kegiatan,
      };
    }

    let supabase: ReturnType<typeof createAdminClient>;

    try {
      supabase = createAdminClient();
    } catch (error) {
      return createDatabaseError(
        "inisialisasi koneksi database",
        error,
        kegiatan,
      );
    }

    if (kegiatan.jenis_peserta === "jamaah") {
      return await scanJamaah(
        supabase,
        qrId,
        kegiatan,
        kegiatanId,
      );
    }

    return await scanMudamudi(
      supabase,
      qrId,
      kegiatan,
      kegiatanId,
    );
  } catch (error) {
    return createDatabaseError(
      "proses scan QR secara keseluruhan",
      error,
    );
  }
}

export async function scanMudamudiQR(
  qrText: string,
  kegiatanId: number,
): Promise<ScanMudamudiQRResult> {
  return scanQR(qrText, kegiatanId);
}
