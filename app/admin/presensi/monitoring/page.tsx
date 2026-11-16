import { getKegiatan } from "../../../../src/backend/kegiatan/actions";
import MonitoringPage from "../../../../src/components/presensi/monitoring/MonitoringPage";
import { PageContainer } from "../../../../src/components/common";

export default async function Page() {
  const kegiatan = await getKegiatan();

  return (
    <PageContainer maxWidth="9xl">
      <MonitoringPage kegiatan={kegiatan} />
    </PageContainer>
  );
}
