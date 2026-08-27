import ExcelJS from 'exceljs'
import { Mudamudi } from './types'
import { KELOMPOK_OPTIONS } from './constants'

type ExportOptions = {
  data: Mudamudi[]
}

function toInisialJenisKelamin(jenisKelamin: string | null): string {
  if (jenisKelamin === 'Laki-laki') return 'L'
  if (jenisKelamin === 'Perempuan') return 'P'
  return ''
}

function sortByKelompokThenNama(data: Mudamudi[]): Mudamudi[] {
  return [...data].sort((a, b) => {
    const indexA = KELOMPOK_OPTIONS.indexOf(a.kelompok)
    const indexB = KELOMPOK_OPTIONS.indexOf(b.kelompok)

    if (indexA !== indexB) return indexA - indexB

    return a.nama.localeCompare(b.nama)
  })
}

function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const jam = `${pad(now.getHours())}-${pad(now.getMinutes())}`

  return `${tanggal}_${jam}`
}

export async function exportPresensiExcel({ data }: ExportOptions) {
  const sorted = sortByKelompokThenNama(data)

  const header = ['NO', 'NAMA', 'KELOMPOK', 'JK', 'JENJANG']

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Data Mudamudi')

  sheet.columns = [
    { width: 6 },
    { width: 30 },
    { width: 16 },
    { width: 6 },
    { width: 16 },
  ]

  const headerRow = sheet.addRow(header)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    }
  })

  sorted.forEach((s, i) => {
    const row = sheet.addRow([
      i + 1,
      s.nama,
      s.kelompok,
      toInisialJenisKelamin(s.jenis_kelamin),
      s.jenjang,
    ])

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.alignment = {
        horizontal: colNumber === 2 ? 'left' : 'center',
        vertical: 'middle',
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Data Mudamudi_${getTimestamp()}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}