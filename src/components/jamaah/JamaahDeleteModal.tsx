
"use client";

import { useState } from "react";
import type { Jamaah } from "../../backend/jamaah/types";
import { ModalWrapper, Button } from "../common";

type Props = {
  data: Jamaah;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function JamaahDeleteModal({
  data,
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (loading) return;

    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalWrapper onClose={onClose} size="sm">
      <div className="p-4 sm:p-5 flex flex-col items-center text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 ring-4 ring-red-50/60">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h3 className="text-sm font-bold text-[#202824]">
          Hapus Data Jamaah
        </h3>

        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#78827C]">
          Apakah Anda yakin ingin menghapus data{" "}
          <strong className="text-[#202824]">{data.nama}</strong> dari kelompok{" "}
          <strong className="text-[#202824]">{data.kelompok}</strong>?
        </p>

        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#78827C]">
          Data Jamaah akan dihapus dari daftar aktif. Riwayat presensi dan
          snapshot kegiatan tetap tersimpan.
        </p>

        <div className="mt-4 flex w-full justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={loading}
            className="text-xs"
          >
            Hapus Jamaah
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
