"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  MonitoringPeserta,
  PresensiStatus,
} from "../../../backend/presensi/types";
import { Modal, Button } from "../../common";

type Props = {
  peserta: MonitoringPeserta | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSave: (status: PresensiStatus, keterangan: string) => void;
};

const STATUS_OPTIONS: {
  value: PresensiStatus;
  label: string;
}[] = [
  {
    value: "hadir",
    label: "Hadir",
  },
  {
    value: "terlambat",
    label: "Terlambat",
  },
  {
    value: "izin",
    label: "Izin",
  },
  {
    value: "sakit",
    label: "Sakit",
  },
  {
    value: "alpa",
    label: "Alpa",
  },
];

function getInitialStatus(status: PresensiStatus | null): PresensiStatus | "" {
  return status ?? "";
}

function getStatusLabel(status: PresensiStatus | null) {
  if (!status) return "Belum Hadir";

  const item = STATUS_OPTIONS.find((option) => option.value === status);
  return item?.label ?? status;
}

export default function MonitoringEditModal({
  peserta,
  loading,
  error,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<PresensiStatus | "">("");
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    if (!peserta) {
      setStatus("");
      setKeterangan("");
      return;
    }

    setStatus(getInitialStatus(peserta.status));
    setKeterangan(peserta.keterangan ?? "");
  }, [peserta]);

  if (!peserta) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!status) {
      return;
    }

    onSave(status, keterangan.trim());
  }

  return (
    <Modal
      title="Edit Presensi Peserta"
      subtitle={`Ubah status kehadiran untuk ${peserta.nama}`}
      onClose={loading ? () => {} : onClose}
      size="md"
      headerIcon={
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#65B98A]/30 bg-[#E6F2EA] text-[#287A50]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </div>
      }
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={loading}
            disabled={!status}
            onClick={() => {
              if (status) {
                onSave(status, keterangan.trim());
              }
            }}
            className="w-full sm:w-auto"
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* INFORMASI PESERTA */}
        <section>
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-[#202824]">
              Informasi Peserta
            </h3>
          </div>

          <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Kelompok
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                  {peserta.kelompok || "-"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Kelas
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                  {Array.isArray(peserta.kelas)
                    ? peserta.kelas.length > 0
                      ? peserta.kelas.join(", ")
                      : "-"
                    : peserta.kelas || "-"}
                </p>
              </div>

              <div className="min-w-0 col-span-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Status Saat Ini
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-[#202824]">
                  {getStatusLabel(peserta.status)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATUS */}
        <section>
          <label
            htmlFor="monitoring-edit-status"
            className="mb-1.5 block text-xs font-medium text-[#78827C]"
          >
            Status Presensi Baru <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id="monitoring-edit-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as PresensiStatus | "")
              }
              disabled={loading}
              required
              className={`h-10 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-xs outline-none transition focus:ring-2 ${
                status ? "text-[#202824]" : "text-[#9AA39D]"
              } ${
                error
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-50"
                  : "border-[#E5EAE6] focus:border-[#287A50] focus:ring-[#65B98A]/20"
              } disabled:cursor-not-allowed disabled:bg-[#F5F7F5]`}
            >
              <option value="" disabled>
                Pilih status presensi
              </option>

              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#78827C]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </div>
          </div>

          {!status && !error && (
            <p className="mt-1 text-[10px] text-[#78827C]">
              Pilih status untuk menyimpan perubahan.
            </p>
          )}
        </section>

        {/* KETERANGAN */}
        <section>
          <label
            htmlFor="monitoring-edit-keterangan"
            className="mb-1.5 block text-xs font-medium text-[#78827C]"
          >
            Keterangan
            <span className="ml-1 font-normal text-[#9AA39D]">
              (opsional)
            </span>
          </label>

          <textarea
            id="monitoring-edit-keterangan"
            value={keterangan}
            onChange={(event) => setKeterangan(event.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Tambahkan keterangan..."
            maxLength={500}
            className="w-full resize-none rounded-xl border border-[#E5EAE6] bg-white px-3 py-2.5 text-xs text-[#202824] placeholder:text-[#9AA39D] outline-none transition focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5]"
          />

          <p className="mt-1 text-right text-[10px] text-[#9AA39D]">
            {keterangan.length}/500
          </p>
        </section>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4M12 16h.01"
              />
            </svg>

            <p className="text-xs leading-4 text-rose-600">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
