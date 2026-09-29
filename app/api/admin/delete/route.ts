import crypto from "crypto";
import { NextResponse } from "next/server";
import { adminAutorizado } from "@/src/lib/adminAuth";
export async function POST(req: Request) {
  if (!(await adminAutorizado())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { publicId } = await req.json().catch(() => ({ publicId: "" }));
  if (!String(publicId).startsWith("atodo-trapo/variantes/")) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return NextResponse.json({ error: "Falta configurar Cloudinary" }, { status: 500 });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash("sha1").update(`invalidate=true&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), invalidate: "true", api_key: key, signature });
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const json = await r.json();
  if (!r.ok) return NextResponse.json({ error: "No se pudo eliminar" }, { status: 502 });
  return NextResponse.json({ ok: true, result: json.result });
}
