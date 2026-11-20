
"use client";

import { Kegiatan } from "../../backend/kegiatan/types";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

type Props = {
  data: Kegiatan;
  error: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function DeleteConfirmModal({
  data,
  error,
  onConfirm,
  onClose,
}: Props) {
  return (
    <ConfirmationDialog
      title="Hapus Kegiatan"
      subtitle="Konfirmasi penghapusan kegiatan"
      message={
        <span>
          Apakah Anda yakin ingin menghapus kegiatan{" "}
          <span className="font-semibold text-[#202824]">{data.nama}</span>?
        </span>
      }
      warningNote="Kegiatan akan dihapus dari daftar aktif. Riwayat kegiatan dan presensi tetap tersimpan."
      error={error}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
