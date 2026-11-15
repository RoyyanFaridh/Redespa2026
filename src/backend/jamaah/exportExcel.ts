import ExcelJS from "exceljs";
import type { Jamaah } from "./types";
import { KELOMPOK_OPTIONS, JENIS_KELAMIN_OPTIONS } from "./constants";

type ExportOptions = {
  data: Jamaah[];
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
  const index = (KELOMPOK_OPTIONS as readonly string[]).indexOf(kelompok as any);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortByKelompokThenNama(data: Jamaah[]): Jamaah[] {
  return [...data].sort((a, b) => {
    const kelompokDifference =
      getKelompokIndex(a.kelompok) - getKelompokIndex(b.kelompok);

    if (kelompokDifference !== 0) return kelompokDifference;

    return a.nama.localeCompare(b.nama, "id", {
      sensitivity: "base",
    });
  });
}

export async function exportJamaahExcel({ data }: ExportOptions): Promise<Blob> {
  const sortedData = sortByKelompokThenNama(data);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Jamaah", {
    views: [{ showGridLines: true }],
  });

  const referenceSheet = workbook.addWorksheet("Referensi");
  referenceSheet.state = "hidden";

  (KELOMPOK_OPTIONS as readonly string[]).forEach((option, index) => {
    referenceSheet.getCell(`A${index + 1}`).value = option;
  });

  (JENIS_KELAMIN_OPTIONS as readonly string[]).forEach((option, index) => {
    referenceSheet.getCell(`B${index + 1}`).value = option;
  });

  const kelompokRef = `Referensi!$A$1:$A$${KELOMPOK_OPTIONS.length}`;
  const jenisKelaminRef = `Referensi!$B$1:$B$${JENIS_KELAMIN_OPTIONS.length}`;

  worksheet.columns = [
    { width: 5 },
    { width: 14 },
    { width: 26 },
    { width: 15 },
    { width: 15 },
    { width: 13 },
    { width: 18 },
    { width: 20 },
  ];

  const headerRow = worksheet.addRow([...HEADER]);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: FONT_NAME,
      size: FONT_SIZE,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D9488" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: Number(cell.col) === 1 ? "center" : "left",
    };
    cell.border = BORDER_STYLE;
  });

  sortedData.forEach((item, index) => {
    const row = worksheet.addRow([
      index + 1,
      item.kelompok || "",
      item.nama || "",
      item.jenis_kelamin || "",
      item.tempat_lahir || "",
      item.tahun_lahir || "",
      item.no_hp || "",
      item.pekerjaan || "",
    ]);

    row.height = 20;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: FONT_NAME, size: FONT_SIZE };
      cell.border = BORDER_STYLE;

      if (colNumber === 1 || colNumber === 6) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }

      if (colNumber === 7) {
        cell.numFmt = "@";
      }
    });
  });

  for (let rowIndex = 2; rowIndex <= VALIDATION_LAST_ROW; rowIndex++) {
    worksheet.getCell(`B${rowIndex}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [kelompokRef],
    };

    worksheet.getCell(`D${rowIndex}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [jenisKelaminRef],
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
