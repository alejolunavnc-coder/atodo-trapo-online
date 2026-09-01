"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const originalesQueFuncionaron = new Set<string>();

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  loading?: "eager" | "lazy";
  className?: string;
  forzarOriginal?: boolean;
};

/**
 * Usa primero la optimización de Next/Vercel (rápida cuando ya está cacheada).
 * Si una imagen externa se queda esperando o falla, cambia automáticamente a
 * la URL original para evitar que una foto de producto quede cargando eternamente.
 */
export default function ImagenProductoRapida({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  quality = 70,
  loading = "lazy",
  className,
  forzarOriginal = false,
}: Props) {
  const [usarOriginal, setUsarOriginal] = useState(() =>
    forzarOriginal || originalesQueFuncionaron.has(src),
  );
  const [cargada, setCargada] = useState(false);

  useEffect(() => {
    setUsarOriginal(forzarOriginal || originalesQueFuncionaron.has(src));
    setCargada(false);
  }, [src, forzarOriginal]);

  useEffect(() => {
    if (cargada || usarOriginal || forzarOriginal) return;

    const temporizador = window.setTimeout(() => {
      originalesQueFuncionaron.add(src);
      setUsarOriginal(true);
    }, 3500);

    return () => window.clearTimeout(temporizador);
  }, [src, cargada, usarOriginal, forzarOriginal]);

  const alCargar = () => {
    if (usarOriginal) originalesQueFuncionaron.add(src);
    setCargada(true);
  };
  const alFallar = () => {
    if (!usarOriginal) {
      originalesQueFuncionaron.add(src);
      setUsarOriginal(true);
    }
  };

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        loading={loading}
        unoptimized={usarOriginal}
        onLoad={alCargar}
        onError={alFallar}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 160}
      height={height ?? 160}
      sizes={sizes}
      quality={quality}
      loading={loading}
      unoptimized={usarOriginal}
      onLoad={alCargar}
      onError={alFallar}
      className={className}
    />
  );
}
