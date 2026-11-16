import { requireAdmin } from "../../../../src/backend/auth/admin";
import RekapitulasiPage from "../../../../src/components/presensi/rekapitulasi/RekapitulasiPage";
import { PageContainer } from "../../../../src/components/common";

export default async function Page() {
  const { desa } = await requireAdmin();

  return (
    <PageContainer maxWidth="9xl">
      <RekapitulasiPage adminDesa={desa} />
    </PageContainer>
  );
}

