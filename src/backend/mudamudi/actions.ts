"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "../supabase/admin";
import { requireAdmin } from "../auth/admin";

import { KELOMPOK_OPTIONS, JENIS_KELAMIN_OPTIONS } from "./constants";

import type { Mudamudi } from "./types";
import type { ImportRow } from "./importExcel";

type ActionResult = {
  success: boolean;
  message?: string;
  data?: Mudamudi;
  errors?: Record<string, string>;
};

function validate(
  nama: string,
  kelompok: string,
  jenisKelamin: string,
  tanggalLahir: string,
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
    !KELOMPOK_OPTIONS.includes(kelompok as (typeof KELOMPOK_OPTIONS)[number])
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

  if (!tanggalLahir) {
    errors.tanggal_lahir = "Tanggal lahir wajib diisi";
  }

  return errors;
}

function mapImportRow(row: ImportRow) {
  return {
    kelompok: row.kelompok.trim(),
    nama: row.nama.trim(),
    jenis_kelamin: row.jenis_kelamin.trim() || null,
    tempat_lahir: row.tempat_lahir.trim() || null,
    tanggal_lahir: row.tanggal_lahir.trim() || null,
    umur: row.umur ? Number(row.umur) : null,
    no_hp: row.no_hp.trim() || null,
    pekerjaan: row.pekerjaan.trim() || null,
    kelas: row.kelas.trim(),
    nama_ayah: row.nama_ayah.trim() || null,
    nama_ibu: row.nama_ibu.trim() || null,
    no_hp_ortu: row.no_hp_ortu.trim() || null,
    alamat: row.alamat.trim() || null,
  };
}

function createDuplicateKey(
  nama: string,
  kelas: string,
  kelompok: string,
): string {
  return [
    nama.trim().toLowerCase(),
    kelas.trim().toLowerCase(),
    kelompok.trim().toLowerCase(),
  ].join("|");
}

export async function addMudamudi(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const nama = String(formData.get("nama") ?? "").trim();

  const kelompok = String(formData.get("kelompok") ?? "").trim();

  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

  const errors = validate(nama, kelompok, jenisKelamin, tanggalLahir);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const kelas = String(formData.get("kelas") ?? "").trim();

  const { data: existing, error: existingError } = await supabase
    .from("mudamudi")
    .select("id")
    .eq("nama", nama)
    .eq("kelas", kelas)
    .eq("kelompok", kelompok)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      message: "Gagal memeriksa data Muda-Mudi",
    };
  }

  if (existing) {
    return {
      success: false,
      message:
        "Data Muda-Mudi dengan nama, kelas, dan kelompok tersebut sudah ada",
    };
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .insert({
      nama,
      kelompok,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: String(formData.get("tempat_lahir") ?? "").trim() || null,
      tanggal_lahir: tanggalLahir || null,
      umur: formData.get("umur") ? Number(formData.get("umur")) : null,
      no_hp: String(formData.get("no_hp") ?? "").trim() || null,
      pekerjaan: String(formData.get("pekerjaan") ?? "").trim() || null,
      kelas,
      nama_ayah: String(formData.get("nama_ayah") ?? "").trim() || null,
      nama_ibu: String(formData.get("nama_ibu") ?? "").trim() || null,
      no_hp_ortu: String(formData.get("no_hp_ortu") ?? "").trim() || null,
      alamat: String(formData.get("alamat") ?? "").trim() || null,
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

  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();

  const errors = validate(nama, kelompok, jenisKelamin, tanggalLahir);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const kelas = String(formData.get("kelas") ?? "").trim();

  const { data: existing, error: existingError } = await supabase
    .from("mudamudi")
    .select("id")
    .eq("nama", nama)
    .eq("kelas", kelas)
    .eq("kelompok", kelompok)
    .neq("id", id)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      message: "Gagal memeriksa data Muda-Mudi",
    };
  }

  if (existing) {
    return {
      success: false,
      message:
        "Data Muda-Mudi dengan nama, kelas, dan kelompok tersebut sudah ada",
    };
  }

  const { data, error } = await supabase
    .from("mudamudi")
    .update({
      nama,
      kelompok,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: String(formData.get("tempat_lahir") ?? "").trim() || null,
      tanggal_lahir: tanggalLahir || null,
      umur: formData.get("umur") ? Number(formData.get("umur")) : null,
      no_hp: String(formData.get("no_hp") ?? "").trim() || null,
      pekerjaan: String(formData.get("pekerjaan") ?? "").trim() || null,
      kelas,
      nama_ayah: String(formData.get("nama_ayah") ?? "").trim() || null,
      nama_ibu: String(formData.get("nama_ibu") ?? "").trim() || null,
      no_hp_ortu: String(formData.get("no_hp_ortu") ?? "").trim() || null,
      alamat: String(formData.get("alamat") ?? "").trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui Muda-Mudi",
    };
  }

  revalidatePath("/admin/mudamudi");

  return {
    success: true,
    message: "Muda-Mudi berhasil diperbarui",
    data,
  };
}

export async function deleteMudamudi(id: number): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase.from("mudamudi").delete().eq("id", id);

  if (error) {
    return {
      success: false,
      message: error.message || "Gagal menghapus Muda-Mudi",
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
    .order("kelompok", {
      ascending: true,
    })
    .order("nama", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message || "Gagal mengambil data Muda-Mudi");
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
    .order("nama", {
      ascending: true,
    })
    .limit(20);

  if (error) {
    throw new Error(error.message || "Gagal mencari Muda-Mudi");
  }

  return data ?? [];
}

export async function previewImportMudamudi(rows: ImportRow[]) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: existingData, error } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas, kelompok");

  if (error) {
    throw new Error(error.message || "Gagal mengambil data Muda-Mudi");
  }

  const existingKeys = new Set(
    (existingData ?? []).map((item) =>
      createDuplicateKey(item.nama, item.kelas, item.kelompok),
    ),
  );

  const importedKeys = new Set<string>();

  const preview = rows.map((row, index) => {
    const mapped = mapImportRow(row);

    const key = createDuplicateKey(mapped.nama, mapped.kelas, mapped.kelompok);

    const duplicateInDatabase = existingKeys.has(key);

    const duplicateInFile = importedKeys.has(key);

    importedKeys.add(key);

    return {
      row: index + 2,
      data: mapped,
      duplicateInDatabase,
      duplicateInFile,
      valid: !duplicateInDatabase && !duplicateInFile,
    };
  });

  return preview;
}

export async function importMudamudi(rows: ImportRow[]): Promise<{
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

  const { data: existingData, error: existingError } = await supabase
    .from("mudamudi")
    .select("id, nama, kelas, kelompok");

  if (existingError) {
    return {
      success: false,
      message: existingError.message || "Gagal mengambil data Muda-Mudi",
      imported: 0,
      skipped: 0,
      errors: [],
    };
  }

  const existingKeys = new Set(
    (existingData ?? []).map((item) =>
      createDuplicateKey(item.nama, item.kelas, item.kelompok),
    ),
  );

  const importedKeys = new Set<string>();

  const validRows: ReturnType<typeof mapImportRow>[] = [];

  const errors: string[] = [];
  let skipped = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const mapped = mapImportRow(row);

    if (
      !mapped.nama ||
      !mapped.kelas ||
      !mapped.kelompok ||
      !mapped.jenis_kelamin
    ) {
      errors.push(`Baris ${rowNumber}: Data wajib belum lengkap`);
      skipped++;
      return;
    }

    const key = createDuplicateKey(mapped.nama, mapped.kelas, mapped.kelompok);

    if (existingKeys.has(key)) {
      errors.push(`Baris ${rowNumber}: Data sudah ada di database`);
      skipped++;
      return;
    }

    if (importedKeys.has(key)) {
      errors.push(`Baris ${rowNumber}: Data duplikat dalam file`);
      skipped++;
      return;
    }

    importedKeys.add(key);
    validRows.push(mapped);
  });

  if (validRows.length === 0) {
    return {
      success: errors.length === 0,
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
      message: insertError.message || "Gagal mengimpor data Muda-Mudi",
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
