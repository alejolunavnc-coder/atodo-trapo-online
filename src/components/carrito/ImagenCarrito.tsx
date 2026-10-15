"use client";

import { useEffect, useState } from "react";
import manifest from "@/src/generated/imagenes-productos.json";

const locales = manifest as Record<string, { tarjeta?: string; detalle?: string }>;

export default function ImagenCarrito({ src, alt }: { src?: string; alt: string }) {
  const original = String(src || "").trim();
  const local = locales[original]?.tarjeta || locales[original]?.detalle || "";
  const [actual, setActual] = useState(local || original);

  useEffect(() => { setActual(local || original); }, [local, original]);

  const fallo = () => {
    if (actual !== original && original) setActual(original);
    else setActual("");
  };

  return actual ? (
    <img src={actual} alt={alt} loading="lazy" onError={fallo}
      className="w-full h-full object-contain p-1.5" />
  ) : (
    <span className="text-2xl" aria-label="Imagen no disponible">🛒</span>
  );
}
