'use client'

import { useState } from 'react'
import { Mudamudi } from './types'
import { JENIS_KELAMIN_OPTIONS, KELOMPOK_OPTIONS, JENJANG_OPTIONS } from './constants'
import { exportPresensiExcel } from './exportExcel'
import FilterCheckboxGroup from './FilterCheckboxGroup'
import ModalWrapper from './ModalWrapper'

type Props = {
  allData: Mudamudi[]
  onClose: () => void
}

export default function ExportModal({ allData, onClose }: Props) {
  const [selectedJenisKelamin, setSelectedJenisKelamin] = useState<string[]>([])
  const [selectedKelompok, setSelectedKelompok] = useState<string[]>([])
  const [selectedJenjang, setSelectedJenjang] = useState<string[]>([])

  async function handleExport(e: React.FormEvent) {
    e.preventDefault()

    const filtered = allData.filter((s) => {
      const matchJenisKelamin =
        selectedJenisKelamin.length === 0 ||
        (s.jenis_kelamin !== null && selectedJenisKelamin.includes(s.jenis_kelamin))
      const matchKelompok = selectedKelompok.length === 0 || selectedKelompok.includes(s.kelompok)
      const matchJenjang = selectedJenjang.length === 0 || selectedJenjang.includes(s.jenjang)
      return matchJenisKelamin && matchKelompok && matchJenjang
    })

    await exportPresensiExcel({ data: filtered })

    onClose()
  }

  return (
    <ModalWrapper onClose={onClose}>
      <form
        onSubmit={handleExport}
        className="w-full max-w-125 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold leading-5 text-gray-800">Export Data</h2>
            <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
              Pilih data yang ingin diexport ke Excel
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 px-5 py-5">
          <FilterCheckboxGroup
            label="Jenis Kelamin"
            options={JENIS_KELAMIN_OPTIONS}
            selected={selectedJenisKelamin}
            onChange={setSelectedJenisKelamin}
            colorClass="border-violet-400 bg-violet-50 text-violet-700"
          />

          <FilterCheckboxGroup
            label="Kelompok"
            options={KELOMPOK_OPTIONS}
            selected={selectedKelompok}
            onChange={setSelectedKelompok}
            colorClass="border-sky-400 bg-sky-50 text-sky-700"
          />

          <FilterCheckboxGroup
            label="Jenjang"
            options={JENJANG_OPTIONS}
            selected={selectedJenjang}
            onChange={setSelectedJenjang}
            colorClass="border-orange-400 bg-orange-50 text-orange-700"
          />
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
          >
            Export Excel
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}