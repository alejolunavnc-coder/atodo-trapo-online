"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronRight,
  Clock3,
  Ellipsis,
  HousePlus,
  Info,
  X,
} from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";
import useInstalacionPWA from "./useInstalacionPWA";

// [Tipos]

type NavegadorDetectado = "safari" | "chrome" | "otro";

// [Ícono Compartir de iPhone]

function IconoCompartirIOS({
  size = 26,
}: {
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
    >
      <path
        d="M16 4V19"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M10.5 9.5L16 4L21.5 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M11 13H8.5C7.12 13 6 14.12 6 15.5V25.5C6 26.88 7.12 28 8.5 28H23.5C24.88 28 26 26.88 26 25.5V15.5C26 14.12 24.88 13 23.5 13H21"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// [Detector de navegador]

function detectarNavegador(): NavegadorDetectado {
  if (typeof navigator === "undefined") {
    return "otro";
  }

  const agente = navigator.userAgent;

  // Chrome en iPhone o iPad
  if (/CriOS/i.test(agente)) {
    return "chrome";
  }

  // Chrome en Android, Windows u otros dispositivos
  if (
    /Chrome|Chromium/i.test(agente) &&
    !/Edg|OPR/i.test(agente)
  ) {
    return "chrome";
  }

  // Safari real
  if (
    /Safari/i.test(agente) &&
    !/CriOS|Chrome|Chromium|Edg|OPR|FxiOS/i.test(agente)
  ) {
    return "safari";
  }

  return "otro";
}

// [Componente]

export default function BotonInstalarWeb() {
  const {
    instalar,
    instalada,
    esDispositivoAndroid,
    puedeInstalar,
    estado,
  } = useInstalacionPWA();

  // [Estados]

  const [guiaIPhoneAbierta, setGuiaIPhoneAbierta] =
    useState(false);

  const [navegadorDetectado, setNavegadorDetectado] =
    useState<NavegadorDetectado>("otro");

  // [Service Worker]

  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error(
          "No se pudo registrar el service worker:",
          error,
        );
      });
    }
  }, []);

  // [Bloquear scroll al abrir la guía]

  useEffect(() => {
    if (!guiaIPhoneAbierta) {
      return;
    }

    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [guiaIPhoneAbierta]);

  if (instalada) {
    return null;
  }

  // [Datos Android]

  const textoAndroid =
    estado === "instalando"
      ? "Abriendo..."
      : puedeInstalar
        ? "Agregar acceso directo"
        : "Agregar acceso directo";

  // [Datos del navegador detectado]

  const esChrome = navegadorDetectado === "chrome";
  const esSafari = navegadorDetectado === "safari";

  const nombreNavegador = esChrome
    ? "Chrome"
    : esSafari
      ? "Safari"
      : "Tu navegador";

  const iconoNavegador = esChrome
    ? "/navegadores/chrome.png"
    : esSafari
      ? "/navegadores/safari.png"
      : null;

  const textoPasoDos = esChrome
    ? "Agregar a pantalla principal"
    : "Agregar a Inicio";

  const descripcionCompartir = esChrome
    ? "Buscá el botón Compartir junto a la barra de direcciones."
    : esSafari
      ? "Buscá el ícono del cuadrado con la flecha hacia arriba."
      : "Buscá el botón Compartir en la barra del navegador.";

  const ayudaCompartir = esChrome
    ? "Si no lo ves, tocá el menú ••• y buscá la opción Compartir."
    : esSafari
      ? "Si no lo ves, tocá Más ••• y después Compartir."
      : "Si no aparece, abrí el menú ••• y buscá Compartir.";

  // [Funciones]

  const abrirGuiaIPhone = () => {
    setNavegadorDetectado(detectarNavegador());
    setGuiaIPhoneAbierta(true);
  };

  const cerrarGuiaIPhone = () => {
    setGuiaIPhoneAbierta(false);
  };

  const manejarAndroid = async () => {
    if (!esDispositivoAndroid || estado === "instalando") {
      return;
    }

    await instalar();
  };

  return (
    <>
      {/* [Cartel de instalación] */}

      <section className="px-4 pt-1 pb-2">
        <div className="relative overflow-hidden rounded-[22px] bg-[#062C5E] px-3.5 py-3 shadow-[0_10px_26px_rgba(6,44,94,0.22)]">
          {/* Decoración del fondo */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute -right-7 top-1 h-32 w-32 rounded-full border border-white/[0.05]" />
          <div className="pointer-events-none absolute right-5 top-8 h-20 w-20 rounded-full border border-white/[0.04]" />

          <div className="relative z-10">
            {/* Encabezado */}

            <div className="flex items-start gap-1">
              <div className="relative -ml-1 -mt-1 h-[96px] w-[112px] shrink-0">
                <Image
                  src="/instalacion/telefono-instalar-v2.png"
                  alt="Instalar acceso directo"
                  fill
                  className="object-contain"
                  priority
                />

                {/* Brillitos */}

                <div className="pointer-events-none absolute left-[12px] top-[18px] h-[8px] w-[8px] rotate-45 rounded-[1px] bg-white/95 shadow-[0_0_10px_rgba(255,255,255,0.45)]" />

                <div className="pointer-events-none absolute left-[18px] top-[28px] h-[3px] w-[3px] rounded-full bg-white/90" />

                <div className="pointer-events-none absolute right-[24px] top-[8px] h-[7px] w-[7px] rotate-45 rounded-[1px] bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.35)]" />

                <div className="pointer-events-none absolute right-[14px] top-[16px] h-[3px] w-[3px] rounded-full bg-[#FFB400]" />

                <div className="pointer-events-none absolute right-[8px] top-[10px] h-[4px] w-[4px] rounded-full bg-[#FFB400]/90" />

                <div className="pointer-events-none absolute left-[10px] bottom-[15px] h-[6px] w-[6px] rotate-45 rounded-[1px] bg-white/85 shadow-[0_0_8px_rgba(255,255,255,0.28)]" />

                <div className="pointer-events-none absolute left-[22px] bottom-[10px] h-[3px] w-[3px] rounded-full bg-[#FFB400]/85" />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <h2 className="text-[18px] font-black leading-[1.02] tracking-[-0.035em] text-white">
                  <span className="text-[#FFB400]">
                    Instalá
                  </span>{" "}
                  nuestra web
                </h2>

                <p className="mt-1 max-w-[225px] text-[11px] font-medium leading-[1.28] text-white/85">
                  Agregala a tu pantalla de inicio y accedé más rápido.
                </p>

                <p className="mt-1 text-[9px] font-semibold leading-[1.25] text-white/60">
                  Convertí la web en una app más en tu dispositivo.
                </p>
              </div>
            </div>

            {/* Botones */}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={manejarAndroid}
                disabled={
                  estado === "instalando" ||
                  !esDispositivoAndroid
                }
                aria-label="Agregar A Todo Trapo a la pantalla de inicio en Android"
                className="flex h-[48px] min-w-0 items-center rounded-[11px] bg-[#FFB400] px-2 text-left text-[#082651] shadow-sm transition active:scale-[0.98] disabled:cursor-default"
              >
                <FaAndroid
                  size={18}
                  className="mr-1.5 shrink-0"
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-black leading-none">
                    Android
                  </span>

                  <span className="mt-1 block whitespace-nowrap text-[7px] font-bold leading-none">
                    {textoAndroid}
                  </span>
                </span>

                <ChevronRight
                  size={15}
                  strokeWidth={3}
                  className="ml-1 shrink-0"
                />
              </button>

              <button
                type="button"
                onClick={abrirGuiaIPhone}
                aria-label="Ver cómo agregar A Todo Trapo a un iPhone"
                className="flex h-[48px] min-w-0 items-center rounded-[11px] bg-white px-2 text-left text-[#082651] shadow-sm transition active:scale-[0.98]"
              >
                <FaApple
                  size={19}
                  className="mr-1.5 shrink-0"
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-black leading-none">
                    iPhone
                  </span>

                  <span className="mt-1 block whitespace-nowrap text-[7px] font-bold leading-none text-[#082651]/65">
                    Cómo agregarla
                  </span>
                </span>

                <ChevronRight
                  size={15}
                  strokeWidth={3}
                  className="ml-1 shrink-0"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* [Guía para iPhone] */}

      {guiaIPhoneAbierta && (
        <div
          onClick={cerrarGuiaIPhone}
          className="fixed inset-0 z-[180] flex items-end bg-black/55 backdrop-blur-[2px]"
        >
          <div
            onClick={(evento) => evento.stopPropagation()}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[30px] bg-white px-4 pt-3 pb-[calc(18px+env(safe-area-inset-bottom))] shadow-[0_-20px_55px_rgba(0,0,0,0.28)]"
          >
            {/* Línea superior */}

            <div className="mx-auto h-1.5 w-14 rounded-full bg-gray-300" />

            {/* Cerrar */}

            <button
              type="button"
              onClick={cerrarGuiaIPhone}
              aria-label="Cerrar instrucciones"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#082651] shadow-sm transition active:scale-95"
            >
              <X size={24} strokeWidth={2.4} />
            </button>

            {/* Encabezado */}

            <div className="mt-3 flex items-center gap-3 pr-12">
              <div className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-[#082651] shadow-[0_8px_20px_rgba(8,38,81,0.22)]">
                <Image
                  src="/icon-192.png"
                  alt="A Todo Trapo"
                  width={54}
                  height={54}
                  className="rounded-[15px] object-cover"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-[21px] font-black leading-tight tracking-[-0.04em] text-[#071426]">
                  Agregar a tu iPhone
                </h2>

                <p className="mt-1 text-[11px] font-semibold leading-tight text-gray-500">
                  Convertí la web en una app en tu dispositivo.
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[#123A72]">
                  <Clock3 size={14} strokeWidth={2.2} />

                  <span className="text-[10px] font-bold">
                    Te lleva menos de un minuto.
                  </span>
                </div>
              </div>
            </div>

            {/* Navegador detectado */}

            <div className="mt-4 flex justify-center">
              <div className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#F5F7FB] px-4 shadow-sm ring-1 ring-gray-200">
                {iconoNavegador ? (
                  <Image
                    src={iconoNavegador}
                    alt={nombreNavegador}
                    width={30}
                    height={30}
                    className="h-[30px] w-[30px] object-contain"
                  />
                ) : (
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#123A72] text-[15px] text-white">
                    🌐
                  </div>
                )}

                <span className="text-[12px] font-black text-[#123A72]">
                  {nombreNavegador}
                </span>
              </div>
            </div>

            {/* Paso 1 */}

            <div className="mt-4 rounded-[22px] bg-white p-3 shadow-[0_7px_22px_rgba(8,38,81,0.08)] ring-1 ring-gray-100">
              <div className="grid grid-cols-[38px_minmax(0,1fr)] gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#123A72] text-[15px] font-black text-white">
                  1
                </div>

                <div className="min-w-0">
                  <h3 className="text-[15px] font-black text-[#082651]">
                    Tocá Compartir
                  </h3>

                  <p className="mt-1 text-[11px] font-semibold leading-[1.4] text-gray-500">
                    {descripcionCompartir}
                  </p>

                  <p className="mt-1 text-[11px] font-bold leading-[1.4] text-[#123A72]">
                    {ayudaCompartir}
                  </p>

                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="flex min-h-[72px] flex-col items-center justify-center rounded-[16px] bg-[#F7F9FC] px-2 text-[#1267D6] ring-1 ring-gray-100">
                      <IconoCompartirIOS size={28} />

                      <span className="mt-1.5 text-[9px] font-black text-[#082651]">
                        Compartir
                      </span>
                    </div>

                    <span className="text-[12px] font-black text-gray-400">
                      o
                    </span>

                    <div className="flex min-h-[72px] flex-col items-center justify-center rounded-[16px] bg-[#F7F9FC] px-2 text-[#082651] ring-1 ring-gray-100">
                      <Ellipsis
                        size={30}
                        strokeWidth={2.5}
                      />

                      <span className="mt-1.5 text-[9px] font-black">
                        Menú
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 2 */}

            <div className="mt-2.5 rounded-[22px] bg-white p-3 shadow-[0_7px_22px_rgba(8,38,81,0.08)] ring-1 ring-gray-100">
              <div className="grid grid-cols-[38px_minmax(0,1fr)_48px] items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#123A72] text-[15px] font-black text-white">
                  2
                </div>

                <div>
                  <h3 className="text-[14px] font-black leading-tight text-[#082651]">
                    Elegí {textoPasoDos}
                  </h3>

                  <p className="mt-1 text-[10px] font-semibold text-gray-500">
                    Buscalo en la lista de opciones.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F5F8FF] text-[#1267D6] shadow-sm ring-1 ring-blue-100">
                  <HousePlus size={25} strokeWidth={2.2} />
                </div>
              </div>
            </div>

            {/* Paso 3 */}

            <div className="mt-2.5 rounded-[22px] bg-white p-3 shadow-[0_7px_22px_rgba(8,38,81,0.08)] ring-1 ring-gray-100">
              <div className="grid grid-cols-[38px_minmax(0,1fr)_48px] items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#123A72] text-[15px] font-black text-white">
                  3
                </div>

                <div>
                  <h3 className="text-[14px] font-black text-[#082651]">
                    Tocá Agregar
                  </h3>

                  <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-500">
                    Y listo, la web queda en tu pantalla de inicio.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1677ED] text-white shadow-[0_8px_18px_rgba(22,119,237,0.25)]">
                  <Check size={28} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Aclaración */}

            <div className="mt-3 flex items-start gap-2 rounded-[18px] bg-[#F5F7FB] px-3 py-2.5 text-gray-500">
              <Info
                size={17}
                strokeWidth={2.2}
                className="mt-0.5 shrink-0 text-[#123A72]"
              />

              <p className="text-[10px] font-semibold leading-[1.4]">
                Los botones pueden aparecer arriba o abajo según tu versión de iPhone y la configuración del navegador.
              </p>
            </div>

            {/* Botón final */}

            <button
              type="button"
              onClick={cerrarGuiaIPhone}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#082F66] text-[14px] font-black text-white shadow-[0_10px_25px_rgba(8,47,102,0.25)] transition active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
