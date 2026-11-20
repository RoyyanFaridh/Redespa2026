
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

function isKegiatanBelumSelesai(
  tanggalSelesai: string,
  jamSelesai: string,
): boolean {
  const waktuSelesai = new Date(`${tanggalSelesai}T${jamSelesai}+07:00`);
  return !Number.isNaN(waktuSelesai.getTime()) && waktuSelesai.getTime() > Date.now();
}

function matchesKegiatan(
  jamaah: {
    kelompok: string;
    jenis_kelamin: string | null;
  },
  kegiatan: {
    kelompok: string[] | null;
    jenis_kelamin: string | null;
  },
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

async function syncJamaahToActiveKegiatan(
  jamaah: {
    id: number;
    nama: string;
    kelompok: string;
    jenis_kelamin: string | null;
    qr_id: string | null;
  },
): Promise<void> {
  if (!jamaah.qr_id) {
    console.error(
      `QR ID Jamaah ${jamaah.id} belum tersedia. Sinkronisasi sasaran dilewati.`,
    );
    return;
  }

  const supabase = createAdminClient();

  const { data: kegiatanList, error: kegiatanError } = await supabase
    .from("kegiatan")
    .select(
      "id, kelompok, jenis_kelamin, tanggal_selesai, jam_selesai, sasaran_dibekukan_pada",
    )
    .eq("jenis_peserta", "jamaah")
    .is("deleted_at", null)
    .is("sasaran_dibekukan_pada", null);

  if (kegiatanError) {
    console.error("Gagal mengambil kegiatan untuk sinkronisasi Jamaah:", kegiatanError);
    return;
  }

  for (const kegiatan of kegiatanList ?? []) {
    if (
      !isKegiatanBelumSelesai(
        kegiatan.tanggal_selesai,
        kegiatan.jam_selesai,
      )
    ) {
      continue;
    }

    const sesuai = matchesKegiatan(jamaah, kegiatan);

    const { data: existing, error: existingError } = await supabase
      .from("kegiatan_peserta")
      .select("id, is_target")
      .eq("kegiatan_id", kegiatan.id)
      .eq("jenis_peserta", "jamaah")
      .eq("jamaah_id", jamaah.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        `Gagal memeriksa snapshot Jamaah ${jamaah.id} pada kegiatan ${kegiatan.id}:`,
        existingError,
      );
      continue;
    }

    if (sesuai) {
      const payload = {
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
        diperbarui_pada: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from("kegiatan_peserta")
          .update(payload)
          .eq("id", existing.id);

        if (error) {
          console.error(
            `Gagal memperbarui snapshot Jamaah ${jamaah.id}:`,
            error,
          );
        }
      } else {
        const { error } = await supabase
          .from("kegiatan_peserta")
          .insert(payload);

        if (error) {
          console.error(
            `Gagal menambahkan snapshot Jamaah ${jamaah.id}:`,
            error,
          );
        }
      }
    } else if (existing?.is_target) {
      const { error } = await supabase
        .from("kegiatan_peserta")
        .update({
          is_target: false,
          dikeluarkan_pada: new Date().toISOString(),
          alasan_perubahan:
            "Data Jamaah tidak lagi memenuhi kriteria sasaran kegiatan.",
          diperbarui_pada: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error(
          `Gagal mengeluarkan Jamaah ${jamaah.id} dari sasaran kegiatan:`,
          error,
        );
      }
    }
  }
}

export async function getJamaah(): Promise<Jamaah[]> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jamaah")
    .select(
      "id, nama, kelompok, jenis_kelamin, tempat_lahir, tahun_lahir, no_hp, pekerjaan, qr_id, created_at",
    )
    .is("deleted_at", null)
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

  if (
    !kelompok ||
    !(KELOMPOK_OPTIONS as readonly string[]).includes(kelompok)
  ) {
    errors.kelompok = "Kelompok tidak valid.";
  }

  if (
    !jenisKelamin ||
    !(JENIS_KELAMIN_OPTIONS as readonly string[]).includes(jenisKelamin)
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid.";
  }

  let tahunLahir: number | null = null;

  if (tahunLahirRaw) {
    const parsed = parseInt(tahunLahirRaw, 10);
    const currentYear = new Date().getFullYear();

    if (Number.isNaN(parsed) || parsed < 1900 || parsed > currentYear) {
      errors.tahun_lahir = `Tahun lahir harus antara 1900 dan ${currentYear}.`;
    } else {
      tahunLahir = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const { data: existing, error: duplicateError } = await supabase
    .from("jamaah")
    .select("id, nama, kelompok")
    .eq("kelompok", kelompok)
    .is("deleted_at", null);

  if (duplicateError) {
    return {
      success: false,
      message: "Gagal memeriksa data Jamaah yang sudah terdaftar.",
    };
  }

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
      jenis_kelamin: jenisKelamin,
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

  await syncJamaahToActiveKegiatan(inserted);

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");
  revalidatePath("/admin/presensi");

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

  if (
    !kelompok ||
    !(KELOMPOK_OPTIONS as readonly string[]).includes(kelompok)
  ) {
    errors.kelompok = "Kelompok tidak valid.";
  }

  if (
    !jenisKelamin ||
    !(JENIS_KELAMIN_OPTIONS as readonly string[]).includes(jenisKelamin)
  ) {
    errors.jenis_kelamin = "Jenis kelamin tidak valid.";
  }

  let tahunLahir: number | null = null;

  if (tahunLahirRaw) {
    const parsed = parseInt(tahunLahirRaw, 10);
    const currentYear = new Date().getFullYear();

    if (Number.isNaN(parsed) || parsed < 1900 || parsed > currentYear) {
      errors.tahun_lahir = `Tahun lahir harus antara 1900 dan ${currentYear}.`;
    } else {
      tahunLahir = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const { data: existing, error: duplicateError } = await supabase
    .from("jamaah")
    .select("id, nama, kelompok")
    .eq("kelompok", kelompok)
    .neq("id", id)
    .is("deleted_at", null);

  if (duplicateError) {
    return {
      success: false,
      message: "Gagal memeriksa data Jamaah yang sudah terdaftar.",
    };
  }

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
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir || null,
      tahun_lahir: tahunLahir,
      no_hp: noHp || null,
      pekerjaan: pekerjaan || null,
    })
    .eq("id", id)
    .is("deleted_at", null)
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

  await syncJamaahToActiveKegiatan(updated);

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");
  revalidatePath("/admin/presensi");

  return {
    success: true,
    data: updated as Jamaah,
    message: "Data Jamaah berhasil diperbarui.",
  };
}

export async function deleteJamaah(id: number): Promise<ActionResult> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "ID Jamaah tidak valid." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("jamaah")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: admin.user.id,
      deleted_reason: "Dihapus melalui halaman Data Jamaah.",
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Gagal melakukan soft delete Jamaah:", deleteError);

    return {
      success: false,
      message: deleteError.message || "Gagal menghapus data Jamaah.",
    };
  }

  if (!deleted) {
    return {
      success: false,
      message: "Jamaah tidak ditemukan atau sudah dihapus.",
    };
  }

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");
  revalidatePath("/admin/presensi");

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
    return {
      success: true,
      insertedCount: 0,
      updatedCount: 0,
      errors: [],
    };
  }

  const { data: allExisting, error: existingError } = await supabase
    .from("jamaah")
    .select("id, nama, kelompok")
    .is("deleted_at", null);

  if (existingError) {
    return {
      success: false,
      insertedCount: 0,
      updatedCount: 0,
      errors: [existingError.message],
    };
  }

  const existingMap = new Map<string, number>();

  for (const item of allExisting ?? []) {
    existingMap.set(
      `${item.kelompok}:${normalizeName(item.nama)}`,
      item.id,
    );
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
        const updatePayload: Record<string, unknown> = {
          jenis_kelamin: row.jenis_kelamin,
        };

        if (row.tempat_lahir !== null) {
          updatePayload.tempat_lahir = row.tempat_lahir;
        }

        if (row.tahun_lahir !== null) {
          updatePayload.tahun_lahir = row.tahun_lahir;
        }

        if (row.no_hp !== null) {
          updatePayload.no_hp = row.no_hp;
        }

        if (row.pekerjaan !== null) {
          updatePayload.pekerjaan = row.pekerjaan;
        }

        const { data: updated, error } = await supabase
          .from("jamaah")
          .update(updatePayload)
          .eq("id", existingId)
          .is("deleted_at", null)
          .select(
            "id, nama, kelompok, jenis_kelamin, tempat_lahir, tahun_lahir, no_hp, pekerjaan, qr_id",
          )
          .single();

        if (error) {
          errors.push(`Baris ${i + 1} (${row.nama}): ${error.message}`);
        } else {
          updatedCount++;
          await syncJamaahToActiveKegiatan(updated);
        }
      } else {
        errors.push(
          `Baris ${i + 1}: ${row.nama} sudah ada di kelompok ${row.kelompok}.`,
        );
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
        .select(
          "id, nama, kelompok, jenis_kelamin, tempat_lahir, tahun_lahir, no_hp, pekerjaan, qr_id",
        )
        .single();

      if (error) {
        errors.push(`Baris ${i + 1} (${row.nama}): ${error.message}`);
      } else {
        insertedCount++;
        existingMap.set(key, newRow.id);
        await syncJamaahToActiveKegiatan(newRow);
      }
    }
  }

  revalidatePath("/admin/jamaah");
  revalidatePath("/admin");
  revalidatePath("/admin/presensi");

  return {
    success: errors.length === 0,
    insertedCount,
    updatedCount,
    errors,
  };
}
