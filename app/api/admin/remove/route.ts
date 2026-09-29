import { NextResponse } from "next/server";
import { adminAutorizado } from "@/src/lib/adminAuth";
import { destroyManagedImage, isReferenced, readRegistry, writeRegistry } from "@/src/lib/imageRegistry";

export async function POST(req: Request) {
  if (!(await adminAutorizado())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { target, productId, variantIds } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  const registry = await readRegistry();
  const removed = new Set<string>();
  if (target === "product") {
    const old = registry.products[productId];
    if (old) { removed.add(old.publicId); delete registry.products[productId]; }
  } else {
    for (const id of Array.isArray(variantIds) ? variantIds : []) {
      const old = registry.variants[id];
      if (old) { removed.add(old.publicId); delete registry.variants[id]; }
    }
  }
  try {
    const saved = await writeRegistry(registry);
    for (const id of removed) if (!isReferenced(saved, id)) await destroyManagedImage(id);
    return NextResponse.json({ ok: true, registry: saved });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se pudo eliminar la asociación" }, { status: 502 });
  }
}
