"use client";

import { Mudamudi } from "../../backend/mudamudi/types";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

type Props = {
  data: Mudamudi;
  error: string;
  onConfirm: () => void;
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
      title="Hapus Data Jamaah"
      subtitle="Konfirmasi penghapusan anggota"
      message={
        <span>
          Apakah Anda yakin ingin menghapus data Jamaah atas nama{" "}
          <span className="font-semibold text-[#202824]">{data.nama}</span>?
        </span>
      }
      warningNote="Tindakan ini permanen dan akan menghapus data anggota beserta riwayat presensi terkait. Tindakan ini tidak dapat dibatalkan."
      error={error}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
