
"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "../supabase/admin";
import { requireAdmin } from "../auth/admin";

import {
  KELOMPOK_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
} from "./constants";

import type { Mudamudi } from "./types";
import type { ImportRow } from "./importExcel";

type ActionResult = {
  success: boolean;
  message?: string;
  data?: Mudamudi;
  errors?: Record<string, string>;
};

type ClassValue = string | string[] | null | undefined;

const MUDAMUDI_KELAS_OPTIONS = KELAS_OPTIONS;

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function parseClasses(value: ClassValue): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return [
    ...new Set(
      values
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeClasses(value: ClassValue): string[] {
  const classes = parseClasses(value);

  return MUDAMUDI_KELAS_OPTIONS.filter((item) =>
    classes.includes(item),
  );
}

function validateClasses(classes: string[]): boolean {
  if (classes.length === 0) {
    return false;
  }

  return classes.every((item) =>
    MUDAMUDI_KELAS_OPTIONS.includes(
      item as (typeof MUDAMUDI_KELAS_OPTIONS)[number],
    ),
  );
}

function parseYear(value: string): number | null {
  const year = value.trim();

  if (!year) {
    return null;
  }

  const parsedYear = Number(year);

  if (!Number.isInteger(parsedYear)) {
    return null;
  }

  return parsedYear;
}

function validateYear(value: string): boolean {
  const year = value.trim();

  if (!year) {
    return true;
  }

  if (!/^\d{4}$/.test(year)) {
    return false;
  }

  const parsedYear = Number(year);
  const currentYear = new Date().getFullYear();

  return parsedYear >= 1900 && parsedYear <= currentYear;
}

function validate(
  nama: string,
  kelompok: string,
  jenisKelamin: string,
  kelas: string[],
  tahunLahir: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!nama.trim()) {
    errors.nama = "Nama wajib diisi";
  } else if (/\d/.test(nama)) {
    errors.nama = "Nama tidak boleh mengandung angka";
  }

  if (!kelompok) {
    errors.kelompok = "Kelompok wajib dipilih";
  } else if (
    !KELOMPOK_OPTIONS.includes(
      kelompok as (typeof KELOMPOK_OPTIONS)[number],
    )
  ) {
    errors.kelompok = "Kelompok tidak valid";
  }

  if (!jenisKelamin) {
    errors.jenis_kelamin = "Jenis kelamin wajib dipilih";
  } else if (
    !JENIS_KELAMIN_OPTIONS.includes(
      jenisKelamin as (typeof JENIS_KELAMIN_OPTIONS)[number],
    )
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid";
  }

  if (!validateClasses(kelas)) {
    errors.kelas =
      "Pilih minimal satu kelas Mudamudi yang valid";
  }

  if (!validateYear(tahunLahir)) {
    errors.tahun_lahir =
      "Tahun lahir harus berupa 4 digit dan tidak boleh melebihi tahun sekarang";
  }

  return errors;
}

function validateImportRow(row: ImportRow): Record<string, string> {
  const errors: Record<string, string> = {};

  const nama = String(row.nama ?? "").trim();
  const kelompok = String(row.kelompok ?? "").trim();
  const jenisKelamin = String(row.jenis_kelamin ?? "").trim();
  const tahunLahir = String(row.tahun_lahir ?? "").trim();
  const kelas = parseClasses(row.kelas);

  if (!nama) {
    errors.nama = "Nama wajib diisi";
  } else if (/\d/.test(nama)) {
    errors.nama = "Nama tidak boleh mengandung angka";
  }

  if (
    !KELOMPOK_OPTIONS.includes(
      kelompok as (typeof KELOMPOK_OPTIONS)[number],
    )
  ) {
    errors.kelompok = "Kelompok tidak valid";
  }

  if (
    !JENIS_KELAMIN_OPTIONS.includes(
      jenisKelamin as (typeof JENIS_KELAMIN_OPTIONS)[number],
    )
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid";
  }

  if (!validateClasses(kelas)) {
    errors.kelas = "Kelas tidak valid atau belum dipilih";
  }

  if (!validateYear(tahunLahir)) {
    errors.tahun_lahir =
      "Tahun lahir harus berupa 4 digit dan tidak boleh melebihi tahun sekarang";
  }

  return errors;
}

function mapImportRow(row: ImportRow) {
  const kelas = parseClasses(row.kelas);

  return {
    kelompok: (row.kelompok ?? "").trim(),
    nama: (row.nama ?? "").trim(),
    jenis_kelamin: (row.jenis_kelamin ?? "").trim() || null,
    tempat_lahir: (row.tempat_lahir ?? "").trim() || null,
    tahun_lahir: parseYear(String(row.tahun_lahir ?? "")),
    no_hp: (row.no_hp ?? "").trim() || null,
    pekerjaan: (row.pekerjaan ?? "").trim() || null,
    kelas: normalizeClasses(kelas),
  };
}

function createDuplicateKey(
  nama: string,
  kelompok: string,
): string {
  return [
    normalizeText(nama),
    normalizeText(kelompok),
  ].join("|");
}

function getClassesFromForm(formData: FormData): string[] {
  return formData
    .getAll("kelas")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function findDuplicateMudamudi(
  nama: string,
  kelompok: string,
  excludeId?: number,
): Promise<{ exists: boolean; error: string | null }> {
  const supabase = createAdminClient();

  let query = supabase
    .from("mudamudi")
    .select("id, nama, kelompok")
    .eq("kelompok", kelompok);

  if (excludeId !== undefined) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    return {
      exists: false,
      error: error.message,
    };
  }

  const targetKey = createDuplicateKey(nama, kelompok);

  const exists = (data ?? []).some((item) => {
    return (
      createDuplicateKey(item.nama ?? "", item.kelompok ?? "") ===
      targetKey
    );
  });

  return {
    exists,
    error: null,
  };
}

export async function addMudamudi(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(
    formData.get("jenis_kelamin") ?? "",
  ).trim();

  const tempatLahir = String(
    formData.get("tempat_lahir") ?? "",
  ).trim();

  const tahunLahir = String(
    formData.get("tahun_lahir") ?? "",
  ).trim();

  const kelasInput = getClassesFromForm(formData);

  const errors = validate(
    nama,
    kelompok,
    jenisKelamin,
    kelasInput,
    tahunLahir,
  );

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const kelas = normalizeClasses(kelasInput);

  const duplicate = await findDuplicateMudamudi(
    nama,
    kelompok,
  );

  if (duplicate.error) {
    return {
      success: false,
      message: "Gagal memeriksa data Muda-Mudi",
    };
  }

  if (duplicate.exists) {
    return {
      success: false,
      message:
        "Peserta dengan nama dan kelompok tersebut sudah terdaftar",
    };
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .insert({
      nama,
      kelompok,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir || null,
      tahun_lahir: parseYear(tahunLahir),
      no_hp: String(formData.get("no_hp") ?? "").trim() || null,
      pekerjaan:
        String(formData.get("pekerjaan") ?? "").trim() || null,
      kelas,
    })
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan Muda-Mudi",
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
    message: "Muda-Mudi berhasil ditambahkan",
    data,
  };
}

export async function updateMudamudi(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(
    formData.get("jenis_kelamin") ?? "",
  ).trim();

  const tempatLahir = String(
    formData.get("tempat_lahir") ?? "",
  ).trim();

  const tahunLahir = String(
    formData.get("tahun_lahir") ?? "",
  ).trim();

  const kelasInput = getClassesFromForm(formData);

  const errors = validate(
    nama,
    kelompok,
    jenisKelamin,
    kelasInput,
    tahunLahir,
  );

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const kelas = normalizeClasses(kelasInput);

  const duplicate = await findDuplicateMudamudi(
    nama,
    kelompok,
    id,
  );

  if (duplicate.error) {
    return {
      success: false,
      message: "Gagal memeriksa data Muda-Mudi",
    };
  }

  if (duplicate.exists) {
    return {
      success: false,
      message:
        "Peserta dengan nama dan kelompok tersebut sudah terdaftar",
    };
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .update({
      nama,
      kelompok,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir || null,
      tahun_lahir: parseYear(tahunLahir),
      no_hp: String(formData.get("no_hp") ?? "").trim() || null,
      pekerjaan:
        String(formData.get("pekerjaan") ?? "").trim() || null,
      kelas,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui Muda-Mudi",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "Data Muda-Mudi tidak ditemukan atau sudah dihapus",
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
    message: "Muda-Mudi berhasil diperbarui",
    data,
  };
}

export async function deleteMudamudi(
  id: number,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("mudamudi")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_reason: "Dihapus melalui pengelolaan data Mudamudi",
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      message: error.message || "Gagal menghapus Muda-Mudi",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "Data Muda-Mudi tidak ditemukan atau sudah dihapus",
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
    message: "Muda-Mudi berhasil dihapus",
  };
}

export async function getMudamudi(): Promise<Mudamudi[]> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("mudamudi")
    .select("*")
    .is("deleted_at", null)
    .order("kelompok", {
      ascending: true,
    })
    .order("nama", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      error.message || "Gagal mengambil data Muda-Mudi",
    );
  }

  return data ?? [];
}

export async function searchMudamudiNames(query: string) {
  await requireAdmin();

  const supabase = createAdminClient();

  const search = query.trim();

  if (search.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .select("id, nama, kelompok")
    .ilike("nama", `%${search}%`)
    .is("deleted_at", null)
    .order("nama", {
      ascending: true,
    })
    .limit(20);

  if (error) {
    throw new Error(
      error.message || "Gagal mencari Muda-Mudi",
    );
  }

  return data ?? [];
}

export async function previewImportMudamudi(
  rows: ImportRow[],
) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: existingData, error } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas, kelompok");

  if (error) {
    throw new Error(
      error.message || "Gagal mengambil data Muda-Mudi",
    );
  }

  const existingKeys = new Set(
    (existingData ?? []).map((item) =>
      createDuplicateKey(
        item.nama ?? "",
        item.kelompok ?? "",
      ),
    ),
  );

  const importedKeys = new Set<string>();

  const preview = rows.map((row, index) => {
    const mapped = mapImportRow(row);
    const rowErrors = validateImportRow(row);

    const key = createDuplicateKey(
      mapped.nama,
      mapped.kelompok,
    );

    const duplicateInDatabase = existingKeys.has(key);
    const duplicateInFile = importedKeys.has(key);

    importedKeys.add(key);

    return {
      row: index + 2,
      data: mapped,
      duplicateInDatabase,
      duplicateInFile,
      valid:
        !duplicateInDatabase &&
        !duplicateInFile &&
        Object.keys(rowErrors).length === 0,
      errors: rowErrors,
    };
  });

  return preview;
}

export async function importMudamudi(
  rows: ImportRow[],
): Promise<{
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
  errors: string[];
}> {
  await requireAdmin();

  const supabase = createAdminClient();

  if (!rows.length) {
    return {
      success: false,
      message: "Tidak ada data untuk diimpor",
      imported: 0,
      skipped: 0,
      errors: [],
    };
  }

  const { data: existingData, error: existingError } =
    await supabase
      .from("mudamudi")
      .select("id, nama, kelas, kelompok");

  if (existingError) {
    return {
      success: false,
      message:
        existingError.message ||
        "Gagal mengambil data Muda-Mudi",
      imported: 0,
      skipped: 0,
      errors: [],
    };
  }

  const existingKeys = new Set(
    (existingData ?? []).map((item) =>
      createDuplicateKey(
        item.nama ?? "",
        item.kelompok ?? "",
      ),
    ),
  );

  const importedKeys = new Set<string>();

  const validRows: ReturnType<typeof mapImportRow>[] = [];

  const errors: string[] = [];
  let skipped = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const mapped = mapImportRow(row);
    const rowErrors = validateImportRow(row);

    if (Object.keys(rowErrors).length > 0) {
      errors.push(
        `Baris ${rowNumber}: ${Object.values(rowErrors).join(", ")}`,
      );
      skipped++;
      return;
    }

    const key = createDuplicateKey(
      mapped.nama,
      mapped.kelompok,
    );

    if (existingKeys.has(key)) {
      errors.push(
        `Baris ${rowNumber}: Peserta dengan nama dan kelompok tersebut sudah ada di database`,
      );
      skipped++;
      return;
    }

    if (importedKeys.has(key)) {
      errors.push(
        `Baris ${rowNumber}: Data peserta duplikat dalam file`,
      );
      skipped++;
      return;
    }

    importedKeys.add(key);
    validRows.push(mapped);
  });

  if (validRows.length === 0) {
    return {
      success: false,
      message:
        errors.length > 0
          ? "Tidak ada data yang dapat diimpor"
          : "Tidak ada data baru",
      imported: 0,
      skipped,
      errors,
    };
  }

  const { error: insertError } = await supabase
    .from("mudamudi")
    .insert(validRows);

  if (insertError) {
    return {
      success: false,
      message:
        insertError.message ||
        "Gagal mengimpor data Muda-Mudi",
      imported: 0,
      skipped,
      errors,
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
    message: `${validRows.length} data Muda-Mudi berhasil diimpor`,
    imported: validRows.length,
    skipped,
    errors,
  };
}
