"use client";

import type { Jamaah } from "../../backend/jamaah/types";
import ModalWrapper from "../mudamudi/ModalWrapper";
import { Button } from "../common";

type Props = {
  data: Jamaah;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function JamaahDeleteModal({ data, onConfirm, onClose }: Props) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-base font-bold text-gray-900">Hapus Data Jamaah</h3>
        <p className="mt-2 text-xs text-gray-500">
          Apakah Anda yakin ingin menghapus data <strong>{data.nama}</strong> dari kelompok <strong>{data.kelompok}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            className="text-xs bg-red-600 text-white hover:bg-red-700"
          >
            Hapus Jamaah
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
