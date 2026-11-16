"use client";

import React, { useState } from "react";
import { createClient } from "../../../src/backend/supabase/client";
import {
  PageContainer,
  PageHeader,
  ResponsiveCard,
  Button,
  FormInput,
  Badge,
  Avatar,
  InfoRow,
  Modal,
} from "../../../src/components/common";

type Profile = {
  id: string;
  nama: string;
  desa: string | null;
};

type Props = {
  user: {
    email: string;
  };
  profile: Profile;
};

export default function ProfileForm({ user, profile }: Props) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const supabase = createClient();

  function openPasswordModal() {
    setPasswordError("");
    setPasswordMessage("");
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");

    setShowPasswordLama(false);
    setShowPasswordBaru(false);
    setShowKonfirmasi(false);

    setShowPasswordModal(true);
  }

  function closePasswordModal() {
    if (passwordLoading) return;

    setShowPasswordModal(false);
    setPasswordError("");
    setPasswordMessage("");
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (!passwordLama) {
      setPasswordError("Password lama wajib diisi.");
      return;
    }

    if (passwordBaru.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setPasswordError("Konfirmasi password tidak sesuai.");
      return;
    }

    if (passwordLama === passwordBaru) {
      setPasswordError("Password baru harus berbeda dari password lama.");
      return;
    }

    setPasswordLoading(true);

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser?.email) {
      setPasswordLoading(false);
      setPasswordError("Data akun tidak ditemukan.");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: passwordLama,
    });

    if (verifyError) {
      setPasswordLoading(false);
      setPasswordError("Password lama tidak benar.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    setPasswordLoading(false);

    if (updateError) {
      setPasswordError("Password gagal diperbarui. Silakan coba lagi.");
      return;
    }

    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");

    setPasswordMessage("Password berhasil diperbarui dengan aman.");
    setShowPasswordModal(false);
  }

  function PasswordToggle({
    visible,
    onClick,
    label,
  }: {
    visible: boolean;
    onClick: () => void;
    label: string;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-y-0 right-2.5 flex items-center text-[#78827C] transition hover:text-[#202824]"
        aria-label={label}
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 3 18 18" />
            <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
            <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 8.5 4 10 8a15.8 15.8 0 0 1-3.17 4.35" />
            <path d="M6.61 6.61C4.62 7.97 3.24 10 2 12c1.5 4 5 8 10 8a10.94 10.94 0 0 0 3.38-.54" />
          </svg>
        )}
      </button>
    );
  }

  const roleLabel = profile.desa ? "Admin Wilayah" : "Super Admin";
  const wilayahLabel = profile.desa ?? "Seluruh Desa Pandak";

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        eyebrow="Pengaturan Akun"
        title="Profil Admin"
        description="Kelola informasi akun petugas, hak akses, dan pengaturan kata sandi sistem REDESPA."
        actions={
          <Button
            variant="primary"
            onClick={openPasswordModal}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          >
            Ganti Password
          </Button>
        }
      />

      {/* Success Notification Alert */}
      {passwordMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#287A50]/30 bg-[#E6F2EA] px-4 py-3 text-xs text-[#206440] shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#287A50] text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="font-medium">{passwordMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setPasswordMessage("")}
            className="text-[11px] font-semibold text-[#287A50] hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Identity Banner Card */}
      <ResponsiveCard className="border border-[#E5EAE6] bg-white">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={profile.nama || user.email} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#202824]">
                  {profile.nama || "Petugas Administrasi"}
                </h2>
                <Badge variant={profile.desa ? "info" : "success"} dot size="sm">
                  {roleLabel}
                </Badge>
              </div>
              <p className="text-xs text-[#78827C]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[#E5EAE6] pt-3 sm:border-t-0 sm:pt-0">
            <span className="rounded-xl bg-[#F5F7F5] px-3 py-1.5 text-[11px] font-medium text-[#202824] border border-[#E5EAE6]">
              Wilayah: <strong className="text-[#287A50]">{wilayahLabel}</strong>
            </span>
          </div>
        </div>
      </ResponsiveCard>

      {/* Detail Account & Security Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Card: Informasi Akun */}
        <ResponsiveCard
          title="Informasi Kredensial"
          description="Data identitas terdaftar yang digunakan untuk autentikasi sistem."
        >
          <div className="divide-y divide-[#E5EAE6]">
            <div className="py-3 first:pt-0 last:pb-0">
              <InfoRow label="Nama Petugas" value={profile.nama || "-"} />
            </div>
            <div className="py-3 first:pt-0 last:pb-0">
              <InfoRow label="Email Resmi" value={user.email} />
            </div>
            <div className="py-3 first:pt-0 last:pb-0">
              <InfoRow
                label="Peran Akun"
                value={
                  <Badge variant={profile.desa ? "info" : "success"} size="sm">
                    {roleLabel}
                  </Badge>
                }
              />
            </div>
            <div className="py-3 first:pt-0 last:pb-0">
              <InfoRow label="Wilayah Tugas" value={wilayahLabel} />
            </div>
            <div className="py-3 first:pt-0 last:pb-0">
              <InfoRow
                label="Status Akun"
                value={
                  <Badge variant="success" dot size="sm">
                    Aktif & Terverifikasi
                  </Badge>
                }
              />
            </div>
          </div>
        </ResponsiveCard>

        {/* Right Card: Pengaturan Keamanan */}
        <ResponsiveCard
          title="Keamanan & Proteksi Akun"
          description="Konfigurasi otentikasi kata sandi akun admin."
          footer={
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#78827C]">
                Ingin memperbarui kata sandi?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={openPasswordModal}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              >
                Ganti Password
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#287A50]/15 text-[#287A50]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#202824]">
                    Keamanan Password
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#78827C]">
                    Gunakan kombinasi minimal 6 karakter. Dianjurkan mengganti kata sandi secara berkala untuk menjaga integritas data presensi jamaah.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#287A50]/15 text-[#287A50]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#202824]">
                    Sesi Login & Perangkat
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#78827C]">
                    Sesi terotentikasi secara aman menggunakan token cookie Supabase SSR. Pastikan selalu logout bila mengakses dari komputer bersama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveCard>
      </div>

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <Modal
          title="Ganti Password Akun"
          subtitle="Masukkan password lama untuk verifikasi keamanan sebelum mengatur password baru."
          onClose={closePasswordModal}
          size="sm"
          headerIcon={
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          }
        >
          <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
            {passwordError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="leading-4">{passwordError}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="passwordLama"
                className="mb-1 block text-xs font-semibold text-[#202824]"
              >
                Password Lama
              </label>
              <div className="relative">
                <FormInput
                  id="passwordLama"
                  type={showPasswordLama ? "text" : "password"}
                  value={passwordLama}
                  onChange={(e) => setPasswordLama(e.target.value)}
                  disabled={passwordLoading}
                  autoComplete="current-password"
                  placeholder="Masukkan password lama"
                  className="pr-10"
                />
                <PasswordToggle
                  visible={showPasswordLama}
                  onClick={() => setShowPasswordLama((v) => !v)}
                  label={
                    showPasswordLama
                      ? "Sembunyikan password lama"
                      : "Tampilkan password lama"
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="passwordBaru"
                className="mb-1 block text-xs font-semibold text-[#202824]"
              >
                Password Baru
              </label>
              <div className="relative">
                <FormInput
                  id="passwordBaru"
                  type={showPasswordBaru ? "text" : "password"}
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  disabled={passwordLoading}
                  autoComplete="new-password"
                  placeholder="Masukkan password baru"
                  helperText="Minimal 6 karakter"
                  className="pr-10"
                />
                <PasswordToggle
                  visible={showPasswordBaru}
                  onClick={() => setShowPasswordBaru((v) => !v)}
                  label={
                    showPasswordBaru
                      ? "Sembunyikan password baru"
                      : "Tampilkan password baru"
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="konfirmasiPassword"
                className="mb-1 block text-xs font-semibold text-[#202824]"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <FormInput
                  id="konfirmasiPassword"
                  type={showKonfirmasi ? "text" : "password"}
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  disabled={passwordLoading}
                  autoComplete="new-password"
                  placeholder="Ulangi password baru"
                  className="pr-10"
                />
                <PasswordToggle
                  visible={showKonfirmasi}
                  onClick={() => setShowKonfirmasi((v) => !v)}
                  label={
                    showKonfirmasi
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E5EAE6] pt-4">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={closePasswordModal}
                disabled={passwordLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={passwordLoading}
              >
                {passwordLoading ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
