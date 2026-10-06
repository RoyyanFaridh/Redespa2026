"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "../supabase/server";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeArray(values: string[]) {
  return [...values]
    .map((value) => normalize(value))
    .filter(Boolean)
    .sort();
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

function validateServer(
  nama: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  jamMulai: string,
  jamSelesai: string,
  lokasi: string,
  kelas: string[],
  jenisKelamin: string,
) {
  if (!nama) {
    return "Nama kegiatan wajib diisi";
  }

  if (!tanggalMulai) {
    return "Tanggal mulai wajib diisi";
  }

  if (!tanggalSelesai) {
    return "Tanggal selesai wajib diisi";
  }

  if (tanggalSelesai < tanggalMulai) {
    return "Tanggal selesai harus setelah atau sama dengan tanggal mulai";
  }

  if (!jamMulai) {
    return "Jam mulai wajib diisi";
  }

  if (!jamSelesai) {
    return "Jam selesai wajib diisi";
  }

  if (tanggalMulai === tanggalSelesai && jamSelesai <= jamMulai) {
    return "Jam selesai harus setelah jam mulai";
  }

  if (!lokasi) {
    return "Lokasi wajib diisi";
  }

  if (!Array.isArray(kelas)) {
    return "Kelas tidak valid";
  }

  if (
    jenisKelamin !== "" &&
    jenisKelamin !== "Laki-laki" &&
    jenisKelamin !== "Perempuan"
  ) {
    return "Jenis kelamin tidak valid";
  }

  return null;
}

export async function getKegiatan() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelas, jenis_kelamin, created_at",
    )
    .order("tanggal_mulai", { ascending: false })
    .order("jam_mulai", { ascending: false });

  if (error) {
    console.error("Gagal mengambil kegiatan:", error);

    throw new Error(`Gagal mengambil data kegiatan: ${error.message}`);
  }

  return data ?? [];
}

export async function addKegiatan(formData: FormData) {
  const supabase = await createClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "");
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "");
  const jamMulai = String(formData.get("jam_mulai") ?? "");
  const jamSelesai = String(formData.get("jam_selesai") ?? "");
  const lokasi = String(formData.get("lokasi") ?? "").trim();

  const kelas = getStringArray(formData, "kelas");

  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  console.log("Data kegiatan yang akan disimpan:", {
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    kelas,
    jenisKelamin,
  });

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    kelas,
    jenisKelamin,
  );

  if (validationError) {
    return {
      error: validationError,
    };
  }

  // Cek duplikasi kegiatan
  const { data: candidates, error: duplicateCheckError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelas, jenis_kelamin",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai);

  if (duplicateCheckError) {
    console.error("Gagal mengecek duplikasi kegiatan:", duplicateCheckError);

    return {
      error: `Gagal mengecek data kegiatan: ${duplicateCheckError.message}`,
    };
  }

  const isDuplicate = candidates?.some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi ?? "") === normalize(lokasi) &&
      sameArray(item.kelas, kelas) &&
      (item.jenis_kelamin ?? "") === jenisKelamin,
  );

  if (isDuplicate) {
    return {
      error: "Kegiatan dengan data yang sama sudah ada",
    };
  }

  // Insert kegiatan
  const { data, error: insertError } = await supabase
    .from("kegiatan")
    .insert({
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      lokasi,
      kelas: kelas.length > 0 ? kelas : null,
      jenis_kelamin: jenisKelamin || null,
    })
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelas, jenis_kelamin, created_at",
    )
    .single();

  if (insertError) {
    console.error("Gagal insert kegiatan:", insertError);

    return {
      error: `Gagal menyimpan kegiatan: ${insertError.message}`,
    };
  }

  console.log("Kegiatan berhasil disimpan:", data);

  revalidatePath("/admin/kegiatan");

  return {
    success: true,
    data,
  };
}

export async function updateKegiatan(id: number, formData: FormData) {
  const supabase = await createClient();

  const nama = String(formData.get("nama") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggal_mulai") ?? "");
  const tanggalSelesai = String(formData.get("tanggal_selesai") ?? "");
  const jamMulai = String(formData.get("jam_mulai") ?? "");
  const jamSelesai = String(formData.get("jam_selesai") ?? "");
  const lokasi = String(formData.get("lokasi") ?? "").trim();

  const kelas = getStringArray(formData, "kelas");

  const jenisKelamin = String(formData.get("jenis_kelamin") ?? "").trim();

  const validationError = validateServer(
    nama,
    tanggalMulai,
    tanggalSelesai,
    jamMulai,
    jamSelesai,
    lokasi,
    kelas,
    jenisKelamin,
  );

  if (validationError) {
    return {
      error: validationError,
    };
  }

  // Cek duplikasi kegiatan selain data yang sedang diedit
  const { data: candidates, error: duplicateCheckError } = await supabase
    .from("kegiatan")
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelas, jenis_kelamin",
    )
    .eq("tanggal_mulai", tanggalMulai)
    .eq("tanggal_selesai", tanggalSelesai)
    .neq("id", id);

  if (duplicateCheckError) {
    console.error("Gagal mengecek duplikasi kegiatan:", duplicateCheckError);

    return {
      error: `Gagal mengecek data kegiatan: ${duplicateCheckError.message}`,
    };
  }

  const isDuplicate = candidates?.some(
    (item) =>
      normalize(item.nama) === normalize(nama) &&
      item.jam_mulai === jamMulai &&
      item.jam_selesai === jamSelesai &&
      normalize(item.lokasi ?? "") === normalize(lokasi) &&
      sameArray(item.kelas, kelas) &&
      (item.jenis_kelamin ?? "") === jenisKelamin,
  );

  if (isDuplicate) {
    return {
      error: "Kegiatan dengan data yang sama sudah ada",
    };
  }

  // Update kegiatan
  const { data, error: updateError } = await supabase
    .from("kegiatan")
    .update({
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      lokasi,
      kelas: kelas.length > 0 ? kelas : null,
      jenis_kelamin: jenisKelamin || null,
    })
    .eq("id", id)
    .select(
      "id, nama, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, kelas, jenis_kelamin, created_at",
    )
    .single();

  if (updateError) {
    console.error("Gagal update kegiatan:", updateError);

    return {
      error: `Gagal memperbarui kegiatan: ${updateError.message}`,
    };
  }

  revalidatePath("/admin/kegiatan");

  return {
    success: true,
    data,
  };
}

export async function deleteKegiatan(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("kegiatan").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus kegiatan:", error);

    return {
      error: `Gagal menghapus kegiatan: ${error.message}`,
    };
  }

  revalidatePath("/admin/kegiatan");

  return {
    success: true,
  };
}
