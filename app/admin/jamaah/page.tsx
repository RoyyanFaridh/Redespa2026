import { requireAdmin } from "../../../src/backend/auth/admin";
import { getJamaah } from "../../../src/backend/jamaah/actions";
import JamaahPage from "../../../src/components/jamaah/JamaahPage";

export const metadata = {
  title: "Data Jamaah | REDESPA",
  description: "Pengelolaan Data Jamaah REDESPA",
};

export default async function Page() {
  await requireAdmin();
  const data = await getJamaah();
  return <JamaahPage initialData={data} />;
}
