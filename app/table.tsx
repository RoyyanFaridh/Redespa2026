'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import {
  addMudamudi,
  updateMudamudi,
  deleteMudamudi,
} from './actions'

import {
  Mudamudi,
  ModalState,
  FieldErrors,
} from './mudamudi/types'

import { validateClient } from './mudamudi/validation'
import { useMudamudiFilter } from './mudamudi/useMudamudiFilter'
import SearchFilterBar from './mudamudi/SearchFilterBar'
import MudamudiTableView from './mudamudi/MudamudiTableView'
import MudamudiFormModal from './mudamudi/MudamudiFormModal'
import DeleteConfirmModal from './mudamudi/DeleteConfirmModal'

export default function MudamudiTable({
  initialData,
  isAdmin,
}: {
  initialData: Mudamudi[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  const [modal, setModal] = useState<ModalState | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const filter = useMudamudiFilter(initialData)

  // ============================================================
  // AUTH
  // ============================================================

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function guardOrOpen(action: () => void) {
    if (!isAdmin) {
      router.push('/login')
      return
    }

    action()
  }

  // ============================================================
  // MODAL
  // ============================================================

  function closeModal() {
    setModal(null)
    setFieldErrors({})
    setError('')
  }

  // ============================================================
  // ADD
  // ============================================================

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()

    const fd = new FormData(e.currentTarget as HTMLFormElement)

    const nama = fd.get('nama') as string
    const jenjang = fd.get('jenjang') as string
    const kelompok = fd.get('kelompok') as string

    const errs = validateClient(nama, jenjang, kelompok)

    setFieldErrors(errs)

    if (Object.keys(errs).length > 0) return

    const res = await addMudamudi(fd)

    if (res?.error) {
      setError(res.error)
      return
    }

    closeModal()
  }

  // ============================================================
  // EDIT
  // ============================================================

  async function handleEditSubmit(
    e: React.FormEvent,
    id: number
  ) {
    e.preventDefault()

    const fd = new FormData(e.currentTarget as HTMLFormElement)

    const nama = fd.get('nama') as string
    const jenjang = fd.get('jenjang') as string
    const kelompok = fd.get('kelompok') as string

    const errs = validateClient(nama, jenjang, kelompok)

    setFieldErrors(errs)

    if (Object.keys(errs).length > 0) return

    const res = await updateMudamudi(id, fd)

    if (res?.error) {
      setError(res.error)
      return
    }

    closeModal()
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(id: number) {
    const res = await deleteMudamudi(id)

    if (res?.error) {
      setError(res.error)
      return
    }

    closeModal()
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">

        {/* ======================================================
            HEADER
            ====================================================== */}
        <header className="border-b border-gray-200 pb-5">
        <div className="flex items-start justify-between gap-4">

            {/* ==================================================
                BRAND
                ================================================== */}
            <div className="min-w-0">
            <div className="flex items-center gap-2.5">

                {/* Logo */}
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] bg-[#0d7f78] text-[11px] font-semibold text-white">
                MM
                </div>

                {/* Title */}
                <div className="min-w-0">
                <h1 className="truncate text-[18px] font-semibold leading-5 text-gray-900 sm:text-[19px]">
                    Data Mudamudi 2026
                </h1>

                <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                    Desa Pandak
                </p>
                </div>
            </div>

            {/* ==================================================
                ACCOUNT / SESSION
                ================================================== */}
            <div className="mt-3 flex items-center gap-3 pl-10.5">

                {/* Status */}
                <div className="flex items-center gap-1.5 text-[11px]">
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                    isAdmin
                        ? 'bg-[#0d9b91]'
                        : 'bg-gray-400'
                    }`}
                />

                <span className="text-gray-500">
                    {isAdmin ? 'Admin' : 'Guest'}
                </span>
                </div>

                {/* Divider */}
                {isAdmin && (
                <span className="h-3 w-px bg-gray-200" />
                )}

                {/* Logout */}
                {isAdmin && (
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 transition hover:text-gray-800"
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 8l4 4-4 4"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 12H9"
                    />
                    </svg>

                    Keluar
                </button>
                )}
            </div>
            </div>

            {/* ==================================================
                ADD DATA
                ================================================== */}
            
            <button
                type="button"
                onClick={() =>
                guardOrOpen(() =>
                    setModal({ type: 'add' })
                )
                }
                aria-label="Tambah Data"
                title="Tambah Data"
                className="
                flex h-8.5 w-8.5 shrink-0 items-center justify-center
                rounded-[10px] bg-[#171717] text-white
                transition hover:bg-gray-800 active:scale-95

                md:h-8.5 md:w-auto
                md:gap-1.5 md:px-3.5
                md:text-[11px] md:font-medium
                "
            >
                {/* Icon + */}
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                />
                </svg>

                {/* Text — hanya desktop/tablet */}
                <span className="hidden md:inline">
                Tambah Data
                </span>
            </button>
        </div>
        </header>

        {/* ======================================================
            DATA CONTENT
            ====================================================== */}
        <section className="pt-5">

          {/* Search & Filter */}
          <SearchFilterBar
            search={filter.search}
            setSearch={filter.setSearch}
            filterJenjang={filter.filterJenjang}
            setFilterJenjang={filter.setFilterJenjang}
            filterKelompok={filter.filterKelompok}
            setFilterKelompok={filter.setFilterKelompok}
            hasActiveFilters={filter.hasActiveFilters}
            onReset={filter.resetAll}
          />

          {/* Table / Card */}
          <MudamudiTableView
            data={filter.displayedData}
            totalCount={initialData.length}
            sortIndicator={filter.sortIndicator}
            toggleSort={filter.toggleSort}
            filterKey={filter.filterKey}
            onEdit={(s) =>
                guardOrOpen(() =>
                setModal({ type: 'edit', data: s })
                )
            }
            onDelete={(s) =>
                guardOrOpen(() =>
                setModal({ type: 'delete', data: s })
                )
            }
            />
        </section>
      </div>

      {/* ========================================================
          ADD MODAL
          ======================================================== */}
      {modal?.type === 'add' && (
        <MudamudiFormModal
          mode="add"
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleAddSubmit}
          onClose={closeModal}
        />
      )}

      {/* ========================================================
          EDIT MODAL
          ======================================================== */}
      {modal?.type === 'edit' && (
        <MudamudiFormModal
          mode="edit"
          initialData={modal.data}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={(e) =>
            handleEditSubmit(e, modal.data.id)
          }
          onClose={closeModal}
        />
      )}

      {/* ========================================================
          DELETE MODAL
          ======================================================== */}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal
          data={modal.data}
          error={error}
          onConfirm={() =>
            handleDelete(modal.data.id)
          }
          onClose={closeModal}
        />
      )}
    </main>
  )
}