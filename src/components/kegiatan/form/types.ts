export type GroupMode = "all" | "specific";

export type ActivityForm = {
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
};

export const JEMAAH_CLASS = "Jamaah";

export const formStyles = {
  sectionTitle: "text-[11px] font-semibold tracking-tight text-[#202824]",
  description: "text-[9px] leading-4 text-[#78827C]",
  label: "mb-1.5 block text-[9px] font-semibold leading-4 text-[#202824]",
  input:
    "h-9 w-full min-w-0 rounded-xl border border-[#E5EAE6] bg-white px-3 text-[9px] text-[#202824] outline-none transition placeholder:text-[#9AA39D] focus:border-[#287A50] focus:ring-2 focus:ring-[#65B98A]/20 disabled:cursor-not-allowed disabled:bg-[#F5F7F5]",
  option:
    "flex min-h-8 min-w-0 cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1.5 transition",
  optionText: "min-w-0 wrap-break-word text-[9px] leading-4 text-[#202824]",
  subheading: "text-[9px] font-semibold text-[#202824]",
  action:
    "shrink-0 text-[9px] font-semibold text-[#287A50] transition hover:text-[#206440] disabled:cursor-not-allowed disabled:opacity-50",
  button:
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[9px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
};

export const STEPS = [
  { number: 1, title: "Informasi Kegiatan", description: "Informasi dasar" },
  { number: 2, title: "Sasaran Kegiatan", description: "Kriteria peserta" },
  { number: 3, title: "Konfirmasi", description: "Periksa kembali" },
] as const;

export function formatDate(value: string): string {
  if (!value) return "Belum diisi";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(value: string): string {
  if (!value) return "Belum diisi";
  return value.slice(0, 5);
}

