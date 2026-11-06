
import ExcelJS from "exceljs";
import type { Mudamudi } from "./types";
import { KELOMPOK_OPTIONS, KELAS_OPTIONS, JENIS_KELAMIN_OPTIONS } from "./constants";

type ExportOptions = {
  data: Mudamudi[];
};

const HEADER = [
  "No",
  "Kelompok",
  "Nama Lengkap",
  "Jenis Kelamin",
  "Tempat",
  "Tahun Lahir",
  "No HP",
  "Pekerjaan",
  "Kelas",
] as const;

const FONT_NAME = "Arial";
const FONT_SIZE = 10;
const VALIDATION_LAST_ROW = 1000;

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD9D9D9" } },
  bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
  left: { style: "thin", color: { argb: "FFD9D9D9" } },
  right: { style: "thin", color: { argb: "FFD9D9D9" } },
};

function getKelompokIndex(kelompok: string): number {
  const index = (KELOMPOK_OPTIONS as readonly string[]).indexOf(kelompok);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortByKelompokThenNama(data: Mudamudi[]): Mudamudi[] {
  return [...data].sort((a, b) => {
    const kelompokDifference =
      getKelompokIndex(a.kelompok) - getKelompokIndex(b.kelompok);

    if (kelompokDifference !== 0) return kelompokDifference;

    return a.nama.localeCompare(b.nama, "id", {
      sensitivity: "base",
    });
  });
}

function toCapitalEachWord(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .trim()
    .toLocaleLowerCase("id-ID")
    .replace(
      /(^|[\s-])([\p{L}])/gu,
      (_, separator: string, letter: string) =>
        separator + letter.toLocaleUpperCase("id-ID"),
    );
}

function getTimestamp(): string {
  const now = new Date();

  const pad = (value: number) => String(value).padStart(2, "0");

  const tanggal = `${now.getFullYear()}-${pad(
    now.getMonth() + 1,
  )}-${pad(now.getDate())}`;

  const jam = `${pad(now.getHours())}-${pad(now.getMinutes())}`;

  return `${tanggal}_${jam}`;
}

function setCellAlignment(
  cell: ExcelJS.Cell,
  horizontal: ExcelJS.Alignment["horizontal"] = "center",
): void {
  cell.alignment = {
    horizontal,
    vertical: "middle",
    wrapText: true,
  };
}

function applyDataValidation(
  sheet: ExcelJS.Worksheet,
  column: "B" | "D" | "I",
  values: readonly string[],
  promptTitle: string,
  prompt: string,
): void {
  const formula = `"${values.join(",")}"`;

  for (let rowNumber = 2; rowNumber <= VALIDATION_LAST_ROW; rowNumber++) {
    sheet.getCell(`${column}${rowNumber}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [formula],
      showInputMessage: true,
      promptTitle,
      prompt,
      showErrorMessage: true,
      errorStyle: "stop",
      errorTitle: "Pilihan tidak valid",
      error: "Silakan pilih salah satu opsi dari daftar.",
    };
  }
}

export async function exportPresensiExcel({
  data,
}: ExportOptions): Promise<void> {
  const sorted = sortByKelompokThenNama(data);

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "REDESPA";
  workbook.subject = "Database Muda-Mudi";
  workbook.title = "Database Muda-Mudi";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const sheet = workbook.addWorksheet("Database", {
    views: [
      {
        state: "frozen",
        ySplit: 1,
        activeCell: "A2",
      },
    ],
    properties: {
      defaultRowHeight: 18,
    },
  });

  sheet.columns = [
    { key: "no", width: 6 },
    { key: "kelompok", width: 18 },
    { key: "nama", width: 30 },
    { key: "jenis_kelamin", width: 18 },
    { key: "tempat", width: 18 },
    { key: "tahun_lahir", width: 14 },
    { key: "no_hp", width: 18 },
    { key: "pekerjaan", width: 22 },
    { key: "kelas", width: 18 },
  ];

  const headerRow = sheet.addRow([...HEADER]);

  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: FONT_NAME,
      size: FONT_SIZE,
      bold: true,
    };

    setCellAlignment(cell, "center");
    cell.border = BORDER_STYLE;
  });

  sorted.forEach((item, index) => {
    const row = sheet.addRow([
      index + 1,
      item.kelompok ?? "",
      toCapitalEachWord(item.nama),
      item.jenis_kelamin ?? "",
      item.tempat_lahir ?? "",
      item.tahun_lahir ?? "",
      item.no_hp == null ? "" : String(item.no_hp),
      item.pekerjaan ?? "",
      item.kelas ?? "",
    ]);

    row.height = 20;

    row.eachCell((cell, columnNumber) => {
      cell.font = {
        name: FONT_NAME,
        size: FONT_SIZE,
        bold: false,
      };

      cell.border = BORDER_STYLE;

      const leftAlignedColumns = [3, 9];

      setCellAlignment(
        cell,
        leftAlignedColumns.includes(columnNumber) ? "left" : "center",
      );
    });

    row.getCell(6).numFmt = "0";
    row.getCell(7).numFmt = "@";
  });

  applyDataValidation(
    sheet,
    "B",
    KELOMPOK_OPTIONS,
    "Kelompok",
    "Pilih kelompok dari daftar yang tersedia.",
  );

  applyDataValidation(
    sheet,
    "D",
    JENIS_KELAMIN_OPTIONS,
    "Jenis Kelamin",
    "Pilih Laki-laki atau Perempuan.",
  );

  applyDataValidation(
    sheet,
    "I",
    KELAS_OPTIONS,
    "Kelas",
    "Pilih kelas dari daftar yang tersedia.",
  );

  sheet.autoFilter = {
    from: "A1",
    to: `I${Math.max(sorted.length + 1, 1)}`,
  };

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Database Muda-Mudi_${getTimestamp()}.xlsx`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
