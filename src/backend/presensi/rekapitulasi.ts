
"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { isMudamudiTargeted } from "./target";

import type {
  PresensiMetode,
  RekapitulasiKegiatan,
  RekapitulasiPresensi,
  RekapitulasiStatus,
} from "./types";

type FilterValue = string | string[];

type GetRekapitulasiParams = {
  page: number;
  itemsPerPage: number;
  search?: string;
  bulan?: string;
  kegiatanId?: number;
  kelompok?: FilterValue;
  kelas?: FilterValue;
};

type KegiatanRekap = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  kelompok: string[] | null;
  kelas: string[] | null;
  jenis_kelamin: string | null;
};

type MudamudiRekap = {
  id: number;
  nama: string;
  kelompok: string | null;
  kelas: string[];
  jenis_kelamin: string | null;
};

type PresensiRekap = {
  kegiatan_id: number;
  mudamudi_id: number;
  status: string;
  metode: string | null;
  waktu_checkin: string | null;
  keterangan: string | null;
};

function normalizeFilter(value?: FilterValue): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => item.trim()).filter(Boolean)),
    );
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function emptyResult(
  page: number,
  itemsPerPage: number,
  error: string,
  totalItems = 0,
  totalPages = 0,
) {
  return {
    data: {
      mudamudi: [],
      kegiatan: [],
      kehadiran: [],
    } as RekapitulasiPresensi,
    pagination: {
      page,
      itemsPerPage,
      totalItems,
      totalPages,
    },
    error,
  };
}

function mapKegiatan(item: KegiatanRekap): RekapitulasiKegiatan {
  return {
    id: item.id,
    nama: item.nama,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_selesai: item.tanggal_selesai,
    jam_mulai: item.jam_mulai,
    jam_selesai: item.jam_selesai,
    lokasi: item.lokasi,
    kelompok: item.kelompok,
    kelas: item.kelas,
    jenis_kelamin: item.jenis_kelamin,
  };
}

function isTarget(kegiatan: KegiatanRekap, mudamudi: MudamudiRekap) {
  return isMudamudiTargeted(kegiatan, mudamudi);
}

export async function getRekapitulasiPresensi({
  page,
  itemsPerPage,
  search = "",
  bulan,
  kegiatanId,
  kelompok,
  kelas,
}: GetRekapitulasiParams) {
  await requireAdmin();

  const supabase = await createClient();

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const safeItemsPerPage =
    Number.isFinite(itemsPerPage) && itemsPerPage > 0
      ? Math.min(100, Math.floor(itemsPerPage))
      : 10;

  if (
    kegiatanId !== undefined &&
    (!Number.isInteger(kegiatanId) || kegiatanId <= 0)
  ) {
    return emptyResult(safePage, safeItemsPerPage, "Kegiatan tidak valid.");
  }

  const kelompokFilters = normalizeFilter(kelompok);
  const kelasFilters = normalizeFilter(kelas);

  let kegiatanQuery = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (bulan) {
    const match = /^(\d{4})-(\d{2})$/.exec(bulan);

    if (!match) {
      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Format bulan tidak valid.",
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);

    if (month < 1 || month > 12) {
      return emptyResult(
        safePage,
        safeItemsPerPage,
        "Format bulan tidak valid.",
      );
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(Date.UTC(year, month, 1))
      .toISOString()
      .slice(0, 10);

    kegiatanQuery = kegiatanQuery
      .gte("tanggal_mulai", startDate)
      .lt("tanggal_mulai", endDate);
  }

  if (kegiatanId !== undefined) {
    kegiatanQuery = kegiatanQuery.eq("id", kegiatanId);
  }

  let mudamudiQuery = supabase
    .from("mudamudi")
    .select("id, nama, kelompok, kelas, jenis_kelamin")
    .order("nama", { ascending: true });

  const keyword = search.trim();

  if (keyword) {
    mudamudiQuery = mudamudiQuery.ilike("nama", `%${keyword}%`);
  }

  if (kelompokFilters.length === 1) {
    mudamudiQuery = mudamudiQuery.eq("kelompok", kelompokFilters[0]);
  } else if (kelompokFilters.length > 1) {
    mudamudiQuery = mudamudiQuery.in("kelompok", kelompokFilters);
  }

  if (
    kelasFilters.length > 0 &&
    !kelasFilters.includes("Jamaah")
  ) {
    mudamudiQuery = mudamudiQuery.overlaps("kelas", kelasFilters);
  }

  const [mudamudiResult, kegiatanResult] = await Promise.all([
    mudamudiQuery,
    kegiatanQuery,
  ]);

  if (mudamudiResult.error) {
    console.error("Gagal mengambil data Muda-Mudi:", mudamudiResult.error);

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data Muda-Mudi.",
    );
  }

  if (kegiatanResult.error) {
    console.error("Gagal mengambil data kegiatan:", kegiatanResult.error);

    return emptyResult(
      safePage,
      safeItemsPerPage,
      "Gagal mengambil data kegiatan.",
    );
  }

  const kegiatanData = (kegiatanResult.data ?? []) as KegiatanRekap[];
  const mudamudiData = (mudamudiResult.data ?? []) as MudamudiRekap[];

  const totalItems = mudamudiData.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / safeItemsPerPage);

  const currentPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;

  const from = (currentPage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage;
  const mudamudiDataPaginated = mudamudiData.slice(from, to);

  const mudamudiIds = mudamudiDataPaginated.map((item) => item.id);
  const kegiatanIds = kegiatanData.map((item) => item.id);

  let presensiData: PresensiRekap[] = [];

  if (mudamudiIds.length > 0 && kegiatanIds.length > 0) {
    const presensiResult = await supabase
      .from("presensi")
      .select(
        "kegiatan_id, mudamudi_id, status, metode, waktu_checkin, keterangan",
      )
      .in("mudamudi_id", mudamudiIds)
      .in("kegiatan_id", kegiatanIds);

    if (presensiResult.error) {
      console.error("Gagal mengambil data presensi:", presensiResult.error);

      return emptyResult(
        currentPage,
        safeItemsPerPage,
        "Gagal mengambil data presensi.",
        totalItems,
        totalPages,
      );
    }

    presensiData = (presensiResult.data ?? []) as PresensiRekap[];
  }

  const presensiMap = new Map<string, PresensiRekap>();

  for (const item of presensiData) {
    presensiMap.set(`${item.kegiatan_id}:${item.mudamudi_id}`, item);
  }

  const kehadiran = kegiatanData.flatMap((kegiatan) =>
    mudamudiDataPaginated.map((mudamudi) => {
      const key = `${kegiatan.id}:${mudamudi.id}`;
      const presensi = presensiMap.get(key);
      const targeted = isTarget(kegiatan, mudamudi);

      if (!targeted) {
        return {
          kegiatan_id: kegiatan.id,
          mudamudi_id: mudamudi.id,
          status: "tidak_berlaku" as RekapitulasiStatus,
          metode: null,
          waktu_checkin: null,
          keterangan: null,
        };
      }

      return {
        kegiatan_id: kegiatan.id,
        mudamudi_id: mudamudi.id,
        status: (presensi?.status ?? "alpa") as RekapitulasiStatus,
        metode: (presensi?.metode ?? null) as PresensiMetode | null,
        waktu_checkin: presensi?.waktu_checkin ?? null,
        keterangan: presensi?.keterangan ?? null,
      };
    }),
  );

  const result: RekapitulasiPresensi = {
    mudamudi: mudamudiDataPaginated.map((item) => ({
      id: item.id,
      nama: item.nama,
      kelompok: item.kelompok,
      kelas: item.kelas,
      jenis_kelamin: item.jenis_kelamin,
    })),
    kegiatan: kegiatanData.map(mapKegiatan),
    kehadiran,
  };

  return {
    data: result,
    pagination: {
      page: currentPage,
      itemsPerPage: safeItemsPerPage,
      totalItems,
      totalPages,
    },
  };
}

export async function getRekapitulasiKegiatanExportOptions() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (error) {
    console.error("Gagal mengambil opsi kegiatan ekspor:", error);

    return { error: "Gagal mengambil pilihan kegiatan ekspor." };
  }

  const kegiatan = ((data ?? []) as KegiatanRekap[]).map(mapKegiatan);

  return { data: kegiatan };
}
