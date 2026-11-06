
import { useMemo, useState } from "react";
import type {
  Mudamudi,
  SortKey,
  SortConfig,
} from "../../backend/mudamudi/types";

const DEFAULT_SORT: NonNullable<SortConfig> = {
  key: "created_at",
  direction: "desc",
};

export function useMudamudiFilter(initialData: Mudamudi[]) {
  const [search, setSearch] = useState("");
  const [filterJenisKelamin, setFilterJenisKelamin] = useState<string[]>([]);
  const [filterKelas, setFilterKelas] = useState<string[]>([]);
  const [filterKelompok, setFilterKelompok] = useState<string[]>([]);

  const [sortConfig, setSortConfig] =
    useState<NonNullable<SortConfig>>(DEFAULT_SORT);

  const displayedData = useMemo(() => {
    let result = [...initialData];

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();

      result = result.filter((item) =>
        item.nama.toLowerCase().includes(keyword),
      );
    }

    if (filterJenisKelamin.length > 0) {
      result = result.filter((item) =>
        filterJenisKelamin.includes(item.jenis_kelamin ?? ""),
      );
    }

    if (filterKelas.length > 0) {
      result = result.filter((item) =>
        filterKelas.includes(item.kelas ?? ""),
      );
    }

    if (filterKelompok.length > 0) {
      result = result.filter((item) =>
        filterKelompok.includes(item.kelompok),
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === "created_at") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        return sortConfig.direction === "asc"
          ? dateA - dateB
          : dateB - dateA;
      }

      if (sortConfig.key === "nama") {
        const comparison = a.nama.localeCompare(b.nama, "id", {
          sensitivity: "base",
        });

        return sortConfig.direction === "asc"
          ? comparison
          : -comparison;
      }

      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      const comparison = String(valueA ?? "").localeCompare(
        String(valueB ?? ""),
        "id",
        { sensitivity: "base" },
      );

      return sortConfig.direction === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    initialData,
    search,
    filterJenisKelamin,
    filterKelas,
    filterKelompok,
    sortConfig,
  ]);

  function toggleSort(key: SortKey) {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return {
          key,
          direction: "asc",
        };
      }

      if (prev.direction === "asc") {
        return {
          key,
          direction: "desc",
        };
      }

      return DEFAULT_SORT;
    });
  }

  function sortIndicator(key: SortKey) {
    if (sortConfig.key !== key) {
      return "";
    }

    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  }

  function resetAll() {
    setSearch("");
    setFilterJenisKelamin([]);
    setFilterKelas([]);
    setFilterKelompok([]);
    setSortConfig(DEFAULT_SORT);
  }

  const hasActiveFilters = Boolean(
    search.trim() ||
    filterJenisKelamin.length > 0 ||
    filterKelas.length > 0 ||
    filterKelompok.length > 0,
  );

  const filterKey = [
    search,
    filterJenisKelamin.join(","),
    filterKelas.join(","),
    filterKelompok.join(","),
    sortConfig.key,
    sortConfig.direction,
  ].join("|");

  return {
    search,
    setSearch,
    filterJenisKelamin,
    setFilterJenisKelamin,
    filterKelas,
    setFilterKelas,
    filterKelompok,
    setFilterKelompok,
    sortConfig,
    setSortConfig,
    displayedData,
    toggleSort,
    sortIndicator,
    resetAll,
    hasActiveFilters,
    filterKey,
  };
}
