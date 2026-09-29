import { NextResponse } from "next/server";
import { adminAutorizado } from "@/src/lib/adminAuth";
import { destroyManagedImage, isReferenced, readRegistry, uploadManagedImage, writeRegistry } from "@/src/lib/imageRegistry";

const MAX = 12 * 1024 * 1024;
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  if (!(await adminAutorizado())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.formData();
  const file = data.get("file");
  const productId = String(data.get("productId") || "");
  const variantIds = String(data.get("variantIds") || "").split(",").map(x => x.trim()).filter(Boolean);
  const target = String(data.get("target") || "variants");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Seleccioná una imagen" }, { status: 400 });
  if (!TIPOS.has(file.type)) return NextResponse.json({ error: "Usá JPG, PNG o WebP" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "La imagen supera 12 MB" }, { status: 400 });
  if (!productId) return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  if (target !== "product" && variantIds.length === 0) return NextResponse.json({ error: "Seleccioná al menos una variante" }, { status: 400 });

  let uploaded;
  try {
    uploaded = await uploadManagedImage(file);
    const registry = await readRegistry();
    const oldIds = new Set<string>();
    if (target === "product") {
      if (registry.products[productId]) oldIds.add(registry.products[productId].publicId);
      registry.products[productId] = uploaded;
    } else {
      for (const id of variantIds) {
        if (registry.variants[id]) oldIds.add(registry.variants[id].publicId);
        registry.variants[id] = uploaded;
      }
    }
    const saved = await writeRegistry(registry);
    for (const oldId of oldIds) if (oldId !== uploaded.publicId && !isReferenced(saved, oldId)) await destroyManagedImage(oldId);
    return NextResponse.json({ ok: true, image: uploaded, registry: saved });
  } catch (e) {
    if (uploaded?.publicId) await destroyManagedImage(uploaded.publicId).catch(() => {});
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se pudo guardar la imagen" }, { status: 502 });
  }
}
