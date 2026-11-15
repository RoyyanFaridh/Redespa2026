-- ====================================================================
-- MIGRASI REDESPA: PENAMBAHAN JENIS_PESERTA PADA TABEL KEGIATAN
-- ====================================================================

-- 1. Tambah kolom jenis_peserta pada tabel kegiatan jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'kegiatan' 
      AND column_name = 'jenis_peserta'
  ) THEN
    ALTER TABLE public.kegiatan 
      ADD COLUMN jenis_peserta TEXT;
  END IF;
END $$;

-- 2. Tambah constraint check agar jenis_peserta hanya bernilai 'jamaah' atau 'mudamudi'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'public' 
      AND table_name = 'kegiatan' 
      AND constraint_name = 'kegiatan_jenis_peserta_check'
  ) THEN
    ALTER TABLE public.kegiatan 
      ADD CONSTRAINT kegiatan_jenis_peserta_check 
      CHECK (jenis_peserta IN ('jamaah', 'mudamudi'));
  END IF;
END $$;

-- 3. Update data historis kegiatan yang sudah ada:
-- Berdasarkan hasil audit data kegiatan id=7 ("Pengajian GSM"):
-- Target kelas adalah [Caberawit, Pra Remaja, Remaja, Usia Nikah, MT] yang merupakan jenjang Muda-Mudi,
-- dan 144 presensi tercatat memiliki mudamudi_id.
-- Set jenis_peserta = 'mudamudi' untuk kegiatan ini (atau kegiatan yang kelasnya spesifik mudamudi).
UPDATE public.kegiatan
SET jenis_peserta = 'mudamudi'
WHERE jenis_peserta IS NULL AND kelas IS NOT NULL AND array_length(kelas, 1) > 0;

-- Untuk kegiatan lainnya yang tidak memiliki kelas (jika ada di masa lalu atau masa depan):
UPDATE public.kegiatan
SET jenis_peserta = 'jamaah'
WHERE jenis_peserta IS NULL;

-- 4. Set NOT NULL setelah backfill selesai
ALTER TABLE public.kegiatan 
  ALTER COLUMN jenis_peserta SET NOT NULL;

-- 5. Tambahkan indeks performa untuk filtering presensi & kegiatan
CREATE INDEX IF NOT EXISTS idx_kegiatan_jenis_peserta ON public.kegiatan(jenis_peserta);
CREATE INDEX IF NOT EXISTS idx_presensi_jamaah_id ON public.presensi(jamaah_id);
CREATE INDEX IF NOT EXISTS idx_presensi_mudamudi_id ON public.presensi(mudamudi_id);
CREATE INDEX IF NOT EXISTS idx_presensi_kegiatan_jamaah ON public.presensi(kegiatan_id, jamaah_id);
CREATE INDEX IF NOT EXISTS idx_presensi_kegiatan_mudamudi ON public.presensi(kegiatan_id, mudamudi_id);
