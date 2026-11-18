"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  scanMudamudiQR,
  type ScanQRResult,
} from "../../backend/presensi/public";
import {
  type ScannerStatus,
  type ScannerNotification,
  type DebugLevel,
  type DebugEntry,
  mapResultToNotification,
} from "./types";

const SCAN_COOLDOWN_MS = 1500;
const NOTIFICATION_DURATION_MS = 2800;

const QR_PREFIXES = [
  "SIKEMA:MUDA_MUDI:",
  "KMM_PANDAK:MUDA_MUDI:",
  "SIKEMA:JAMAAH:",
  "KMM_PANDAK:JAMAAH:",
];

export function useScannerEngine(kegiatanId: number) {
  const [status, setStatus] = useState<ScannerStatus>("ready");
  const [notification, setNotification] = useState<ScannerNotification | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Diagnostics & Debugging
  const [debugLogs, setDebugLogs] = useState<DebugEntry[]>([]);
  const [debugPayload, setDebugPayload] = useState("");
  const [debugStage, setDebugStage] = useState("Scanner siap");

  const processingRef = useRef(false);
  const lastScannedQRRef = useRef<string | null>(null);
  const lastScannedAtRef = useRef(0);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);

  const addDebugLog = useCallback(
    (level: DebugLevel, message: string) => {
      const time = new Date().toLocaleTimeString("id-ID", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setDebugLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          time,
          level,
          message,
        },
        ...prev.slice(0, 50),
      ]);
    },
    [],
  );

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
    setDebugStage("Log dibersihkan");
  }, []);

  const enableSound = useCallback(async () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      await audioContextRef.current.resume();

      if (audioContextRef.current.state === "running") {
        soundEnabledRef.current = true;
        setSoundEnabled(true);
        addDebugLog("INFO", "Feedback audio diaktifkan.");
      }
    } catch (e) {
      console.warn("[Scanner] Gagal mengaktifkan audio:", e);
      soundEnabledRef.current = false;
      setSoundEnabled(false);
    }
  }, [addDebugLog]);

  const disableSound = useCallback(() => {
    soundEnabledRef.current = false;
    setSoundEnabled(false);
    addDebugLog("INFO", "Feedback audio dinonaktifkan.");
  }, [addDebugLog]);

  const playTone = useCallback((success: boolean) => {
    if (!soundEnabledRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx || ctx.state !== "running") return;

    try {
      const now = ctx.currentTime;
      const play = (
        freq: number,
        startAt: number,
        dur: number,
        vol: number,
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, startAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(vol, startAt + 0.008);
        gain.gain.setValueAtTime(vol, startAt + dur * 0.65);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startAt);
        osc.stop(startAt + dur);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      };

      if (success) {
        play(1800, now, 0.22, 0.65);
      } else {
        play(950, now, 0.16, 0.4);
        play(700, now + 0.2, 0.2, 0.4);
      }
    } catch (e) {
      console.warn("[Scanner] Gagal memutar suara:", e);
    }
  }, []);

  const showNotification = useCallback(
    (notif: ScannerNotification) => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }

      setNotification(notif);

      notificationTimerRef.current = setTimeout(() => {
        setNotification((current) => (current?.id === notif.id ? null : current));
        setStatus("ready");
      }, NOTIFICATION_DURATION_MS);
    },
    [],
  );

  const processQR = useCallback(
    async (decodedText: string, source: "Cashow" | "Kamera") => {
      const qrText = decodedText.trim();
      if (!qrText) return;

      if (processingRef.current) {
        addDebugLog(
          "WARNING",
          `Scan dari ${source} diabaikan karena sedang memproses QR sebelumnya.`,
        );
        return;
      }

      const now = Date.now();
      if (
        lastScannedQRRef.current === qrText &&
        now - lastScannedAtRef.current < SCAN_COOLDOWN_MS
      ) {
        addDebugLog(
          "WARNING",
          `QR ganda terdeteksi dalam cooldown (${Math.round(
            (now - lastScannedAtRef.current) / 1000,
          )}s). Diabaikan.`,
        );
        return;
      }

      setDebugPayload(qrText);
      setDebugStage(`Menerima QR dari ${source}`);
      addDebugLog(
        "INFO",
        `Memvalidasi format QR dari ${source} (${qrText.length} karakter).`,
      );

      const hasValidPrefix = QR_PREFIXES.some((prefix) =>
        qrText.startsWith(prefix),
      );

      if (!hasValidPrefix) {
        addDebugLog("ERROR", `Prefix QR tidak dikenali: ${qrText}`);
        playTone(false);
        setStatus("error");
        showNotification({
          id: Date.now() + Math.random(),
          type: "invalid_qr",
          title: "QR Code Tidak Valid",
          message:
            "QR Code tidak dikenali atau tidak sesuai dengan data peserta.",
          tone: "rose",
          technicalDetail: `Prefix tidak cocok. Menerima: ${qrText.slice(0, 30)}...`,
        });
        return;
      }

      // Mulai proses server
      processingRef.current = true;
      setIsProcessing(true);
      setStatus("processing");
      lastScannedQRRef.current = qrText;
      lastScannedAtRef.current = now;
      setDebugStage("Mengirim ke database Supabase");

      try {
        const result: ScanQRResult = await scanMudamudiQR(qrText, kegiatanId);
        const notif = mapResultToNotification(result);

        if (result.success) {
          setStatus("success");
          setDebugStage(`Presensi berhasil: ${result.status.toUpperCase()}`);
          addDebugLog(
            "SUCCESS",
            `Presensi berhasil disimpan: ${result.peserta.nama} (${result.status})`,
          );
        } else {
          setStatus("error");
          setDebugStage(`Presensi ditolak: ${result.type}`);
          addDebugLog("WARNING", `Presensi ditolak (${result.type}): ${result.message}`);
        }

        playTone(result.success);
        showNotification(notif);
      } catch (err) {
        console.error("[ScannerEngine] Error processing QR:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setStatus("error");
        setDebugStage("Exception koneksi database");
        addDebugLog("ERROR", `Exception saat memproses: ${errMsg}`);
        playTone(false);
        showNotification({
          id: Date.now() + Math.random(),
          type: "error",
          title: "Gagal Memproses Presensi",
          message:
            "Terjadi kesalahan saat memproses hasil pemindaian. Silakan coba kembali.",
          tone: "rose",
          technicalDetail: errMsg,
        });
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [kegiatanId, addDebugLog, playTone, showNotification],
  );

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          void audioContextRef.current.close();
        } catch { }
      }
    };
  }, []);

  return {
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
  };
}
