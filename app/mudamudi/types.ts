export type Mudamudi = { id: number; nama: string; jenjang: string; kelompok: string }

export type ModalState =
  | null
  | { type: 'add' }
  | { type: 'edit'; data: Mudamudi }
  | { type: 'delete'; data: Mudamudi }

export type FieldErrors = { nama?: string; jenjang?: string; kelompok?: string }

export type SortKey = 'nama' | 'jenjang' | 'kelompok'
export type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null