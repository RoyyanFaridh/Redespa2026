"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import { scanMudamudiQR, getKegiatanById } from "../../backend/presensi/public";

type Kegiatan = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
};

type Mudamudi = {
  id: number;
  nama: string;
  kelompok: string;
  kelas: string;
  jenis_kelamin: string | null;
  tanggal_lahir: string | null;
};

type ScanResult =
  | {
      success: true;
      type: "success";
      message: string;
      presensiId: number;
      waktuCheckin: string;
      status: "hadir" | "terlambat" | "izin" | "sakit" | "alpa";
      metode: "qr" | "manual";
      kegiatan: Kegiatan;
      mudamudi: Mudamudi;
    }
  | {
      success: false;
      type:
        | "invalid_qr"
        | "mudamudi_not_found"
        | "kegiatan_not_found"
        | "kegiatan_inactive"
        | "already_present"
        | "database_error";
      message: string;
      mudamudi?: Mudamudi;
      kegiatan?: Kegiatan;
    };

type CheckinScannerProps = {
  kegiatanId: number;
};

const QR_REGION_ID = "kmm-pandak-mudamudi-qr-reader";

const SCAN_COOLDOWN = 3000;
const RESULT_DISPLAY_DURATION = 3000;

/*
 * HC-P10 bekerja sebagai USB HID keyboard.
 *
 * Beberapa scanner mengirim Enter setelah QR selesai,
 * tetapi tidak semua konfigurasi scanner pasti mengirim Enter.
 *
 * Karena itu kita menggunakan timeout pendek sebagai fallback.
 */
const HID_SCAN_TIMEOUT = 120;

const MOBILE_QRBOX_SIZE = 220;
const DESKTOP_QRBOX_SIZE = 280;

const FPS = 10;

const MUDA_MUDI_QR_PREFIX = "KMM_PANDAK:MUDA_MUDI:";

export default function CheckinScanner({ kegiatanId }: CheckinScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const mountedRef = useRef(true);
  const scanningRef = useRef(false);
  const processingRef = useRef(false);

  const lastScannedQRRef = useRef<string | null>(null);
  const lastScannedAtRef = useRef(0);

  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Buffer untuk menangkap input dari HC-P10.
   *
   * HC-P10 diperlakukan browser sebagai keyboard.
   *
   * Contoh:
   *
   * K → M → M → _ → P → A → N → D → A → K → ...
   *
   * seluruh karakter akan dikumpulkan di sini.
   */
  const hidBufferRef = useRef("");

  const hidTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Menyimpan breakpoint kamera terakhir.
   *
   * false = mobile
   * true  = desktop
   */
  const desktopModeRef = useRef<boolean | null>(null);

  /*
   * Mencegah dua proses restart kamera berjalan bersamaan.
   */
  const restartingRef = useRef(false);

  const [isStarting, setIsStarting] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  /*
   * Scanner fisik selalu siap selama halaman aktif.
   *
   * HC-P10 tidak memerlukan permission seperti kamera.
   */
  const [isPhysicalScannerReady, setIsPhysicalScannerReady] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);

  /*
   * Membersihkan timeout HID.
   */
  const clearHidTimeout = () => {
    if (hidTimeoutRef.current) {
      clearTimeout(hidTimeoutRef.current);
      hidTimeoutRef.current = null;
    }
  };

  /*
   * Membersihkan buffer HC-P10.
   */
  const clearHidBuffer = () => {
    hidBufferRef.current = "";
    clearHidTimeout();
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    scanningRef.current = false;
    setIsScanning(false);

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.error("[CheckinScanner] Failed to stop scanner:", error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.error("[CheckinScanner] Failed to clear scanner:", error);
    }

    scannerRef.current = null;
  };

  /*
   * Memproses QR baik dari kamera maupun HC-P10.
   *
   * Semua sumber scanner berakhir di fungsi yang sama.
   */
  const handleScan = async (decodedText: string) => {
    console.log("[QR TERDETEKSI]", decodedText);

    if (!mountedRef.current) {
      return;
    }

    const qrText = decodedText.trim();

    if (!qrText) {
      return;
    }

    /*
     * Pastikan hanya QR Muda-Mudi REDESPA Pandak
     * yang diproses.
     */
    if (!qrText.startsWith(MUDA_MUDI_QR_PREFIX)) {
      return;
    }

    const now = Date.now();

    /*
     * Cooldown global untuk kamera dan scanner fisik.
     */
    if (now - lastScannedAtRef.current < SCAN_COOLDOWN) {
      return;
    }

    /*
     * Mencegah QR yang sama diproses berulang kali
     * dalam waktu singkat.
     */
    if (
      lastScannedQRRef.current === qrText &&
      now - lastScannedAtRef.current < RESULT_DISPLAY_DURATION + SCAN_COOLDOWN
    ) {
      return;
    }

    /*
     * Jangan proses dua QR sekaligus.
     */
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    lastScannedQRRef.current = qrText;
    lastScannedAtRef.current = now;

    setError(null);

    try {
      const scanResult = (await scanMudamudiQR(
        qrText,
        kegiatanId,
      )) as ScanResult;

      if (!mountedRef.current) {
        return;
      }

      setResult(scanResult);

      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }

      resultTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        setResult(null);
        lastScannedQRRef.current = null;
        processingRef.current = false;
      }, RESULT_DISPLAY_DURATION);
    } catch (error) {
      console.error("[CheckinScanner] Scan error:", error);

      if (!mountedRef.current) {
        return;
      }

      setResult({
        success: false,
        type: "database_error",
        message: "Terjadi kesalahan saat memproses presensi.",
      });

      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }

      resultTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        setResult(null);
        lastScannedQRRef.current = null;
        processingRef.current = false;
      }, RESULT_DISPLAY_DURATION);
    }
  };

  /*
   * Menyelesaikan satu hasil scan dari HC-P10.
   */
  const processHidBuffer = () => {
    const qrText = hidBufferRef.current.trim();

    clearHidBuffer();

    if (!qrText) {
      return;
    }

    /*
     * Hanya teruskan payload yang memang memiliki
     * prefix QR Muda-Mudi.
     */
    if (!qrText.startsWith(MUDA_MUDI_QR_PREFIX)) {
      return;
    }

    console.log("[HC-P10 TERDETEKSI]", qrText);

    void handleScan(qrText);
  };

  /*
   * Menangkap input keyboard dari HC-P10.
   *
   * HC-P10 USB HID akan dianggap browser sebagai keyboard.
   *
   * Contoh:
   *
   * H → A → L → O → Enter
   *
   * atau:
   *
   * H → A → L → O
   *        ↓
   * timeout
   *        ↓
   * diproses
   */
  useEffect(() => {
    if (!kegiatan) {
      return;
    }

    const handleHidKeyDown = (event: KeyboardEvent) => {
      if (!mountedRef.current) {
        return;
      }

      /*
       * Enter menandakan scanner selesai mengirim
       * data pada konfigurasi HC-P10 yang memakai suffix Enter.
       */
      if (event.key === "Enter") {
        if (hidBufferRef.current) {
          event.preventDefault();
          processHidBuffer();
        }

        return;
      }

      /*
       * Abaikan modifier key.
       *
       * Scanner biasanya mengirim karakter biasa.
       */
      if (
        event.key === "Shift" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Meta" ||
        event.key === "Tab" ||
        event.key === "Escape"
      ) {
        return;
      }

      /*
       * Kita hanya menerima satu karakter.
       */
      if (event.key.length !== 1) {
        return;
      }

      /*
       * Tambahkan karakter ke buffer.
       */
      hidBufferRef.current += event.key;

      /*
       * Reset timeout setiap kali karakter baru diterima.
       *
       * Dengan demikian selama HC-P10 masih mengirim
       * karakter, timeout tidak akan mengeksekusi.
       */
      clearHidTimeout();

      hidTimeoutRef.current = setTimeout(() => {
        processHidBuffer();
      }, HID_SCAN_TIMEOUT);
    };

    window.addEventListener("keydown", handleHidKeyDown);

    setIsPhysicalScannerReady(true);

    return () => {
      window.removeEventListener("keydown", handleHidKeyDown);

      clearHidBuffer();

      setIsPhysicalScannerReady(false);
    };
  }, [kegiatan]);

  const startScanner = async (force = false) => {
    if (!mountedRef.current) {
      return;
    }

    if (scanningRef.current && !force) {
      return;
    }

    if (restartingRef.current) {
      return;
    }

    restartingRef.current = true;

    setIsStarting(true);
    setError(null);

    try {
      const element = document.getElementById(QR_REGION_ID);

      if (!element) {
        throw new Error("Area scanner tidak ditemukan.");
      }

      /*
       * Pastikan scanner kamera lama benar-benar dihentikan
       * sebelum membuat instance baru.
       */
      if (scannerRef.current) {
        await stopScanner();
      }

      if (!mountedRef.current) {
        return;
      }

      /*
       * Tentukan mode berdasarkan breakpoint.
       *
       * < 768px  = mobile
       * >= 768px = desktop
       */
      const isDesktop = window.innerWidth >= 768;

      const qrboxSize = isDesktop
        ? DESKTOP_QRBOX_SIZE
        : Math.min(MOBILE_QRBOX_SIZE, Math.max(160, window.innerWidth - 64));

      /*
       * Mobile:
       * kamera diminta 1:1
       *
       * Desktop:
       * kamera diminta 16:9
       */
      const cameraConfig: {
        fps: number;
        qrbox: {
          width: number;
          height: number;
        };
        aspectRatio: number;
      } = {
        fps: FPS,
        qrbox: {
          width: qrboxSize,
          height: qrboxSize,
        },
        aspectRatio: isDesktop ? 16 / 9 : 1,
      };

      const scanner = new Html5Qrcode(QR_REGION_ID);

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        cameraConfig,
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => {},
      );

      if (!mountedRef.current) {
        return;
      }

      /*
       * Simpan mode kamera setelah berhasil start.
       */
      desktopModeRef.current = isDesktop;

      scanningRef.current = true;

      setIsStarting(false);
      setIsScanning(true);
    } catch (error) {
      console.error("[CheckinScanner] Failed to start camera:", error);

      scanningRef.current = false;

      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          // Ignore cleanup error.
        }

        scannerRef.current = null;
      }

      if (!mountedRef.current) {
        return;
      }

      setIsStarting(false);
      setIsScanning(false);

      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError(
          "Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan.",
        );
      }
    } finally {
      restartingRef.current = false;
    }
  };

  /*
   * Restart kamera ketika berpindah:
   *
   * Mobile <-> Desktop
   *
   * Kita TIDAK restart pada setiap resize pixel.
   */
  useEffect(() => {
    if (!kegiatan) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleBreakpointChange = () => {
      if (!mountedRef.current) {
        return;
      }

      const isDesktop = mediaQuery.matches;

      /*
       * Kalau masih di mode yang sama,
       * tidak perlu restart.
       */
      if (desktopModeRef.current === isDesktop) {
        return;
      }

      /*
       * Beri sedikit waktu agar layout selesai berubah
       * sebelum scanner dibuat ulang.
       */
      window.setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        void startScanner(true);
      }, 150);
    };

    mediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [kegiatan]);

  /*
   * Memuat data kegiatan.
   */
  useEffect(() => {
    mountedRef.current = true;

    const loadKegiatan = async () => {
      try {
        const data = await getKegiatanById(kegiatanId);

        if (!mountedRef.current) {
          return;
        }

        if (!data) {
          setError("Kegiatan tidak ditemukan.");
          return;
        }

        setKegiatan(data);
      } catch (error) {
        console.error("[CheckinScanner] Failed to load kegiatan:", error);

        if (!mountedRef.current) {
          return;
        }

        setError("Data kegiatan tidak dapat dimuat.");
      }
    };

    void loadKegiatan();

    return () => {
      mountedRef.current = false;
      scanningRef.current = false;
      processingRef.current = false;

      desktopModeRef.current = null;
      restartingRef.current = false;

      clearHidBuffer();

      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);

        resultTimeoutRef.current = null;
      }

      const cleanup = async () => {
        const scanner = scannerRef.current;

        if (!scanner) {
          return;
        }

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch (error) {
          console.error("[CheckinScanner] Cleanup stop error:", error);
        }

        try {
          scanner.clear();
        } catch (error) {
          console.error("[CheckinScanner] Cleanup clear error:", error);
        }

        scannerRef.current = null;
      };

      void cleanup();
    };
  }, [kegiatanId]);

  /*
   * Mulai kamera setelah data kegiatan tersedia.
   */
  useEffect(() => {
    if (!kegiatan) {
      return;
    }

    const timer = setTimeout(() => {
      void startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [kegiatan]);

  const formatWaktu = (value: string) => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  if (!kegiatan) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">
          <header className="border-b border-gray-200 pb-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
              Presensi
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
              Scan QR Muda-Mudi
            </h1>

            <p className="mt-1 text-[10px] leading-4 text-gray-500 sm:text-xs">
              Gunakan scanner fisik atau kamera untuk mencatat kehadiran
              Muda-Mudi pada kegiatan.
            </p>
          </header>

          <section className="pt-5">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                    !
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-red-800 sm:text-xs">
                      Scanner tidak dapat digunakan
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-red-700 sm:text-xs sm:leading-5">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-center gap-3 px-4 py-16 text-gray-500 sm:py-20">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />

                  <span className="text-[10px] sm:text-xs">
                    Memuat kegiatan...
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  const currentKegiatan = kegiatan;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 md:px-7 lg:px-8">
        <header className="border-b border-gray-200 pb-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            Presensi
          </p>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                Scan QR Muda-Mudi
              </h1>

              <p className="mt-1 max-w-xl text-[10px] leading-4 text-gray-500 sm:text-xs">
                Gunakan scanner fisik atau kamera untuk mencatat kehadiran
                Muda-Mudi pada kegiatan yang dipilih.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[9px]">
              {/* Status scanner fisik */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPhysicalScannerReady
                      ? "animate-pulse bg-emerald-500"
                      : "bg-gray-300"
                  }`}
                />

                <span
                  className={
                    isPhysicalScannerReady
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }
                >
                  Scanner fisik {isPhysicalScannerReady ? "siap" : "menyiapkan"}
                </span>
              </div>

              {/* Status kamera */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isScanning ? "animate-pulse bg-blue-500" : "bg-gray-300"
                  }`}
                />

                <span
                  className={isScanning ? "text-blue-600" : "text-gray-400"}
                >
                  Kamera {isScanning ? "aktif" : "menyiapkan"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4 pt-5">
          {/* Informasi kegiatan */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Kegiatan
              </p>

              <h2 className="mt-1 text-sm font-semibold text-gray-900 sm:text-base">
                {currentKegiatan.nama}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3">
              <div className="border-b border-gray-100 px-4 py-3 sm:border-b-0 sm:border-r sm:px-5">
                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                  Tanggal
                </p>

                <p className="mt-1 text-[10px] font-medium text-gray-700 sm:text-[11px]">
                  {currentKegiatan.tanggal_mulai}
                </p>
              </div>

              <div className="border-b border-gray-100 px-4 py-3 sm:border-b-0 sm:border-r sm:px-5">
                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                  Waktu
                </p>

                <p className="mt-1 text-[10px] font-medium text-gray-700 sm:text-[11px]">
                  {currentKegiatan.jam_mulai} - {currentKegiatan.jam_selesai}
                </p>
              </div>

              <div className="col-span-2 px-4 py-3 sm:col-span-1 sm:px-5">
                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                  Lokasi
                </p>

                <p className="mt-1 truncate text-[10px] font-medium text-gray-700 sm:text-[11px]">
                  {currentKegiatan.lokasi || "-"}
                </p>
              </div>
            </div>
          </section>

          {/* Status metode scanner */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Metode Scanner
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Scanner fisik */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 8h2v2H8zM14 8h2v2h-2zM8 14h2v2H8zM14 14h2v2h-2z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-900">
                    Scanner fisik
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-gray-400">
                    HC-P10 siap menerima QR melalui USB.
                  </p>
                </div>

                <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-600">
                  Utama
                </span>
              </div>

              {/* Kamera */}
              <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h3l1.5-2h3L13 7h3a3 3 0 013 3v6a3 3 0 01-3 3H8a4 4 0 01-4-4V7z"
                    />

                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-900">
                    Kamera
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-gray-400">
                    Alternatif jika scanner fisik tidak tersedia.
                  </p>
                </div>

                <span className="ml-auto shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-semibold text-blue-600">
                  Fallback
                </span>
              </div>
            </div>
          </section>

          {/* Scanner kamera */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900">
                  Kamera Scanner
                </p>

                <p className="mt-0.5 text-[9px] leading-4 text-gray-400 sm:text-[10px]">
                  Kamera tetap aktif sebagai alternatif scanner fisik.
                </p>
              </div>

              {isScanning && (
                <span className="shrink-0 text-[9px] font-medium text-blue-600">
                  Siap scan
                </span>
              )}
            </div>

            <div className="p-3 sm:p-4 md:p-5">
              {/* Area kamera */}
              <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-lg bg-gray-950">
                <div id={QR_REGION_ID} className="w-full" />

                {/* Loading kamera */}
                {isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90">
                    <div className="text-center text-white">
                      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                      <p className="mt-3 text-[10px] font-medium sm:text-xs">
                        Menyiapkan kamera
                      </p>
                    </div>
                  </div>
                )}

                {/* Hasil scan */}
                {result && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-lg sm:p-6">
                      {result.success ? (
                        <>
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="h-5 w-5 text-emerald-600"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>

                          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
                            Presensi berhasil
                          </p>

                          <h3 className="mt-1 text-sm font-semibold text-gray-900">
                            {result.mudamudi.nama}
                          </h3>

                          <p className="mt-1 text-[10px] text-gray-500">
                            {result.mudamudi.kelompok} · {result.mudamudi.kelas}
                          </p>

                          <div className="mt-3 inline-flex rounded-md bg-teal-50 px-2.5 py-1 text-[9px] font-semibold text-teal-700">
                            {result.status === "hadir" ? "Hadir" : "Terlambat"}
                          </div>

                          <p className="mt-2 text-[9px] text-gray-400">
                            {formatWaktu(result.waktuCheckin)}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-5 w-5 text-amber-600"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.5M12 16h.01"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.3 4.8L2.9 17.5a2 2 0 001.7 3h14.8a2 2 0 001.7-3L13.7 4.8a2 2 0 00-3.4 0z"
                              />
                            </svg>
                          </div>

                          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-600">
                            Presensi tidak diproses
                          </p>

                          {result.mudamudi && (
                            <h3 className="mt-1 text-sm font-semibold text-gray-900">
                              {result.mudamudi.nama}
                            </h3>
                          )}

                          <p className="mt-2 text-[10px] leading-5 text-gray-600">
                            {result.message}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Petunjuk */}
              {!result && !error && (
                <div className="mx-auto mt-3 flex w-full max-w-5xl items-start gap-3 rounded-lg bg-teal-50 px-3.5 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-teal-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <rect x="4" y="4" width="16" height="16" rx="2" />

                      <path
                        strokeLinecap="round"
                        d="M8 8h3M8 12h1M8 16h3M13 8h3M13 12h3M13 16h3"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-teal-800">
                      Scanner siap digunakan
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-teal-600">
                      Arahkan QR Muda-Mudi ke HC-P10. Kamera juga dapat
                      digunakan sebagai alternatif.
                    </p>
                  </div>
                </div>
              )}

              {/* Error kamera */}
              {error && (
                <div className="mx-auto mt-3 w-full max-w-3xl rounded-lg border border-red-200 bg-red-50 p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100 text-xs font-bold text-red-600">
                      !
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-red-800">
                        Kamera bermasalah
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void startScanner(true)}
                    className="mt-3 w-full rounded-lg bg-teal-600 px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-teal-700 active:bg-teal-800 sm:w-auto sm:px-4"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
