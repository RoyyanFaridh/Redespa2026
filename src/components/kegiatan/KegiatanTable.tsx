
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addKegiatan,
  deleteKegiatan,
  updateKegiatan,
  getKegiatan,
} from "../../backend/kegiatan/actions";

import { getKegiatanStatus } from "../../backend/kegiatan/format";

import type {
  FieldErrors,
  Kegiatan,
  ModalState,
  SortConfig,
  SortKey,
} from "../../backend/kegiatan/types";

import DeleteConfirmModal from "./DeleteConfirmModal";
import KegiatanFormModal from "./KegiatanFormModal";
import KegiatanTableView from "./KegiatanTableView";
import SearchFilterBar from "./SearchFilterBar";
import { PageContainer, PageHeader, Button, StatCard } from "../common";

type Props = {
  initialData: Kegiatan[];
};

export default function KegiatanTable({ initialData }: Props) {
  const router = useRouter();

  const [data, setData] = useState<Kegiatan[]>(initialData);
  const [modal, setModal] = useState<ModalState>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Statistics
  const stats = useMemo(() => {
    let sedangBerlangsung = 0;
    let akanBerlangsung = 0;
    let selesai = 0;

    data.forEach((item) => {
      const st = getKegiatanStatus(
        item.tanggal_mulai,
        item.tanggal_selesai,
        item.jam_mulai,
        item.jam_selesai,
      );
      if (st === "sedang_berlangsung") sedangBerlangsung++;
      else if (st === "akan_berlangsung") akanBerlangsung++;
      else if (st === "selesai") selesai++;
    });

    return {
      total: data.length,
      sedangBerlangsung,
      akanBerlangsung,
      selesai,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = data.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.nama.toLowerCase().includes(keyword) ||
        (item.lokasi ?? "").toLowerCase().includes(keyword);

      const matchesStatus =
        !filterStatus ||
        getKegiatanStatus(
          item.tanggal_mulai,
          item.tanggal_selesai,
          item.jam_mulai,
          item.jam_selesai,
        ) === filterStatus;

      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const comparison = String(a[sortConfig.key] ?? "").localeCompare(
          String(b[sortConfig.key] ?? ""),
          "id",
          { numeric: true },
        );

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, filterStatus, sortConfig]);

  const hasActiveFilters =
    Boolean(search.trim()) || Boolean(filterStatus) || Boolean(sortConfig);

  function clearMessages() {
    setError("");
    setFieldErrors({});
  }

  function handleReset() {
    setSearch("");
    setFilterStatus("");
    setSortConfig(null);
  }

  function handleSort(key: SortKey) {
    if (loading) return;

    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });
  }

  function openAdd() {
    if (loading) return;

    clearMessages();
    setModal({ type: "add" });
  }

  function openEdit(kegiatan: Kegiatan) {
    if (loading) return;

    clearMessages();
    setModal({ type: "edit", data: kegiatan });
  }

  function openDelete(kegiatan: Kegiatan) {
    if (loading) return;

    clearMessages();
    setModal({ type: "delete", data: kegiatan });
  }

  function handleScanQR(kegiatan: Kegiatan) {
    if (loading) return;

    window.location.href = `/admin/presensi/scan/${kegiatan.id}`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const currentModal = modal;

    if (
      !currentModal ||
      (currentModal.type !== "add" && currentModal.type !== "edit")
    ) {
      setError("Form kegiatan tidak valid. Silakan buka kembali modal.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    setLoading(true);
    clearMessages();

    try {
      const result =
        currentModal.type === "edit"
          ? await updateKegiatan(currentModal.data.id, formData)
          : await addKegiatan(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (!result?.success) {
        setError("Penyimpanan belum berhasil. Silakan coba lagi.");
        return;
      }

      try {
        const refreshedData = (await getKegiatan()) as Kegiatan[];
        setData(refreshedData);
      } catch (refreshError) {
        console.error(
          "Kegiatan tersimpan, tetapi daftar gagal dimuat ulang:",
          refreshError,
        );
      }

      setModal(null);
      clearMessages();
      router.refresh();
    } catch (submitError) {
      console.error("Gagal menyimpan kegiatan:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan saat menyimpan kegiatan.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (modal?.type !== "delete" || loading) return;

    const kegiatanId = modal.data.id;

    setLoading(true);
    setError("");

    try {
      const result = await deleteKegiatan(kegiatanId);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (!result?.success) {
        setError("Kegiatan belum berhasil dihapus. Silakan coba lagi.");
        return;
      }

      setData((current) =>
        current.filter((item) => item.id !== kegiatanId),
      );

      setModal(null);
      clearMessages();
      router.refresh();
    } catch (deleteError) {
      console.error("Gagal menghapus kegiatan:", deleteError);

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Terjadi kesalahan saat menghapus kegiatan.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer maxWidth="8xl">
      <PageHeader
        eyebrow="Kegiatan"
        title="Data Kegiatan"
        description="Kelola jadwal kegiatan, sasaran peserta, dan akses pemindaian presensi."
        actions={
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={openAdd}
            disabled={loading}
            aria-label="Tambah kegiatan"
            title="Tambah kegiatan"
            leftIcon={
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M10 4v12M4 10h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          >
            <span>Tambah Kegiatan</span>
          </Button>
        }
      />

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Kegiatan"
          value={stats.total}
          description="Semua agenda terdaftar"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Sedang Berlangsung"
          value={stats.sedangBerlangsung}
          description="Scan QR presensi aktif"
          className="border-emerald-200/60"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-600" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Akan Datang"
          value={stats.akanBerlangsung}
          description="Jadwal berikutnya"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-600" aria-hidden="true">
              <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          }
        />
        <StatCard
          label="Telah Selesai"
          value={stats.selesai}
          description="Kegiatan lampau"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#78827C]" aria-hidden="true">
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          }
        />
      </div>

      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        hasActiveFilters={hasActiveFilters}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        onReset={handleReset}
      />

      <KegiatanTableView
        data={filteredData}
        sort={sortConfig}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={openDelete}
        onScanQR={handleScanQR}
      />

      {(modal?.type === "add" || modal?.type === "edit") && (
        <KegiatanFormModal
          key={modal.type === "edit" ? `edit-${modal.data.id}` : "add"}
          mode={modal.type}
          initialData={modal.type === "edit" ? modal.data : undefined}
          fieldErrors={fieldErrors}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => {
            if (!loading) {
              setModal(null);
              clearMessages();
            }
          }}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirmModal
          data={modal.data}
          error={error}
          onConfirm={handleDelete}
          onClose={() => {
            if (!loading) {
              setModal(null);
              clearMessages();
            }
          }}
        />
      )}
    </PageContainer>
  );
}
