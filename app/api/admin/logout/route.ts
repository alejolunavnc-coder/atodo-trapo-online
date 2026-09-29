import { NextResponse } from "next/server";
import { adminCookie } from "@/src/lib/adminAuth";
export async function POST() {
  const r = NextResponse.json({ ok: true });
  r.cookies.set(adminCookie.nombre, "", { path: "/", maxAge: 0 });
  return r;
}
