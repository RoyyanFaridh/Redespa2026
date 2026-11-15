export type Jamaah = {
  id: number;
  kelompok: string;
  nama: string;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tahun_lahir: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  qr_id: string;
  created_at: string | null;
};

export type ModalState =
  | null
  | { type: "add" }
  | { type: "edit"; data: Jamaah }
  | { type: "delete"; data: Jamaah };

export type FieldErrors = {
  kelompok?: string;
  nama?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tahun_lahir?: string;
  no_hp?: string;
  pekerjaan?: string;
};

export type SortKey =
  | "kelompok"
  | "nama"
  | "jenis_kelamin"
  | "created_at";

export type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
} | null;

export type PerPageOption = 10 | 50 | 100;
