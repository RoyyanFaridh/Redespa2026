"use client";

import React, { useEffect, useState } from "react";
import { getKegiatanById } from "../../backend/presensi/public";
import { formatRentangTanggal } from "../../backend/kegiatan/format";
import { PageContainer, PageHeader, Button } from "../common";
import { useScannerEngine } from "./useScannerEngine";
import ScannerTools from "./ScannerTools";
import ScannerManual from "./ScannerManual";

type Props = {
  kegiatanId: number;
};

type Kegiatan = NonNullable<Awaited<ReturnType<typeof getKegiatanById>>>;

export default function ScannerPage({ kegiatanId }: Props) {
  const [scanMethod, setScanMethod] = useState<"cashow" | "camera">("cashow");
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(true);
  const [kegiatanError, setKegiatanError] = useState<string | null>(null);

  // Engine presensi bersama
  const {
    status,
    notification,
    isProcessing,
    soundEnabled,
    enableSound,
    disableSound,
    debugLogs,
    debugPayload,
    debugStage,
    clearDebugLogs,
    processQR,
  } = useScannerEngine(kegiatanId);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingKegiatan(true);
      setKegiatanError(null);
      try {
        const data = await getKegiatanById(kegiatanId);
        if (!isMounted) return;

        if (!data) {
          setKegiatanError("Kegiatan tidak ditemukan atau belum aktif.");
        } else {
          setKegiatan(data);
        }
      } catch (err) {
        if (!isMounted) return;
        setKegiatanError(
          err instanceof Error
            ? err.message
            : "Gagal memuat informasi kegiatan.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingKegiatan(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [kegiatanId]);

  if (isLoadingKegiatan) {
    return (
      <PageContainer maxWidth="9xl">
        <header className="pb-1">
          <PageHeader
            eyebrow="REDESPA"
            title="Scanner Presensi"
            description="Kelola pemindaian QR Code peserta kegiatan secara langsung."
          />
        </header>

        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#E5EAE6] bg-white p-8 shadow-xs">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5EAE6] border-t-[#287A50]" />
            <p className="text-[11px] text-[#78827C]">
              Memuat data kegiatan...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (kegiatanError || !kegiatan) {
    return (
      <PageContainer maxWidth="9xl">
        <header className="pb-1">
          <PageHeader
            eyebrow="REDESPA"
            title="Scanner Presensi"
            description="Kelola pemindaian QR Code peserta kegiatan secara langsung."
          />
        </header>

        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-medium text-[#202824]">
                Kegiatan Tidak Dapat Diakses
              </h2>
              <p className="mt-0.5 text-[11px] text-[#78827C]">
                {kegiatanError ?? "Kegiatan tidak valid atau telah dihapus."}
              </p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  Kembali
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const jenisPesertaLabel =
    kegiatan.jenis_peserta === "jamaah" ? "Jamaah" : "Muda-Mudi";

  return (
    <PageContainer maxWidth="9xl">
      <header className="pb-1">
        <PageHeader
          eyebrow="REDESPA"
          title="Scanner Presensi"
          description="Kelola pemindaian QR Code peserta kegiatan secara langsung."
          actions={
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/admin/presensi/monitoring")}
                aria-label="Lihat monitoring presensi"
                title="Lihat monitoring presensi"
                leftIcon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5 text-[#78827C]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                }
              >
                <span className="hidden sm:inline">Monitoring</span>
                <span className="sm:hidden">Pantau</span>
              </Button>
            </div>
          }
        />
      </header>

      {/* Bar Ringkas Informasi Kegiatan */}
      <section className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#E5EAE6] bg-[#F5F7F5] px-3.5 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#287A50]" />
            <h2 className="truncate text-xs font-medium text-[#202824]">
              {kegiatan.nama}
            </h2>
          </div>

          <span className="inline-flex rounded-md border border-[#65B98A]/30 bg-[#E6F2EA] px-2 py-0.5 text-[10px] font-medium text-[#287A50]">
            Sasaran {jenisPesertaLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 sm:grid-cols-4 sm:px-4 text-[10px] sm:text-[11px]">
          <div>
            <span className="text-[9px] text-[#78827C] uppercase">Tanggal</span>
            <p className="font-medium text-[#202824] truncate">
              {formatRentangTanggal(kegiatan.tanggal_mulai, kegiatan.tanggal_selesai)}
            </p>
          </div>

          <div>
            <span className="text-[9px] text-[#78827C] uppercase">Jam</span>
            <p className="font-medium text-[#202824]">
              {kegiatan.jam_mulai?.slice(0, 5) ?? "-"} – {kegiatan.jam_selesai?.slice(0, 5) ?? "-"} WIB
            </p>
          </div>

          <div>
            <span className="text-[9px] text-[#78827C] uppercase">Lokasi</span>
            <p className="font-medium text-[#202824] truncate">
              {kegiatan.lokasi?.trim() || "Masjid / Balai"}
            </p>
          </div>

          <div>
            <span className="text-[9px] text-[#78827C] uppercase">Gender</span>
            <p className="font-medium text-[#202824] truncate">
              {kegiatan.jenis_kelamin || "Semua Peserta"}
            </p>
          </div>
        </div>
      </section>

      {/* Pilihan Metode Pemindaian (Tab Minimalis) */}
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5EAE6] bg-white p-2 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Tab 1: Cashow HC-P10 */}
          <button
            type="button"
            onClick={() => setScanMethod("cashow")}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium transition ${
              scanMethod === "cashow"
                ? "bg-[#E6F2EA] text-[#287A50] border border-[#65B98A]/40"
                : "text-[#78827C] hover:bg-[#F5F7F5] hover:text-[#202824]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7V5a1 1 0 0 1 1-1h2m10 0h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2m-10 0H5a1 1 0 0 1-1-1v-2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM14 14h2v2h-2z"
              />
            </svg>
            <span>Scanner Alat (Cashow)</span>
          </button>

          {/* Tab 2: Kamera Perangkat */}
          <button
            type="button"
            onClick={() => setScanMethod("camera")}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium transition ${
              scanMethod === "camera"
                ? "bg-[#E6F2EA] text-[#287A50] border border-[#65B98A]/40"
                : "text-[#78827C] hover:bg-[#F5F7F5] hover:text-[#202824]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
              />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Scanner Kamera (HP)</span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-[10px] text-[#78827C] px-2">
          {scanMethod === "cashow"
            ? "Mendukung pemindaian beruntun otomatis USB"
            : "Memindai menggunakan lensa kamera belakang"}
        </span>
      </section>

      {/* Konten Pemindaian Utama */}
      {scanMethod === "cashow" ? (
        <ScannerTools
          status={status}
          notification={notification}
          isProcessing={isProcessing}
          onScan={(qr) => processQR(qr, "Cashow")}
          debugLogs={debugLogs}
          debugPayload={debugPayload}
          debugStage={debugStage}
          onClearLogs={clearDebugLogs}
        />
      ) : (
        <ScannerManual
          status={status}
          notification={notification}
          isProcessing={isProcessing}
          onScan={(qr) => processQR(qr, "Kamera")}
          soundEnabled={soundEnabled}
          onToggleSound={() => (soundEnabled ? disableSound() : enableSound())}
        />
      )}
    </PageContainer>
  );
}
