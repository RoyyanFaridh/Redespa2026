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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kartu QR Presensi Jamaah"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-3 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none sm:p-4"
      onClick={onClose}
    >
      <div
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5EAE6] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#202824]">
                Kartu QR Presensi
              </h3>
              <p className="text-[9px] text-[#78827C]">
                Presensi kegiatan Jamaah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 text-[#78827C] transition-colors duration-150 hover:bg-[#F0F4F1] hover:text-[#202824] motion-reduce:transition-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card Content for Image Export */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
          <div
            ref={cardRef}
            className="w-full rounded-2xl border border-[#287A50]/20 bg-gradient-to-b from-[#F4F9F6] to-white p-5 shadow-xs flex flex-col items-center text-center"
          >
            <div className="text-[9px] font-semibold tracking-wider uppercase text-[#287A50]">
              REDESPA PANDAK
            </div>
            <div className="text-[11px] font-bold text-[#202824] mb-3">
              KARTU PRESENSI JAMAAH
            </div>

            <div className="rounded-xl border border-[#E5EAE6] bg-white p-2.5 shadow-2xs">
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="mt-3.5">
              <h4 className="text-xs font-bold text-[#202824]">
                {toTitleCase(data.nama)}
              </h4>
              <p className="text-[10px] text-[#78827C] mt-0.5">
                Kelompok {data.kelompok}
              </p>
              <div className="mt-1.5 inline-flex items-center rounded-full bg-[#E6F2EA] px-2 py-0.5 text-[9px] font-medium text-[#287A50]">
                {data.jenis_kelamin || "Jamaah"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-2.5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            className="bg-[#287A50] text-xs hover:bg-[#1E5E3D]"
          >
            Unduh Gambar QR
          </Button>
        </div>
      </div>
    </div>
  );
}
