import { NextResponse } from "next/server";
import { adminAutorizado } from "@/src/lib/adminAuth";
import { readRegistry } from "@/src/lib/imageRegistry";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await adminAutorizado())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await readRegistry(), { headers: { "Cache-Control": "no-store" } });
}
