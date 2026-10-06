import ExcelJS from "exceljs";
import type { FieldErrors } from "./types";
import {
  KELOMPOK_OPTIONS,
  JENIS_KELAMIN_OPTIONS,
  KELAS_OPTIONS,
} from "./constants";

export type ImportRow = {
  kelompok: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  umur: string;
  no_hp: string;
  pekerjaan: string;
  kelas: string;
  nama_ayah: string;
  nama_ibu: string;
  no_hp_ortu: string;
  alamat: string;
};

export type ImportResult = {
  data: ImportRow[];
  errors: string[];
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function normalizeValue(value: unknown): string {
  return String(value ?? "").trim();
}

function isValidKelompok(kelompok: string): boolean {
  return KELOMPOK_OPTIONS.includes(
    kelompok as (typeof KELOMPOK_OPTIONS)[number],
  );
}

function isValidKelas(kelas: string): boolean {
  return KELAS_OPTIONS.includes(kelas as (typeof KELAS_OPTIONS)[number]);
}

function normalizeJenisKelamin(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "l" ||
    normalized === "lk" ||
    normalized === "laki" ||
    normalized === "laki-laki" ||
    normalized === "laki laki" ||
    normalized === "pria"
  ) {
    return "Laki-laki";
  }

  if (
    normalized === "p" ||
    normalized === "pr" ||
    normalized === "perempuan" ||
    normalized === "wanita"
  ) {
    return "Perempuan";
  }

  return value.trim();
}

function isValidJenisKelamin(value: string): boolean {
  return JENIS_KELAMIN_OPTIONS.includes(
    value as (typeof JENIS_KELAMIN_OPTIONS)[number],
  );
}

function parseExcelDate(value: unknown): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value);
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(
      excelEpoch.getTime() + value * 24 * 60 * 60 * 1000,
    );

    if (!Number.isNaN(date.getTime())) {
      return formatDate(
        new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
        ),
      );
    }
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return "";
  }

  const normalized = stringValue
    .replace(/\./g, "/")
    .replace(/-/g, "/");

  const parts = normalized.split("/");

  if (parts.length === 3) {
    let day: number;
    let month: number;
    let year: number;

    if (parts[0].length === 4) {
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
    } else {
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    }

    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year) &&
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12
    ) {
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return formatDate(date);
      }
    }
  }

  const parsed = new Date(stringValue);

  if (!Number.isNaN(parsed.getTime())) {
    return formatDate(parsed);
  }

  return stringValue;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDateInput(value: string): string {
  if (!value) {
    return "";
  }

  return parseExcelDate(value);
}

function isValidDate(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

function calculateAge(tanggalLahir: string): number | null {
  if (!isValidDate(tanggalLahir)) {
    return null;
  }

  const birthDate = new Date(`${tanggalLahir}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function normalizePhone(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\d+]/g, "");
}

type ValidateValues = {
  kelompok: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  umur: string;
  no_hp: string;
  pekerjaan: string;
  kelas: string;
  nama_ayah: string;
  nama_ibu: string;
  no_hp_ortu: string;
  alamat: string;
};

function validateRow(
  row: ValidateValues,
  rowNumber: number,
  existingKeys: Set<string>,
  importedKeys: Set<string>,
): string[] {
  const rowErrors: string[] = [];

  const kelompok = row.kelompok.trim();
  const nama = row.nama.trim();
  const jenisKelamin = normalizeJenisKelamin(row.jenis_kelamin);
  const kelas = row.kelas.trim();
  const tanggalLahir = normalizeDateInput(row.tanggal_lahir);

  if (!kelompok) {
    rowErrors.push("Kelompok wajib diisi");
  } else if (!isValidKelompok(kelompok)) {
    rowErrors.push("Kelompok tidak valid");
  }

  if (!nama) {
    rowErrors.push("Nama lengkap wajib diisi");
  } else if (/\d/.test(nama)) {
    rowErrors.push("Nama tidak boleh mengandung angka");
  }

  if (!jenisKelamin) {
    rowErrors.push("Jenis kelamin wajib diisi");
  } else if (!isValidJenisKelamin(jenisKelamin)) {
    rowErrors.push("Jenis kelamin tidak valid");
  }

  if (tanggalLahir && !isValidDate(tanggalLahir)) {
    rowErrors.push("Tanggal lahir tidak valid");
  }

  if (kelas && !isValidKelas(kelas)) {
    rowErrors.push("Kelas tidak valid");
  }

  const key = [
    nama.toLowerCase(),
    kelas.toLowerCase(),
    kelompok.toLowerCase(),
  ].join("|");

  if (nama && kelas && kelompok) {
    if (existingKeys.has(key)) {
      rowErrors.push(
        "Data dengan nama, kelas, dan kelompok tersebut sudah ada",
      );
    }

    if (importedKeys.has(key)) {
      rowErrors.push("Data duplikat dengan baris lain dalam file");
    }

    importedKeys.add(key);
  }

  if (rowErrors.length > 0) {
    return [`Baris ${rowNumber}: ${rowErrors.join(", ")}`];
  }

  return [];
}

function getCellValue(row: ExcelJS.Row, columnIndex: number): unknown {
  const cell = row.getCell(columnIndex);
  const value = cell.value;

  if (value && typeof value === "object" && "result" in value) {
    return value.result;
  }

  return value;
}

function buildHeaderMap(headerRow: ExcelJS.Row): Map<string, number> {
  const map = new Map<string, number>();

  headerRow.eachCell((cell, columnNumber) => {
    const header = normalizeHeader(cell.value);

    if (header) {
      map.set(header, columnNumber);
    }
  });

  return map;
}

function getStringFromRow(
  row: ExcelJS.Row,
  headerMap: Map<string, number>,
  header: string,
): string {
  const columnIndex = headerMap.get(header);

  if (!columnIndex) {
    return "";
  }

  return normalizeValue(getCellValue(row, columnIndex));
}

const REQUIRED_HEADERS = ["KELOMPOK", "NAMA LENGKAP", "JENIS KELAMIN"];

const OPTIONAL_HEADERS = [
  "TEMPAT",
  "TANGGAL LAHIR",
  "UMUR",
  "NO HP",
  "PEKERJAAN",
  "KELAS",
  "NAMA AYAH",
  "NAMA IBU",
  "NO HP ORANGTUA",
  "ALAMAT",
];

export async function parseExcelFile(
  file: File,
  existingData: {
    nama: string;
    kelas: string;
    kelompok: string;
  }[],
): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();

  const arrayBuffer = await file.arrayBuffer();

  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return {
      data: [],
      errors: ["File Excel tidak memiliki worksheet"],
    };
  }

  const headerRow = worksheet.getRow(1);
  const headerMap = buildHeaderMap(headerRow);

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerMap.has(header),
  );

  if (missingHeaders.length > 0) {
    return {
      data: [],
      errors: [`Header wajib tidak ditemukan: ${missingHeaders.join(", ")}`],
    };
  }

  const existingKeys = new Set(
    existingData.map((item) =>
      [
        item.nama.trim().toLowerCase(),
        item.kelas.trim().toLowerCase(),
        item.kelompok.trim().toLowerCase(),
      ].join("|"),
    ),
  );

  const importedKeys = new Set<string>();
  const data: ImportRow[] = [];
  const errors: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values: ImportRow = {
      kelompok: getStringFromRow(row, headerMap, "KELOMPOK"),
      nama: getStringFromRow(row, headerMap, "NAMA LENGKAP"),
      jenis_kelamin: normalizeJenisKelamin(
        getStringFromRow(row, headerMap, "JENIS KELAMIN"),
      ),
      tempat_lahir: getStringFromRow(row, headerMap, "TEMPAT"),
      tanggal_lahir: getStringFromRow(row, headerMap, "TANGGAL LAHIR"),
      umur: getStringFromRow(row, headerMap, "UMUR"),
      no_hp: normalizePhone(getStringFromRow(row, headerMap, "NO HP")),
      pekerjaan: getStringFromRow(row, headerMap, "PEKERJAAN"),
      kelas: getStringFromRow(row, headerMap, "KELAS"),
      nama_ayah: getStringFromRow(row, headerMap, "NAMA AYAH"),
      nama_ibu: getStringFromRow(row, headerMap, "NAMA IBU"),
      no_hp_ortu: normalizePhone(
        getStringFromRow(row, headerMap, "NO HP ORANGTUA"),
      ),
      alamat: getStringFromRow(row, headerMap, "ALAMAT"),
    };

    const isEmptyRow = Object.values(values).every((value) => !value);

    if (isEmptyRow) {
      return;
    }

    const rowErrors = validateRow(
      values,
      rowNumber,
      existingKeys,
      importedKeys,
    );

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      return;
    }

    const tanggalLahir = normalizeDateInput(values.tanggal_lahir);

    data.push({
      ...values,
      tanggal_lahir: tanggalLahir,
      umur:
        values.umur ||
        (tanggalLahir ? String(calculateAge(tanggalLahir) ?? "") : ""),
    });
  });

  return {
    data,
    errors,
  };
}

export async function parseCsvFile(
  file: File,
  existingData: {
    nama: string;
    kelas: string;
    kelompok: string;
  }[],
): Promise<ImportResult> {
  const text = await file.text();

  const lines = text.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      data: [],
      errors: ["File CSV kosong"],
    };
  }

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());

    return result;
  };

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  const headerMap = new Map<string, number>();

  headers.forEach((header, index) => {
    if (header) {
      headerMap.set(header, index);
    }
  });

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerMap.has(header),
  );

  if (missingHeaders.length > 0) {
    return {
      data: [],
      errors: [`Header wajib tidak ditemukan: ${missingHeaders.join(", ")}`],
    };
  }

  const existingKeys = new Set(
    existingData.map((item) =>
      [
        item.nama.trim().toLowerCase(),
        item.kelas.trim().toLowerCase(),
        item.kelompok.trim().toLowerCase(),
      ].join("|"),
    ),
  );

  const importedKeys = new Set<string>();
  const data: ImportRow[] = [];
  const errors: string[] = [];

  const getCsvValue = (values: string[], header: string): string => {
    const index = headerMap.get(header);

    if (index === undefined) {
      return "";
    }

    return normalizeValue(values[index]);
  };

  for (let index = 1; index < lines.length; index++) {
    const rowNumber = index + 1;
    const values = parseCsvLine(lines[index]);

    const row: ImportRow = {
      kelompok: getCsvValue(values, "KELOMPOK"),
      nama: getCsvValue(values, "NAMA LENGKAP"),
      jenis_kelamin: normalizeJenisKelamin(
        getCsvValue(values, "JENIS KELAMIN"),
      ),
      tempat_lahir: getCsvValue(values, "TEMPAT"),
      tanggal_lahir: getCsvValue(values, "TANGGAL LAHIR"),
      umur: getCsvValue(values, "UMUR"),
      no_hp: normalizePhone(getCsvValue(values, "NO HP")),
      pekerjaan: getCsvValue(values, "PEKERJAAN"),
      kelas: getCsvValue(values, "KELAS"),
      nama_ayah: getCsvValue(values, "NAMA AYAH"),
      nama_ibu: getCsvValue(values, "NAMA IBU"),
      no_hp_ortu: normalizePhone(getCsvValue(values, "NO HP ORANGTUA")),
      alamat: getCsvValue(values, "ALAMAT"),
    };

    const isEmptyRow = Object.values(row).every((value) => !value);

    if (isEmptyRow) {
      continue;
    }

    const rowErrors = validateRow(row, rowNumber, existingKeys, importedKeys);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    const tanggalLahir = normalizeDateInput(row.tanggal_lahir);

    data.push({
      ...row,
      tanggal_lahir: tanggalLahir,
      umur:
        row.umur ||
        (tanggalLahir ? String(calculateAge(tanggalLahir) ?? "") : ""),
    });
  }

  return {
    data,
    errors,
  };
}

export async function parseImportFile(
  file: File,
  existingData: {
    nama: string;
    kelas: string;
    kelompok: string;
  }[],
): Promise<ImportResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return parseCsvFile(file, existingData);
  }

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    return parseExcelFile(file, existingData);
  }

  return {
    data: [],
    errors: ["Format file tidak didukung. Gunakan file .xlsx atau .csv"],
  };
}
