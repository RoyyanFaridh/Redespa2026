import ExcelJS from "exceljs";
import type { Mudamudi } from "./types";

type ExportOptions = {
  data: Mudamudi[];
};

export async function exportMudamudiToExcel({
  data,
}: ExportOptions): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Muda-Mudi");

  worksheet.columns = [
    {
      header: "NO",
      key: "no",
      width: 8,
    },
    {
      header: "KELOMPOK",
      key: "kelompok",
      width: 18,
    },
    {
      header: "NAMA LENGKAP",
      key: "nama",
      width: 30,
    },
    {
      header: "JENIS KELAMIN",
      key: "jenis_kelamin",
      width: 18,
    },
    {
      header: "TEMPAT LAHIR",
      key: "tempat_lahir",
      width: 20,
    },
    {
      header: "TANGGAL LAHIR",
      key: "tanggal_lahir",
      width: 18,
    },
    {
      header: "UMUR",
      key: "umur",
      width: 10,
    },
    {
      header: "NO HP",
      key: "no_hp",
      width: 18,
    },
    {
      header: "PEKERJAAN",
      key: "pekerjaan",
      width: 20,
    },
    {
      header: "KELAS",
      key: "kelas",
      width: 18,
    },
    {
      header: "NAMA AYAH",
      key: "nama_ayah",
      width: 25,
    },
    {
      header: "NAMA IBU",
      key: "nama_ibu",
      width: 25,
    },
    {
      header: "NO HP ORANGTUA",
      key: "no_hp_ortu",
      width: 20,
    },
    {
      header: "ALAMAT",
      key: "alamat",
      width: 35,
    },
  ];

  const sortedData = [...data].sort((a, b) => {
    const kelompokCompare = a.kelompok.localeCompare(b.kelompok, "id", {
      sensitivity: "base",
    });

    if (kelompokCompare !== 0) {
      return kelompokCompare;
    }

    return a.nama.localeCompare(b.nama, "id", {
      sensitivity: "base",
    });
  });

  sortedData.forEach((item, index) => {
    worksheet.addRow({
      no: index + 1,
      kelompok: item.kelompok,
      nama: item.nama,
      jenis_kelamin: item.jenis_kelamin ?? "",
      tempat_lahir: item.tempat_lahir ?? "",
      tanggal_lahir: item.tanggal_lahir ? new Date(item.tanggal_lahir) : "",
      umur: item.umur ?? "",
      no_hp: item.no_hp ?? "",
      pekerjaan: item.pekerjaan ?? "",
      kelas: item.kelas,
      nama_ayah: item.nama_ayah ?? "",
      nama_ibu: item.nama_ibu ?? "",
      no_hp_ortu: item.no_hp_ortu ?? "",
      alamat: item.alamat ?? "",
    });
  });

  const headerRow = worksheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  headerRow.height = 25;

  worksheet.eachRow((row, rowNumber) => {
    row.alignment = {
      vertical: "middle",
    };

    if (rowNumber > 1) {
      row.getCell("no").alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      row.getCell("umur").alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    }
  });

  worksheet.getColumn("tanggal_lahir").numFmt = "dd/mm/yyyy";

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
