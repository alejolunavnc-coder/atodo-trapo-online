import { adminAutorizado } from "@/src/lib/adminAuth";
import AdminImagenes from "@/src/components/admin/AdminImagenes";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  return <AdminImagenes autorizadoInicial={await adminAutorizado()} />;
}
