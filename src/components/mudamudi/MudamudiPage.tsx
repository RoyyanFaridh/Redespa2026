
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  addMudamudi,
  updateMudamudi,
  deleteMudamudi,
} from "../../backend/mudamudi/actions";

import type {
  Mudamudi,
  ModalState,
  FieldErrors,
} from "../../backend/mudamudi/types";

import { validateClient } from "../../backend/mudamudi/validation";
import { useMudamudiFilter } from "./useMudamudiFilter";
import { PageHeader, Button } from "../common";

import SearchFilterBar from "./SearchFilterBar";
import MudamudiTableView from "./MudamudiTableView";
import MudamudiFormModal from "./MudamudiFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import DetailModal from "./DetailModal";
import ExportModal from "./ExportModal";
import ImportModal from "./ImportModal";
import MudamudiQRModal from "./MudamudiQRModal";
import ExportDropdown from "./ExportDropdown";
import { exportBatchQRCodeZip } from "../../backend/mudamudi/exportQRBatch";

type Props = {
  initialData: Mudamudi[];
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

export default function MudamudiPage({ initialData }: Props) {
  const router = useRouter();

  const [modal, setModal] = useState<ModalState | null>(null);
  const [detailData, setDetailData] = useState<Mudamudi | null>(null);
  const [qrData, setQrData] = useState<Mudamudi | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [isExportingQR, setIsExportingQR] = useState(false);
  const [qrExportProgress, setQrExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const filter = useMudamudiFilter(initialData);

  async function handleExportQR() {
    if (isExportingQR) return;

    try {
      setIsExportingQR(true);
      setError("");
      setQrExportProgress({ current: 0, total: initialData.length });

      await exportBatchQRCodeZip(initialData, (current, total) => {
        setQrExportProgress({ current, total });
      });
    } catch (err) {
      console.error("Gagal mengekspor QR Code batch:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengunduh QR Code. Silakan coba kembali.",
      );
    } finally {
      setIsExportingQR(false);
      setQrExportProgress(null);
    }
  }

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

  function openDetailModal(data: Mudamudi) {
    setError("");
    setFieldErrors({});
    setDetailData(data);
  }

  function closeDetailModal() {
    setDetailData(null);
  }

  function openQRModal(data: Mudamudi) {
    setQrData(data);
  }

  function closeQRModal() {
    setQrData(null);
  }

  function openEditModal(data: Mudamudi) {
    setError("");
    setFieldErrors({});
    setModal({
      type: "edit",
      data,
    });
  }

  function openDeleteModal(data: Mudamudi) {
    setError("");
    setFieldErrors({});
    setModal({
      type: "delete",
      data,
    });
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const nama = String(formData.get("nama") ?? "");
    const kelas = String(formData.get("kelas") ?? "");
    const kelompok = String(formData.get("kelompok") ?? "");
    const jenisKelamin = String(formData.get("jenis_kelamin") ?? "");
    const tahunLahir = String(formData.get("tahun_lahir") ?? "");

    const errors = validateClient(
      nama,
      kelas,
      kelompok,
      jenisKelamin,
      tahunLahir,
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setError("");

    try {
      const result = await addMudamudi(formData);

      if (!result.success) {
        setError(getActionError(result));
        return;
      }

      closeModal();
      router.refresh();
    } catch (err) {
      console.error("Gagal menambahkan data Jamaah:", err);
      setError("Terjadi kesalahan saat menambahkan data Jamaah.");
    }
  }

  async function handleEditSubmit(
    e: React.FormEvent<HTMLFormElement>,
    id: number,
  ) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const nama = String(formData.get("nama") ?? "");
    const kelas = String(formData.get("kelas") ?? "");
    const kelompok = String(formData.get("kelompok") ?? "");
    const jenisKelamin = String(formData.get("jenis_kelamin") ?? "");
    const tahunLahir = String(formData.get("tahun_lahir") ?? "");

    const errors = validateClient(
      nama,
      kelas,
      kelompok,
      jenisKelamin,
      tahunLahir,
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setError("");

    try {
      const result = await updateMudamudi(id, formData);

      if (!result.success) {
        setError(getActionError(result));
        return;
      }

      closeModal();
      router.refresh();
    } catch (err) {
      console.error("Gagal memperbarui data Jamaah:", err);
      setError("Terjadi kesalahan saat memperbarui data Jamaah.");
    }
  }

  async function handleDelete(id: number) {
    setError("");

    try {
      const result = await deleteMudamudi(id);

      if (!result.success) {
        setError(getActionError(result));
        return;
      }

      closeModal();
      router.refresh();
    } catch (err) {
      console.error("Gagal menghapus data Jamaah:", err);
      setError("Terjadi kesalahan saat menghapus data Jamaah.");
    }
  }

  function handleImportSuccess() {
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F5F7F5]">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">
        <header className="pb-5">
          <PageHeader
            eyebrow="REDESPA"
            title="Data Jamaah"
            description="Kelola data anggota Jamaah yang digunakan untuk presensi."
            actions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowImportModal(true)}
                  aria-label="Import data"
                  title="Import data"
                  leftIcon={<UploadIcon />}
                >
                  <span className="hidden md:inline">Import</span>
                </Button>

                <ExportDropdown
                  onExportData={() => setShowExportModal(true)}
                  onExportQR={handleExportQR}
                  isExportingQR={isExportingQR}
                />

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={openAddModal}
                  aria-label="Tambah Jamaah"
                  title="Tambah Jamaah"
                >
                  <span className="md:hidden">+</span>
                  <span className="hidden md:inline">+ Tambah Jamaah</span>
                </Button>
              </>
            }
          />
        </header>

        <section className="pt-1">
          <SearchFilterBar
            search={filter.search}
            setSearch={filter.setSearch}
            filterKelas={filter.filterKelas}
            setFilterKelas={filter.setFilterKelas}
            filterKelompok={filter.filterKelompok}
            setFilterKelompok={filter.setFilterKelompok}
            filterJenisKelamin={filter.filterJenisKelamin}
            setFilterJenisKelamin={filter.setFilterJenisKelamin}
            sortConfig={filter.sortConfig}
            setSortConfig={filter.setSortConfig}
            hasActiveFilters={filter.hasActiveFilters}
            onReset={filter.resetAll}
          />

          <MudamudiTableView
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
      </div>

      {detailData && (
        <DetailModal
          data={detailData}
          onClose={closeDetailModal}
        />
      )}

      {qrData && (
        <MudamudiQRModal
          data={qrData}
          onClose={closeQRModal}
        />
      )}

      {modal?.type === "add" && (
        <MudamudiFormModal
          mode="add"
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleAddSubmit}
          onClose={closeModal}
        />
      )}

      {modal?.type === "edit" && (
        <MudamudiFormModal
          mode="edit"
          initialData={modal.data}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
            handleEditSubmit(e, modal.data.id)
          }
          onClose={closeModal}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          data={modal.data}
          error={error}
          onConfirm={() => handleDelete(modal.data.id)}
          onClose={closeModal}
        />
      )}

      {showExportModal && (
        <ExportModal
          allData={initialData}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Floating progress feedback saat export batch QR sedang berlangsung */}
      {isExportingQR && qrExportProgress && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#287A50]/30 bg-white px-4 py-3 shadow-xl shadow-black/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <svg
              className="h-4 w-4 animate-spin text-[#287A50]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
          <div>
            <p className="text-xs font-semibold text-[#202824]">
              Mengunduh QR Code Batch...
            </p>
            <p className="text-[10px] text-[#78827C]">
              {qrExportProgress.current} dari {qrExportProgress.total} QR diproses ({Math.round((qrExportProgress.current / Math.max(qrExportProgress.total, 1)) * 100)}%)
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
