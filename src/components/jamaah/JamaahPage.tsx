"use client";

import { useEffect, useState } from "react";
import type { Jamaah, ModalState, FieldErrors } from "../../backend/jamaah/types";
import {
  getJamaah,
  addJamaah,
  updateJamaah,
  deleteJamaah,
} from "../../backend/jamaah/actions";
import { useJamaahFilter } from "./useJamaahFilter";
import JamaahFormModal from "./JamaahFormModal";
import JamaahDetailModal from "./JamaahDetailModal";
import JamaahDeleteModal from "./JamaahDeleteModal";
import JamaahQRModal from "./JamaahQRModal";
import JamaahExportModal from "./JamaahExportModal";
import JamaahImportModal from "./JamaahImportModal";
import { KELOMPOK_OPTIONS, JENIS_KELAMIN_OPTIONS } from "../../backend/jamaah/constants";
import { toTitleCase, getInitials, getAvatarColor } from "../../backend/mudamudi/format";
import { Button } from "../common";

type Props = {
  initialData: Jamaah[];
};

export default function JamaahPage({ initialData }: Props) {
  const [data, setData] = useState<Jamaah[]>(initialData);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [detailData, setDetailData] = useState<Jamaah | null>(null);
  const [qrData, setQrData] = useState<Jamaah | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const {
    search,
    setSearch,
    filterJenisKelamin,
    setFilterJenisKelamin,
    filterKelompok,
    setFilterKelompok,
    sortConfig,
    handleSort,
    resetFilters,
    displayedData,
  } = useJamaahFilter(data);

  useEffect(() => {
    setPage(1);
  }, [search, filterJenisKelamin, filterKelompok, itemsPerPage]);

  const totalPages = Math.ceil(displayedData.length / itemsPerPage);
  const paginatedData = displayedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  async function refreshData() {
    try {
      const refreshed = await getJamaah();
      setData(refreshed);
    } catch (err) {
      console.error("Gagal refresh data Jamaah:", err);
    }
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (modalState?.type === "add") {
      const res = await addJamaah(formData);
      if (!res.success) {
        if (res.errors) setFieldErrors(res.errors as any);
        if (res.message) setError(res.message);
      } else {
        setModalState(null);
        await refreshData();
      }
    } else if (modalState?.type === "edit") {
      const res = await updateJamaah(modalState.data.id, formData);
      if (!res.success) {
        if (res.errors) setFieldErrors(res.errors as any);
        if (res.message) setError(res.message);
      } else {
        setModalState(null);
        await refreshData();
      }
    }
  }

  async function handleDeleteConfirm() {
    if (modalState?.type !== "delete") return;
    const res = await deleteJamaah(modalState.data.id);
    if (!res.success) {
      alert(res.message || "Gagal menghapus data Jamaah.");
    } else {
      setModalState(null);
      await refreshData();
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#202824]">Data Jamaah</h1>
          <p className="text-xs text-[#78827C]">
            Kelola data seluruh warga jamaah, pencarian, cetak QR Code, dan ekspor data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <JamaahImportModal onSuccess={refreshData} />
          <JamaahExportModal
            data={displayedData}
            totalDataCount={data.length}
            filteredCount={displayedData.length}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFieldErrors({});
              setError("");
              setModalState({ type: "add" });
            }}
            className="flex items-center gap-1.5 bg-[#287A50] text-xs hover:bg-[#1E5E3D]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Jamaah
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78827C] mb-1">
              Pencarian Nama
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama jamaah..."
              className="w-full rounded-xl border border-[#E5EAE6] px-3 py-2 text-xs text-[#202824] placeholder:text-gray-400 focus:border-[#287A50] focus:outline-none"
            />
          </div>

          {/* Kelompok */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78827C] mb-1">
              Kelompok
            </label>
            <select
              value={filterKelompok[0] || ""}
              onChange={(e) =>
                setFilterKelompok(e.target.value ? [e.target.value] : [])
              }
              className="w-full rounded-xl border border-[#E5EAE6] px-3 py-2 text-xs text-[#202824] focus:border-[#287A50] focus:outline-none"
            >
              <option value="">Semua Kelompok</option>
              {KELOMPOK_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78827C] mb-1">
              Jenis Kelamin
            </label>
            <select
              value={filterJenisKelamin[0] || ""}
              onChange={(e) =>
                setFilterJenisKelamin(e.target.value ? [e.target.value] : [])
              }
              className="w-full rounded-xl border border-[#E5EAE6] px-3 py-2 text-xs text-[#202824] focus:border-[#287A50] focus:outline-none"
            >
              <option value="">Semua Jenis Kelamin</option>
              {JENIS_KELAMIN_OPTIONS.map((jk) => (
                <option key={jk} value={jk}>
                  {jk}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(search || filterKelompok.length > 0 || filterJenisKelamin.length > 0) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#287A50] hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5EAE6] bg-[#F9FBFA] text-[11px] font-semibold text-[#78827C]">
              <tr>
                <th className="px-4 py-3.5">Nama Jamaah</th>
                <th className="px-4 py-3.5">Kelompok</th>
                <th className="px-4 py-3.5">Jenis Kelamin</th>
                <th className="px-4 py-3.5">Tempat, Thn Lahir</th>
                <th className="px-4 py-3.5">No. HP</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data Jamaah yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const avatarColor = getAvatarColor(item.nama);
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FBFA]/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: avatarColor.bg }}
                          >
                            {getInitials(item.nama)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {toTitleCase(item.nama)}
                            </div>
                            {item.pekerjaan && (
                              <div className="text-[10px] text-gray-400">
                                {item.pekerjaan}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                          {item.kelompok}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.jenis_kelamin || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {[item.tempat_lahir, item.tahun_lahir].filter(Boolean).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.no_hp || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Kartu QR"
                            onClick={() => setQrData(item)}
                            className="rounded-lg p-1 text-[#287A50] hover:bg-[#E6F2EA]"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>
                          <button
                            title="Detail"
                            onClick={() => setDetailData(item)}
                            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            title="Edit"
                            onClick={() => {
                              setFieldErrors({});
                              setError("");
                              setModalState({ type: "edit", data: item });
                            }}
                            className="rounded-lg p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            title="Hapus"
                            onClick={() => setModalState({ type: "delete", data: item })}
                            className="rounded-lg p-1 text-red-600 hover:bg-red-50"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAE6] px-4 py-3 text-xs text-gray-500">
            <div>
              Menampilkan {(page - 1) * itemsPerPage + 1} -{" "}
              {Math.min(page * itemsPerPage, displayedData.length)} dari{" "}
              {displayedData.length} data
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs"
              >
                Sebelumnya
              </Button>
              <span className="px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalState?.type === "add" || modalState?.type === "edit") && (
        <JamaahFormModal
          mode={modalState.type}
          initialData={modalState.type === "edit" ? modalState.data : undefined}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleFormSubmit}
          onClose={() => setModalState(null)}
        />
      )}

      {modalState?.type === "delete" && (
        <JamaahDeleteModal
          data={modalState.data}
          onConfirm={handleDeleteConfirm}
          onClose={() => setModalState(null)}
        />
      )}

      {detailData && (
        <JamaahDetailModal
          data={detailData}
          onClose={() => setDetailData(null)}
        />
      )}

      {qrData && (
        <JamaahQRModal
          data={qrData}
          onClose={() => setQrData(null)}
        />
      )}
    </div>
  );
}
