import JSZip from "jszip";
import { QRCodeSVG } from "qrcode.react";
import React from "react";
import ReactDOMServer from "react-dom/server";
import type { Jamaah } from "./types";

export function sanitizeWindowsFileName(name: string): string {
  const illegalRe = /[<>:"/\\|?*\x00-\x1F]/g;
  const cleaned = name.replace(illegalRe, "").trim();
  return cleaned || "Tanpa_Nama";
}

/**
 * Payload format khusus Jamaah:
 * SIKEMA:JAMAAH:{qr_id}
 */
export function generateJamaahQRCodeSvgString(qrId: string): string {
  const payload = `SIKEMA:JAMAAH:${qrId}`;
  const element = React.createElement(QRCodeSVG, {
    value: payload,
    level: "M",
    includeMargin: true,
    size: 512,
  });
  return ReactDOMServer.renderToStaticMarkup(element);
}

export async function svgToPngBlob(
  svgString: string,
  width = 512,
  height = 512,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Gagal menginisialisasi canvas context"));
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Gagal mengekspor canvas ke Blob"));
          }
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal memuat image dari SVG Blob"));
    };

    img.src = url;
  });
}

export async function exportJamaahQRBatchZip(
  jamaahList: Jamaah[],
  onProgress?: (processed: number, total: number) => void,
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("QR_Code_Jamaah");
  const total = jamaahList.length;

  for (let i = 0; i < total; i++) {
    const item = jamaahList[i];
    const safeKelompok = sanitizeWindowsFileName(item.kelompok || "Tanpa_Kelompok");
    const safeNama = sanitizeWindowsFileName(item.nama || "Tanpa_Nama");
    const fileName = `${safeKelompok}_${safeNama}.png`;

    const svg = generateJamaahQRCodeSvgString(item.qr_id);
    const pngBlob = await svgToPngBlob(svg, 512, 512);

    if (folder) {
      folder.file(fileName, pngBlob);
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}
