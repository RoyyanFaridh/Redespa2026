"use client";

import type { Jamaah } from "../../backend/jamaah/types";
import { toTitleCase } from "../../backend/mudamudi/format";
import ModalWrapper from "../mudamudi/ModalWrapper";
import { Button } from "../common";

type Props = {
  data: Jamaah;
  onClose: () => void;
};

export default function JamaahDetailModal({ data, onClose }: Props) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-[#F0F4F1] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#202824]">
                Detail Data Jamaah
              </h2>
              <p className="text-[11px] text-[#78827C]">
                Informasi profil lengkap warga jamaah.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Nama Lengkap</span>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {toTitleCase(data.nama)}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Kelompok</span>
              <p className="text-sm font-semibold text-[#287A50] mt-0.5">
                {data.kelompok}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Jenis Kelamin</span>
              <p className="text-xs text-gray-800 mt-0.5">
                {data.jenis_kelamin || "-"}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Tempat, Tahun Lahir</span>
              <p className="text-xs text-gray-800 mt-0.5">
                {[data.tempat_lahir, data.tahun_lahir].filter(Boolean).join(", ") || "-"}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Nomor HP / WhatsApp</span>
              <p className="text-xs text-gray-800 mt-0.5">
                {data.no_hp || "-"}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Pekerjaan</span>
              <p className="text-xs text-gray-800 mt-0.5">
                {data.pekerjaan || "-"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400">ID Kode QR Presensi</span>
            <p className="text-[11px] font-mono text-gray-500 break-all mt-0.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
              {data.qr_id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#F0F4F1] px-6 py-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
