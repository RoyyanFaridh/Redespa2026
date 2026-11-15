import ExcelJS from "exceljs";
import { KELOMPOK_OPTIONS, JENIS_KELAMIN_OPTIONS } from "./constants";

export type ImportField =
  | "kelompok"
  | "nama"
  | "jenis_kelamin"
  | "tempat_lahir"
  | "tahun_lahir"
  | "no_hp"
  | "pekerjaan";

export type ImportRow = {
  kelompok: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string | null;
  tahun_lahir: number | null;
  no_hp: string | null;
  pekerjaan: string | null;
  presentFields: ImportField[];
};

export type ImportError = {
  rowNumber: number;
  message: string;
};

export type ImportWarning = {
  rowNumber: number;
  message: string;
};

export type ImportParseResult = {
  data: ImportRow[];
  errors: ImportError[];
  warnings: ImportWarning[];
};

const REQUIRED_HEADERS = [
  "NO",
  "KELOMPOK",
  "NAMA LENGKAP",
  "JENIS KELAMIN",
];

function normalizeHeader(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().toUpperCase().replace(/\s+/g, " ");
}

function normalizeCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "richText" in value) {
    return (value as ExcelJS.CellRichTextValue).richText
      .map((t) => t.text)
      .join("")
      .trim();
  }
  return String(value).trim();
}

function parseTahunLahir(raw: string, rowNumber: number, warnings: ImportWarning[]): number | null {
  if (!raw) return null;
  const num = parseInt(raw, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(num) || num < 1900 || num > currentYear) {
    warnings.push({
      rowNumber,
      message: `Tahun lahir "${raw}" di luar rentang wajar (1900-${currentYear}), dikosongkan.`,
    });
    return null;
  }
  return num;
}

export async function parseJamaahExcel(buffer: ArrayBuffer): Promise<ImportParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet =
    workbook.getWorksheet("Data Jamaah") ||
    workbook.worksheets.find((ws) => ws.state !== "hidden") ||
    workbook.worksheets[0];

  if (!worksheet) {
    return {
      data: [],
      errors: [{ rowNumber: 0, message: "File Excel kosong atau tidak memiliki sheet yang valid." }],
      warnings: [],
    };
  }

  let headerRowNumber = -1;
  const colMap: Partial<Record<ImportField, number>> = {};

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (headerRowNumber !== -1) return;
    const cellTexts: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      cellTexts.push(normalizeHeader(cell.value));
    });

    const hasNo = cellTexts.some((t) => t === "NO");
    const hasNama = cellTexts.some((t) => t === "NAMA LENGKAP" || t === "NAMA");
    const hasKelompok = cellTexts.some((t) => t === "KELOMPOK");

    if (hasNo && hasNama && hasKelompok) {
      headerRowNumber = rowNumber;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const text = normalizeHeader(cell.value);
        if (text === "KELOMPOK") colMap.kelompok = colNumber;
        else if (text === "NAMA LENGKAP" || text === "NAMA") colMap.nama = colNumber;
        else if (text === "JENIS KELAMIN" || text === "JK") colMap.jenis_kelamin = colNumber;
        else if (text === "TEMPAT" || text === "TEMPAT LAHIR") colMap.tempat_lahir = colNumber;
        else if (text === "TAHUN LAHIR" || text === "TAHUN") colMap.tahun_lahir = colNumber;
        else if (text === "NO HP" || text === "NO. HP" || text === "NOMOR HP" || text === "TELEPON") colMap.no_hp = colNumber;
        else if (text === "PEKERJAAN") colMap.pekerjaan = colNumber;
      });
    }
  });

  if (headerRowNumber === -1 || !colMap.kelompok || !colMap.nama || !colMap.jenis_kelamin) {
    return {
      data: [],
      errors: [
        {
          rowNumber: 0,
          message: `Header Excel tidak sesuai format. Kolom wajib: ${REQUIRED_HEADERS.join(", ")}.`,
        },
      ],
      warnings: [],
    };
  }

  const data: ImportRow[] = [];
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const rowHasValues = row.actualCellCount > 0;
    if (!rowHasValues) continue;

    const namaRaw = normalizeCellValue(row.getCell(colMap.nama!));
    const kelompokRaw = normalizeCellValue(row.getCell(colMap.kelompok!));
    const jkRaw = normalizeCellValue(row.getCell(colMap.jenis_kelamin!));
    const tempatRaw = colMap.tempat_lahir ? normalizeCellValue(row.getCell(colMap.tempat_lahir)) : "";
    const tahunRaw = colMap.tahun_lahir ? normalizeCellValue(row.getCell(colMap.tahun_lahir)) : "";
    const hpRaw = colMap.no_hp ? normalizeCellValue(row.getCell(colMap.no_hp)) : "";
    const kerjaRaw = colMap.pekerjaan ? normalizeCellValue(row.getCell(colMap.pekerjaan)) : "";

    if (!namaRaw && !kelompokRaw && !jkRaw) continue;

    const presentFields: ImportField[] = [];
    if (kelompokRaw) presentFields.push("kelompok");
    if (namaRaw) presentFields.push("nama");
    if (jkRaw) presentFields.push("jenis_kelamin");
    if (tempatRaw) presentFields.push("tempat_lahir");
    if (tahunRaw) presentFields.push("tahun_lahir");
    if (hpRaw) presentFields.push("no_hp");
    if (kerjaRaw) presentFields.push("pekerjaan");

    const rowErrors: string[] = [];

    if (!namaRaw) {
      rowErrors.push("Nama Lengkap wajib diisi.");
    }

    let kelompokValid = kelompokRaw;
    const matchKelompok = (KELOMPOK_OPTIONS as readonly string[]).find(
      (k) => k.toLowerCase() === kelompokRaw.toLowerCase(),
    );
    if (!matchKelompok) {
      rowErrors.push(`Kelompok "${kelompokRaw}" tidak valid.`);
    } else {
      kelompokValid = matchKelompok;
    }

    let jkValid = jkRaw;
    const lowerJk = jkRaw.toLowerCase();
    if (lowerJk === "l" || lowerJk === "laki-laki" || lowerJk === "laki - laki") {
      jkValid = "Laki-laki";
    } else if (lowerJk === "p" || lowerJk === "perempuan") {
      jkValid = "Perempuan";
    } else {
      rowErrors.push(`Jenis Kelamin "${jkRaw}" tidak valid (pilih Laki-laki atau Perempuan).`);
    }

    if (rowErrors.length > 0) {
      errors.push({
        rowNumber,
        message: rowErrors.join(" "),
      });
      continue;
    }

    const tahunLahir = parseTahunLahir(tahunRaw, rowNumber, warnings);

    data.push({
      nama: namaRaw,
      kelompok: kelompokValid,
      jenis_kelamin: jkValid,
      tempat_lahir: tempatRaw || null,
      tahun_lahir: tahunLahir,
      no_hp: hpRaw || null,
      pekerjaan: kerjaRaw || null,
      presentFields,
    });
  }

  return { data, errors, warnings };
}
