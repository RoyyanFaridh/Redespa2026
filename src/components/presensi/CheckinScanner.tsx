
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Html5Qrcode } from "html5-qrcode";

import {
  getKegiatanById,
  scanMudamudiQR,
  type ScanQRResult,
} from "../../backend/presensi/public";
import { formatRentangTanggal } from "../../backend/kegiatan/format";

const QR_REGION_ID = "redespa-qr-reader";

const SCAN_COOLDOWN = 1500;
const RESULT_DISPLAY_DURATION = 2500;
const FAILURE_DISPLAY_DURATION = 4000;
const CASHOW_DEBOUNCE = 150;

const MOBILE_QRBOX_SIZE = 200;
const DESKTOP_QRBOX_SIZE = 240;
const FPS = 15;

const QR_PREFIXES = [
  "SIKEMA:MUDA_MUDI:",
  "KMM_PANDAK:MUDA_MUDI:",
  "SIKEMA:JAMAAH:",
  "KMM_PANDAK:JAMAAH:",
];

type Tone = "emerald" | "amber" | "rose";

type FailureMeta = {
  title: string;
  hint: string;
  tone: Tone;
};

type Kegiatan = NonNullable<
  Awaited<ReturnType<typeof getKegiatanById>>
>;

type ScanSuccess = Extract<ScanQRResult, { success: true }>;
type ScanFailure = Extract<ScanQRResult, { success: false }>;

const FAILURE_META: Record<ScanFailure["type"], FailureMeta> = {
  already_present: {
    title: "Sudah melakukan presensi",
    hint: "Peserta ini sudah tercatat dalam kegiatan. Tidak perlu melakukan pemindaian ulang.",
    tone: "amber",
  },
  kegiatan_inactive: {
    title: "Presensi belum tersedia",
    hint: "Kegiatan belum dimulai atau sudah melewati waktu pelaksanaan.",
    tone: "amber",
  },
  not_target: {
    title: "Bukan sasaran kegiatan",
    hint: "Peserta tidak memenuhi kriteria sasaran yang ditentukan pada kegiatan ini.",
    tone: "amber",
  },
  qr_mismatch: {
    title: "Jenis QR tidak sesuai",
    hint: "QR yang dipindai bukan QR untuk jenis peserta kegiatan ini.",
    tone: "rose",
  },
  peserta_not_found: {
    title: "Data Jamaah tidak ditemukan",
    hint: "QR berhasil dibaca, tetapi tidak ditemukan pada database Jamaah.",
    tone: "rose",
  },
  mudamudi_not_found: {
    title: "Data Muda-Mudi tidak ditemukan",
    hint: "QR berhasil dibaca, tetapi tidak ditemukan pada database Muda-Mudi.",
    tone: "rose",
  },
  invalid_qr: {
    title: "QR tidak valid",
    hint: "QR tidak dikenali oleh sistem REDESPA. Pastikan menggunakan QR personal yang benar.",
    tone: "rose",
  },
  kegiatan_not_found: {
    title: "Kegiatan tidak ditemukan",
    hint: "Data kegiatan tidak tersedia. Silakan kembali ke daftar kegiatan.",
    tone: "rose",
  },
  not_authorized: {
    title: "Akses ditolak",
    hint: "Akun ini tidak memiliki izin untuk melakukan presensi.",
    tone: "rose",
  },
  database_error: {
    title: "Gagal menyimpan presensi",
    hint: "Terjadi gangguan saat menyimpan data. Silakan coba kembali.",
    tone: "rose",
  },
};

const STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  hadir: {
    label: "Hadir",
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
  terlambat: {
    label: "Terlambat",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  izin: {
    label: "Izin",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  sakit: {
    label: "Sakit",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  alpa: {
    label: "Alpa",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function formatWaktu(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getJenisPesertaLabel(
  jenisPeserta: string | null | undefined,
): string {
  return jenisPeserta === "jamaah" ? "Jamaah" : "Muda-Mudi";
}

function getFailureMeta(type: ScanFailure["type"]): FailureMeta {
  return (
    FAILURE_META[type] ?? {
      title: "Presensi tidak dapat diproses",
      hint: "Silakan coba kembali atau hubungi administrator.",
      tone: "amber",
    }
  );
}

function getStatusMeta(status: string) {
  return (
    STATUS_META[status.toLowerCase()] ?? {
      label: status,
      className: "border-gray-200 bg-gray-50 text-gray-700",
    }
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-sm font-semibold text-gray-900">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="mt-1 break-words text-xs font-medium leading-5 text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}

function ResultTimer({
  duration,
  colorClass,
}: {
  duration: number;
  colorClass: string;
}) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRunning(true), 30);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full ${colorClass} transition-[width] ease-linear`}
        style={{
          width: running ? "0%" : "100%",
          transitionDuration: `${duration}ms`,
        }}
      />
    </div>
  );
}

function MethodButton({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${active
          ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-600"
          : "border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50"
        }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active
            ? "bg-teal-600 text-white"
            : "bg-gray-100 text-gray-500"
          }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-gray-900">
          {title}
        </span>
        <span className="mt-1 block text-[10px] leading-4 text-gray-500">
          {description}
        </span>
      </span>

      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active
            ? "border-teal-600 bg-teal-600"
            : "border-gray-300 bg-white"
          }`}
      >
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </span>
    </button>
  );
}

export default function CheckinScanner({
  kegiatanId,
}: {
  kegiatanId: number;
}) {
  const [scanMethod, setScanMethod] = useState<
    "cashow" | "camera" | null
  >(null);

  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanQRResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const cashowInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const mountedRef = useRef(true);
  const scanningRef = useRef(false);
  const processingRef = useRef(false);
  const restartingRef = useRef(false);

  const scanMethodRef = useRef<"cashow" | "camera" | null>(null);

  const lastScannedQRRef = useRef<string | null>(null);
  const lastScannedAtRef = useRef(0);

  const cashowDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const desktopModeRef = useRef<boolean | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);

  useEffect(() => {
    scanMethodRef.current = scanMethod;
  }, [scanMethod]);

  const enableScanSound = async () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as Window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      let audioContext = audioContextRef.current;

      if (!audioContext || audioContext.state === "closed") {
        audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
      }

      await audioContext.resume();

      if (audioContext.state === "running") {
        soundEnabledRef.current = true;
        setSoundEnabled(true);
      }
    } catch (e) {
      console.warn("[CheckinScanner] Gagal mengaktifkan suara:", e);
      soundEnabledRef.current = false;
      setSoundEnabled(false);
    }
  };

  const disableScanSound = () => {
    soundEnabledRef.current = false;
    setSoundEnabled(false);
  };

  const playScanSound = (success: boolean) => {
    if (!soundEnabledRef.current) return;

    const audioContext = audioContextRef.current;

    if (!audioContext || audioContext.state !== "running") return;

    try {
      const now = audioContext.currentTime;

      const playTone = (
        frequency: number,
        startAt: number,
        duration: number,
        volume: number,
      ) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(frequency, startAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(
          volume,
          startAt + 0.008,
        );
        gain.gain.setValueAtTime(
          volume,
          startAt + duration * 0.65,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          startAt + duration,
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startAt);
        oscillator.stop(startAt + duration);

        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      };

      if (success) {
        playTone(1800, now, 0.22, 0.65);
      } else {
        playTone(950, now, 0.16, 0.4);
        playTone(700, now + 0.2, 0.2, 0.4);
      }
    } catch (e) {
      console.warn("[CheckinScanner] Gagal memainkan suara:", e);
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    scanningRef.current = false;

    if (mountedRef.current) {
      setIsScanning(false);
    }

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (e) {
      console.error("[CheckinScanner] Gagal menghentikan kamera:", e);
    }

    try {
      scanner.clear();
    } catch (e) {
      console.error("[CheckinScanner] Gagal membersihkan scanner:", e);
    }

    if (scannerRef.current === scanner) {
      scannerRef.current = null;
    }
  };

  const showResult = (scanResult: ScanQRResult) => {
    if (!mountedRef.current) return;

    setResult(scanResult);

    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }

    const duration = scanResult.success
      ? RESULT_DISPLAY_DURATION
      : FAILURE_DISPLAY_DURATION;

    resultTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      setResult(null);
      lastScannedAtRef.current = Date.now();
      processingRef.current = false;
      setIsProcessing(false);
      resultTimeoutRef.current = null;

      if (scanMethodRef.current === "cashow") {
        cashowInputRef.current?.focus();
      }
    }, duration);
  };

  const handleScan = async (decodedText: string) => {
    if (!mountedRef.current || processingRef.current) return;

    const qrText = decodedText.trim();

    if (!qrText) return;

    const isKnownPrefix = QR_PREFIXES.some((prefix) =>
      qrText.startsWith(prefix),
    );

    if (!isKnownPrefix) {
      processingRef.current = true;
      setIsProcessing(true);

      playScanSound(false);

      showResult({
        success: false,
        type: "invalid_qr",
        message: "Format QR Code tidak dikenali oleh sistem REDESPA.",
      });

      return;
    }

    const now = Date.now();

    if (
      lastScannedQRRef.current === qrText &&
      now - lastScannedAtRef.current < SCAN_COOLDOWN
    ) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    lastScannedQRRef.current = qrText;
    lastScannedAtRef.current = now;

    setError(null);

    try {
      const scanResult = await scanMudamudiQR(qrText, kegiatanId);

      if (!mountedRef.current) return;

      playScanSound(scanResult.success);
      showResult(scanResult);
    } catch (e) {
      console.error(
        "[CheckinScanner] Kesalahan saat memproses QR:",
        e,
      );

      if (!mountedRef.current) return;

      playScanSound(false);

      showResult({
        success: false,
        type: "database_error",
        message: "Terjadi kesalahan saat memproses presensi.",
      });
    }
  };

  const handleCashowChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.currentTarget.value;

    if (cashowDebounceRef.current) {
      clearTimeout(cashowDebounceRef.current);
      cashowDebounceRef.current = null;
    }

    if (!value.trim() || processingRef.current) return;

    cashowDebounceRef.current = setTimeout(() => {
      const input = cashowInputRef.current;

      if (!input || processingRef.current) return;

      const scannedValue = input.value.trim();

      if (!scannedValue) return;

      input.value = "";
      cashowDebounceRef.current = null;

      void handleScan(scannedValue);
    }, CASHOW_DEBOUNCE);
  };

  const handleCashowKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (cashowDebounceRef.current) {
      clearTimeout(cashowDebounceRef.current);
      cashowDebounceRef.current = null;
    }

    const input = cashowInputRef.current;
    const value = input?.value.trim();

    if (!value || processingRef.current) return;

    if (input) {
      input.value = "";
    }

    void handleScan(value);
  };

  const startScanner = async (force = false) => {
    if (!mountedRef.current) return;
    if (scanMethodRef.current !== "camera") return;
    if (scanningRef.current && !force) return;
    if (restartingRef.current) return;

    restartingRef.current = true;

    setIsStarting(true);
    setError(null);

    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      if (!mountedRef.current || scanMethodRef.current !== "camera") {
        return;
      }

      const element = document.getElementById(QR_REGION_ID);

      if (!element) {
        throw new Error("Area scanner tidak ditemukan.");
      }

      const isDesktop = window.innerWidth >= 768;

      const qrboxSize = isDesktop
        ? DESKTOP_QRBOX_SIZE
        : Math.min(
          MOBILE_QRBOX_SIZE,
          Math.max(160, window.innerWidth - 64),
        );

      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: FPS,
          qrbox: {
            width: qrboxSize,
            height: qrboxSize,
          },
          aspectRatio: isDesktop ? 16 / 9 : 1,
        },
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => { },
      );

      if (
        !mountedRef.current ||
        scanMethodRef.current !== "camera"
      ) {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch { }

        try {
          scanner.clear();
        } catch { }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }

        return;
      }

      desktopModeRef.current = isDesktop;
      scanningRef.current = true;

      setIsStarting(false);
      setIsScanning(true);
    } catch (e) {
      console.error(
        "[CheckinScanner] Gagal memulai kamera:",
        e,
      );

      scanningRef.current = false;

      if (scannerRef.current) {
        const scanner = scannerRef.current;

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch { }

        try {
          scanner.clear();
        } catch { }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
      }

      if (!mountedRef.current) return;

      setIsStarting(false);
      setIsScanning(false);

      setError(
        e instanceof Error && e.message
          ? e.message
          : "Kamera tidak dapat digunakan. Pastikan izin kamera telah diberikan.",
      );
    } finally {
      restartingRef.current = false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const loadKegiatan = async () => {
      setIsLoadingKegiatan(true);
      setError(null);

      try {
        const data = await getKegiatanById(kegiatanId);

        if (!mountedRef.current) return;

        if (!data) {
          setKegiatan(null);
          setError("Kegiatan tidak ditemukan atau tidak dapat diakses.");
        } else {
          setKegiatan(data);
        }
      } catch (e) {
        console.error(
          "[CheckinScanner] Gagal memuat kegiatan:",
          e,
        );

        if (!mountedRef.current) return;

        setKegiatan(null);
        setError("Data kegiatan tidak dapat dimuat.");
      } finally {
        if (mountedRef.current) {
          setIsLoadingKegiatan(false);
        }
      }
    };

    void loadKegiatan();

    return () => {
      mountedRef.current = false;
      scanningRef.current = false;
      processingRef.current = false;
      restartingRef.current = false;
      desktopModeRef.current = null;
      soundEnabledRef.current = false;

      if (cashowDebounceRef.current) {
        clearTimeout(cashowDebounceRef.current);
        cashowDebounceRef.current = null;
      }

      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = null;
      }

      const cleanup = async () => {
        const scanner = scannerRef.current;

        if (scanner) {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch { }

          try {
            scanner.clear();
          } catch { }

          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }
        }

        const audioContext = audioContextRef.current;

        if (audioContext && audioContext.state !== "closed") {
          try {
            await audioContext.close();
          } catch { }
        }

        audioContextRef.current = null;
      };

      void cleanup();
    };
  }, [kegiatanId]);

  useEffect(() => {
    if (!kegiatan || scanMethod !== "camera") {
      void stopScanner();
      return;
    }

    const timer = window.setTimeout(() => {
      void startScanner();
    }, 200);

    return () => {
      window.clearTimeout(timer);
      void stopScanner();
    };
  }, [scanMethod, kegiatan?.id]);

  useEffect(() => {
    if (scanMethod !== "cashow") return;

    const timer = window.setTimeout(() => {
      cashowInputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [scanMethod]);

  useEffect(() => {
    if (scanMethod !== "camera" || !kegiatan) return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleMediaChange = () => {
      if (!mountedRef.current) return;

      const isDesktop = mediaQuery.matches;

      if (desktopModeRef.current === null) return;
      if (desktopModeRef.current === isDesktop) return;

      window.setTimeout(() => {
        if (
          !mountedRef.current ||
          scanMethodRef.current !== "camera"
        ) {
          return;
        }

        void startScanner(true);
      }, 200);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [scanMethod, kegiatan?.id]);

  const jenisPeserta = kegiatan?.jenis_peserta ?? "mudamudi";
  const jenisPesertaLabel = getJenisPesertaLabel(jenisPeserta);

  const kelompok = kegiatan?.kelompok ?? [];
  const kelas = kegiatan?.kelas ?? [];

  const successResult: ScanSuccess | null =
    result?.success === true ? result : null;

  const failureResult: ScanFailure | null =
    result?.success === false ? result : null;

  const failureMeta = failureResult
    ? getFailureMeta(failureResult.type)
    : null;

  const statusMeta = successResult
    ? getStatusMeta(successResult.status)
    : null;

  const resultTone: Tone | null = successResult
    ? "emerald"
    : failureMeta?.tone ?? null;

  const resultColor =
    resultTone === "emerald"
      ? "bg-teal-500"
      : resultTone === "amber"
        ? "bg-amber-400"
        : "bg-rose-500";

  const showResultDuration = successResult
    ? RESULT_DISPLAY_DURATION
    : FAILURE_DISPLAY_DURATION;

  if (isLoadingKegiatan) {
    return (
      <main className="min-h-dvh bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700">
              Presensi
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
              Scanner QR
            </h1>
          </div>

          <div className="flex min-h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
              Memuat informasi kegiatan...
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!kegiatan) {
    return (
      <main className="min-h-dvh bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700">
              Presensi
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
              Scanner QR
            </h1>
          </div>

          <div className="rounded-xl border border-rose-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.3 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
              </span>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Kegiatan tidak dapat dimuat
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {error ?? "Periksa kembali kegiatan yang dipilih."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-teal-700">
              <span>Presensi</span>
              <span className="text-gray-300">/</span>
              <span>Scan QR</span>
            </div>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Scanner Presensi
            </h1>

            <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm">
              Pindai QR personal peserta untuk mencatat kehadiran kegiatan.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span className="text-[11px] font-semibold text-teal-800">
              Sasaran {jenisPesertaLabel}
            </span>
          </div>
        </header>

        <section className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                Kegiatan yang dipilih
              </p>
              <h2 className="mt-1 break-words text-sm font-semibold text-gray-900 sm:text-base">
                {kegiatan.nama || "Belum ada nama kegiatan"}
              </h2>
            </div>

            <span className="w-fit shrink-0 rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1.5 text-[10px] font-semibold text-teal-700">
              {jenisPesertaLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-4 py-4 sm:grid-cols-4 sm:px-5">
            <InfoItem
              label="Tanggal"
              value={formatRentangTanggal(
                kegiatan.tanggal_mulai,
                kegiatan.tanggal_selesai,
              )}
            />
            <InfoItem
              label="Waktu"
              value={`${kegiatan.jam_mulai?.slice(0, 5) ?? "-"}–${kegiatan.jam_selesai?.slice(0, 5) ?? "-"}`}
            />
            <InfoItem
              label="Lokasi"
              value={kegiatan.lokasi?.trim() || "Belum diisi"}
            />
            <InfoItem
              label="Jenis kelamin"
              value={kegiatan.jenis_kelamin || "Semua jenis kelamin"}
            />
          </div>

          {!kegiatan.jenis_peserta && (
            <div className="border-t border-amber-100 bg-amber-50 px-4 py-2.5 sm:px-5">
              <p className="text-[10px] leading-4 text-amber-700">
                Jenis peserta kegiatan ini belum ditentukan. Untuk sementara,
                sistem memperlakukannya sebagai Muda-Mudi.
              </p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <SectionHeading
                eyebrow="Metode pemindaian"
                title="Pilih perangkat scanner"
                description="Tentukan metode yang akan digunakan untuk membaca QR personal peserta."
              />

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MethodButton
                  active={scanMethod === "cashow"}
                  title="Scanner Alat (Cashow)"
                  description="Gunakan scanner QR eksternal yang terhubung melalui USB."
                  onClick={() => setScanMethod("cashow")}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
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
                  }
                />

                <MethodButton
                  active={scanMethod === "camera"}
                  title="Scanner HP (Kamera)"
                  description="Gunakan kamera perangkat untuk memindai QR secara langsung."
                  onClick={() => setScanMethod("camera")}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                      />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  }
                />
              </div>
            </section>

            {scanMethod === null && (
              <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-7 w-7"
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
                </div>

                <h2 className="mt-4 text-sm font-semibold text-gray-900">
                  Scanner siap digunakan
                </h2>
                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                  Pilih salah satu metode pemindaian di atas untuk mulai
                  mencatat presensi peserta.
                </p>
              </section>
            )}

            {scanMethod === "cashow" && (
              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                  <div>
                    <SectionHeading
                      eyebrow="Mode scanner alat"
                      title="Pemindaian otomatis melalui USB"
                      description="Hubungkan scanner ke komputer, kemudian arahkan ke QR peserta. Hasil scan akan diproses otomatis."
                    />
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
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
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <label
                    htmlFor="cashow-qr-input"
                    className="mb-2 block text-xs font-semibold text-gray-700"
                  >
                    Input hasil pemindaian
                  </label>

                  <input
                    id="cashow-qr-input"
                    ref={cashowInputRef}
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Arahkan scanner ke QR peserta..."
                    disabled={isProcessing}
                    onChange={handleCashowChange}
                    onKeyDown={handleCashowKeyDown}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${isProcessing
                            ? "animate-pulse bg-amber-500"
                            : "bg-emerald-500"
                          }`}
                      />
                      <span className="text-[10px] text-gray-500">
                        {isProcessing
                          ? "Sedang memproses presensi..."
                          : "Menunggu pemindaian QR"}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400">
                      Pemindaian otomatis
                    </span>
                  </div>
                </div>
              </section>
            )}

            {scanMethod === "camera" && (
              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                  <SectionHeading
                    eyebrow="Mode scanner HP"
                    title="Pemindaian melalui kamera"
                    description="Arahkan kamera belakang perangkat ke QR personal peserta."
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (soundEnabledRef.current) {
                        disableScanSound();
                      } else {
                        void enableScanSound();
                      }
                    }}
                    aria-pressed={soundEnabled}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${soundEnabled
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
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
                    {soundEnabled ? "Suara aktif" : "Aktifkan suara"}
                  </button>
                </div>

                <div className="relative min-h-72 bg-gray-950 p-3 sm:p-5">
                  <div
                    id={QR_REGION_ID}
                    className="mx-auto min-h-64 w-full max-w-2xl overflow-hidden rounded-lg"
                  />

                  {isStarting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 text-center">
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-gray-600 border-t-teal-400" />
                      <p className="mt-3 text-xs font-medium text-white">
                        Menyiapkan kamera...
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        Mohon izinkan akses kamera pada browser.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/95 px-5 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-6 w-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v4m0 4h.01M10.3 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                          />
                        </svg>
                      </span>

                      <p className="mt-3 text-xs font-semibold text-white">
                        Kamera tidak dapat digunakan
                      </p>
                      <p className="mt-1 max-w-sm text-[10px] leading-5 text-gray-400">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() => void startScanner(true)}
                        className="mt-4 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                      >
                        Coba lagi
                      </button>
                    </div>
                  )}

                  {!isStarting && !error && !isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90">
                      <p className="text-xs text-gray-300">
                        Kamera belum aktif.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${isScanning
                          ? "animate-pulse bg-emerald-500"
                          : "bg-gray-300"
                        }`}
                    />
                    <span className="text-[10px] text-gray-500">
                      {isScanning
                        ? "Kamera aktif dan siap memindai"
                        : "Kamera tidak aktif"}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400">
                    Kamera belakang
                  </span>
                </div>
              </section>
            )}

            {result && (
              <section
                className={`overflow-hidden rounded-xl border bg-white ${successResult
                    ? "border-teal-200"
                    : failureMeta?.tone === "amber"
                      ? "border-amber-200"
                      : "border-rose-200"
                  }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${successResult
                          ? "bg-teal-50 text-teal-700"
                          : failureMeta?.tone === "amber"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                    >
                      {successResult ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v4m0 4h.01M10.3 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                          />
                        </svg>
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {successResult
                            ? "Presensi berhasil dicatat"
                            : failureMeta?.title ?? "Presensi gagal"}
                        </h3>

                        <span
                          className={`rounded-md px-2 py-1 text-[9px] font-semibold ${successResult
                              ? "bg-teal-50 text-teal-700"
                              : failureMeta?.tone === "amber"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                        >
                          {successResult ? "Berhasil" : "Tidak berhasil"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  {successResult && (
                    <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                          Detail peserta
                        </p>
                        <span className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-gray-600 ring-1 ring-gray-200">
                          {jenisPesertaLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem
                          label="Nama peserta"
                          value={successResult.peserta.nama}
                        />

                        <InfoItem
                          label="Kelompok"
                          value={successResult.peserta.kelompok ?? "-"}
                        />

                        {successResult.peserta.kelas.length > 0 && (
                          <InfoItem
                            label="Kelas"
                            value={successResult.peserta.kelas.join(", ")}
                          />
                        )}

                        <InfoItem
                          label="Jenis kelamin"
                          value={
                            successResult.peserta.jenis_kelamin ?? "-"
                          }
                        />

                        <InfoItem
                          label="Tahun lahir"
                          value={
                            successResult.peserta.tahun_lahir?.toString() ??
                            "-"
                          }
                        />

                        <InfoItem
                          label="Waktu presensi"
                          value={formatWaktu(successResult.waktuCheckin)}
                        />
                      </div>

                      {statusMeta && (
                        <div className="mt-4 border-t border-gray-200 pt-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold ${statusMeta.className}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusMeta.label}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {failureResult && (
                    <div
                      className={`mt-4 rounded-lg p-3 ${failureMeta?.tone === "amber"
                          ? "bg-amber-50"
                          : "bg-rose-50"
                        }`}
                    >
                      <p
                        className={`text-[11px] leading-5 ${failureMeta?.tone === "amber"
                            ? "text-amber-800"
                            : "text-rose-800"
                          }`}
                      >
                        {failureMeta?.hint}
                      </p>

                      {failureResult.peserta && (
                        <div className="mt-3 border-t border-current/10 pt-3">
                          <p className="text-xs font-semibold">
                            {failureResult.peserta.nama}
                          </p>
                          <p className="mt-1 text-[10px]">
                            Kelompok:{" "}
                            {failureResult.peserta.kelompok ?? "-"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <ResultTimer
                      duration={showResultDuration}
                      colorClass={resultColor}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <SectionHeading
                eyebrow="Informasi sasaran"
                title="Kriteria peserta"
                description="Peserta yang dapat melakukan presensi pada kegiatan ini."
              />

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold text-gray-500">
                    Jenis peserta
                  </p>
                  <span className="inline-flex rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1.5 text-[10px] font-semibold text-teal-700">
                    {jenisPesertaLabel}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="mb-2 text-[10px] font-semibold text-gray-500">
                    Sasaran kelompok
                  </p>

                  {kelompok.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {kelompok.map((item) => (
                        <span
                          key={item}
                          className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Semua kelompok
                    </p>
                  )}
                </div>

                {jenisPeserta === "mudamudi" && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="mb-2 text-[10px] font-semibold text-gray-500">
                      Sasaran kelas
                    </p>

                    {kelas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {kelas.map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Semua kelas
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <p className="mb-1 text-[10px] font-semibold text-gray-500">
                    Jenis kelamin
                  </p>
                  <p className="text-xs font-medium text-gray-800">
                    {kegiatan.jenis_kelamin || "Semua jenis kelamin"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <SectionHeading
                eyebrow="Panduan penggunaan"
                title="Cara melakukan presensi"
              />

              <div className="mt-4 space-y-4">
                {scanMethod === "cashow" ? (
                  <>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
                        1
                      </span>
                      <p className="text-[11px] leading-5 text-gray-600">
                        Hubungkan scanner QR ke komputer melalui USB.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
                        2
                      </span>
                      <p className="text-[11px] leading-5 text-gray-600">
                        Pastikan kolom input scanner dalam keadaan aktif.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
                        3
                      </span>
                      <p className="text-[11px] leading-5 text-gray-600">
                        Arahkan scanner ke QR personal peserta. Sistem akan
                        memproses hasil pemindaian secara otomatis tanpa
                        perlu menekan Enter.
                      </p>
                    </div>
                  </>
                ) : scanMethod === "camera" ? (
                  <>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
                        1
                      </span>
                      <p className="text-[11px] leading-5 text-gray-600">
                        Izinkan browser mengakses kamera perangkat.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
                        2
                      </span>
                      <p className="text-[11px] leading-5 text-gray-600">
                        Arahkan kamera belakang ke QR personal peserta.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[10px] font-semibold text-teal-700">
                        3
                      </span>
                      <p className="text-[11px] leading-5 text-gray-600">
                        Tunggu hingga hasil pemindaian dan status presensi
                        ditampilkan.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] leading-5 text-gray-500">
                    Pilih metode scanner terlebih dahulu untuk melihat
                    panduan penggunaan.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-teal-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11v5m0-8h.01"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-teal-900">
                    Informasi presensi
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-teal-800">
                    Status Hadir diberikan apabila peserta melakukan
                    presensi hingga 10 menit setelah waktu mulai kegiatan.
                    Setelah batas tersebut, presensi tercatat sebagai
                    Terlambat.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
