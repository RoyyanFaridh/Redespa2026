"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { ScannerStatus, ScannerNotification } from "./types";
import ScannerStatusIndicator from "./ScannerStatusIndicator";
import ScannerResultBanner from "./ScannerResultBanner";

const CAMERA_REGION_ID = "redespa-camera-qr-reader";
const FPS = 15;
const MOBILE_QRBOX_SIZE = 220;
const DESKTOP_QRBOX_SIZE = 240;

type Props = {
  status: ScannerStatus;
  notification: ScannerNotification | null;
  isProcessing: boolean;
  onScan: (qrText: string) => Promise<void>;
  soundEnabled: boolean;
  onToggleSound: () => void;
};

export default function ScannerManual({
  status,
  notification,
  isProcessing,
  onScan,
  soundEnabled,
  onToggleSound,
}: Props) {
  const [isStarting, setIsStarting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const isStartingRef = useRef(false);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (e) {
      console.warn("[ScannerManual] Error stopping camera:", e);
    }

    try {
      scanner.clear();
    } catch { }

    if (scannerRef.current === scanner) {
      scannerRef.current = null;
    }

    if (mountedRef.current) {
      setIsCameraActive(false);
    }
  }, []);

  const startCamera = useCallback(
    async (force = false) => {
      if (!mountedRef.current) return;
      if (isStartingRef.current && !force) return;
      if (isCameraActive && !force) return;

      isStartingRef.current = true;
      setIsStarting(true);
      setCameraError(null);

      try {
        if (scannerRef.current) {
          await stopCamera();
        }

        const element = document.getElementById(CAMERA_REGION_ID);
        if (!element) {
          throw new Error("Elemen kamera tidak ditemukan di DOM.");
        }

        const isDesktop = window.innerWidth >= 768;
        const boxSize = isDesktop
          ? DESKTOP_QRBOX_SIZE
          : Math.min(MOBILE_QRBOX_SIZE, Math.max(160, window.innerWidth - 64));

        const scanner = new Html5Qrcode(CAMERA_REGION_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: FPS,
            qrbox: {
              width: boxSize,
              height: boxSize,
            },
            aspectRatio: isDesktop ? 16 / 9 : 1,
          },
          (decodedText) => {
            void onScan(decodedText);
          },
          () => { },
        );

        if (mountedRef.current) {
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("[ScannerManual] Failed to start camera:", err);
        if (mountedRef.current) {
          setCameraError(
            err instanceof Error && err.message
              ? err.message
              : "Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan pada browser.",
          );
        }
      } finally {
        isStartingRef.current = false;
        if (mountedRef.current) {
          setIsStarting(false);
        }
      }
    },
    [isCameraActive, onScan, stopCamera],
  );

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      void startCamera();
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      void stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="space-y-3.5">
      <section className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs">
        {/* Header Mode */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#E5EAE6] bg-[#F5F7F5] px-3.5 py-2.5 sm:px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-medium text-[#202824]">
                Scanner Kamera Perangkat
              </h2>
              <p className="text-[10px] text-[#78827C]">
                Memindai langsung melalui lensa kamera smartphone / laptop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition ${
                soundEnabled
                  ? "border-[#65B98A]/40 bg-[#E6F2EA] text-[#287A50]"
                  : "border-[#E5EAE6] bg-white text-[#78827C] hover:bg-[#F5F7F5]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3 w-3"
              >
                {soundEnabled ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5 6 9H3v6h3l5 4V5Zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6"
                  />
                )}
              </svg>
              <span>{soundEnabled ? "Suara Aktif" : "Suara"}</span>
            </button>

            <ScannerStatusIndicator status={status} modeLabel="Kamera" />
          </div>
        </div>

        {/* Notifikasi Hasil Presensi Operasional */}
        {notification && (
          <div className="p-3.5 sm:p-4 pb-0">
            <ScannerResultBanner notification={notification} />
          </div>
        )}

        {/* Viewfinder Kamera */}
        <div className="p-3.5 sm:p-4">
          <div className="relative min-h-64 overflow-hidden rounded-xl bg-gray-950 p-2 sm:p-3">
            <div
              id={CAMERA_REGION_ID}
              className="mx-auto min-h-60 w-full max-w-lg overflow-hidden rounded-lg"
            />

            {/* Overlay Loading */}
            {isStarting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 text-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-gray-600 border-t-emerald-400" />
                <p className="mt-2.5 text-xs text-white">
                  Menyiapkan kamera...
                </p>
                <p className="mt-0.5 text-[9px] text-gray-400">
                  Mohon izinkan akses kamera pada browser.
                </p>
              </div>
            )}

            {/* Overlay Error Kamera */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/95 p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.3 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xs font-medium text-white">
                  Kamera Tidak Dapat Digunakan
                </h3>
                <p className="mt-1 max-w-sm text-[10px] text-gray-400 leading-snug">
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={() => void startCamera(true)}
                  className="mt-3 rounded-lg bg-[#287A50] px-3.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#206440] transition"
                >
                  Coba Akses Lagi
                </button>
              </div>
            )}

            {/* Status saat memproses */}
            {isProcessing && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-3.5 py-1 backdrop-blur-xs flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                <span>Memproses QR...</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#78827C]">
            <span>Arahkan kamera belakang ke QR Code peserta.</span>
            <span>Deteksi Otomatis</span>
          </div>
        </div>
      </section>
    </div>
  );
}
