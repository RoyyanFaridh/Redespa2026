import JSZip from "jszip";
import { QRCodeSVG } from "qrcode.react";
import React from "react";
import ReactDOMServer from "react-dom/server";
import type { Mudamudi } from "./types";

/**
 * Membersihkan karakter ilegal untuk nama file pada sistem operasi Windows
 * (< > : " / \ | ? * serta control characters 0x00 - 0x1F)
 * tanpa mengubah spasi di dalam nama.
 */
export function sanitizeWindowsFileName(name: string): string {
  // Karakter yang dilarang di Windows: < > : " / \ | ? *
  const illegalRe = /[<>:"/\\|?*\x00-\x1F]/g;
  const cleaned = name.replace(illegalRe, "").trim();
  return cleaned || "Tanpa_Nama";
}

/**
 * Menghasilkan SVG string QR Code persis dengan format yang digunakan di MudamudiQRModal
 * Payload format: SIKEMA:MUDA_MUDI:{qr_id}
 * Error Correction: M
 * Include Margin: true
 */
export function generateQRCodeSvgString(qrId: string): string {
  const payload = `SIKEMA:MUDA_MUDI:${qrId}`;
  const element = React.createElement(QRCodeSVG, {
    value: payload,
    level: "M",
    includeMargin: true,
    size: 512,
  });
  return ReactDOMServer.renderToStaticMarkup(element);
}

/**
 * Mengonversi SVG String menjadi PNG Blob menggunakan OffscreenCanvas / HTMLCanvasElement di browser
 */
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

        // Background putih untuk kontras QR optimal
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // Gambar QR Code
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Gagal mengonversi canvas ke PNG Blob"));
          }
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal memuat SVG QR Code ke Image"));
    };

    img.src = url;
  });
}

export type ExportQRProgressCallback = (current: number, total: number) => void;

/**
 * Mengunduh seluruh QR Code Muda-Mudi Desa Pandak dalam bentuk ZIP:
 * - Nama file ZIP: QR_Muda_Mudi_Pandak.zip
 * - Struktur folder: Nama Kelompok / QR_[nama_lengkap]_[kelompok].png
 * - Penanganan duplikasi nama dengan suffix numerik (_2, _3, dst.)
 */
export async function exportBatchQRCodeZip(
  dataList: Mudamudi[],
  onProgress?: ExportQRProgressCallback,
): Promise<void> {
  if (!dataList || dataList.length === 0) {
    throw new Error("Tidak ada data Muda-Mudi untuk di-export.");
  }

  const zip = new JSZip();
  const total = dataList.length;

  // Track nama file yang sudah digunakan per kelompok agar tidak terjadi overwrite
  const usedFileNamesByFolder = new Map<string, Set<string>>();

  // Cache folder zip per kelompok
  const folderCache = new Map<string, JSZip>();

  for (let i = 0; i < total; i++) {
    const item = dataList[i];
    const rawKelompok = (item.kelompok || "Lainnya").trim();
    const folderName = sanitizeWindowsFileName(rawKelompok);

    let folder = folderCache.get(folderName);
    if (!folder) {
      folder = zip.folder(folderName) ?? zip;
      folderCache.set(folderName, folder);
    }

    let folderSet = usedFileNamesByFolder.get(folderName);
    if (!folderSet) {
      folderSet = new Set<string>();
      usedFileNamesByFolder.set(folderName, folderSet);
    }

    // Nama lengkap dan kelompok dengan spasi asli yang tersimpan di database
    const rawNama = (item.nama || "Tanpa Nama").trim();
    const cleanNama = sanitizeWindowsFileName(rawNama);
    const cleanKelompok = sanitizeWindowsFileName(rawKelompok);

    // Format: QR_[nama_lengkap]_[kelompok].png
    const baseFileName = `QR_${cleanNama}_${cleanKelompok}`;
    let finalFileName = `${baseFileName}.png`;
    let duplicateIndex = 2;

    // Pastikan tidak ada overwrite jika terdapat nama duplikat di folder yang sama
    while (folderSet.has(finalFileName.toLowerCase())) {
      finalFileName = `${baseFileName}_${duplicateIndex}.png`;
      duplicateIndex++;
    }
    folderSet.add(finalFileName.toLowerCase());

    // Generate SVG string dan konversi ke PNG Blob
    const svgString = generateQRCodeSvgString(item.qr_id);
    const pngBlob = await svgToPngBlob(svgString, 512, 512);

    folder.file(finalFileName, pngBlob);

    if (onProgress) {
      onProgress(i + 1, total);
    }

    // Berikan jeda mikrotask kecil setiap 15 item agar UI browser tetap responsif
    if (i % 15 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Generate file ZIP
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Trigger unduh ZIP
  const downloadUrl = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = "QR_Muda_Mudi_Pandak.zip";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

