import type { ScanQRResult } from "../../backend/presensi/public";

export type ScannerStatus = "idle" | "ready" | "processing" | "success" | "error";

export type ScannerNotificationType =
  | "hadir"
  | "terlambat"
  | "already_present"
  | "invalid_qr"
  | "not_target"
  | "error";

export type ScannerNotification = {
  id: number;
  type: ScannerNotificationType;
  title: string;
  namaPeserta?: string;
  statusBadge?: "HADIR" | "TERLAMBAT";
  message: string;
  tone: "emerald" | "amber" | "rose";
  technicalDetail?: string;
};

export type DebugLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type DebugEntry = {
  id: number;
  time: string;
  level: DebugLevel;
  message: string;
};

export function mapResultToNotification(
  result: ScanQRResult,
): ScannerNotification {
  const id = Date.now() + Math.random();

  if (result.success) {
    const isHadir = result.status.toLowerCase() === "hadir";
    const namaPeserta = result.peserta?.nama || "Peserta";

    if (isHadir) {
      return {
        id,
        type: "hadir",
        title: "Presensi Berhasil",
        namaPeserta,
        statusBadge: "HADIR",
        message: "Peserta berhasil tercatat sebagai hadir.",
        tone: "emerald",
      };
    }

    return {
      id,
      type: "terlambat",
      title: "Presensi Berhasil",
      namaPeserta,
      statusBadge: "TERLAMBAT",
      message: "Peserta berhasil tercatat sebagai terlambat.",
      tone: "amber",
    };
  }

  const namaPeserta = result.peserta?.nama;

  switch (result.type) {
    case "already_present":
      return {
        id,
        type: "already_present",
        title: "Sudah Presensi",
        namaPeserta,
        message: "Peserta sudah tercatat melakukan presensi sebelumnya. Jangan membuat catatan presensi baru.",
        tone: "amber",
        technicalDetail: result.message,
      };

    case "not_target":
    case "qr_mismatch":
      return {
        id,
        type: "not_target",
        title: "Peserta Tidak Termasuk Target",
        namaPeserta,
        message: "Peserta tidak memenuhi kriteria target kegiatan ini.",
        tone: "amber",
        technicalDetail: result.message,
      };

    case "invalid_qr":
    case "peserta_not_found":
    case "mudamudi_not_found":
      return {
        id,
        type: "invalid_qr",
        title: "QR Code Tidak Valid",
        namaPeserta,
        message: "QR Code tidak dikenali atau tidak sesuai dengan data peserta.",
        tone: "rose",
        technicalDetail: result.message,
      };

    case "database_error":
    case "kegiatan_inactive":
    case "kegiatan_not_found":
    case "not_authorized":
    default:
      return {
        id,
        type: "error",
        title: "Gagal Memproses Presensi",
        namaPeserta,
        message: "Terjadi kesalahan saat memproses hasil pemindaian. Silakan coba kembali.",
        tone: "rose",
        technicalDetail: result.message,
      };
  }
}
