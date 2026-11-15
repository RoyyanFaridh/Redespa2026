import { useMemo, useState } from "react";
import type {
  Jamaah,
  SortKey,
  SortConfig,
} from "../../backend/jamaah/types";

const DEFAULT_SORT: NonNullable<SortConfig> = {
  key: "created_at",
  direction: "desc",
};

export function useJamaahFilter(initialData: Jamaah[]) {
  const [search, setSearch] = useState("");
  const [filterJenisKelamin, setFilterJenisKelamin] = useState<string[]>([]);
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

    if (filterKelompok.length > 0) {
      result = result.filter((item) =>
        filterKelompok.includes(item.kelompok),
      );
    }

    result.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key] ?? "";
      let valB = b[key] ?? "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialData, search, filterJenisKelamin, filterKelompok, sortConfig]);

  function handleSort(key: SortKey) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function resetFilters() {
    setSearch("");
    setFilterJenisKelamin([]);
    setFilterKelompok([]);
    setSortConfig(DEFAULT_SORT);
  }

  return {
    search,
    setSearch,
    filterJenisKelamin,
    setFilterJenisKelamin,
    filterKelompok,
    setFilterKelompok,
    sortConfig,
    handleSort,
    resetFilters,
    displayedData,
  };
}
