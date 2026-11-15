"use server";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { isMudamudiTargeted, isJamaahTargeted } from "./target";

import type {
  PresensiMetode,
  RekapitulasiKegiatan,
  RekapitulasiPresensi,
  RekapitulasiStatus,
  RekapitulasiPeserta,
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
  jenisPeserta?: "jamaah" | "mudamudi";
};

type KegiatanRekap = {
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

type PresensiRekap = {
  kegiatan_id: number;
  mudamudi_id: number | null;
  jamaah_id: number | null;
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
      peserta: [],
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

export async function getRekapitulasiKegiatanExportOptions() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .order("tanggal_mulai", { ascending: false });

  if (error) {
    console.error("Gagal mengambil opsi kegiatan rekapitulasi:", error);
    return { data: [], error: "Gagal memuat opsi kegiatan" };
  }

  return { data: (data as unknown as RekapitulasiKegiatan[]) ?? [] };
}

export async function getRekapitulasiPresensi({
  page,
  itemsPerPage,
  search = "",
  bulan,
  kegiatanId,
  kelompok,
  kelas,
  jenisPeserta,
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

  // Ambil daftar kegiatan
  let kegiatanQuery = supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (bulan) {
    const match = /^(\d{4})-(\d{2})$/.exec(bulan);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(Date.UTC(year, month, 1))
        .toISOString()
        .slice(0, 10);

      kegiatanQuery = kegiatanQuery
        .gte("tanggal_mulai", startDate)
        .lt("tanggal_mulai", endDate);
    }
  }

  if (kegiatanId !== undefined) {
    kegiatanQuery = kegiatanQuery.eq("id", kegiatanId);
  }

  const { data: rawKegiatan, error: kegiatanError } = await kegiatanQuery;

  if (kegiatanError) {
    console.error("Gagal mengambil data kegiatan:", kegiatanError);
    return emptyResult(safePage, safeItemsPerPage, "Gagal mengambil data kegiatan.");
  }

  // Tentukan jenis kegiatan: jika filter kegiatanId dipilih, ikuti kegiatan tersebut.
  // Jika tidak, default ke mudamudi atau param jenisPeserta.
  let activeJenis: "jamaah" | "mudamudi" = jenisPeserta || "mudamudi";

  if (kegiatanId && rawKegiatan && rawKegiatan.length > 0) {
    const { data: jenisData } = await supabase
      .from("kegiatan")
      .select("jenis_peserta")
      .eq("id", kegiatanId)
      .maybeSingle();

    if (jenisData?.jenis_peserta) {
      activeJenis = jenisData.jenis_peserta;
    } else {
      activeJenis = rawKegiatan[0].kelas && rawKegiatan[0].kelas.length > 0 ? "mudamudi" : "jamaah";
    }
  }

  const kegiatanData: KegiatanRekap[] = (rawKegiatan ?? []).map((k: any) => ({
    ...k,
    jenis_peserta: activeJenis,
  }));

  let pesertaData: RekapitulasiPeserta[] = [];
  const keyword = search.trim();

  if (activeJenis === "jamaah") {
    let queryJamaah = supabase
      .from("jamaah")
      .select("id, nama, kelompok, jenis_kelamin")
      .order("nama", { ascending: true });

    if (keyword) {
      queryJamaah = queryJamaah.ilike("nama", `%${keyword}%`);
    }

    if (kelompokFilters.length === 1) {
      queryJamaah = queryJamaah.eq("kelompok", kelompokFilters[0]);
    } else if (kelompokFilters.length > 1) {
      queryJamaah = queryJamaah.in("kelompok", kelompokFilters);
    }

    const { data: jamaahList, error: jamaahError } = await queryJamaah;

    if (jamaahError) {
      console.error("Gagal mengambil data Jamaah:", jamaahError);
      return emptyResult(safePage, safeItemsPerPage, "Gagal mengambil data Jamaah.");
    }

    pesertaData = (jamaahList ?? []).map((j) => ({
      id: j.id,
      nama: j.nama,
      kelompok: j.kelompok,
      kelas: [],
      jenis_kelamin: j.jenis_kelamin,
    }));
  } else {
    // Muda-Mudi
    let queryMudamudi = supabase
      .from("mudamudi")
      .select("id, nama, kelompok, kelas, jenis_kelamin")
      .order("nama", { ascending: true });

    if (keyword) {
      queryMudamudi = queryMudamudi.ilike("nama", `%${keyword}%`);
    }

    if (kelompokFilters.length === 1) {
      queryMudamudi = queryMudamudi.eq("kelompok", kelompokFilters[0]);
    } else if (kelompokFilters.length > 1) {
      queryMudamudi = queryMudamudi.in("kelompok", kelompokFilters);
    }

    if (kelasFilters.length > 0 && !kelasFilters.includes("Jamaah")) {
      queryMudamudi = queryMudamudi.overlaps("kelas", kelasFilters);
    }

    const { data: mudamudiList, error: mudamudiError } = await queryMudamudi;

    if (mudamudiError) {
      console.error("Gagal mengambil data Muda-Mudi:", mudamudiError);
      return emptyResult(safePage, safeItemsPerPage, "Gagal mengambil data Muda-Mudi.");
    }

    pesertaData = (mudamudiList ?? []).map((m) => ({
      id: m.id,
      nama: m.nama,
      kelompok: m.kelompok,
      kelas: m.kelas || [],
      jenis_kelamin: m.jenis_kelamin,
    }));
  }

  const totalItems = pesertaData.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeItemsPerPage);
  const currentPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1;

  const from = (currentPage - 1) * safeItemsPerPage;
  const to = from + safeItemsPerPage;
  const pesertaPaginated = pesertaData.slice(from, to);

  const pesertaIds = pesertaPaginated.map((p) => p.id);
  const kegiatanIds = kegiatanData.map((k) => k.id);

  let presensiRows: PresensiRekap[] = [];

  if (pesertaIds.length > 0 && kegiatanIds.length > 0) {
    let presensiQuery = supabase
      .from("presensi")
      .select(
        "kegiatan_id, mudamudi_id, jamaah_id, status, metode, waktu_checkin, keterangan",
      )
      .in("kegiatan_id", kegiatanIds);

    if (activeJenis === "jamaah") {
      presensiQuery = presensiQuery.in("jamaah_id", pesertaIds);
    } else {
      presensiQuery = presensiQuery.in("mudamudi_id", pesertaIds);
    }

    const { data: presensiResult, error: presensiError } = await presensiQuery;

    if (presensiError) {
      console.error("Gagal mengambil presensi rekap:", presensiError);
      return emptyResult(
        currentPage,
        safeItemsPerPage,
        "Gagal mengambil data presensi.",
        totalItems,
        totalPages,
      );
    }

    presensiRows = (presensiResult ?? []) as PresensiRekap[];
  }

  const presensiMap = new Map<string, PresensiRekap>();

  for (const item of presensiRows) {
    const pId = activeJenis === "jamaah" ? item.jamaah_id : item.mudamudi_id;
    if (pId) {
      presensiMap.set(`${item.kegiatan_id}:${pId}`, item);
    }
  }

  const kehadiran = kegiatanData.flatMap((kegiatan) =>
    pesertaPaginated.map((peserta) => {
      const key = `${kegiatan.id}:${peserta.id}`;
      const presensi = presensiMap.get(key);

      const targeted =
        activeJenis === "jamaah"
          ? isJamaahTargeted(kegiatan, peserta)
          : isMudamudiTargeted(kegiatan, peserta);

      if (!targeted) {
        return {
          kegiatan_id: kegiatan.id,
          peserta_id: peserta.id,
          mudamudi_id: activeJenis === "mudamudi" ? peserta.id : null,
          jamaah_id: activeJenis === "jamaah" ? peserta.id : null,
          status: "tidak_berlaku" as RekapitulasiStatus,
          metode: null,
          waktu_checkin: null,
          keterangan: null,
        };
      }

      return {
        kegiatan_id: kegiatan.id,
        peserta_id: peserta.id,
        mudamudi_id: activeJenis === "mudamudi" ? peserta.id : null,
        jamaah_id: activeJenis === "jamaah" ? peserta.id : null,
        status: (presensi?.status as RekapitulasiStatus) ?? null,
        metode: (presensi?.metode as PresensiMetode) ?? null,
        waktu_checkin: presensi?.waktu_checkin ?? null,
        keterangan: presensi?.keterangan ?? null,
      };
    }),
  );

  return {
    data: {
      peserta: pesertaPaginated,
      mudamudi: pesertaPaginated, // legacy alias
      kegiatan: kegiatanData,
      kehadiran,
      jenis_peserta: activeJenis,
    },
    pagination: {
      page: currentPage,
      itemsPerPage: safeItemsPerPage,
      totalItems,
      totalPages,
    },
  };
}
