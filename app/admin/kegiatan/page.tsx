import { getKegiatan } from "../../../src/backend/kegiatan/actions";
import KegiatanTable from "../../../src/components/kegiatan/KegiatanTable";

export default async function KegiatanPage() {
  const data = await getKegiatan();

  return <KegiatanTable initialData={data} />;
}
