"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

import type { Jamaah } from "../../backend/jamaah/types";
import { toTitleCase } from "../../backend/mudamudi/format";
import { Button } from "../common";

type Props = {
  data: Jamaah;
  onClose: () => void;
};

export default function JamaahQRModal({ data, onClose }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Format QR Jamaah yang terisolasi dari Muda-Mudi
  const qrValue = `SIKEMA:JAMAAH:${data.qr_id}`;

  async function handleDownload() {
    if (!cardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      await document.fonts?.ready;

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 4,
        backgroundColor: "#f9fafb",
        cacheBust: true,
      });

      const safeName =
        data.nama
          ?.trim()
          .replace(/[^a-zA-Z0-9\s-_]/g, "")
          .replace(/\s+/g, "-") || "Jamaah";

      const link = document.createElement("a");
      link.download = `QR-JAMAAH-${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mengunduh QR Code:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden border border-[#E5EAE6]">
        {/* Header */}
        <div className="border-b border-[#F0F4F1] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#202824]">
              Kartu QR Presensi Jamaah
            </h3>
            <p className="text-[10px] text-[#78827C]">
              Gunakan untuk presensi kegiatan kategori Jamaah
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card Content for Image Export */}
        <div className="p-5 flex flex-col items-center">
          <div
            ref={cardRef}
            className="w-full rounded-2xl border border-[#287A50]/20 bg-gradient-to-b from-[#F4F9F6] to-white p-6 shadow-sm flex flex-col items-center text-center"
          >
            <div className="mb-1 text-[10px] font-semibold tracking-wider uppercase text-[#287A50]">
              REDESPA PANDAK
            </div>
            <div className="text-xs font-bold text-gray-900 mb-4">
              KARTU PRESENSI JAMAAH
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-inner">
              <QRCodeSVG
                value={qrValue}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-900">
                {toTitleCase(data.nama)}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Kelompok {data.kelompok}
              </p>
              <div className="mt-2 inline-flex items-center rounded-full bg-[#E6F2EA] px-2.5 py-0.5 text-[10px] font-medium text-[#287A50]">
                {data.jenis_kelamin || "Jamaah"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#F0F4F1] bg-gray-50/50 px-5 py-3 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#287A50] text-xs hover:bg-[#1E5E3D]"
          >
            {isDownloading ? "Mengunduh..." : "Unduh Gambar QR"}
          </Button>
        </div>
      </div>
    </div>
  );
}
