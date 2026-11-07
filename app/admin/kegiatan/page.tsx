import { getKegiatan } from "../../../src/backend/kegiatan/actions";
import KegiatanTable from "../../../src/components/kegiatan/KegiatanTable";

export default async function KegiatanPage() {
  const data = await getKegiatan();

  return (
    <main className="min-h-screen bg-[#F5F7F5]">
      <KegiatanTable initialData={data} />
    </main>
  );
}
