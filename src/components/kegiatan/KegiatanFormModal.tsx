"use client";

import { useMemo, useRef, useState } from "react";

import type { Kegiatan, FieldErrors } from "../../backend/kegiatan/types";
import { validateClient } from "../../backend/kegiatan/validation";
import {
  KELAS_OPTIONS,
  KELOMPOK_OPTIONS,
} from "../../backend/mudamudi/constants";

import { ModalWrapper } from "../common/ModalWrapper";
import { Button } from "../common/Button";
import { IconButton } from "../common/IconButton";

import {
  type ActivityForm,
  type GroupMode,
  JEMAAH_CLASS,
} from "./form/types";
import StepIndicator from "./form/StepIndicator";
import StepInformasi from "./form/StepInformasi";
import StepSasaran from "./form/StepSasaran";
import StepKonfirmasi from "./form/StepKonfirmasi";

type Props = {
  mode: "add" | "edit";
  initialData?: Kegiatan;
  fieldErrors: FieldErrors;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClose: () => void;
};

function getInitialGroupMode(initialData: Kegiatan | undefined): GroupMode {
  return initialData?.kelompok == null ? "all" : "specific";
}

function normalizeKelas(kelas: string[] | null | undefined): string[] {
  if (!Array.isArray(kelas)) return [];

  if (kelas.includes(JEMAAH_CLASS)) {
    return [JEMAAH_CLASS];
  }

  return KELAS_OPTIONS.filter((item) => kelas.includes(item));
}

function normalizeKelompok(kelompok: string[] | null | undefined): string[] {
  if (!Array.isArray(kelompok)) return [];

  return KELOMPOK_OPTIONS.filter((item) => kelompok.includes(item));
}

export default function KegiatanFormModal({
  mode,
  initialData,
  fieldErrors,
  error,
  loading,
  onSubmit,
  onClose,
}: Props) {
  const navigationLockRef = useRef(false);
  const submitLockRef = useRef(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const [activity, setActivity] = useState<ActivityForm>({
    nama: initialData?.nama ?? "",
    tanggal_mulai: initialData?.tanggal_mulai ?? "",
    tanggal_selesai: initialData?.tanggal_selesai ?? "",
    jam_mulai: initialData?.jam_mulai?.slice(0, 5) ?? "",
    jam_selesai: initialData?.jam_selesai?.slice(0, 5) ?? "",
    lokasi: initialData?.lokasi ?? "",
  });

  const [groupMode, setGroupMode] = useState<GroupMode>(() =>
    getInitialGroupMode(initialData),
  );

  const [selectedKelompok, setSelectedKelompok] = useState<string[]>(() =>
    normalizeKelompok(initialData?.kelompok),
  );

  const [selectedKelas, setSelectedKelas] = useState<string[]>(() =>
    normalizeKelas(initialData?.kelas),
  );

  const [jenisKelamin, setJenisKelamin] = useState(
    initialData?.jenis_kelamin ?? "",
  );

  const effectiveKelompok = useMemo(
    () =>
      KELOMPOK_OPTIONS.filter((kelompok) =>
        selectedKelompok.includes(kelompok),
      ),
    [selectedKelompok],
  );

  const allKelompokSelected =
    effectiveKelompok.length === KELOMPOK_OPTIONS.length;

  const allKelasSelected =
    KELAS_OPTIONS.length > 0 &&
    KELAS_OPTIONS.every((kelas) => selectedKelas.includes(kelas));

  const isJamaahSelected = selectedKelas.includes(JEMAAH_CLASS);

  const kelasLabel = isJamaahSelected
    ? "Semua peserta"
    : selectedKelas.length === 0 || allKelasSelected
      ? "Semua kelas"
      : `${selectedKelas.length} kelas`;

  const jenisKelaminLabel = jenisKelamin || "Semua peserta";

  const selectedKelasForSummary = isJamaahSelected
    ? [JEMAAH_CLASS]
    : selectedKelas.length === 0 || allKelasSelected
      ? [...KELAS_OPTIONS]
      : KELAS_OPTIONS.filter((kelas) => selectedKelas.includes(kelas));

  function getValidationErrors(): FieldErrors {
    return validateClient(
      activity.nama,
      activity.tanggal_mulai,
      activity.tanggal_selesai,
      activity.jam_mulai,
      activity.jam_selesai,
      activity.lokasi,
      groupMode === "all" ? [] : effectiveKelompok,
      selectedKelas,
      jenisKelamin,
    );
  }

  function updateActivity(field: keyof ActivityForm, value: string) {
    const nextActivity = {
      ...activity,
      [field]: value,
    };

    setActivity(nextActivity);

    const validation = validateClient(
      nextActivity.nama,
      nextActivity.tanggal_mulai,
      nextActivity.tanggal_selesai,
      nextActivity.jam_mulai,
      nextActivity.jam_selesai,
      nextActivity.lokasi,
      groupMode === "all" ? [] : effectiveKelompok,
      selectedKelas,
      jenisKelamin,
    );

    setClientErrors((current) => ({
      ...current,
      [field]: validation[field],
      ...(field === "tanggal_mulai" || field === "tanggal_selesai"
        ? { tanggal_selesai: validation.tanggal_selesai }
        : {}),
      ...(field === "jam_mulai" || field === "jam_selesai"
        ? { jam_selesai: validation.jam_selesai }
        : {}),
    }));

    setStepError("");
  }

  function changeGroupMode(nextMode: GroupMode) {
    if (loading || nextMode === groupMode) return;

    setGroupMode(nextMode);

    if (nextMode === "all") {
      setSelectedKelompok([]);
    } else {
      setSelectedKelompok((current) =>
        current.length > 0 ? current : [...KELOMPOK_OPTIONS],
      );
    }

    setStepError("");
  }

  function toggleKelompok(kelompok: string) {
    setSelectedKelompok((current) =>
      current.includes(kelompok)
        ? current.filter((item) => item !== kelompok)
        : [...current, kelompok],
    );

    setStepError("");
  }

  function toggleAllKelompok() {
    setSelectedKelompok(allKelompokSelected ? [] : [...KELOMPOK_OPTIONS]);
    setStepError("");
  }

  function toggleKelas(kelas: string) {
    setSelectedKelas((current) => {
      if (kelas === JEMAAH_CLASS) {
        return current.includes(JEMAAH_CLASS) ? [] : [JEMAAH_CLASS];
      }

      if (current.includes(JEMAAH_CLASS)) {
        return [kelas];
      }

      return current.includes(kelas)
        ? current.filter((item) => item !== kelas)
        : [...current, kelas];
    });

    setStepError("");
  }

  function toggleAllKelas() {
    setSelectedKelas((current) => {
      const allSelected =
        KELAS_OPTIONS.length > 0 &&
        KELAS_OPTIONS.every((kelas) => current.includes(kelas));

      if (allSelected) {
        return [];
      }

      if (KELAS_OPTIONS.includes(JEMAAH_CLASS)) {
        return [JEMAAH_CLASS];
      }

      return [...KELAS_OPTIONS];
    });

    setStepError("");
  }

  function renderError(message?: string) {
    if (!message) return null;

    return (
      <p role="alert" className="mt-1.5 text-[9px] leading-4 text-red-600">
        {message}
      </p>
    );
  }

  function getFieldError(field: keyof ActivityForm) {
    return clientErrors[field] || fieldErrors[field];
  }

  function validateCurrentStep(): boolean {
    setStepError("");

    const validation = getValidationErrors();
    setClientErrors(validation);

    if (currentStep === 1) {
      const activityErrors = [
        validation.nama,
        validation.tanggal_mulai,
        validation.tanggal_selesai,
        validation.jam_mulai,
        validation.jam_selesai,
        validation.lokasi,
      ];

      if (activityErrors.some(Boolean)) {
        setStepError("Periksa kembali informasi kegiatan yang bertanda merah.");
        return false;
      }

      return true;
    }

    if (currentStep === 2) {
      if (groupMode === "specific" && effectiveKelompok.length === 0) {
        setStepError(
          "Pilih setidaknya satu kelompok atau pilih semua kelompok.",
        );
        return false;
      }

      if (validation.kelompok || validation.kelas || validation.jenis_kelamin) {
        setStepError("Periksa kembali sasaran kegiatan yang dipilih.");
        return false;
      }

      return true;
    }

    return true;
  }

  function goToStep(nextStep: number) {
    if (loading || submitLockRef.current || navigationLockRef.current) {
      return;
    }

    if (nextStep < 1 || nextStep > 3 || nextStep === currentStep) {
      return;
    }

    navigationLockRef.current = true;
    setCurrentStep(nextStep);
    setStepError("");

    requestAnimationFrame(() => {
      navigationLockRef.current = false;
    });
  }

  function handleNext() {
    if (
      loading ||
      submitLockRef.current ||
      navigationLockRef.current ||
      currentStep >= 3
    ) {
      return;
    }

    if (!validateCurrentStep()) return;

    navigationLockRef.current = true;
    setCurrentStep(currentStep + 1);
    setStepError("");

    requestAnimationFrame(() => {
      navigationLockRef.current = false;
    });
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      currentStep !== 3 ||
      loading ||
      submitLockRef.current ||
      navigationLockRef.current
    ) {
      return;
    }

    const validation = getValidationErrors();
    setClientErrors(validation);

    if (Object.values(validation).some(Boolean)) {
      setStepError(
        "Informasi kegiatan atau sasaran belum lengkap atau belum valid. Silakan periksa kembali.",
      );
      return;
    }

    if (groupMode === "specific" && effectiveKelompok.length === 0) {
      setStepError(
        "Pilih setidaknya satu kelompok atau pilih semua kelompok.",
      );
      return;
    }

    setStepError("");
    submitLockRef.current = true;

    try {
      await onSubmit(event);
    } catch (submitError) {
      console.error("Gagal menyimpan kegiatan:", submitError);
      setStepError(
        "Terjadi kesalahan saat menyimpan kegiatan. Silakan coba kembali.",
      );
    } finally {
      submitLockRef.current = false;
    }
  }

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <form
        onSubmit={handleFormSubmit}
        noValidate
        className="flex max-h-[90dvh] min-h-0 w-full flex-col overflow-hidden bg-white"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                mode === "add"
                  ? "bg-[#E6F2EA] text-[#287A50]"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {mode === "add" ? (
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
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              ) : (
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
                    d="m16.5 3.5 4 4L8 20l-5 1 1-5Z"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-semibold leading-5 text-[#202824]">
                {mode === "add" ? "Tambah Kegiatan" : "Edit Kegiatan"}
              </h2>
              <p className="mt-0.5 text-[9px] leading-4 text-[#78827C]">
                Langkah {currentStep} dari 3
              </p>
            </div>
          </div>

          <IconButton
            label="Tutup formulir"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
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
                d="m6 6 12 12M18 6 6 18"
              />
            </svg>
          </IconButton>
        </header>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          loading={loading}
          onGoToStep={goToStep}
        />

        {/* Step Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">
          {currentStep === 1 && (
            <StepInformasi
              activity={activity}
              loading={loading}
              onUpdateActivity={updateActivity}
              getFieldError={getFieldError}
              renderError={renderError}
            />
          )}

          {currentStep === 2 && (
            <StepSasaran
              groupMode={groupMode}
              effectiveKelompok={effectiveKelompok}
              allKelompokSelected={allKelompokSelected}
              selectedKelas={selectedKelas}
              allKelasSelected={allKelasSelected}
              isJamaahSelected={isJamaahSelected}
              kelasLabel={kelasLabel}
              jenisKelamin={jenisKelamin}
              jenisKelaminLabel={jenisKelaminLabel}
              loading={loading}
              onChangeGroupMode={changeGroupMode}
              onToggleKelompok={toggleKelompok}
              onToggleAllKelompok={toggleAllKelompok}
              onToggleKelas={toggleKelas}
              onToggleAllKelas={toggleAllKelas}
              onSetJenisKelamin={(opt) => {
                setJenisKelamin(opt);
                setStepError("");
              }}
              kelompokError={clientErrors.kelompok || fieldErrors.kelompok}
              kelasError={clientErrors.kelas || fieldErrors.kelas}
              jenisKelaminError={
                clientErrors.jenis_kelamin || fieldErrors.jenis_kelamin
              }
              renderError={renderError}
            />
          )}

          {currentStep === 3 && (
            <StepKonfirmasi
              activity={activity}
              groupMode={groupMode}
              effectiveKelompok={effectiveKelompok}
              selectedKelasForSummary={selectedKelasForSummary}
              kelasLabel={kelasLabel}
              jenisKelaminLabel={jenisKelaminLabel}
              loading={loading}
              onGoToStep={goToStep}
            />
          )}

          {(stepError || error) && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[9px] leading-4 text-red-700"
            >
              {stepError || error}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 flex-col gap-2.5 border-t border-[#E5EAE6] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-[9px] leading-4 text-[#78827C]">
            {currentStep < 3 ? (
              <>
                <span className="text-red-600">*</span> Wajib diisi
              </>
            ) : (
              "Periksa ringkasan sebelum konfirmasi."
            )}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => goToStep(currentStep - 1)}
                disabled={loading || navigationLockRef.current}
                className="w-full sm:w-auto"
                leftIcon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 12H5m7 7-7-7 7-7"
                    />
                  </svg>
                }
              >
                Kembali
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={loading || navigationLockRef.current}
                className="w-full sm:w-auto"
                rightIcon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-7-7 7 7-7 7"
                    />
                  </svg>
                }
              >
                Lanjut
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={loading}
                disabled={
                  loading ||
                  submitLockRef.current ||
                  (groupMode === "specific" && effectiveKelompok.length === 0)
                }
                className="w-full sm:min-w-36 sm:w-auto"
                leftIcon={
                  !loading && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  )
                }
              >
                {mode === "add" ? "Simpan Kegiatan" : "Simpan Perubahan"}
              </Button>
            )}
          </div>
        </footer>
      </form>
    </ModalWrapper>
  );
}
