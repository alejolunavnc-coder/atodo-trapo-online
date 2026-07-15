"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Armchair,
  Check,
  Grid2X2,
  Home,
  Layers3,
  Minus,
  PaintBucket,
  Plus,
  Ruler,
  Trash2,
  Warehouse,
  Waves,
} from "lucide-react";
import MobileHeaderCompartido from "./MobileHeaderCompartido";
import type { Producto } from "@/src/types/producto";
import CalculadoraPaso2, {type DatosPasoDos,} from "./CalculadoraPaso2";

type CalculadoraPinturaProps = {
  onVolver: () => void;
  onVolverInicio: () => void;
  onAbrirMenu?: () => void;
  onAbrirCarrito?: () => void;
  onContinuar?: (datos: DatosPasoUno) => void;
  cantidadCarrito?: number;
  productos: Producto[];
  onAgregarAlCarrito: (
    items: Array<{
      producto: Producto;
      cantidad: number;
    }>
  ) => void;
  onFinalizado: () => void;
};

type GrupoCalculadora =
  | "Interior"
  | "Exterior"
  | "Madera"
  | "Metal"
  | "Pisos"
  | "Piscina"
  | "Pisos atérmicos"
  | "Texturado";

type Superficie = {
  id: number;
  ancho: string;
  alto: string;
};

type Descuento = {
  id: number;
  nombre: string;
  ancho: string;
  alto: string;
};

export type DatosPasoUno = {
  grupo: GrupoCalculadora;
  aplicacion: string;
  superficieTotal: number;
  descuentosTotal: number;
  superficieNeta: number;
  superficies: Superficie[];
  descuentos: Descuento[];
};

const GRUPOS: GrupoCalculadora[] = [
  "Interior",
  "Exterior",
  "Madera",
  "Metal",
  "Pisos",
  "Piscina",
  "Pisos atérmicos",
  "Texturado",
];

const APLICACIONES: Record<GrupoCalculadora, string[]> = {
  Interior: [],

  Exterior: [
    "Frente / Fachada",
    "Pared exterior",
    "Techo",
    "Terraza / Azotea",
    "Muro",
  ],

  Madera: [
    "Aberturas",
    "Pared exterior",
    "Pared interior",
    "Mueble",
    "Cerco",
  ],

  Metal: ["Rejas", "Portón", "Puerta", "Estructura"],

  Pisos: ["Tránsito pesado", "Alto tránsito"],

  Piscina: ["Piscina de cemento", "Piscina de fibra"],

  "Pisos atérmicos": [],

  Texturado: ["Rodillable", "Mediano", "Grueso"],
};

function normalizarTextoCalculadora(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function palabrasClaveCalculadora(valor: unknown) {
  return normalizarTextoCalculadora(valor)
    .split(/[^a-z0-9]+/)
    .filter((palabra) => palabra.length >= 3);
}

function coincideCalculadora(
  textoProducto: unknown,
  textoBuscado: unknown
) {
  const palabrasProducto =
    palabrasClaveCalculadora(textoProducto);

  const palabrasBuscadas =
    palabrasClaveCalculadora(textoBuscado);

  return palabrasBuscadas.some((palabra) =>
    palabrasProducto.includes(palabra)
  );
}

function productoDisponibleCalculadora(producto: Producto) {
  return normalizarTextoCalculadora(producto.Stock) !== "x";
}

function convertirNumero(valor: string) {
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) ? numero : 0;
}

function formatearDecimal(valor: number) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function etiquetasMedidas(
  grupo: GrupoCalculadora | null,
  aplicacion: string
) {
  const usaLados =
    grupo === "Pisos" ||
    grupo === "Pisos atérmicos" ||
    aplicacion === "Techo" ||
    aplicacion === "Terraza / Azotea";

  return usaLados
    ? {
        primera: "Lado 1 (m)",
        segunda: "Lado 2 (m)",
      }
    : {
        primera: "Ancho (m)",
        segunda: "Alto (m)",
      };
}

function nombreSuperficie(
  grupo: GrupoCalculadora | null,
  aplicacion: string,
  indice: number
) {
  const numero = indice + 1;

  if (aplicacion) {
    return `${aplicacion} ${numero}`;
  }

  if (grupo) {
    return `${grupo} ${numero}`;
  }

  return `Superficie ${numero}`;
}

export default function CalculadoraPintura({
  onVolver,
  onVolverInicio,
  onAbrirMenu,
  onAbrirCarrito,
  onContinuar,
  cantidadCarrito = 0,
  productos,
  onAgregarAlCarrito,
  onFinalizado,
}: CalculadoraPinturaProps) {

  const aplicacionRef = useRef<HTMLElement | null>(null);
  const superficiesRef = useRef<HTMLElement | null>(null);

  const [pasoActual, setPasoActual] = useState<1 | 2>(1);
  const [datosPasoUno, setDatosPasoUno] =
  useState<DatosPasoUno | null>(null);

  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState<GrupoCalculadora | null>(null);

  const [aplicacionSeleccionada, setAplicacionSeleccionada] =
    useState("");

  const [superficies, setSuperficies] = useState<Superficie[]>([
    {
      id: 1,
      ancho: "",
      alto: "",
    },
  ]);

  const [descuentos, setDescuentos] = useState<Descuento[]>([]);

  const gruposDisponibles = GRUPOS;

  const aplicacionesDisponibles = grupoSeleccionado
    ? APLICACIONES[grupoSeleccionado]
    : [];

  const necesitaAplicacion =
    grupoSeleccionado !== null && aplicacionesDisponibles.length > 0;

  const aplicacionFinal =
    grupoSeleccionado &&
    aplicacionesDisponibles.length === 0
      ? grupoSeleccionado
      : aplicacionSeleccionada;

  const superficieTotal = useMemo(() => {
    return superficies.reduce((total, superficie) => {
      const ancho = convertirNumero(superficie.ancho);
      const alto = convertirNumero(superficie.alto);

      return total + ancho * alto;
    }, 0);
  }, [superficies]);

  const descuentosTotal = useMemo(() => {
    return descuentos.reduce((total, descuento) => {
      const ancho = convertirNumero(descuento.ancho);
      const alto = convertirNumero(descuento.alto);

      return total + ancho * alto;
    }, 0);
  }, [descuentos]);

  const superficieNeta = Math.max(
    superficieTotal - descuentosTotal,
    0
  );

  const seleccionCompleta =
    grupoSeleccionado !== null &&
    (!necesitaAplicacion || aplicacionSeleccionada !== "");

  const medidasCompletas =
    superficies.length > 0 &&
    superficies.every(
      (superficie) =>
        convertirNumero(superficie.ancho) > 0 &&
        convertirNumero(superficie.alto) > 0
    );

  const puedeContinuar =
    seleccionCompleta &&
    medidasCompletas &&
    superficieNeta > 0;

  const faltaGrupo = grupoSeleccionado === null;

  const faltaAplicacion =
    grupoSeleccionado !== null &&
    necesitaAplicacion &&
    aplicacionSeleccionada === "";

  const faltaMedidas =
    seleccionCompleta &&
    !medidasCompletas;

  const mostrarGuiaDescuentos =
    seleccionCompleta &&
    medidasCompletas &&
    descuentos.length === 0;

  const primerDescuentoIncompleto = descuentos.findIndex(
    (descuento) =>
      descuento.nombre.trim() === "" ||
      convertirNumero(descuento.ancho) <= 0 ||
      convertirNumero(descuento.alto) <= 0
  );

  const hayDescuentoIncompleto =
    primerDescuentoIncompleto >= 0;

  function desplazarA(
    referencia: React.RefObject<HTMLElement | null>
  ) {
    window.setTimeout(() => {
      referencia.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }

  function seleccionarGrupo(grupo: GrupoCalculadora) {
    setGrupoSeleccionado(grupo);
    setAplicacionSeleccionada("");

    setSuperficies([
      {
        id: Date.now(),
        ancho: "",
        alto: "",
      },
    ]);

    setDescuentos([]);

    if (APLICACIONES[grupo].length > 0) {
      desplazarA(aplicacionRef);
    } else {
      desplazarA(superficiesRef);
    }
  }

  function seleccionarAplicacion(aplicacion: string) {
    setAplicacionSeleccionada(aplicacion);
    desplazarA(superficiesRef);
  }

  function actualizarSuperficie(
    id: number,
    campo: "ancho" | "alto",
    valor: string
  ) {
    setSuperficies((actuales) =>
      actuales.map((superficie) =>
        superficie.id === id
          ? {
              ...superficie,
              [campo]: valor,
            }
          : superficie
      )
    );
  }

  function agregarSuperficie() {
    setSuperficies((actuales) => [
      ...actuales,
      {
        id: Date.now(),
        ancho: "",
        alto: "",
      },
    ]);
  }

  function eliminarSuperficie(id: number) {
    setSuperficies((actuales) => {
      if (actuales.length === 1) {
        return actuales;
      }

      return actuales.filter(
        (superficie) => superficie.id !== id
      );
    });
  }

  function agregarDescuento() {
    setDescuentos((actuales) => [
      ...actuales,
      {
        id: Date.now(),
        nombre: "",
        ancho: "",
        alto: "",
      },
    ]);
  }

  function actualizarDescuento(
    id: number,
    campo: "nombre" | "ancho" | "alto",
    valor: string
  ) {
    setDescuentos((actuales) =>
      actuales.map((descuento) =>
        descuento.id === id
          ? {
              ...descuento,
              [campo]: valor,
            }
          : descuento
      )
    );
  }

  function eliminarDescuento(id: number) {
    setDescuentos((actuales) =>
      actuales.filter((descuento) => descuento.id !== id)
    );
  }

  function continuar() {
  if (
    !puedeContinuar ||
    !grupoSeleccionado ||
    !aplicacionFinal
  ) {
    return;
  }

  const datos: DatosPasoUno = {
    grupo: grupoSeleccionado,
    aplicacion: aplicacionFinal,
    superficieTotal,
    descuentosTotal,
    superficieNeta,
    superficies,
    descuentos,
  };

  setDatosPasoUno(datos);
  setPasoActual(2);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  onContinuar?.(datos);
}

if (pasoActual === 2 && datosPasoUno) {
  return (
    <CalculadoraPaso2
      datosPasoUno={datosPasoUno}
      productos={productos}
      cantidadCarrito={cantidadCarrito}
      onVolverPaso={() => {
        setPasoActual(1);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      onContinuar={(datosPasoDos: DatosPasoDos) => {
        console.log("Datos del Paso 2:", datosPasoDos);
      }}
      onAgregarAlCarrito={onAgregarAlCarrito}
      onFinalizado={onFinalizado}
      onVolverInicio={onVolverInicio}
      onAbrirMenu={onAbrirMenu}
      onAbrirCarrito={onAbrirCarrito}
    />
  );
}

  return (
    <main className="min-h-screen bg-[#F7F9FC] pb-44 text-[#081B43]">
      

      {/* [Header compartido] */}

<MobileHeaderCompartido
  cantidadCarrito={cantidadCarrito}
  onAbrirMenu={onAbrirMenu}
  onAbrirCarrito={onAbrirCarrito}
  onVolverInicio={onVolverInicio}
  mostrarBeneficios={true}
/>

{/* [Título] */}

      <section className="bg-white px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#F8A400] shadow-[0_7px_18px_rgba(248,164,0,0.24)]">
            <PaintBucket
              size={28}
              strokeWidth={2.2}
              className="text-[#081B43]"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-[22px] font-black leading-tight tracking-[-0.04em] text-[#081B43]">
              Calculadora de pintura
            </h1>

            <p className="mt-0.5 text-[11px] font-medium text-gray-500">
              Calculá cuántos litros necesitás
            </p>
          </div>
        </div>
      </section>

      {/* [Progreso] */}

      <section className="bg-white px-6 pb-5 pt-2">
        <div className="flex items-start">
          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8A400] text-[13px] font-black text-[#081B43]">
              1
            </div>

            <span className="mt-1 text-[10px] font-black text-[#081B43]">
              Medidas
            </span>
          </div>

          <div className="mt-4 h-[2px] flex-1 bg-gray-200" />

          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[13px] font-black text-gray-500">
              2
            </div>

            <span className="mt-1 text-[10px] font-bold text-gray-500">
              Pintura
            </span>
          </div>

          <div className="mt-4 h-[2px] flex-1 bg-gray-200" />

          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[13px] font-black text-gray-500">
              3
            </div>

            <span className="mt-1 text-[10px] font-bold text-gray-500">
              Resultado
            </span>
          </div>
        </div>
      </section>

      <div className="space-y-3 px-3 pt-3">
        {/* [Grupo principal] */}

        <section
          className={`rounded-[22px] border bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)] transition ${
            faltaGrupo
              ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/25"
              : "border-gray-100"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <PaintBucket
              size={19}
              strokeWidth={2.3}
              className="text-[#F8A400]"
            />

            <h2 className="text-[15px] font-black tracking-[-0.025em] text-[#081B43]">
              ¿Qué vas a pintar?
            </h2>

            {faltaGrupo && (
              <span className="ml-auto rounded-full bg-[#EAF8EC] px-2 py-1 text-[8px] font-black text-[#16813A]">
                Empezá acá
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {gruposDisponibles.map((grupo) => {
              const activo = grupoSeleccionado === grupo;

              return (
                <button
                  key={grupo}
                  type="button"
                  onClick={() => seleccionarGrupo(grupo)}
                  className={`relative flex min-h-[74px] flex-col items-center justify-center gap-1 rounded-[15px] border px-1.5 py-2 text-center transition active:scale-95 ${
                    activo
                      ? "border-[#123A72] bg-[#F7FAFF] ring-1 ring-[#123A72]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {activo && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#123A72] text-white">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}

                  <IconoGrupo grupo={grupo} />

                  <span className="text-[9px] font-black leading-tight text-[#081B43]">
                    {grupo}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* [Aplicación específica] */}

        {grupoSeleccionado && necesitaAplicacion && (
          <section
            ref={aplicacionRef}
            className={`scroll-mt-3 rounded-[22px] border bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)] transition ${
              faltaAplicacion
                ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/25"
                : "border-gray-100"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Layers3
                size={19}
                strokeWidth={2.3}
                className="text-[#F8A400]"
              />

              <h2 className="text-[14px] font-black tracking-[-0.02em] text-[#081B43]">
                ¿Qué parte de{" "}
                {grupoSeleccionado.toLowerCase()} vas a pintar?
              </h2>

              {faltaAplicacion && (
                <span className="ml-auto rounded-full bg-[#EAF8EC] px-2 py-1 text-[8px] font-black text-[#16813A]">
                  Seguí acá
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {aplicacionesDisponibles.map((aplicacion) => {
                const activa =
                  aplicacionSeleccionada === aplicacion;

                return (
                  <button
                    key={aplicacion}
                    type="button"
                    onClick={() =>
                      seleccionarAplicacion(aplicacion)
                    }
                    className={`relative flex min-h-[52px] items-center justify-center rounded-[14px] border px-3 py-2 text-center transition active:scale-95 ${
                      activa
                        ? "border-[#123A72] bg-[#F7FAFF] ring-1 ring-[#123A72]"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {activa && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#123A72] text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}

                    <span className="pr-2 text-[10px] font-black leading-tight text-[#081B43]">
                      {aplicacion}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* [Superficies] */}

        {seleccionCompleta && (
          <section
            ref={superficiesRef}
            className={`scroll-mt-3 rounded-[22px] border bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)] transition ${
              faltaMedidas
                ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/25"
                : "border-gray-100"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Ruler
                size={19}
                strokeWidth={2.3}
                className="text-[#F8A400]"
              />

              <h2 className="text-[15px] font-black tracking-[-0.025em] text-[#081B43]">
                Superficies a pintar
              </h2>

              {faltaMedidas && (
                <span className="ml-auto rounded-full bg-[#EAF8EC] px-2 py-1 text-[8px] font-black text-[#16813A]">
                  Completá acá
                </span>
              )}
            </div>

            <div className="space-y-3">
              {superficies.map((superficie, indice) => {
                const metros =
                  convertirNumero(superficie.ancho) *
                  convertirNumero(superficie.alto);

                const etiquetas = etiquetasMedidas(
                  grupoSeleccionado,
                  aplicacionFinal
                );

                const primerIndiceIncompleto =
                  superficies.findIndex(
                    (item) =>
                      convertirNumero(item.ancho) <= 0 ||
                      convertirNumero(item.alto) <= 0
                  );

                const esSuperficieSiguiente =
                  faltaMedidas &&
                  indice === primerIndiceIncompleto;

                const faltaAncho =
                  esSuperficieSiguiente &&
                  convertirNumero(superficie.ancho) <= 0;

                const faltaAlto =
                  esSuperficieSiguiente &&
                  !faltaAncho &&
                  convertirNumero(superficie.alto) <= 0;

                return (
                  <div
                    key={superficie.id}
                    className={`rounded-[17px] border bg-white p-3 transition ${
                      esSuperficieSiguiente
                        ? "border-[#1F9D55] bg-[#F4FCF7] ring-1 ring-[#1F9D55]/25"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-black text-[#081B43]">
                        {nombreSuperficie(
                          grupoSeleccionado,
                          aplicacionFinal,
                          indice
                        )}
                      </p>

                      {superficies.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarSuperficie(superficie.id)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#123A72] transition active:scale-90"
                          aria-label="Eliminar superficie"
                        >
                          <Trash2 size={15} strokeWidth={2.3} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-[9px] font-bold text-gray-500">
                          {etiquetas.primera}
                        </span>

                        <input
                          type="text"
                          inputMode="decimal"
                          value={superficie.ancho}
                          onChange={(evento) =>
                            actualizarSuperficie(
                              superficie.id,
                              "ancho",
                              evento.target.value
                            )
                          }
                          placeholder="0"
                          className={`h-11 w-full rounded-[12px] border bg-white px-3 text-[16px] font-bold text-[#081B43] outline-none transition ${
                            faltaAncho
                              ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/20"
                              : "border-gray-200 focus:border-[#F8A400] focus:ring-2 focus:ring-[#F8A400]/20"
                          }`}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[9px] font-bold text-gray-500">
                          {etiquetas.segunda}
                        </span>

                        <input
                          type="text"
                          inputMode="decimal"
                          value={superficie.alto}
                          onChange={(evento) =>
                            actualizarSuperficie(
                              superficie.id,
                              "alto",
                              evento.target.value
                            )
                          }
                          placeholder="0"
                          className={`h-11 w-full rounded-[12px] border bg-white px-3 text-[16px] font-bold text-[#081B43] outline-none transition ${
                            faltaAlto
                              ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/20"
                              : "border-gray-200 focus:border-[#F8A400] focus:ring-2 focus:ring-[#F8A400]/20"
                          }`}
                        />
                      </label>
                    </div>

                    <p className="mt-2 text-[10px] font-medium text-gray-500">
                      Superficie:{" "}
                      <span className="font-black text-[#123A72]">
                        {formatearDecimal(metros)} m²
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={agregarSuperficie}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#123A72]/60 bg-[#F7FAFF] text-[11px] font-black text-[#123A72] transition active:scale-[0.98]"
            >
              <Plus size={17} strokeWidth={2.5} />
              Agregar otra superficie
            </button>
          </section>
        )}

        {/* [Descuentos] */}

        {seleccionCompleta && (
          <section
            className={`rounded-[22px] border bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)] transition ${
              mostrarGuiaDescuentos || hayDescuentoIncompleto
                ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/25"
                : "border-gray-100"
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <Minus
                size={19}
                strokeWidth={2.3}
                className="text-[#F8A400]"
              />

              <h2 className="text-[15px] font-black tracking-[-0.025em] text-[#081B43]">
                Descontar zonas
              </h2>

              {(mostrarGuiaDescuentos || hayDescuentoIncompleto) && (
                <span className="ml-auto rounded-full bg-[#EAF8EC] px-2 py-1 text-[8px] font-black text-[#16813A]">
                  {hayDescuentoIncompleto ? "Completá acá" : "Opcional"}
                </span>
              )}
            </div>

            <p className="mb-3 text-[9px] font-medium text-gray-500">
              Opcional: puertas, ventanas, vidrios u otras zonas que
              no se van a pintar.
            </p>

            {descuentos.length > 0 && (
              <div className="space-y-3">
                {descuentos.map((descuento, indice) => {
                  const metros =
                    convertirNumero(descuento.ancho) *
                    convertirNumero(descuento.alto);

                  const esDescuentoSiguiente =
                    indice === primerDescuentoIncompleto;

                  const faltaNombreDescuento =
                    esDescuentoSiguiente &&
                    descuento.nombre.trim() === "";

                  const faltaAnchoDescuento =
                    esDescuentoSiguiente &&
                    !faltaNombreDescuento &&
                    convertirNumero(descuento.ancho) <= 0;

                  const faltaAltoDescuento =
                    esDescuentoSiguiente &&
                    !faltaNombreDescuento &&
                    !faltaAnchoDescuento &&
                    convertirNumero(descuento.alto) <= 0;

                  return (
                    <div
                      key={descuento.id}
                      className={`rounded-[17px] border bg-white p-3 transition ${
                        esDescuentoSiguiente
                          ? "border-[#1F9D55] bg-[#F4FCF7] ring-1 ring-[#1F9D55]/25"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[12px] font-black text-[#081B43]">
                          Zona {indice + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarDescuento(descuento.id)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#123A72] transition active:scale-90"
                          aria-label="Eliminar zona"
                        >
                          <Trash2 size={15} strokeWidth={2.3} />
                        </button>
                      </div>

                      <label className="mb-2 block">
                        <span className="mb-1 block text-[9px] font-bold text-gray-500">
                          Nombre
                        </span>

                        <input
                          type="text"
                          value={descuento.nombre}
                          onChange={(evento) =>
                            actualizarDescuento(
                              descuento.id,
                              "nombre",
                              evento.target.value
                            )
                          }
                          placeholder="Ejemplo: ventana"
                          className={`h-10 w-full rounded-[12px] border bg-white px-3 text-[16px] font-bold text-[#081B43] outline-none transition ${
                            faltaNombreDescuento
                              ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/20"
                              : "border-gray-200 focus:border-[#F8A400] focus:ring-2 focus:ring-[#F8A400]/20"
                          }`}
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="mb-1 block text-[9px] font-bold text-gray-500">
                            Ancho (m)
                          </span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={descuento.ancho}
                            onChange={(evento) =>
                              actualizarDescuento(
                                descuento.id,
                                "ancho",
                                evento.target.value
                              )
                            }
                            placeholder="0"
                            className={`h-10 w-full rounded-[12px] border bg-white px-3 text-[16px] font-bold text-[#081B43] outline-none transition ${
                              faltaAnchoDescuento
                                ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/20"
                                : "border-gray-200 focus:border-[#F8A400] focus:ring-2 focus:ring-[#F8A400]/20"
                            }`}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[9px] font-bold text-gray-500">
                            Alto (m)
                          </span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={descuento.alto}
                            onChange={(evento) =>
                              actualizarDescuento(
                                descuento.id,
                                "alto",
                                evento.target.value
                              )
                            }
                            placeholder="0"
                            className={`h-10 w-full rounded-[12px] border bg-white px-3 text-[16px] font-bold text-[#081B43] outline-none transition ${
                              faltaAltoDescuento
                                ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/20"
                                : "border-gray-200 focus:border-[#F8A400] focus:ring-2 focus:ring-[#F8A400]/20"
                            }`}
                          />
                        </label>
                      </div>

                      <p className="mt-2 text-[10px] font-medium text-gray-500">
                        Se descuentan:{" "}
                        <span className="font-black text-[#123A72]">
                          {formatearDecimal(metros)} m²
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={agregarDescuento}
              className={`mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed text-[11px] font-black transition active:scale-[0.98] ${
                mostrarGuiaDescuentos
                  ? "border-[#1F9D55] bg-[#EAF8EC] text-[#16813A]"
                  : "border-[#123A72]/60 bg-[#F7FAFF] text-[#123A72]"
              }`}
            >
              <Plus size={17} strokeWidth={2.5} />
              Agregar zona
            </button>
          </section>
        )}

        {/* [Resumen] */}

        {seleccionCompleta && (
          <section className="overflow-hidden rounded-[22px] border border-gray-100 bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)]">
            <div className="mb-3 flex items-center gap-2">
              <Grid2X2
                size={19}
                strokeWidth={2.3}
                className="text-[#F8A400]"
              />

              <h2 className="text-[15px] font-black tracking-[-0.025em] text-[#081B43]">
                Resumen
              </h2>
            </div>

            <div className="overflow-hidden rounded-[15px] border border-gray-100">
              <FilaResumen
                etiqueta="Grupo"
                valor={grupoSeleccionado ?? "—"}
              />

              <FilaResumen
                etiqueta="Aplicación"
                valor={aplicacionFinal || "—"}
              />

              <FilaResumen
                etiqueta="Superficie total"
                valor={`${formatearDecimal(superficieTotal)} m²`}
              />

              <FilaResumen
                etiqueta="Descuentos"
                valor={`-${formatearDecimal(descuentosTotal)} m²`}
              />

              <div className="flex items-center justify-between bg-[#FFF3D3] px-3 py-3">
                <span className="text-[12px] font-black text-[#081B43]">
                  Superficie neta
                </span>

                <span className="text-[17px] font-black text-[#081B43]">
                  {formatearDecimal(superficieNeta)} m²
                </span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* [Botón flotante Volver] */}

<button
  type="button"
  onClick={onVolver}
  className="fixed bottom-[96px] right-4 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#123A72]/90 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-sm transition active:scale-90"
  aria-label="Volver al catálogo"
>
  <ArrowLeft size={25} strokeWidth={2.7} />
</button>

      {/* [Botón continuar] */}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 px-3 pb-3 pt-2 backdrop-blur">
        <button
          type="button"
          onClick={continuar}
          disabled={!puedeContinuar}
          className={`flex h-[54px] w-full items-center justify-center gap-3 rounded-[18px] text-[15px] font-black shadow-[0_8px_22px_rgba(0,0,0,0.12)] transition active:scale-[0.98] ${
            puedeContinuar
              ? "bg-[#1F9D55] text-white shadow-[0_8px_22px_rgba(31,157,85,0.28)]"
              : "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
          }`}
        >
          Continuar
          <ArrowRight size={22} strokeWidth={2.5} />
        </button>
      </div>
    </main>
  );
}

function FilaResumen({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0">
      <span className="text-[10px] font-medium text-gray-500">
        {etiqueta}
      </span>

      <span className="max-w-[60%] text-right text-[10px] font-black text-[#081B43]">
        {valor}
      </span>
    </div>
  );
}

function IconoGrupo({
  grupo,
}: {
  grupo: GrupoCalculadora;
}) {
  const clases = "text-[#123A72]";

  if (grupo === "Interior") {
    return (
      <Armchair
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  if (grupo === "Exterior") {
    return (
      <Home
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  if (grupo === "Madera") {
    return (
      <Layers3
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  if (grupo === "Metal") {
    return (
      <Warehouse
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  if (grupo === "Pisos") {
    return (
      <Grid2X2
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  if (grupo === "Piscina") {
    return (
      <Waves
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  if (grupo === "Texturado") {
    return (
      <PaintBucket
        size={25}
        strokeWidth={2}
        className={clases}
      />
    );
  }

  return (
    <Layers3
      size={25}
      strokeWidth={2}
      className={clases}
    />
  );
}