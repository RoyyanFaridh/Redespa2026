
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
import { PageContainer, PageHeader, Button, StatCard, ContentGrid } from "../common";

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

  // Statistik computed dari data aktual
  const totalLaki = initialData.filter((j) => j.jenis_kelamin === "Laki-laki").length;
  const totalPerempuan = initialData.filter((j) => j.jenis_kelamin === "Perempuan").length;
  const totalKelompok = new Set(initialData.map((j) => j.kelompok).filter(Boolean)).size;

  return (
    <PageContainer maxWidth="9xl">
      <header className="pb-1">
        <PageHeader
          eyebrow="REDESPA"
          title="Data Muda-Mudi"
          description="Kelola data generasi penerus Muda-Mudi Desa Pandak."
          actions={
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                aria-label="Import data"
                title="Import data"
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
                aria-label="Tambah Muda-Mudi"
                title="Tambah Muda-Mudi"
              >
                <span className="sm:hidden">+ Tambah</span>
                <span className="hidden sm:inline">+ Tambah Muda-Mudi</span>
              </Button>
            </div>
          }
        />
      </header>

      {/* Summary KPI Cards */}
      <ContentGrid columns={4} className="grid-cols-2 lg:grid-cols-4 mb-1">
        <StatCard
          size="sm"
          label="TOTAL MUDA-MUDI"
          value={initialData.length}
          description="Terdaftar dalam database"
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          size="sm"
          label="LAKI-LAKI"
          value={totalLaki}
          description={`${initialData.length > 0 ? Math.round((totalLaki / initialData.length) * 100) : 0}% dari total`}
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
        />
        <StatCard
          size="sm"
          label="PEREMPUAN"
          value={totalPerempuan}
          description={`${initialData.length > 0 ? Math.round((totalPerempuan / initialData.length) * 100) : 0}% dari total`}
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
        />
        <StatCard
          size="sm"
          label="KELOMPOK"
          value={totalKelompok}
          description="Kelompok terdistribusi"
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          }
        />
      </ContentGrid>

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
    </PageContainer>
  );
}
