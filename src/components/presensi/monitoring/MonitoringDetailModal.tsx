"use client";

import { MonitoringPeserta } from "../../../backend/presensi/types";
import MonitoringStatusBadge from "./MonitoringStatusBadge";
import { Modal, Button } from "../../common";

type Props = {
  peserta: MonitoringPeserta | null;
  onClose: () => void;
};

function formatWaktuCheckin(waktu: string | null) {
  if (!waktu) {
    return "-";
  }

  const date = new Date(waktu);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function MonitoringDetailModal({ peserta, onClose }: Props) {
  if (!peserta) {
    return null;
  }

  return (
    <Modal
      title="Detail Presensi Peserta"
      subtitle="Informasi kehadiran dan biodata peserta kegiatan."
      onClose={onClose}
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
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* IDENTITAS */}
        <section>
          <div className="mb-2">
            <h3 className="text-xs font-semibold tracking-wide text-[#202824]">
              Identitas Peserta
            </h3>
          </div>

          <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Nama Lengkap
                </p>

                <p className="mt-0.5 text-xs font-bold text-[#202824]">
                  {peserta.nama}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Kelompok
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#202824]">
                  {peserta.kelompok || "-"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Kelas
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#202824]">
                  {Array.isArray(peserta.kelas)
                    ? peserta.kelas.length > 0
                      ? peserta.kelas.join(", ")
                      : "-"
                    : peserta.kelas || "-"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Jenis Kelamin
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#202824]">
                  {peserta.jenis_kelamin || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATUS */}
        <section>
          <div className="mb-2">
            <h3 className="text-xs font-semibold tracking-wide text-[#202824]">
              Status Kehadiran
            </h3>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                Status Saat Ini
              </p>

              <p className="mt-0.5 text-xs text-[#202824]">
                Hasil pencatatan kehadiran
              </p>
            </div>

            <MonitoringStatusBadge status={peserta.status} size="md" />
          </div>
        </section>

        {/* PRESENSI */}
        <section>
          <div className="mb-2">
            <h3 className="text-xs font-semibold tracking-wide text-[#202824]">
              Detail Presensi
            </h3>
          </div>

          <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Metode
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#202824]">
                  {peserta.metode === "qr"
                    ? "QR Code"
                    : peserta.metode === "manual"
                      ? "Manual"
                      : peserta.metode === "otomatis"
                        ? "Otomatis"
                        : "-"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
                  Waktu Check-in
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#202824]">
                  {formatWaktuCheckin(peserta.waktu_checkin)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KETERANGAN */}
        <section className="border-t border-[#E5EAE6] pt-3">
          <div className="mb-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#78827C]">
              Keterangan
            </p>
          </div>

          <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
            <p className="break-words text-xs leading-relaxed text-[#202824]">
              {peserta.keterangan || "Tidak ada keterangan."}
            </p>
          </div>
        </section>
      </div>
    </Modal>
  );
}
