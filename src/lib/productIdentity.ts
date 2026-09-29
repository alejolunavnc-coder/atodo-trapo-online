import type { Producto } from "@/src/types/producto";

export function normalizarId(valor: unknown) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashCorto(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function productId(p: Partial<Producto>) {
  const base = [p.Categoría, p.Subcategoría, p.Marca, p.Linea, p.Nombre]
    .map(normalizarId).join("|");
  return `${normalizarId(p.Marca)}-${normalizarId(p.Nombre)}-${hashCorto(base)}`.replace(/^-+/, "");
}

export function variantId(p: Partial<Producto>) {
  const pid = productId(p);
  const variantes = [p.Tamaño, p.Color, p.Fragancias, p.Aromas]
    .map(normalizarId).join("|");
  return `${pid}-${hashCorto(`${pid}|${variantes}`)}`;
}

export function cloudinaryPublicId(p: Partial<Producto>) {
  return `atodo-trapo/variantes/${variantId(p)}`;
}

export function cloudinaryUrl(p: Partial<Producto>, modo: "tarjeta" | "detalle" = "tarjeta") {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "equm866o";
  const transform = modo === "detalle"
    ? "f_auto,q_auto,c_limit,w_1100"
    : "f_auto,q_auto,c_limit,w_500";
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${cloudinaryPublicId(p)}`;
}
