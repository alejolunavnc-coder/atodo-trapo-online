import crypto from "crypto";
import { NextResponse } from "next/server";
import { adminAutorizado } from "@/src/lib/adminAuth";

const MAX = 12 * 1024 * 1024;
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  if (!(await adminAutorizado())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return NextResponse.json({ error: "Falta configurar Cloudinary" }, { status: 500 });

  const data = await req.formData();
  const file = data.get("file");
  const publicId = String(data.get("publicId") || "");
  if (!(file instanceof File) || !publicId.startsWith("atodo-trapo/variantes/")) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  if (!TIPOS.has(file.type)) return NextResponse.json({ error: "Usá JPG, PNG o WebP" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "La imagen supera 12 MB" }, { status: 400 });

  const timestamp = Math.floor(Date.now() / 1000);
  const firmaBase = `invalidate=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${secret}`;
  const signature = crypto.createHash("sha1").update(firmaBase).digest("hex");
  const fd = new FormData();
  fd.set("file", file); fd.set("api_key", key); fd.set("timestamp", String(timestamp));
  fd.set("public_id", publicId); fd.set("overwrite", "true"); fd.set("invalidate", "true"); fd.set("signature", signature);
  const subida = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
  const json = await subida.json();
  if (!subida.ok) return NextResponse.json({ error: json?.error?.message || "No se pudo subir" }, { status: 502 });
  return NextResponse.json({ ok: true, version: json.version, publicId: json.public_id });
}
