import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "att_admin";
const DURACION = 60 * 60 * 24 * 14;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.CLOUDINARY_API_SECRET || "";
}
function firma(valor: string) {
  return crypto.createHmac("sha256", secret()).update(valor).digest("hex");
}
export function crearToken() {
  const exp = Math.floor(Date.now() / 1000) + DURACION;
  const base = String(exp);
  return `${base}.${firma(base)}`;
}
export async function adminAutorizado() {
  if (!secret() || !process.env.ADMIN_PASSWORD) return false;
  const token = (await cookies()).get(COOKIE)?.value || "";
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const esperado = firma(exp);
  if (sig.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado));
}
export const adminCookie = { nombre: COOKIE, duracion: DURACION };
