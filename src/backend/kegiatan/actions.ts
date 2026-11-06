
"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "../auth/admin";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";

import {
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
  KELOMPOK_OPTIONS,
} from "../mudamudi/constants";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeArray(values: string[]) {
  return [...values].map(normalize).filter(Boolean).sort();
}

function sameArray(
  first: string[] | null | undefined,
  second: string[] | null | undefined,
) {
  const firstNormalized = normalizeArray(first ?? []);
  const secondNormalized = normalizeArray(second ?? []);

  if (firstNormalized.length !== secondNormalized.length) {
    return false;
  }

  return firstNormalized.every(
    (value, index) => value === secondNormalized[index],
  );
}

function getStringArray(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function normalizeKelasTarget(kelas: string[]) {
  if (kelas.includes("Jamaah")) {
    return ["Jamaah"];
  }

  return kelas.length > 0 ? [...kelas] : null;
}

function isValidValues(values: string[], allowedValues: readonly string[]) {
  return (
    values.every((value) => allowedValues.includes(value)) &&
    new Set(values).size === values.length
  );
}

function validateServer(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
  kelompok: string[],
  kelas: string[],
  jenisKelamin: string,
) {
  if (!nama.trim()) {
    return "Nama kegiatan wajib diisi";
  }

  if (!tanggalMulai || !tanggalSelesai) {
    return "Tanggal mulai dan tanggal selesai wajib diisi";
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(tanggalSelesai) ||
    Number.isNaN(Date.parse(`${tanggalMulai}T00:00:00`)) ||
    Number.isNaN(Date.parse(`${tanggalSelesai}T00:00:00`))
  ) {
    return "Format tanggal tidak valid";
  }

  if (tanggalSelesai < tanggalMulai) {
    return "Tanggal selesai harus setelah atau sama dengan tanggal mulai";
  }

  if (!jamMulai || !jamSelesai) {
    return "Jam mulai dan jam selesai wajib diisi";
  }

  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(jamMulai) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(jamSelesai)
  ) {
    return "Format jam tidak valid";
  }

  if (tanggalMulai === tanggalSelesai && jamSelesai <= jamMulai) {
    return "Jam selesai harus setelah jam mulai";
  }

  if (!lokasi.trim()) {
    return "Lokasi wajib diisi";
  }

  if (!isValidValues(kelompok, KELOMPOK_OPTIONS)) {
    return "Pilihan kelompok tidak valid";
  }

  if (!isValidValues(kelas, KELAS_OPTIONS)) {
    return "Pilihan kelas tidak valid";
  }

  if (
    jenisKelamin !== "" &&
    !JENIS_KELAMIN_OPTIONS.includes(
      jenisKelamin as (typeof JENIS_KELAMIN_OPTIONS)[number],
    )
  ) {
    return "Pilihan jenis kelamin tidak valid";
  }

  return null;
}

async function attachCreatorInfo<
  T extends { created_by?: string | null },
>(kegiatan: T[]) {
  if (kegiatan.length === 0) {
    return kegiatan.map((item) => ({
      ...item,
      creator_nama: null as string | null,
      creator_label: item.created_by
        ? "Informasi pembuat tidak tersedia"
        : "Belum tercatat",
    }));
  }

  const creatorIds = [
    ...new Set(
      kegiatan
        .map((item) => item.created_by)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (creatorIds.length === 0) {
    return kegiatan.map((item) => ({
      ...item,
      creator_nama: null as string | null,
      creator_label: "Belum tercatat",
    }));
  }

  const adminClient = createAdminClient();

  const { data: profiles, error } = await adminClient
    .from("admin_profiles")
    .select("id, nama")
    .in("id", creatorIds);

  if (error) {
    throw new Error("Gagal mengambil informasi pembuat kegiatan.");
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return kegiatan.map((item) => {
    const profile = item.created_by
      ? profileMap.get(item.created_by)
      : null;

    return {
      ...item,
      creator_nama: profile?.nama ?? null,
      creator_label: profile
        ? "Admin REDESPA"
        : item.created_by
          ? "Pembuat tidak ditemukan"
          : "Belum tercatat",
    };
  });
}

export async function getKegiatan() {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin, created_at, created_by",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachCreatorInfo(data ?? []);
}

export async function addKegiatan(formData: FormData) {
  const { user } = await requireAdmin();

  const supabase = await createClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "").trim();
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "").trim();
  const jamMulai = String(formData.get("jam_mulai") ?? "").trim();
  const jamSelesai = String(formData.get("jam_selesai") ?? "").trim();
  const lokasi = String(formData.get("lokasi") ?? "").trim();

  const kelompok = getStringArray(formData, "kelompok");
  const kelas = getStringArray(formData, "kelas");
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    kelompok,
    kelas,
    jenisKelamin,
  );

  if (validationError) {
    return { error: validationError };
  }

  const kelompokTersimpan =
    kelompok.length > 0 ? [...kelompok].sort() : null;

  const kelasTersimpan = normalizeKelasTarget(kelas);

  const { data: candidates, error: candidatesError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai);

  if (candidatesError) {
    return { error: candidatesError.message };
  }

  const isDuplicate = (candidates ?? []).some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi ?? "") === normalize(lokasi) &&
      sameArray(item.kelompok, kelompokTersimpan) &&
      sameArray(item.kelas, kelasTersimpan) &&
      (item.jenis_kelamin ?? "") === jenisKelamin,
  );

  if (isDuplicate) {
    return { error: "Kegiatan dengan data yang sama sudah ada" };
  }

  const { error } = await supabase.from("kegiatan").insert({
    nama,
    tanggal_mulai: tanggalMulai,
    tanggal_selesai: tanggalSelesai,
    jam_mulai: jamMulai,
    jam_selesai: jamSelesai,
    lokasi,
    kelompok: kelompokTersimpan,
    kelas: kelasTersimpan,
    jenis_kelamin: jenisKelamin || null,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/admin");

  return { success: true };
}

export async function updateKegiatan(id: number, formData: FormData) {
  const { user } = await requireAdmin();

  const supabase = await createClient();

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "ID kegiatan tidak valid" };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "").trim();
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "").trim();
  const jamMulai = String(formData.get("jam_mulai") ?? "").trim();
  const jamSelesai = String(formData.get("jam_selesai") ?? "").trim();
  const lokasi = String(formData.get("lokasi") ?? "").trim();

  const kelompok = getStringArray(formData, "kelompok");
  const kelas = getStringArray(formData, "kelas");
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    kelompok,
    kelas,
    jenisKelamin,
  );

  if (validationError) {
    return { error: validationError };
  }

  const kelasTersimpan = normalizeKelasTarget(kelas);

  const { data: existing, error: existingError } = await supabase
    .from("kegiatan")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (!existing) {
    return { error: "Kegiatan tidak ditemukan" };
  }

  if (existing.created_by && existing.created_by !== user.id) {
    return {
      error: "Kamu tidak memiliki kewenangan untuk mengubah kegiatan ini",
    };
  }

  const kelompokTersimpan =
    kelompok.length > 0 ? [...kelompok].sort() : null;

  const { data: candidates, error: candidatesError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelompok, kelas, jenis_kelamin",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai)
    .neq("id", id);

  if (candidatesError) {
    return { error: candidatesError.message };
  }

  const isDuplicate = (candidates ?? []).some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi ?? "") === normalize(lokasi) &&
      sameArray(item.kelompok, kelompokTersimpan) &&
      sameArray(item.kelas, kelasTersimpan) &&
      (item.jenis_kelamin ?? "") === jenisKelamin,
  );

  if (isDuplicate) {
    return { error: "Kegiatan dengan data yang sama sudah ada" };
  }

  const { data: updated, error } = await supabase
    .from("kegiatan")
    .update({
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      lokasi,
      kelompok: kelompokTersimpan,
      kelas: kelasTersimpan,
      jenis_kelamin: jenisKelamin || null,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!updated || updated.length === 0) {
    return {
      error: "Kegiatan gagal diperbarui. Periksa kembali kewenangan admin.",
    };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/admin");

  return { success: true };
}

export async function deleteKegiatan(id: number) {
  const { user } = await requireAdmin();

  const supabase = await createClient();

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "ID kegiatan tidak valid" };
  }

  const { data: existing, error: existingError } = await supabase
    .from("kegiatan")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (!existing) {
    return { error: "Kegiatan tidak ditemukan" };
  }

  if (existing.created_by && existing.created_by !== user.id) {
    return {
      error: "Kamu tidak memiliki kewenangan untuk menghapus kegiatan ini",
    };
  }

  const { data: deleted, error } = await supabase
    .from("kegiatan")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!deleted || deleted.length === 0) {
    return {
      error: "Kegiatan gagal dihapus. Periksa kembali kewenangan admin.",
    };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/admin");

  return { success: true };
}
