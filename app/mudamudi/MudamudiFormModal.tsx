import { Mudamudi, FieldErrors } from './types'
import { JENJANG_OPTIONS, KELOMPOK_OPTIONS, JENIS_KELAMIN_OPTIONS } from './constants'
import ModalWrapper from './ModalWrapper'

type Props = {
  mode: 'add' | 'edit'
  initialData?: Mudamudi
  fieldErrors: FieldErrors
  error: string
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function MudamudiFormModal({
  mode,
  initialData,
  fieldErrors,
  error,
  onSubmit,
  onClose,
}: Props) {
  return (
    <ModalWrapper onClose={onClose}>
        <form
            onSubmit={onSubmit}
            className="w-full max-w-125 overflow-hidden rounded-2xl bg-white shadow-xl"
        >

        {/* ==================================================
            HEADER
            ================================================== */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">

          <div className="flex min-w-0 items-center gap-3">

            {/* Icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                mode === 'add'
                  ? 'bg-teal-50 text-teal-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {mode === 'add' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20h9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold leading-5 text-gray-800">
                {mode === 'add'
                  ? 'Tambah Data Mudamudi'
                  : 'Edit Data Mudamudi'}
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                {mode === 'add'
                  ? 'Tambahkan data mudamudi baru'
                  : 'Perbarui informasi data mudamudi'}
              </p>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* ==================================================
            FORM CONTENT
            ================================================== */}
        <div className="space-y-4 px-5 py-5">

          {/* General Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4M12 16h.01"
                />
              </svg>

              <p className="text-[10px] leading-4 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* ==================================================
              NAMA
              ================================================== */}
          <div>
            <label
              htmlFor="nama"
              className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-400"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-3 w-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21a8 8 0 0 0-16 0"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              Nama
            </label>

            <input
              id="nama"
              name="nama"
              type="text"
              placeholder="Masukkan nama lengkap"
              defaultValue={initialData?.nama ?? ''}
              className={`h-9.75 w-full rounded-lg border bg-white px-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-500 focus:ring-2 ${
                fieldErrors.nama
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                  : 'border-gray-200 focus:border-teal-400 focus:ring-teal-50'
              }`}
            />

            {fieldErrors.nama && (
              <p className="mt-1 text-[10px] text-red-500">
                {fieldErrors.nama}
              </p>
            )}
          </div>

          {/* ==================================================
            JENIS KELAMIN
            ================================================== */}

            <div>
              <label
                htmlFor="jenis_kelamin"
                className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-400"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3 w-3"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12v9M9 18h6"
                    />
                  </svg>
                </span>
            Jenis Kelamin
              </label>

              <div className="relative">
                <select
                  id="jenis_kelamin"
                  name="jenis_kelamin"
                  defaultValue={initialData?.jenis_kelamin ?? ''}
                  className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[12px] outline-none transition focus:ring-2 ${
                    initialData?.jenis_kelamin
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  } ${
                    fieldErrors.jenis_kelamin
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                      : 'border-gray-200 focus:border-violet-300 focus:ring-violet-50'
                  }`}
                >
                  <option value="" disabled>
                    Pilih Jenis Kelamin
                  </option>

              {JENIS_KELAMIN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </div>
              </div>

            {fieldErrors.jenis_kelamin && ( <p className="mt-1 text-[10px] text-red-500">
            {fieldErrors.jenis_kelamin} </p>
            )}

            </div>

          {/* ==================================================
              JENJANG + KELOMPOK
              ================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* ==================================================
                JENJANG
                ================================================== */}
            <div>
              <label
                htmlFor="jenjang"
                className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-400"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3 w-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 8h14M5 16h14"
                    />
                  </svg>
                </span>

                Jenjang
              </label>

              <div className="relative">
                <select
                  id="jenjang"
                  name="jenjang"
                  defaultValue={initialData?.jenjang ?? ''}
                  className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[12px] outline-none transition focus:ring-2 ${
                    initialData?.jenjang
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  } ${
                    fieldErrors.jenjang
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                      : 'border-gray-200 focus:border-orange-300 focus:ring-orange-50'
                  }`}
                >
                  <option value="" disabled>
                    Pilih Jenjang
                  </option>

                  {JENJANG_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>

                {/* Arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              {fieldErrors.jenjang && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.jenjang}
                </p>
              )}
            </div>

            {/* ==================================================
                KELOMPOK
                ================================================== */}
            <div>
              <label
                htmlFor="kelompok"
                className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-400"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-50 text-sky-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3 w-3"
                  >
                    <circle cx="9" cy="8" r="3" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 20a6 6 0 0 1 12 0"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11a3 3 0 1 0 0-6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 14a6 6 0 0 1 3 5"
                    />
                  </svg>
                </span>

                Kelompok
              </label>

              <div className="relative">
                <select
                  id="kelompok"
                  name="kelompok"
                  defaultValue={initialData?.kelompok ?? ''}
                  className={`h-9.75 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[12px] outline-none transition focus:ring-2 ${
                    initialData?.kelompok
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  } ${
                    fieldErrors.kelompok
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                      : 'border-gray-200 focus:border-sky-300 focus:ring-sky-50'
                  }`}
                >
                  <option value="" disabled>
                    Pilih Kelompok
                  </option>

                  {KELOMPOK_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                {/* Arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </div>
              </div>

              {fieldErrors.kelompok && (
                <p className="mt-1 text-[10px] text-red-500">
                  {fieldErrors.kelompok}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================
            FOOTER
            ================================================== */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">

          {/* Batal */}
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Batal
          </button>

          {/* Submit */}
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-5 text-[11px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
          >
            {mode === 'add' ? (
              <>
                Simpan
              </>
            ) : (
              <>
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

      </form>
    </ModalWrapper>
  )
}