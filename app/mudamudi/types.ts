export type Mudamudi = {
  id: number
  nama: string
  jenjang: string
  kelompok: string
  jenis_kelamin: string | null
  created_at: string
}

export type ModalState =
  | null
  | { type: 'add' }
  | { type: 'edit'; data: Mudamudi }
  | { type: 'delete'; data: Mudamudi }

export type FieldErrors = {
  nama?: string
  jenjang?: string
  kelompok?: string
  jenis_kelamin?: string
}

export type SortKey = 'created_at' | 'nama' | 'jenjang' | 'kelompok'

export type SortConfig = {
  key: SortKey
  direction: 'asc' | 'desc'
} | null

export type PerPageOption = 10 | 50 | 100