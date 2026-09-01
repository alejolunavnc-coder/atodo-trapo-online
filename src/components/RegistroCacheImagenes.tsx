"use client";

import { useEffect } from "react";

/**
 * Activa el service worker en toda la web para que las imágenes ya vistas
 * permanezcan en el cache del navegador/PWA. En producción funciona bajo HTTPS.
 */
export default function RegistroCacheImagenes() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registrar = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch {
        // La web sigue funcionando aunque el navegador no habilite SW.
      }
    };

    registrar();
  }, []);

  return null;
}
