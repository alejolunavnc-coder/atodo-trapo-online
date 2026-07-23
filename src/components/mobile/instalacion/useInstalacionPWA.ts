"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function estaEnModoInstalado() {
  if (typeof window === "undefined") return false;

  const modoStandalone = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;

  const navegadorIOSStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as Navigator & {
        standalone?: boolean;
      }).standalone,
    );

  return modoStandalone || navegadorIOSStandalone;
}

function esAndroid() {
  if (typeof navigator === "undefined") return false;

  return /Android/i.test(navigator.userAgent);
}

export default function useInstalacionPWA() {
  const [eventoInstalacion, setEventoInstalacion] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [instalada, setInstalada] = useState(false);
  const [esDispositivoAndroid, setEsDispositivoAndroid] =
    useState(false);

  const [estado, setEstado] = useState<
    "esperando" | "disponible" | "instalando" | "instalada" | "no-disponible"
  >("esperando");

  useEffect(() => {
    setEsDispositivoAndroid(esAndroid());

    if (estaEnModoInstalado()) {
      setInstalada(true);
      setEstado("instalada");
      return;
    }

    const manejarBeforeInstallPrompt = (evento: Event) => {
      evento.preventDefault();

      const eventoPWA =
        evento as BeforeInstallPromptEvent;

      setEventoInstalacion(eventoPWA);
      setEstado("disponible");
    };

    const manejarAplicacionInstalada = () => {
      setInstalada(true);
      setEventoInstalacion(null);
      setEstado("instalada");
    };

    window.addEventListener(
      "beforeinstallprompt",
      manejarBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      manejarAplicacionInstalada,
    );

    const temporizador = window.setTimeout(() => {
      setEstado((estadoActual) =>
        estadoActual === "esperando"
          ? "no-disponible"
          : estadoActual,
      );
    }, 4000);

    return () => {
      window.clearTimeout(temporizador);

      window.removeEventListener(
        "beforeinstallprompt",
        manejarBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        manejarAplicacionInstalada,
      );
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!eventoInstalacion) {
      setEstado("no-disponible");
      return false;
    }

    try {
      setEstado("instalando");

      await eventoInstalacion.prompt();

      const eleccion =
        await eventoInstalacion.userChoice;

      setEventoInstalacion(null);

      if (eleccion.outcome === "accepted") {
        setEstado("instalada");
        setInstalada(true);
        return true;
      }

      setEstado("no-disponible");
      return false;
    } catch (error) {
      console.error(
        "No se pudo abrir la instalación:",
        error,
      );

      setEstado("no-disponible");
      return false;
    }
  }, [eventoInstalacion]);

  return {
    instalar,
    instalada,
    esDispositivoAndroid,
    puedeInstalar:
      Boolean(eventoInstalacion) &&
      !instalada &&
      esDispositivoAndroid,
    estado,
  };
}