
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

const CARD_WIDTH = 213;
const CARD_HEIGHT = 329;
const EXPORT_SCALE = 4;
const QR_SIZE = 132;

export default function JamaahQRModal({ data, onClose }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const qrValue = `KMM_PANDAK:MUDA_MUDI:${data.qr_id}`;
  const displayName = toTitleCase(data.nama || "Jamaah");
  const displayGroup = data.kelompok || "Jamaah";
  const displayGender = data.jenis_kelamin || "Tidak diketahui";

  async function handleDownload() {
    if (!cardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      await document.fonts.ready;

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: EXPORT_SCALE,
        backgroundColor: "#FFFFFF",
        cacheBust: true,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        canvasWidth: CARD_WIDTH * EXPORT_SCALE,
        canvasHeight: CARD_HEIGHT * EXPORT_SCALE,
        style: {
          transform: "none",
          margin: "0",
        },
      });

      const safeName =
        data.nama
          ?.trim()
          .replace(/[^a-zA-Z0-9\s-_]/g, "")
          .replace(/\s+/g, "-") || "Jamaah";

      const link = document.createElement("a");
      link.download = `QR-JAMAAH-${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh QR Code:", error);
      window.alert("Gagal membuat gambar QR. Silakan coba kembali.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kartu QR Presensi Jamaah"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="my-auto flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E7EBE8] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#202824]">
              Kartu QR Presensi
            </h3>
            <p className="mt-1 text-[10px] text-[#89918C]">
              Pratinjau kartu identitas Jamaah
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 text-[#89918C] transition hover:bg-[#F3F5F3] hover:text-[#202824]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#344139]">
                Pratinjau kartu
              </p>
              <p className="mt-1 text-[10px] text-[#89918C]">
                Format portrait · Cocard B1
              </p>
            </div>

            <span className="rounded-md border border-[#E5EAE6] px-2.5 py-1 text-[9px] font-medium tabular-nums text-[#657269]">
              55 × 85 mm
            </span>
          </div>

          <div className="flex justify-center rounded-xl bg-[#EEF1EE] p-5">
            <div
              ref={cardRef}
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                minWidth: `${CARD_WIDTH}px`,
                boxSizing: "border-box",
                padding: "7px",
              }}
              className="relative flex shrink-0 flex-col overflow-hidden border border-[#D8E2DA] bg-white"
            >
              <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[5px] border border-[#E5EBE6]">
                <div className="relative flex h-[70px] shrink-0 items-center overflow-hidden bg-[#174B32] px-3.5">
                  <div className="absolute -right-5 -top-10 h-28 w-28 rounded-full border border-white/10" />
                  <div className="absolute -right-1 -top-7 h-20 w-20 rounded-full border border-white/10" />
                  <div className="absolute -bottom-8 -left-5 h-16 w-16 rounded-full bg-white/[0.04]" />

                  <div className="relative z-10 flex w-full items-center justify-between">
                    <div>
                      <p className="text-[7px] font-medium tracking-[1.8px] text-[#C5D9CB]">
                        KARTU IDENTITAS
                      </p>
                      <h2 className="mt-1.5 text-[14px] font-semibold tracking-[1.7px] text-white">
                        DESA PANDAK
                      </h2>
                      <p className="mt-1 text-[6px] tracking-[1px] text-[#C5D9CB]">
                        SISTEM PRESENSI DIGITAL
                      </p>
                    </div>

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3.5l7 3v5.2c0 4.2-2.8 7.6-7 9.3-4.2-1.7-7-5.1-7-9.3V6.5l7-3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col items-center bg-[#F5F8F5] px-2.5 pb-2.5 pt-2.5">
                  <div className="flex w-full shrink-0 items-center justify-center gap-1.5">
                    <span className="max-w-[100px] truncate rounded-full border border-[#D8E5DA] bg-white px-2.5 py-1 text-[7px] font-semibold text-[#245B3C]">
                      {displayGroup}
                    </span>

                    <span className="max-w-[75px] truncate rounded-full border border-[#E5E9E5] bg-white px-2.5 py-1 text-[7px] font-medium text-[#69736C]">
                      {displayGender}
                    </span>
                  </div>

                  <div className="mt-2.5 flex h-[146px] w-[146px] shrink-0 items-center justify-center rounded-xl border border-[#E2E9E3] bg-white shadow-[0_3px_12px_rgba(23,75,50,0.06)]">
                    <QRCodeSVG
                      value={qrValue}
                      size={QR_SIZE}
                      level="M"
                      includeMargin
                      bgColor="#FFFFFF"
                      fgColor="#14251A"
                    />
                  </div>

                  <div className="mt-2.5 w-full shrink-0 px-1 text-center">
                    <h3 className="break-words text-[10px] font-semibold leading-snug text-[#20372A]">
                      {displayName}
                    </h3>

                    <div className="mx-auto mt-1.5 flex w-full items-center justify-center gap-1.5">
                      <span className="h-px w-4 shrink-0 bg-[#C5D5C8]" />
                      <p className="break-all font-mono text-[6px] tracking-[0.3px] text-[#77857B]">
                        {data.qr_id}
                      </p>
                      <span className="h-px w-4 shrink-0 bg-[#C5D5C8]" />
                    </div>
                  </div>

                  <div className="mt-auto w-full pt-2">
                    <div className="h-px w-full bg-[#DCE6DE]" />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[6px] font-semibold tracking-[1.2px] text-[#245B3C]">
                        REDESPA
                      </span>
                      <span className="text-[6px] tracking-[0.7px] text-[#89958D]">
                        DESA PANDAK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#E8ECE8] bg-[#FAFBFA] px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-[#66816D]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>

              <div>
                <p className="text-[10px] font-medium text-[#344139]">
                  Kualitas gambar
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#78827B]">
                  PNG 1278 × 1974 px. Area QR memiliki ruang putih di
                  sekelilingnya untuk membantu menjaga keterbacaan saat
                  dipindai.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#E7EBE8] bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Tutup
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            className="bg-[#245B3C] text-xs hover:bg-[#19452D]"
          >
            Unduh Kartu QR
          </Button>
        </div>
      </div>
    </div>
  );
}
