"use client";

import React, { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { ScannerStatus, ScannerNotification, DebugEntry } from "./types";
import ScannerStatusIndicator from "./ScannerStatusIndicator";
import ScannerResultBanner from "./ScannerResultBanner";

const CASHOW_DEBOUNCE_MS = 600;

type Props = {
  status: ScannerStatus;
  notification: ScannerNotification | null;
  isProcessing: boolean;
  onScan: (qrText: string) => Promise<void>;
  debugLogs: DebugEntry[];
  debugPayload: string;
  debugStage: string;
  onClearLogs: () => void;
};

export default function ScannerTools({
  status,
  notification,
  isProcessing,
  onScan,
  debugLogs,
  debugPayload,
  debugStage,
  onClearLogs,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputLength, setInputLength] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [lastInputTime, setLastInputTime] = useState("-");
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  // Fokus otomatis saat komponen dimuat
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(focusTimer);
  }, []);

  // Kembalikan fokus setelah proses selesai
  useEffect(() => {
    if (!isProcessing) {
      const refocusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(refocusTimer);
    }
  }, [isProcessing]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!val.trim() || isProcessing) return;

    setInputLength(val.length);
    setLastInputTime(new Date().toLocaleTimeString("id-ID"));

    debounceTimerRef.current = setTimeout(() => {
      const currentInput = inputRef.current;
      if (!currentInput || isProcessing) return;

      const payload = currentInput.value.trim();
      if (!payload) return;

      currentInput.value = "";
      setInputLength(0);
      debounceTimerRef.current = null;

      void onScan(payload);
    }, CASHOW_DEBOUNCE_MS);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const currentInput = inputRef.current;
    const payload = currentInput?.value.trim();

    if (!payload || isProcessing) return;

    if (currentInput) {
      currentInput.value = "";
    }

    setInputLength(0);
    void onScan(payload);
  };

  const handleCopyDiagnostics = async () => {
    const text = [
      "=== DIAGNOSTIK SCANNER CASHOW HC-P10 ===",
      `Status: ${status}`,
      `Tahap: ${debugStage}`,
      `Fokus: ${isFocused ? "Aktif" : "Tidak Aktif"}`,
      `Waktu input terakhir: ${lastInputTime}`,
      `Payload terakhir: ${debugPayload || "-"}`,
      "",
      ...debugLogs.map((l) => `[${l.time}] [${l.level}] ${l.message}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Informasi diagnostik berhasil disalin ke clipboard.");
    } catch {
      alert("Gagal menyalin log diagnostik.");
    }
  };

  return (
    <div className="space-y-3.5" onClick={handleContainerClick}>
      {/* Kartu Utama Scanner Cashow */}
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
                  d="M4 7V5a1 1 0 0 1 1-1h2m10 0h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2m-10 0H5a1 1 0 0 1-1-1v-2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM14 14h2v2h-2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-medium text-[#202824]">
                Scanner Alat Eksternal (Cashow HC-P10)
              </h2>
              <p className="text-[10px] text-[#78827C]">
                Menerima input otomatis USB Keyboard tanpa klik mouse
              </p>
            </div>
          </div>

          <ScannerStatusIndicator status={status} modeLabel="USB HID" />
        </div>

        {/* Notifikasi Hasil Presensi Operasional */}
        {notification && (
          <div className="p-3.5 sm:p-4 pb-0">
            <ScannerResultBanner notification={notification} />
          </div>
        )}

        {/* Input Bar & Panduan */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <label
                htmlFor="cashow-input"
                className="font-medium text-[#202824]"
              >
                Input QR Scanner
              </label>
              <span
                className={`text-[10px] ${
                  isFocused ? "text-[#287A50]" : "text-amber-600"
                }`}
              >
                {isFocused ? "● Fokus aktif" : "○ Klik untuk fokus"}
              </span>
            </div>

            <div className="relative">
              <input
                id="cashow-input"
                ref={inputRef}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={isProcessing}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Arahkan scanner Cashow ke QR Code peserta..."
                className="w-full rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] px-3.5 py-2.5 text-xs text-[#202824] outline-none transition placeholder:text-[#9AA39D] focus:border-[#287A50] focus:bg-white focus:ring-1 focus:ring-[#65B98A]/30 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {isProcessing && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] text-[#287A50]">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#287A50] border-t-transparent" />
                  <span>Memproses...</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] px-3 py-2 text-[10px] text-[#59645D] flex items-center justify-between gap-2">
            <span>
              Scanner siap memindai peserta secara beruntun. Fokus otomatis terjaga.
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.focus();
              }}
              className="shrink-0 text-[10px] font-medium text-[#287A50] hover:underline"
            >
              Fokuskan
            </button>
          </div>
        </div>
      </section>

      {/* Bagian Diagnostik & Debugging (Panel Lipat Minimalis) */}
      <section
        className="rounded-2xl border border-[#E5EAE6] bg-white overflow-hidden shadow-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setDebugExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left hover:bg-[#F5F7F5] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#202824]">
              Diagnostik & Log Scanner
            </span>
            <span className="rounded bg-gray-100 px-1 py-0.5 text-[8px] text-[#78827C]">
              Developer
            </span>
          </div>

          <span className="text-[10px] text-[#287A50] font-medium">
            {debugExpanded ? "Tutup" : "Lihat Detail"}
          </span>
        </button>

        {debugExpanded && (
          <div className="border-t border-[#E5EAE6] p-3 sm:p-4 space-y-3 bg-[#FAFBF9]">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[10px]">
              <div className="rounded-lg border border-[#E5EAE6] bg-white p-2">
                <span className="text-[8px] text-[#78827C] uppercase">Input</span>
                <p className="font-medium text-[#202824] truncate">
                  {inputLength > 0 ? "Menerima Data" : isFocused ? "Fokus Siap" : "Tidak Fokus"}
                </p>
              </div>

              <div className="rounded-lg border border-[#E5EAE6] bg-white p-2">
                <span className="text-[8px] text-[#78827C] uppercase">Buffer</span>
                <p className="font-medium text-[#202824]">
                  {inputLength} karakter
                </p>
              </div>

              <div className="rounded-lg border border-[#E5EAE6] bg-white p-2">
                <span className="text-[8px] text-[#78827C] uppercase">Waktu</span>
                <p className="font-medium text-[#202824]">
                  {lastInputTime}
                </p>
              </div>

              <div className="rounded-lg border border-[#E5EAE6] bg-white p-2">
                <span className="text-[8px] text-[#78827C] uppercase">Tahap</span>
                <p className="font-medium text-[#202824] truncate">
                  {debugStage}
                </p>
              </div>
            </div>

            {/* Payload Viewer */}
            <div className="rounded-lg border border-[#E5EAE6] bg-white p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase text-[#78827C]">
                  Payload Terakhir
                </span>
                <button
                  type="button"
                  onClick={() => setShowPayload((prev) => !prev)}
                  className="text-[9px] text-[#287A50] hover:underline"
                >
                  {showPayload ? "Sensor" : "Buka"}
                </button>
              </div>

              <p className="break-all rounded bg-[#F5F7F5] p-1.5 font-mono text-[9px] text-[#59645D]">
                {showPayload
                  ? debugPayload || "Belum ada payload diterima"
                  : debugPayload
                  ? `${debugPayload.slice(0, 14)}•••• (${debugPayload.length} char)`
                  : "Belum ada payload diterima"}
              </p>
            </div>

            {/* Log Console */}
            <div className="rounded-lg border border-[#E5EAE6] bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E5EAE6] bg-[#F5F7F5] px-2.5 py-1.5">
                <span className="text-[9px] uppercase text-[#78827C]">
                  Log Diagnostik ({debugLogs.length}/50)
                </span>
                <button
                  type="button"
                  onClick={onClearLogs}
                  className="text-[9px] text-rose-600 hover:underline"
                >
                  Hapus
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto p-2 space-y-1 font-mono text-[9px]">
                {debugLogs.length === 0 ? (
                  <p className="text-center text-gray-400 py-2 font-sans">
                    Belum ada log.
                  </p>
                ) : (
                  debugLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-1.5">
                      <span className="text-gray-400 shrink-0">{log.time}</span>
                      <span
                        className={`font-semibold shrink-0 ${
                          log.level === "SUCCESS"
                            ? "text-emerald-600"
                            : log.level === "WARNING"
                            ? "text-amber-600"
                            : log.level === "ERROR"
                            ? "text-rose-600"
                            : "text-blue-600"
                        }`}
                      >
                        [{log.level}]
                      </span>
                      <span className="text-[#39443D] break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleCopyDiagnostics()}
                className="rounded-lg bg-[#287A50] px-3 py-1.5 text-[10px] font-medium text-white hover:bg-[#206440] transition"
              >
                Salin Log
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
