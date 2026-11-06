
"use client";

import type { Mudamudi } from "../../backend/mudamudi/types";
import SearchFilterBar from "./SearchFilterBar";
import MudamudiTableView from "./MudamudiTableView";

type Props = {
  data: Mudamudi[];
  totalCount: number;

  search: string;
  setSearch: (value: string) => void;

  filterKelas: string[];
  setFilterKelas: (values: string[]) => void;

  filterKelompok: string[];
  setFilterKelompok: (values: string[]) => void;

  filterJenisKelamin: string[];
  setFilterJenisKelamin: (values: string[]) => void;

  hasActiveFilters: boolean;

  sortConfig: Parameters<typeof SearchFilterBar>[0]["sortConfig"];
  setSortConfig: Parameters<typeof SearchFilterBar>[0]["setSortConfig"];

  onReset: () => void;

  sortIndicator: Parameters<typeof MudamudiTableView>[0]["sortIndicator"];
  toggleSort: Parameters<typeof MudamudiTableView>[0]["toggleSort"];

  filterKey: string;

  onDetail: (data: Mudamudi) => void;
  onEdit: (data: Mudamudi) => void;
  onDelete: (data: Mudamudi) => void;
  onShowQR: (data: Mudamudi) => void;
};

export default function MudamudiTable({
  data,
  totalCount,
  search,
  setSearch,
  filterKelas,
  setFilterKelas,
  filterKelompok,
  setFilterKelompok,
  filterJenisKelamin,
  setFilterJenisKelamin,
  hasActiveFilters,
  sortConfig,
  setSortConfig,
  onReset,
  sortIndicator,
  toggleSort,
  filterKey,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  return (
    <div>
      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        filterKelas={filterKelas}
        setFilterKelas={setFilterKelas}
        filterKelompok={filterKelompok}
        setFilterKelompok={setFilterKelompok}
        filterJenisKelamin={filterJenisKelamin}
        setFilterJenisKelamin={setFilterJenisKelamin}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        hasActiveFilters={hasActiveFilters}
        onReset={onReset}
      />

      <MudamudiTableView
        data={data}
        totalCount={totalCount}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        filterKey={filterKey}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        onShowQR={onShowQR}
      />
    </div>
  );
}
