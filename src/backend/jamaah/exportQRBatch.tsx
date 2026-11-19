
import JSZip from "jszip";
import { QRCodeSVG } from "qrcode.react";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { toPng } from "html-to-image";
import type { Jamaah } from "./types";
import { toTitleCase } from "../mudamudi/format";

const CARD_WIDTH = 213;
const CARD_HEIGHT = 329;
const EXPORT_SCALE = 4;
const QR_SIZE = 132;

type CardProps = {
  data: Jamaah;
};

function JamaahQRCard({ data }: CardProps) {
  const qrValue = `KMM_PANDAK:MUDA_MUDI:${data.qr_id}`;
  const displayName = toTitleCase(data.nama || "Jamaah");
  const displayGroup = data.kelompok || "Jamaah";
  const displayGender = data.jenis_kelamin || "Tidak diketahui";

  return (
    <div
      data-jamaah-card
      className="relative flex shrink-0 flex-col overflow-hidden border border-[#D8E2DA] bg-white"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        minWidth: `${CARD_WIDTH}px`,
        boxSizing: "border-box",
        padding: "7px",
      }}
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
  );
}

export function sanitizeWindowsFileName(name: string): string {
  const illegalRe = /[<>:"/\\|?*\x00-\x1F]/g;
  const cleaned = name.replace(illegalRe, "").trim();
  return cleaned || "Tanpa_Nama";
}

async function generateJamaahCardPng(data: Jamaah): Promise<Blob> {
  const wrapper = document.createElement("div");

  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${CARD_WIDTH}px`;
  wrapper.style.height = `${CARD_HEIGHT}px`;
  wrapper.style.overflow = "visible";
  wrapper.style.backgroundColor = "#FFFFFF";
  wrapper.style.zIndex = "-1";

  try {
    wrapper.innerHTML = ReactDOMServer.renderToStaticMarkup(
      <JamaahQRCard data={data} />,
    );

    document.body.appendChild(wrapper);

    await document.fonts.ready;

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    const cardElement = wrapper.querySelector<HTMLElement>(
      "[data-jamaah-card]",
    );

    if (!cardElement) {
      throw new Error(
        `Gagal membuat tampilan kartu untuk ${data.nama || "Jamaah"}.`,
      );
    }

    const dataUrl = await toPng(cardElement, {
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

    const response = await fetch(dataUrl);
    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error(
        `Gagal menghasilkan gambar kartu untuk ${data.nama || "Jamaah"}.`,
      );
    }

    return blob;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kesalahan tidak diketahui.";

    throw new Error(
      `Gagal mengekspor QR Jamaah ${data.nama || "Tanpa Nama"}: ${message}`,
    );
  } finally {
    wrapper.remove();
  }
}

export async function exportJamaahQRBatchZip(
  jamaahList: Jamaah[],
  onProgress?: (processed: number, total: number) => void,
): Promise<Blob> {
  if (jamaahList.length === 0) {
    throw new Error("Tidak ada data Jamaah untuk diekspor.");
  }

  if (typeof document === "undefined") {
    throw new Error("Ekspor kartu hanya dapat dilakukan melalui browser.");
  }

  const zip = new JSZip();
  const rootFolder = zip.folder("QR_Code_Jamaah");

  if (!rootFolder) {
    throw new Error("Gagal membuat folder ZIP.");
  }

  const total = jamaahList.length;
  const usedFileNames = new Map<string, Set<string>>();

  for (let i = 0; i < total; i++) {
    const item = jamaahList[i];

    if (!item.qr_id) {
      throw new Error(
        `QR ID tidak ditemukan untuk Jamaah: ${item.nama || "Tanpa Nama"}.`,
      );
    }

    const safeKelompok = sanitizeWindowsFileName(
      item.kelompok || "Tanpa_Kelompok",
    );

    const gender = (item.jenis_kelamin || "").trim().toLowerCase();

    const safeGender =
      gender === "laki-laki" || gender === "laki laki"
        ? "Laki-laki"
        : gender === "perempuan"
          ? "Perempuan"
          : "Tidak_Diketahui";

    const safeNama = sanitizeWindowsFileName(
      item.nama || "Tanpa_Nama",
    );

    const groupFolder =
      rootFolder.folder(safeKelompok) || rootFolder;

    const genderFolder =
      groupFolder.folder(safeGender) || groupFolder;

    const folderKey = `${safeKelompok.toLowerCase()}/${safeGender.toLowerCase()}`;

    const existingNames =
      usedFileNames.get(folderKey) || new Set<string>();

    let fileName = `${safeNama}.png`;

    if (existingNames.has(fileName.toLowerCase())) {
      fileName = `${safeNama}_${item.qr_id.slice(0, 8)}.png`;
    }

    existingNames.add(fileName.toLowerCase());
    usedFileNames.set(folderKey, existingNames);

    const pngBlob = await generateJamaahCardPng(item);

    genderFolder.file(fileName, pngBlob);

    onProgress?.(i + 1, total);
  }

  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });
}
