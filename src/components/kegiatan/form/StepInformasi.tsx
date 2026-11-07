import React, { type ReactNode } from "react";
import { type ActivityForm, formStyles } from "./types";

export interface StepInformasiProps {
  activity: ActivityForm;
  loading: boolean;
  onUpdateActivity: (field: keyof ActivityForm, value: string) => void;
  getFieldError: (field: keyof ActivityForm) => string | undefined;
  renderError: (message?: string) => ReactNode;
}

export function StepInformasi({
  activity,
  loading,
  onUpdateActivity,
  getFieldError,
  renderError,
}: StepInformasiProps) {
  return (
    <section className="space-y-3">
      {/* Informasi Utama */}
      <div className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5" />
              <path d="M12 8h.01" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold leading-4 text-[#202824]">
              Informasi Utama
            </h3>
            <p className="text-[8px] leading-4 text-[#78827C]">
              Tentukan nama yang menggambarkan kegiatan.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="nama" className={formStyles.label}>
            Nama kegiatan <span className="text-red-600">*</span>
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            required
            maxLength={150}
            placeholder="Contoh: Pengajian Rutin"
            value={activity.nama}
            onChange={(event) => onUpdateActivity("nama", event.target.value)}
            disabled={loading}
            aria-invalid={Boolean(getFieldError("nama"))}
            aria-describedby={getFieldError("nama") ? "nama-error" : undefined}
            className={formStyles.input}
          />
          <div id="nama-error">{renderError(getFieldError("nama"))}</div>
        </div>
      </div>

      {/* Jadwal Kegiatan */}
      <div className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="3.5" y="5" width="17" height="15" rx="2" />
              <path d="M7.5 3v4M16.5 3v4M3.5 9h17" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold leading-4 text-[#202824]">
              Jadwal Kegiatan
            </h3>
            <p className="text-[8px] leading-4 text-[#78827C]">
              Atur rentang tanggal dan waktu pelaksanaan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-x-3">
          <div className="min-w-0">
            <label htmlFor="tanggal_mulai" className={formStyles.label}>
              Tanggal mulai <span className="text-red-600">*</span>
            </label>
            <input
              id="tanggal_mulai"
              name="tanggal_mulai"
              type="date"
              required
              value={activity.tanggal_mulai}
              onChange={(event) =>
                onUpdateActivity("tanggal_mulai", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(getFieldError("tanggal_mulai"))}
              className={formStyles.input}
            />
            {renderError(getFieldError("tanggal_mulai"))}
          </div>

          <div className="min-w-0">
            <label htmlFor="tanggal_selesai" className={formStyles.label}>
              Tanggal selesai <span className="text-red-600">*</span>
            </label>
            <input
              id="tanggal_selesai"
              name="tanggal_selesai"
              type="date"
              required
              min={activity.tanggal_mulai || undefined}
              value={activity.tanggal_selesai}
              onChange={(event) =>
                onUpdateActivity("tanggal_selesai", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(getFieldError("tanggal_selesai"))}
              className={formStyles.input}
            />
            {renderError(getFieldError("tanggal_selesai"))}
          </div>

          <div className="min-w-0">
            <label htmlFor="jam_mulai" className={formStyles.label}>
              Jam mulai <span className="text-red-600">*</span>
            </label>
            <input
              id="jam_mulai"
              name="jam_mulai"
              type="time"
              required
              value={activity.jam_mulai}
              onChange={(event) =>
                onUpdateActivity("jam_mulai", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(getFieldError("jam_mulai"))}
              className={formStyles.input}
            />
            {renderError(getFieldError("jam_mulai"))}
          </div>

          <div className="min-w-0">
            <label htmlFor="jam_selesai" className={formStyles.label}>
              Jam selesai <span className="text-red-600">*</span>
            </label>
            <input
              id="jam_selesai"
              name="jam_selesai"
              type="time"
              required
              value={activity.jam_selesai}
              onChange={(event) =>
                onUpdateActivity("jam_selesai", event.target.value)
              }
              disabled={loading}
              aria-invalid={Boolean(getFieldError("jam_selesai"))}
              className={formStyles.input}
            />
            {renderError(getFieldError("jam_selesai"))}
          </div>
        </div>
      </div>

      {/* Lokasi */}
      <div className="rounded-xl border border-[#E5EAE6] bg-white p-3.5 shadow-xs sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold leading-4 text-[#202824]">
              Lokasi Pelaksanaan
            </h3>
            <p className="text-[8px] leading-4 text-[#78827C]">
              Masukkan tempat kegiatan akan berlangsung.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="lokasi" className={formStyles.label}>
            Lokasi <span className="text-red-600">*</span>
          </label>
          <input
            id="lokasi"
            name="lokasi"
            type="text"
            required
            maxLength={200}
            placeholder="Contoh: Balai Pertemuan"
            value={activity.lokasi}
            onChange={(event) => onUpdateActivity("lokasi", event.target.value)}
            disabled={loading}
            aria-invalid={Boolean(getFieldError("lokasi"))}
            className={formStyles.input}
          />
          {renderError(getFieldError("lokasi"))}
        </div>
      </div>
    </section>
  );
}

export default StepInformasi;

