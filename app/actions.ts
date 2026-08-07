'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { toTitleCase } from './mudamudi/format'

const JENJANG_OPTIONS = ['Pra Nikah', 'Remaja', 'Pra Remaja']
const KELOMPOK_OPTIONS = ['Pandak 1', 'Pandak 2', 'Pandak 3', 'Pandak 4', 'Carikan', 'Payungan']

function validate(nama: string, jenjang: string, kelompok: string) {
  if (!nama.trim()) return 'Nama wajib diisi'
  if (/\d/.test(nama)) return 'Nama tidak boleh mengandung angka'
  if (!JENJANG_OPTIONS.includes(jenjang)) return 'Jenjang tidak valid'
  if (!KELOMPOK_OPTIONS.includes(kelompok)) return 'Kelompok tidak valid'
  return null
}

function normalizeForCompare(nama: string) {
  return nama.trim().toLowerCase()
}

export async function addMudamudi(formData: FormData) {
  const supabase = await createClient()
  const namaRaw = (formData.get('nama') as string).trim()
  const jenjang = formData.get('jenjang') as string
  const kelompok = formData.get('kelompok') as string

  const validationError = validate(namaRaw, jenjang, kelompok)
  if (validationError) return { error: validationError }

  const nama = toTitleCase(namaRaw)

  const { data: candidates } = await supabase
    .from('mudamudi')
    .select('id, nama')
    .eq('jenjang', jenjang)
    .eq('kelompok', kelompok)

  const isDuplicate = candidates?.some((c) => normalizeForCompare(c.nama) === normalizeForCompare(nama))
  if (isDuplicate) return { error: 'Data dengan nama, jenjang, dan kelompok yang sama sudah ada' }

  const { error } = await supabase.from('mudamudi').insert({ nama, jenjang, kelompok })
  if (error) {
    if (error.code === '23505') return { error: 'Data dengan kombinasi ini sudah ada' }
    return { error: error.message }
  }
  revalidatePath('/')
  return { success: true }
}

export async function updateMudamudi(id: number, formData: FormData) {
  const supabase = await createClient()
  const namaRaw = (formData.get('nama') as string).trim()
  const jenjang = formData.get('jenjang') as string
  const kelompok = formData.get('kelompok') as string

  const validationError = validate(namaRaw, jenjang, kelompok)
  if (validationError) return { error: validationError }

  const nama = toTitleCase(namaRaw)

  const { data: candidates } = await supabase
    .from('mudamudi')
    .select('id, nama')
    .eq('jenjang', jenjang)
    .eq('kelompok', kelompok)
    .neq('id', id)

  const isDuplicate = candidates?.some((c) => normalizeForCompare(c.nama) === normalizeForCompare(nama))
  if (isDuplicate) return { error: 'Data dengan nama, jenjang, dan kelompok yang sama sudah ada' }

  const { error } = await supabase.from('mudamudi').update({ nama, jenjang, kelompok }).eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'Data dengan kombinasi ini sudah ada' }
    return { error: error.message }
  }
  revalidatePath('/')
  return { success: true }
}

export async function deleteMudamudi(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('mudamudi').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}