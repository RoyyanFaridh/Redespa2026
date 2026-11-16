"use client";

import { useParams } from "next/navigation";
import CheckinScanner from "../../../../../src/components/presensi/CheckinScanner";
import { PageContainer } from "../../../../../src/components/common";

export default function Page() {
  const params = useParams();
  const kegiatanId = Number(params.kegiatanId);

  if (!Number.isInteger(kegiatanId) || kegiatanId <= 0) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-medium text-red-700">
              ID kegiatan tidak valid.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <CheckinScanner kegiatanId={kegiatanId} />;
}
