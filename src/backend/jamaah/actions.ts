"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "../supabase/admin";
import { requireAdmin } from "../auth/admin";
import { KELOMPOK_OPTIONS, JENIS_KELAMIN_OPTIONS } from "./constants";
import type { Jamaah } from "./types";
import type { ImportRow } from "./importExcel";

type ActionResult = {
  success: boolean;
  message?: string;
  data?: Jamaah;
  errors?: Record<string, string>;
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getJamaah(): Promise<Jamaah[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jamaah")
    .select(
      "id, nama, kelompok, jenis_kelamin, tempat_lahir, tahun_lahir, no_hp, pekerjaan, qr_id, created_at",
    )
    .order("nama", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data Jamaah:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as Jamaah[];
}

export async function addJamaah(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();
  const tempatLahir = String(formData.get("tempat_lahir") ?? "").trim();
  const tahunLahirRaw = String(formData.get("tahun_lahir") ?? "").trim();
  const noHp = String(formData.get("no_hp") ?? "").trim();
  const pekerjaan = String(formData.get("pekerjaan") ?? "").trim();

  const errors: Record<string, string> = {};

  if (!nama) {
    errors.nama = "Nama lengkap wajib diisi.";
  }

  if (!kelompok || !(KELOMPOK_OPTIONS as readonly string[]).includes(kelompok as any)) {
    errors.kelompok = "Kelompok tidak valid.";
  }

  if (
    !jenisKelamin ||
    !(JENIS_KELAMIN_OPTIONS as readonly string[]).includes(jenisKelamin as any)
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid.";
  }

  let tahunLahir: number | null = null;
  if (tahunLahirRaw) {
    const parsed = parseInt(tahunLahirRaw, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(parsed) || parsed < 1900 || parsed > currentYear) {
      errors.tahun_lahir = `Tahun lahir harus antara 1900 dan ${currentYear}.`;
    } else {
      tahunLahir = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Cek duplikasi berdasarkan kelompok & nama
  const { data: existing } = await supabase
    .from("jamaah")
    .select("id, nama, kelompok")
    .eq("kelompok", kelompok);

  const isDuplicate = (existing ?? []).some(
    (item) => normalizeName(item.nama) === normalizeName(nama),
  );

  if (isDuplicate) {
    return {
      success: false,
      errors: {
        nama: `Jamaah dengan nama "${nama}" sudah terdaftar di kelompok ${kelompok}.`,
      },
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("jamaah")
    .insert({
      nama,
      kelompok,
      jenis_kelamin: jenisKelamin || null,
      tempat_lahir: tempatLahir || null,
      tahun_lahir: tahunLahir,
      no_hp: noHp || null,
      pekerjaan: pekerjaan || null,
    })
    .select(
      "id, nama, kelompok, jenis_kelamin, tempat_lahir, tahun_lahir, no_hp, pekerjaan, qr_id, created_at",
    )
    .single();

  if (insertError) {
    console.error("Gagal menambahkan Jamaah:", insertError);
    return {
      success: false,
      message: insertError.message || "Gagal menyimpan data Jamaah.",
    };
  }

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");

  return {
    success: true,
    data: inserted as Jamaah,
    message: "Data Jamaah berhasil ditambahkan.",
  };
}

export async function updateJamaah(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "ID Jamaah tidak valid." };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const kelompok = String(formData.get("kelompok") ?? "").trim();
  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();
  const tempatLahir = String(formData.get("tempat_lahir") ?? "").trim();
  const tahunLahirRaw = String(formData.get("tahun_lahir") ?? "").trim();
  const noHp = String(formData.get("no_hp") ?? "").trim();
  const pekerjaan = String(formData.get("pekerjaan") ?? "").trim();

  const errors: Record<string, string> = {};

  if (!nama) {
    errors.nama = "Nama lengkap wajib diisi.";
  }

  if (!kelompok || !(KELOMPOK_OPTIONS as readonly string[]).includes(kelompok as any)) {
    errors.kelompok = "Kelompok tidak valid.";
  }

  if (
    !jenisKelamin ||
    !(JENIS_KELAMIN_OPTIONS as readonly string[]).includes(jenisKelamin as any)
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid.";
  }

  let tahunLahir: number | null = null;
  if (tahunLahirRaw) {
    const parsed = parseInt(tahunLahirRaw, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(parsed) || parsed < 1900 || parsed > currentYear) {
      errors.tahun_lahir = `Tahun lahir harus antara 1900 dan ${currentYear}.`;
    } else {
      tahunLahir = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Cek duplikasi dengan data lain
  const { data: existing } = await supabase
    .from("jamaah")
    .select("id, nama, kelompok")
    .eq("kelompok", kelompok)
    .neq("id", id);

  const isDuplicate = (existing ?? []).some(
    (item) => normalizeName(item.nama) === normalizeName(nama),
  );

  if (isDuplicate) {
    return {
      success: false,
      errors: {
        nama: `Jamaah lain dengan nama "${nama}" sudah terdaftar di kelompok ${kelompok}.`,
      },
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("jamaah")
    .update({
      nama,
      kelompok,
      jenis_kelamin: jenisKelamin || null,
      tempat_lahir: tempatLahir || null,
      tahun_lahir: tahunLahir,
      no_hp: noHp || null,
      pekerjaan: pekerjaan || null,
    })
    .eq("id", id)
    .select(
      "id, nama, kelompok, jenis_kelamin, tempat_lahir, tahun_lahir, no_hp, pekerjaan, qr_id, created_at",
    )
    .single();

  if (updateError) {
    console.error("Gagal memperbarui Jamaah:", updateError);
    return {
      success: false,
      message: updateError.message || "Gagal memperbarui data Jamaah.",
    };
  }

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");

  return {
    success: true,
    data: updated as Jamaah,
    message: "Data Jamaah berhasil diperbarui.",
  };
}

export async function deleteJamaah(id: number): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "ID Jamaah tidak valid." };
  }

  // Cek apakah ada riwayat presensi
  const { count: presensiCount } = await supabase
    .from("presensi")
    .select("id", { count: "exact", head: true })
    .eq("jamaah_id", id);

  if (presensiCount && presensiCount > 0) {
    return {
      success: false,
      message: `Jamaah tidak dapat dihapus karena memiliki ${presensiCount} riwayat presensi terkait.`,
    };
  }

  const { error: deleteError } = await supabase
    .from("jamaah")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Gagal menghapus Jamaah:", deleteError);
    return {
      success: false,
      message: deleteError.message || "Gagal menghapus data Jamaah.",
    };
  }

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");

  return {
    success: true,
    message: "Data Jamaah berhasil dihapus.",
  };
}

export type ImportJamaahResult = {
  success: boolean;
  insertedCount: number;
  updatedCount: number;
  errors: string[];
};

export async function importJamaah(
  rows: ImportRow[],
  mode: "insert_only" | "upsert" = "insert_only",
): Promise<ImportJamaahResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!rows || rows.length === 0) {
    return { success: true, insertedCount: 0, updatedCount: 0, errors: [] };
  }

  const { data: allExisting } = await supabase
    .from("jamaah")
    .select("id, nama, kelompok");

  const existingMap = new Map<string, number>();
  for (const item of allExisting ?? []) {
    existingMap.set(`${item.kelompok}:${normalizeName(item.nama)}`, item.id);
  }

  let insertedCount = 0;
  let updatedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const key = `${row.kelompok}:${normalizeName(row.nama)}`;
    const existingId = existingMap.get(key);

    if (existingId) {
      if (mode === "upsert") {
        const updatePayload: Record<string, any> = {
          jenis_kelamin: row.jenis_kelamin,
        };
        if (row.tempat_lahir !== null) updatePayload.tempat_lahir = row.tempat_lahir;
        if (row.tahun_lahir !== null) updatePayload.tahun_lahir = row.tahun_lahir;
        if (row.no_hp !== null) updatePayload.no_hp = row.no_hp;
        if (row.pekerjaan !== null) updatePayload.pekerjaan = row.pekerjaan;

        const { error } = await supabase
          .from("jamaah")
          .update(updatePayload)
          .eq("id", existingId);

        if (error) {
          errors.push(`Baris ${i + 1} (${row.nama}): ${error.message}`);
        } else {
          updatedCount++;
        }
      } else {
        // Lewati atau catat duplikat
        errors.push(`Baris ${i + 1}: ${row.nama} sudah ada di kelompok ${row.kelompok}.`);
      }
    } else {
      const { data: newRow, error } = await supabase
        .from("jamaah")
        .insert({
          nama: row.nama,
          kelompok: row.kelompok,
          jenis_kelamin: row.jenis_kelamin,
          tempat_lahir: row.tempat_lahir,
          tahun_lahir: row.tahun_lahir,
          no_hp: row.no_hp,
          pekerjaan: row.pekerjaan,
        })
        .select("id")
        .single();

      if (error) {
        errors.push(`Baris ${i + 1} (${row.nama}): ${error.message}`);
      } else {
        insertedCount++;
        if (newRow) {
          existingMap.set(key, newRow.id);
        }
      }
    }
  }

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");

  return {
    success: errors.length === 0,
    insertedCount,
    updatedCount,
    errors,
  };
}
