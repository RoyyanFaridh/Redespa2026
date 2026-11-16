"use client";

import { useEffect, useState } from "react";
import { Pagination } from "../common/Pagination";
import type { Jamaah, SortKey } from "../../backend/jamaah/types";
import MobileList from "./MobileList";
import DesktopTable from "./DesktopTable";

type Props = {
  data: Jamaah[];
  totalCount: number;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  onDetail: (s: Jamaah) => void;
  onEdit: (s: Jamaah) => void;
  onDelete: (s: Jamaah) => void;
  onShowQR: (s: Jamaah) => void;
  filterKey: string;
};

type PerPageOption = 10 | 25 | 50;

export default function JamaahTableView({
  data,
  totalCount,
  sortIndicator,
  toggleSort,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
  filterKey,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<PerPageOption>(10);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div>
      <DesktopTable
        data={paginatedData}
        startIndex={startIndex}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        onShowQR={onShowQR}
      />

      <MobileList
        data={paginatedData}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        onShowQR={onShowQR}
        startIndex={startIndex}
      />

      {totalPages >= 1 && paginatedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          perPageOptions={[10, 25, 50] as const}
          onItemsPerPageChange={(v) => setItemsPerPage(v as PerPageOption)}
          onGoToPage={goToPage}
        />
      )}
    </div>
  );
}
