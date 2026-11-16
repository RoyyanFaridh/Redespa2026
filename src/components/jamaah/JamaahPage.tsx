
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  addJamaah,
  updateJamaah,
  deleteJamaah,
} from "../../backend/jamaah/actions";

import type {
  Jamaah,
  ModalState,
  FieldErrors,
} from "../../backend/jamaah/types";

import { useJamaahFilter } from "./useJamaahFilter";

import {
  PageContainer,
  PageHeader,
  Button,
  StatCard,
  ContentGrid,
} from "../common";

import SearchFilterBar from "./SearchFilterBar";
import JamaahTableView from "./JamaahTableView";
import JamaahFormModal from "./JamaahFormModal";
import JamaahDeleteModal from "./JamaahDeleteModal";
import JamaahDetailModal from "./JamaahDetailModal";
import ExportModal from "./ExportModal";
import ImportModal from "./ImportModal";
import JamaahQRModal from "./JamaahQRModal";
import ExportDropdown from "./ExportDropdown";

import { exportJamaahQRBatchZip } from "../../backend/jamaah/exportQRBatch";

type Props = {
  initialData: Jamaah[];
};

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7 9 5-5 5 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14" />
    </svg>
  );
}

function getActionError(result: unknown): string {
  if (!result || typeof result !== "object") {
    return "Terjadi kesalahan. Silakan coba kembali.";
  }

  const actionResult = result as {
    message?: unknown;
    errors?: unknown;
  };

  if (
    typeof actionResult.message === "string" &&
    actionResult.message.trim()
  ) {
    return actionResult.message;
  }

  if (Array.isArray(actionResult.errors)) {
    return actionResult.errors.map((item) => String(item)).join(", ");
  }

  if (
    actionResult.errors &&
    typeof actionResult.errors === "object"
  ) {
    return Object.values(
      actionResult.errors as Record<string, unknown>,
    )
      .flat()
      .map((item) => String(item))
      .join(", ");
  }

  if (typeof actionResult.errors === "string") {
    return actionResult.errors;
  }

  return "Terjadi kesalahan. Silakan coba kembali.";
}

export default function JamaahPage({ initialData }: Props) {
  const router = useRouter();

  // Modal dan data yang sedang dipilih
  const [modal, setModal] = useState<ModalState | null>(null);
  const [detailData, setDetailData] = useState<Jamaah | null>(null);
  const [qrData, setQrData] = useState<Jamaah | null>(null);

  // Import dan export
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Progress export QR
  const [isExportingQR, setIsExportingQR] = useState(false);
  const [qrExportProgress, setQrExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Error form
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Filter, pencarian, dan sorting
  const filter = useJamaahFilter(initialData);

  // =========================================================
  // EXPORT QR BATCH
  // =========================================================

  async function handleExportQR() {
    if (isExportingQR) return;

    try {
      setIsExportingQR(true);
      setError("");

      setQrExportProgress({
        current: 0,
        total: initialData.length,
      });

      const blob = await exportJamaahQRBatchZip(
        initialData,
        (current, total) => {
          setQrExportProgress({ current, total });
        },
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `QR-Code-Jamaah-${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal export QR batch:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mendownload ZIP QR Code. Silakan coba kembali.",
      );
    } finally {
      setIsExportingQR(false);
      setQrExportProgress(null);
    }
  }

  // =========================================================
  // MODAL HANDLERS
  // =========================================================

  function closeModal() {
    setModal(null);
    setFieldErrors({});
    setError("");
  }

  function openAddModal() {
    setError("");
    setFieldErrors({});
    setModal({ type: "add" });
  }

  function openEditModal(data: Jamaah) {
    setError("");
    setFieldErrors({});
    setModal({
      type: "edit",
      data,
    });
  }

  function openDeleteModal(data: Jamaah) {
    setError("");
    setFieldErrors({});
    setModal({
      type: "delete",
      data,
    });
  }

  function openDetailModal(data: Jamaah) {
    setDetailData(data);
  }

  function closeDetailModal() {
    setDetailData(null);
  }

  function openQRModal(data: Jamaah) {
    setQrData(data);
  }

  function closeQRModal() {
    setQrData(null);
  }

  // =========================================================
  // TAMBAH JAMAAH
  // =========================================================

  async function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setError("");
    setFieldErrors({});

    try {
      const result = await addJamaah(formData);

      if (!result.success) {
        if (result.errors) {
          setFieldErrors(result.errors as FieldErrors);
        }

        setError(getActionError(result));
        return;
      }

      closeModal();
      router.refresh();
    } catch (err) {
      console.error("Gagal menambahkan data Jamaah:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan data Jamaah.",
      );
    }
  }

  // =========================================================
  // EDIT JAMAAH
  // =========================================================

  async function handleEditSubmit(
    e: FormEvent<HTMLFormElement>,
    id: Jamaah["id"],
  ) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setError("");
    setFieldErrors({});

    try {
      const result = await updateJamaah(id, formData);

      if (!result.success) {
        if (result.errors) {
          setFieldErrors(result.errors as FieldErrors);
        }

        setError(getActionError(result));
        return;
      }

      closeModal();
      router.refresh();
    } catch (err) {
      console.error("Gagal memperbarui data Jamaah:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui data Jamaah.",
      );
    }
  }

  // =========================================================
  // HAPUS JAMAAH
  // =========================================================

  async function handleDelete(id: Jamaah["id"]) {
    setError("");

    try {
      const result = await deleteJamaah(id);

      if (!result.success) {
        alert(getActionError(result));
        return;
      }

      closeModal();
      router.refresh();
    } catch (err) {
      console.error("Gagal menghapus data Jamaah:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus data Jamaah.",
      );
    }
  }

  // =========================================================
  // IMPORT SUCCESS
  // =========================================================

  function handleImportSuccess() {
    setShowImportModal(false);
    router.refresh();
  }

  // =========================================================
  // STATISTIK JAMAAH
  // =========================================================

  const totalLaki = initialData.filter(
    (item) => item.jenis_kelamin === "Laki-laki",
  ).length;

  const totalPerempuan = initialData.filter(
    (item) => item.jenis_kelamin === "Perempuan",
  ).length;

  const totalKelompok = new Set(
    initialData
      .map((item) => item.kelompok)
      .filter(Boolean),
  ).size;

  const persentaseLaki =
    initialData.length > 0
      ? Math.round((totalLaki / initialData.length) * 100)
      : 0;

  const persentasePerempuan =
    initialData.length > 0
      ? Math.round((totalPerempuan / initialData.length) * 100)
      : 0;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <PageContainer maxWidth="9xl">
      {/* PAGE HEADER */}
      <header className="pb-1">
        <PageHeader
          eyebrow="REDESPA"
          title="Data Jamaah"
          description="Kelola data warga jamaah Desa Pandak."
          actions={
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                aria-label="Import data Jamaah"
                title="Import data Jamaah"
                leftIcon={<UploadIcon />}
              >
                <span className="hidden sm:inline">Import</span>
              </Button>

              <ExportDropdown
                onExportData={() => setShowExportModal(true)}
                onExportQR={handleExportQR}
                isExportingQR={isExportingQR}
              />

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={openAddModal}
                aria-label="Tambah Jamaah"
                title="Tambah Jamaah"
              >
                <span className="sm:hidden">+ Tambah</span>
                <span className="hidden sm:inline">
                  + Tambah Jamaah
                </span>
              </Button>
            </div>
          }
        />
      </header>

      {/* SUMMARY KPI CARDS */}
      <ContentGrid
        columns={4}
        className="mb-1 grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          size="sm"
          label="TOTAL JAMAAH"
          value={initialData.length}
          description="Terdaftar dalam database"
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />

        <StatCard
          size="sm"
          label="LAKI-LAKI"
          value={totalLaki}
          description={`${persentaseLaki}% dari total`}
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
        />

        <StatCard
          size="sm"
          label="PEREMPUAN"
          value={totalPerempuan}
          description={`${persentasePerempuan}% dari total`}
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
        />

        <StatCard
          size="sm"
          label="KELOMPOK"
          value={totalKelompok}
          description="Kelompok terdistribusi"
          icon={
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          }
        />
      </ContentGrid>

      {/* SEARCH, FILTER, AND TABLE */}
      <section className="pt-1">
        <SearchFilterBar
          search={filter.search}
          setSearch={filter.setSearch}
          filterKelompok={filter.filterKelompok}
          setFilterKelompok={filter.setFilterKelompok}
          filterJenisKelamin={filter.filterJenisKelamin}
          setFilterJenisKelamin={filter.setFilterJenisKelamin}
          sortConfig={filter.sortConfig}
          setSortConfig={filter.setSortConfig}
          hasActiveFilters={filter.hasActiveFilters}
          onReset={filter.resetAll}
        />

        <JamaahTableView
          data={filter.displayedData}
          totalCount={initialData.length}
          sortIndicator={filter.sortIndicator}
          toggleSort={filter.toggleSort}
          filterKey={filter.filterKey}
          onDetail={openDetailModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onShowQR={openQRModal}
        />
      </section>

      {/* FORM MODAL: ADD */}
      {modal?.type === "add" && (
        <JamaahFormModal
          mode="add"
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleAddSubmit}
          onClose={closeModal}
        />
      )}

      {/* FORM MODAL: EDIT */}
      {modal?.type === "edit" && (
        <JamaahFormModal
          mode="edit"
          initialData={modal.data}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={(e: FormEvent<HTMLFormElement>) =>
            handleEditSubmit(e, modal.data.id)
          }
          onClose={closeModal}
        />
      )}

      {/* DELETE MODAL */}
      {modal?.type === "delete" && (
        <JamaahDeleteModal
          data={modal.data}
          onConfirm={() => handleDelete(modal.data.id)}
          onClose={closeModal}
        />
      )}

      {/* DETAIL MODAL */}
      {detailData && (
        <JamaahDetailModal
          data={detailData}
          onClose={closeDetailModal}
        />
      )}

      {/* QR MODAL */}
      {qrData && (
        <JamaahQRModal
          data={qrData}
          onClose={closeQRModal}
        />
      )}

      {/* EXPORT MODAL */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={filter.displayedData}
        totalCount={initialData.length}
      />

      {/* IMPORT MODAL */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      {/* QR EXPORT PROGRESS */}
      {isExportingQR && qrExportProgress && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-[#287A50]/30 bg-white px-4 py-3 shadow-xl shadow-black/10 sm:bottom-6 sm:right-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#202824]">
              Mengunduh QR Code Jamaah...
            </p>

            <p className="text-[10px] text-[#78827C]">
              {qrExportProgress.current} dari {qrExportProgress.total} QR
              diproses (
              {Math.round(
                (qrExportProgress.current /
                  Math.max(qrExportProgress.total, 1)) *
                  100,
              )}
              %)
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
