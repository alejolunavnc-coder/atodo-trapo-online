import { NextResponse } from "next/server";
import { adminCookie, crearToken } from "@/src/lib/adminAuth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const r = NextResponse.json({ ok: true });
  r.cookies.set(adminCookie.nombre, crearToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: adminCookie.duracion,
  });
  return r;
}
