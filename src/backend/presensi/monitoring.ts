
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { buildDateTime } from "./helpers";

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
  jenis_peserta: "jamaah" | "mudamudi";
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
  sasaran_dibekukan_pada: string | null;
};

type SnapshotPeserta = {
  id: number;
  kegiatan_id: number;
  jenis_peserta: "jamaah" | "mudamudi";
  jamaah_id: number | null;
  mudamudi_id: number | null;
  qr_id_snapshot: string;
  nama_snapshot: string | null;
  kelompok_snapshot: string | null;
  kelas_snapshot: string[] | null;
  jenis_kelamin_snapshot: string | null;
  is_target: boolean;
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

type JamaahRow = {
  id: number;
  nama: string;
  kelompok: string;
  jenis_kelamin: string | null;
  qr_id: string | null;
};

type SnapshotPayload = {
  kegiatan_id: number;
  jenis_peserta: "jamaah";
  jamaah_id: number;
  mudamudi_id: null;
  qr_id_snapshot: string;
  nama_snapshot: string;
  kelompok_snapshot: string;
  kelas_snapshot: string[];
  jenis_kelamin_snapshot: string | null;
  is_target: boolean;
  dikeluarkan_pada: string | null;
  alasan_perubahan: string | null;
  diperbarui_pada: string;
};

type SyncResult = {
  success: boolean;
  error?: string;
};

const QUERY_PAGE_SIZE = 1000;
const UPDATE_BATCH_SIZE = 25;

async function fetchAllRows<T>(
  queryFactory: (from: number, to: number) => any,
): Promise<{ data: T[] | null; error: any }> {
  const result: T[] = [];

  for (let from = 0; ; from += QUERY_PAGE_SIZE) {
    const { data, error } = await queryFactory(
      from,
      from + QUERY_PAGE_SIZE - 1,
    );

    if (error) {
      return { data: null, error };
    }

    const rows = (data ?? []) as T[];
    result.push(...rows);

    if (rows.length < QUERY_PAGE_SIZE) {
      break;
    }
  }

  return { data: result, error: null };
}

function matchesJamaahTarget(
  jamaah: JamaahRow,
  kegiatan: KegiatanMonitoring,
): boolean {
  const kelompokSesuai =
    !kegiatan.kelompok ||
    kegiatan.kelompok.length === 0 ||
    kegiatan.kelompok.includes(jamaah.kelompok);

  const jenisKelaminSesuai =
    !kegiatan.jenis_kelamin ||
    kegiatan.jenis_kelamin === jamaah.jenis_kelamin;

  return kelompokSesuai && jenisKelaminSesuai;
}

function isSnapshotDifferent(
  snapshot: SnapshotPeserta,
  jamaah: JamaahRow,
): boolean {
  return (
    snapshot.nama_snapshot !== jamaah.nama ||
    snapshot.kelompok_snapshot !== jamaah.kelompok ||
    snapshot.jenis_kelamin_snapshot !== jamaah.jenis_kelamin ||
    snapshot.qr_id_snapshot !== jamaah.qr_id ||
    !snapshot.is_target
  );
}

async function syncJamaahSnapshot(
  kegiatan: KegiatanMonitoring,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<SyncResult> {
  if (kegiatan.jenis_peserta !== "jamaah") {
    return { success: true };
  }

  const [jamaahResult, snapshotResult] = await Promise.all([
    fetchAllRows<JamaahRow>((from, to) =>
      supabase
        .from("jamaah")
        .select("id, nama, kelompok, jenis_kelamin, qr_id")
        .is("deleted_at", null)
        .range(from, to),
    ),
    fetchAllRows<SnapshotPeserta>((from, to) =>
      supabase
        .from("kegiatan_peserta")
        .select(
          "id, kegiatan_id, jenis_peserta, jamaah_id, mudamudi_id, qr_id_snapshot, nama_snapshot, kelompok_snapshot, kelas_snapshot, jenis_kelamin_snapshot, is_target",
        )
        .eq("kegiatan_id", kegiatan.id)
        .eq("jenis_peserta", "jamaah")
        .range(from, to),
    ),
  ]);

  if (jamaahResult.error) {
    console.error("Gagal mengambil data Jamaah:", jamaahResult.error);
    return {
      success: false,
      error: "Gagal mengambil data Jamaah untuk sasaran kegiatan.",
    };
  }

  if (snapshotResult.error) {
    console.error("Gagal mengambil snapshot Jamaah:", snapshotResult.error);
    return {
      success: false,
      error: "Gagal mengambil snapshot peserta kegiatan.",
    };
  }

  const jamaahList = jamaahResult.data ?? [];
  const snapshotList = snapshotResult.data ?? [];

  const snapshotMap = new Map<number, SnapshotPeserta>();

  for (const snapshot of snapshotList) {
    if (snapshot.jamaah_id !== null) {
      snapshotMap.set(snapshot.jamaah_id, snapshot);
    }
  }

  const jamaahAktif = new Set<number>();
  const dataInsert: SnapshotPayload[] = [];
  const dataUpdate: Array<{
    id: number;
    payload: Partial<SnapshotPayload>;
  }> = [];

  const waktuSekarang = new Date().toISOString();

  for (const jamaah of jamaahList) {
    const sesuai = matchesJamaahTarget(jamaah, kegiatan);
    const existing = snapshotMap.get(jamaah.id);

    if (sesuai) {
      if (existing) {
        jamaahAktif.add(jamaah.id);

        if (isSnapshotDifferent(existing, jamaah)) {
          const payload: Partial<SnapshotPayload> = {
            nama_snapshot: jamaah.nama,
            kelompok_snapshot: jamaah.kelompok,
            jenis_kelamin_snapshot: jamaah.jenis_kelamin,
            is_target: true,
            dikeluarkan_pada: null,
            alasan_perubahan: null,
            diperbarui_pada: waktuSekarang,
          };

          if (jamaah.qr_id) {
            payload.qr_id_snapshot = jamaah.qr_id;
          }

          dataUpdate.push({
            id: existing.id,
            payload,
          });
        }
      } else if (jamaah.qr_id) {
        jamaahAktif.add(jamaah.id);

        dataInsert.push({
          kegiatan_id: kegiatan.id,
          jenis_peserta: "jamaah",
          jamaah_id: jamaah.id,
          mudamudi_id: null,
          qr_id_snapshot: jamaah.qr_id,
          nama_snapshot: jamaah.nama,
          kelompok_snapshot: jamaah.kelompok,
          kelas_snapshot: [],
          jenis_kelamin_snapshot: jamaah.jenis_kelamin,
          is_target: true,
          dikeluarkan_pada: null,
          alasan_perubahan: null,
          diperbarui_pada: waktuSekarang,
        });
      }
    } else if (existing?.is_target) {
      dataUpdate.push({
        id: existing.id,
        payload: {
          is_target: false,
          dikeluarkan_pada: waktuSekarang,
          alasan_perubahan:
            "Data Jamaah tidak lagi memenuhi kriteria sasaran kegiatan.",
          diperbarui_pada: waktuSekarang,
        },
      });
    }
  }

  if (dataInsert.length > 0) {
    const { error } = await supabase
      .from("kegiatan_peserta")
      .insert(dataInsert);

    if (error) {
      console.error("Gagal menambahkan snapshot Jamaah:", error);
      return {
        success: false,
        error: "Gagal menambahkan Jamaah ke sasaran kegiatan.",
      };
    }
  }

  for (
    let index = 0;
    index < dataUpdate.length;
    index += UPDATE_BATCH_SIZE
  ) {
    const batch = dataUpdate.slice(
      index,
      index + UPDATE_BATCH_SIZE,
    );

    const results = await Promise.all(
      batch.map(({ id, payload }) =>
        supabase
          .from("kegiatan_peserta")
          .update(payload)
          .eq("id", id),
      ),
    );

    const failedUpdate = results.find((result) => result.error);

    if (failedUpdate?.error) {
      console.error(
        "Gagal memperbarui snapshot Jamaah:",
        failedUpdate.error,
      );

      return {
        success: false,
        error: "Gagal memperbarui snapshot Jamaah.",
      };
    }
  }

  return { success: true };
}

async function freezeKegiatan(
  kegiatan: KegiatanMonitoring,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<SyncResult> {
  if (kegiatan.sasaran_dibekukan_pada) {
    return { success: true };
  }

  const waktuSelesai = buildDateTime(
    kegiatan.tanggal_selesai,
    kegiatan.jam_selesai,
  );

  if (new Date() < waktuSelesai) {
    return { success: true };
  }

  const { error } = await supabase
    .from("kegiatan")
    .update({
      sasaran_status: "dibekukan",
      sasaran_dibekukan_pada: new Date().toISOString(),
      sasaran_dibekukan_sebab: "Kegiatan telah selesai.",
    })
    .eq("id", kegiatan.id)
    .is("sasaran_dibekukan_pada", null);

  if (error) {
    console.error("Gagal membekukan sasaran kegiatan:", error);

    return {
      success: false,
      error: "Gagal membekukan sasaran kegiatan.",
    };
  }

  return { success: true };
}

async function createAutomaticAlpa(
  kegiatan: KegiatanMonitoring,
  snapshots: SnapshotPeserta[],
  existingPresensi: PresensiRow[],
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ data: PresensiRow[]; error?: string }> {
  const waktuSelesai = buildDateTime(
    kegiatan.tanggal_selesai,
    kegiatan.jam_selesai,
  );

  if (new Date() < waktuSelesai) {
    return { data: [] };
  }

  const existingMudamudiIds = new Set(
    existingPresensi
      .map((item) => item.mudamudi_id)
      .filter((id): id is number => id !== null),
  );

  const existingJamaahIds = new Set(
    existingPresensi
      .map((item) => item.jamaah_id)
      .filter((id): id is number => id !== null),
  );

  const belumPresensi = snapshots.filter((item) => {
    if (!item.is_target) {
      return false;
    }

    if (item.jenis_peserta === "jamaah") {
      return (
        item.jamaah_id !== null &&
        !existingJamaahIds.has(item.jamaah_id)
      );
    }

    return (
      item.mudamudi_id !== null &&
      !existingMudamudiIds.has(item.mudamudi_id)
    );
  });

  if (belumPresensi.length === 0) {
    return { data: [] };
  }

  const dataAlpa = belumPresensi.map((item) => ({
    kegiatan_id: kegiatan.id,
    jamaah_id:
      item.jenis_peserta === "jamaah" ? item.jamaah_id : null,
    mudamudi_id:
      item.jenis_peserta === "mudamudi" ? item.mudamudi_id : null,
    waktu_checkin: null,
    status: "alpa" as PresensiStatus,
    metode: "manual" as PresensiMetode,
    keterangan:
      "Otomatis: tidak melakukan presensi hingga kegiatan selesai.",
  }));

  const { data, error } = await supabase
    .from("presensi")
    .insert(dataAlpa)
    .select(
      "id, kegiatan_id, mudamudi_id, jamaah_id, waktu_checkin, status, metode, keterangan",
    );

  if (error) {
    console.error("Gagal membuat Alpa otomatis:", error);

    return {
      data: [],
      error: "Gagal membuat status Alpa otomatis.",
    };
  }

  return {
    data: (data ?? []) as PresensiRow[],
  };
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

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return {
      success: false,
      error: "Kegiatan tidak valid.",
    };
  }

  const { data: kegiatan, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, jenis_peserta, kelompok, kelas, jenis_kelamin, sasaran_dibekukan_pada",
    )
    .eq("id", kegiatanId)
    .maybeSingle();

  if (kegiatanError || !kegiatan) {
    console.error("Gagal mengambil kegiatan:", kegiatanError);

    return {
      success: false,
      error: "Data kegiatan tidak ditemukan.",
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

  const kegiatanMonitoring: KegiatanMonitoring = {
    ...kegiatan,
    jenis_peserta: jenisPeserta,
  };

  const waktuSelesai = buildDateTime(
    kegiatanMonitoring.tanggal_selesai,
    kegiatanMonitoring.jam_selesai,
  );

  const sudahSelesai = new Date() >= waktuSelesai;
  const sudahDibekukan = Boolean(
    kegiatanMonitoring.sasaran_dibekukan_pada,
  );

  if (jenisPeserta === "jamaah" && !sudahDibekukan) {
    const syncResult = await syncJamaahSnapshot(
      kegiatanMonitoring,
      supabase,
    );

    if (!syncResult.success) {
      return {
        success: false,
        error: syncResult.error,
      };
    }
  }

  if (sudahSelesai && !sudahDibekukan) {
    const freezeResult = await freezeKegiatan(
      kegiatanMonitoring,
      supabase,
    );

    if (!freezeResult.success) {
      return {
        success: false,
        error: freezeResult.error,
      };
    }
  }

  const [snapshotResult, presensiResult] = await Promise.all([
    fetchAllRows<SnapshotPeserta>((from, to) =>
      supabase
        .from("kegiatan_peserta")
        .select(
          "id, kegiatan_id, jenis_peserta, jamaah_id, mudamudi_id, qr_id_snapshot, nama_snapshot, kelompok_snapshot, kelas_snapshot, jenis_kelamin_snapshot, is_target",
        )
        .eq("kegiatan_id", kegiatanId)
        .eq("jenis_peserta", jenisPeserta)
        .range(from, to),
    ),
    fetchAllRows<PresensiRow>((from, to) =>
      supabase
        .from("presensi")
        .select(
          "id, kegiatan_id, mudamudi_id, jamaah_id, waktu_checkin, status, metode, keterangan",
        )
        .eq("kegiatan_id", kegiatanId)
        .range(from, to),
    ),
  ]);

  if (snapshotResult.error) {
    console.error(
      "Gagal mengambil snapshot peserta:",
      snapshotResult.error,
    );

    return {
      success: false,
      error: "Gagal mengambil daftar peserta kegiatan.",
    };
  }

  if (presensiResult.error) {
    console.error(
      "Gagal mengambil data presensi:",
      presensiResult.error,
    );

    return {
      success: false,
      error: "Gagal mengambil data presensi.",
    };
  }

  const snapshotList = snapshotResult.data ?? [];
  let presensiList = presensiResult.data ?? [];

  if (sudahSelesai) {
    const alpaResult = await createAutomaticAlpa(
      kegiatanMonitoring,
      snapshotList,
      presensiList,
      supabase,
    );

    if (alpaResult.error) {
      return {
        success: false,
        error: alpaResult.error,
      };
    }

    if (alpaResult.data.length > 0) {
      presensiList = [...presensiList, ...alpaResult.data];
    }
  }

  const presensiMap = new Map<number, PresensiRow>();

  for (const item of presensiList) {
    const id =
      jenisPeserta === "jamaah"
        ? item.jamaah_id
        : item.mudamudi_id;

    if (id !== null) {
      presensiMap.set(id, item);
    }
  }

  const data: MonitoringPeserta[] = snapshotList
    .filter((item) => {
      const id =
        jenisPeserta === "jamaah"
          ? item.jamaah_id
          : item.mudamudi_id;

      if (id === null) {
        return false;
      }

      return item.is_target || presensiMap.has(id);
    })
    .map((item) => {
      const pesertaId =
        jenisPeserta === "jamaah"
          ? item.jamaah_id!
          : item.mudamudi_id!;

      const presensiItem = presensiMap.get(pesertaId);

      return {
        presensi_id: presensiItem?.id ?? null,
        peserta_id: pesertaId,
        mudamudi_id:
          jenisPeserta === "mudamudi" ? item.mudamudi_id : null,
        jamaah_id:
          jenisPeserta === "jamaah" ? item.jamaah_id : null,
        nama: item.nama_snapshot ?? "Nama tidak tersedia",
        kelompok: item.kelompok_snapshot ?? "",
        kelas: item.kelas_snapshot ?? [],
        jenis_kelamin: item.jenis_kelamin_snapshot,
        waktu_checkin: presensiItem?.waktu_checkin ?? null,
        status: presensiItem?.status ?? null,
        metode: presensiItem?.metode ?? null,
        keterangan: presensiItem?.keterangan ?? null,
      };
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

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
