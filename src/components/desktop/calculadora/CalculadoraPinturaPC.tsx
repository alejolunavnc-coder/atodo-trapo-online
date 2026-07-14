"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Armchair,
  Check,
  CircleCheck,
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

import type { Producto } from "@/src/types/producto";
import CalculadoraPaso2PC, {
  type DatosPasoDosPC,
} from "./CalculadoraPaso2PC";

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

export type DatosPasoUnoPC = {
  grupo: GrupoCalculadora;
  aplicacion: string;
  superficieTotal: number;
  descuentosTotal: number;
  superficieNeta: number;
  superficies: Superficie[];
  descuentos: Descuento[];
};

type CalculadoraPinturaPCProps = {
  productos: Producto[];
  onContinuar?: (datos: DatosPasoUnoPC) => void;
  onAgregarAlCarrito: (
    items: Array<{
      producto: Producto;
      cantidad: number;
    }>
  ) => void;
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

function iconoGrupo(grupo: GrupoCalculadora) {
  const props = {
    size: 22,
    strokeWidth: 2.2,
  };

  switch (grupo) {
    case "Interior":
      return <Home {...props} />;
    case "Exterior":
      return <Warehouse {...props} />;
    case "Madera":
      return <Armchair {...props} />;
    case "Metal":
      return <Grid2X2 {...props} />;
    case "Pisos":
      return <Layers3 {...props} />;
    case "Piscina":
      return <Waves {...props} />;
    case "Pisos atérmicos":
      return <Grid2X2 {...props} />;
    case "Texturado":
      return <PaintBucket {...props} />;
  }
}

export default function CalculadoraPinturaPC({
  productos,
  onContinuar,
  onAgregarAlCarrito,
}: CalculadoraPinturaPCProps) {
  const [pasoActual, setPasoActual] =
    useState<1 | 2>(1);

  const [cambiandoPaso, setCambiandoPaso] =
    useState(false);

  const [confirmandoPaso, setConfirmandoPaso] =
    useState(false);

  const [datosPasoUnoGuardados, setDatosPasoUnoGuardados] =
    useState<DatosPasoUnoPC | null>(null);
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

  const aplicacionRef = useRef<HTMLElement | null>(null);
  const medidasRef = useRef<HTMLElement | null>(null);
  const descuentosRef = useRef<HTMLElement | null>(null);

  const aplicacionesDisponibles = grupoSeleccionado
    ? APLICACIONES[grupoSeleccionado]
    : [];

  const necesitaAplicacion =
    grupoSeleccionado !== null &&
    aplicacionesDisponibles.length > 0;

  const aplicacionFinal =
    grupoSeleccionado &&
    aplicacionesDisponibles.length === 0
      ? grupoSeleccionado
      : aplicacionSeleccionada;

  const superficieTotal = useMemo(() => {
    return superficies.reduce((total, superficie) => {
      return (
        total +
        convertirNumero(superficie.ancho) *
          convertirNumero(superficie.alto)
      );
    }, 0);
  }, [superficies]);

  const descuentosTotal = useMemo(() => {
    return descuentos.reduce((total, descuento) => {
      return (
        total +
        convertirNumero(descuento.ancho) *
          convertirNumero(descuento.alto)
      );
    }, 0);
  }, [descuentos]);

  const superficieNeta = Math.max(
    superficieTotal - descuentosTotal,
    0
  );

  const puedeContinuar =
    grupoSeleccionado !== null &&
    (!necesitaAplicacion || aplicacionSeleccionada !== "") &&
    superficieNeta > 0;

  const etiquetas = etiquetasMedidas(
    grupoSeleccionado,
    aplicacionSeleccionada
  );

  const grupoCompleto = grupoSeleccionado !== null;

  const aplicacionCompleta =
    grupoSeleccionado !== null &&
    (!necesitaAplicacion || aplicacionSeleccionada !== "");

  const medidasCompletas =
    aplicacionCompleta &&
    superficies.every(
      (superficie) =>
        convertirNumero(superficie.ancho) > 0 &&
        convertirNumero(superficie.alto) > 0
    );

  const descuentosCompletos =
    descuentos.length > 0 &&
    descuentos.every(
      (descuento) =>
        convertirNumero(descuento.ancho) > 0 &&
        convertirNumero(descuento.alto) > 0
    );

  // [Sección activa]
  // El borde verde marca siempre el próximo dato a completar.
  // Las secciones ya terminadas conservan solamente la chapita "Completo".

  const grupoActivo = !grupoCompleto;

  const aplicacionActiva =
    grupoCompleto &&
    necesitaAplicacion &&
    !aplicacionCompleta;

  const medidasActivas =
    grupoCompleto &&
    aplicacionCompleta &&
    !medidasCompletas;

  const descuentosActivos =
    grupoCompleto &&
    aplicacionCompleta &&
    medidasCompletas;

  function moverSuaveA(
    referencia: React.RefObject<HTMLElement | null>
  ) {
    window.setTimeout(() => {
      const elemento = referencia.current;

      if (!elemento) {
        return;
      }

      const inicio = window.scrollY;

      const destino =
        elemento.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.58;

      const distancia = destino - inicio;
      const duracion = 850;
      const tiempoInicial = performance.now();

      const suavizar = (progreso: number) =>
        progreso < 0.5
          ? 4 * progreso * progreso * progreso
          : 1 -
            Math.pow(
              -2 * progreso + 2,
              3
            ) /
              2;

      function animar(tiempoActual: number) {
        const transcurrido =
          tiempoActual - tiempoInicial;

        const progreso = Math.min(
          transcurrido / duracion,
          1
        );

        window.scrollTo(
          0,
          inicio +
            distancia *
              suavizar(progreso)
        );

        if (progreso < 1) {
          window.requestAnimationFrame(
            animar
          );
        }
      }

      window.requestAnimationFrame(animar);
    }, 250);
  }

  useEffect(() => {
    if (!grupoSeleccionado) {
      return;
    }

    if (necesitaAplicacion) {
      moverSuaveA(aplicacionRef);
      return;
    }

    moverSuaveA(medidasRef);
  }, [grupoSeleccionado, necesitaAplicacion]);

  useEffect(() => {
    if (
      necesitaAplicacion &&
      aplicacionSeleccionada !== ""
    ) {
      moverSuaveA(medidasRef);
    }
  }, [
    aplicacionSeleccionada,
    necesitaAplicacion,
  ]);

  useEffect(() => {
    if (medidasCompletas) {
      moverSuaveA(descuentosRef);
    }
  }, [medidasCompletas]);

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
    setSuperficies((actuales) =>
      actuales.length === 1
        ? actuales
        : actuales.filter((superficie) => superficie.id !== id)
    );
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
    if (!puedeContinuar || !grupoSeleccionado) {
      return;
    }

    const datos: DatosPasoUnoPC = {
      grupo: grupoSeleccionado,
      aplicacion: aplicacionFinal,
      superficieTotal,
      descuentosTotal,
      superficieNeta,
      superficies,
      descuentos,
    };

    setConfirmandoPaso(true);

    window.setTimeout(() => {
      setCambiandoPaso(true);
    }, 520);

    window.setTimeout(() => {
      setDatosPasoUnoGuardados(datos);
      onContinuar?.(datos);
      setPasoActual(2);
      setCambiandoPaso(false);
      setConfirmandoPaso(false);
    }, 820);
  }

  if (pasoActual === 2 && datosPasoUnoGuardados) {
    return (
      <CalculadoraPaso2PC
        datosPasoUno={datosPasoUnoGuardados}
        productos={productos}
        onVolverPaso={() => {
          setPasoActual(1);

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
        onContinuar={(datosPasoDos: DatosPasoDosPC) => {
          console.log(
            "Datos del Paso 2 PC:",
            datosPasoDos
          );
        }}
        onAgregarAlCarrito={onAgregarAlCarrito}
      />
    );
  }

  return (
    <div
      className={`space-y-6 transition-all duration-300 ease-out ${
        cambiandoPaso
          ? "translate-y-2 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* [Pasos] */}

      <section className="rounded-[24px] border border-gray-200 bg-white px-8 py-5 shadow-sm">
        <div className="flex items-start">
          <Paso
            numero={1}
            titulo="Medidas"
            activo
          />

          <Linea activo />

          <Paso
            numero={2}
            titulo="Pintura"
          />

          <Linea />

          <Paso
            numero={3}
            titulo="Resultado"
          />
        </div>
      </section>

      {/* [Contenido] */}

      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
        <div className="space-y-6">
          {/* [Qué vas a pintar] */}

          <section
            className={`rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
              grupoActivo
                ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/15"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-blue-950">
                <PaintBucket size={23} strokeWidth={2.3} />
              </div>

              <div className="flex-1">
                <h2 className="text-[20px] font-black tracking-[-0.03em] text-blue-950">
                  ¿Qué vas a pintar?
                </h2>

                <p className="text-[13px] font-medium text-gray-500">
                  Elegí el tipo de superficie.
                </p>
              </div>

              {grupoCompleto && (
                <div className="flex items-center gap-1.5 rounded-full bg-[#EAF8EC] px-3 py-1.5 text-[11px] font-black text-[#16813A]">
                  <CircleCheck size={15} strokeWidth={2.6} />
                  Completo
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {GRUPOS.map((grupo) => {
                const activo = grupoSeleccionado === grupo;

                return (
                  <button
                    key={grupo}
                    type="button"
                    onClick={() => seleccionarGrupo(grupo)}
                    className={`group flex min-h-[94px] flex-col items-center justify-center gap-2 rounded-[18px] border px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      activo
                        ? "border-[#1F9D55] bg-[#EAF8EC] text-[#16813A] ring-2 ring-[#1F9D55]/20"
                        : "border-gray-200 bg-white text-slate-700"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        activo
                          ? "bg-[#1F9D55] text-white"
                          : "bg-blue-50 text-blue-950"
                      }`}
                    >
                      {iconoGrupo(grupo)}
                    </span>

                    <span className="text-[12px] font-black">
                      {grupo}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* [Aplicación] */}

          {grupoSeleccionado && necesitaAplicacion && (
            <section
              ref={aplicacionRef}
              className={`scroll-mt-28 rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
                aplicacionActiva
                  ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/15"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-black text-blue-950">
                    Elegí la aplicación
                  </h2>

                  <p className="mt-1 text-[12px] font-medium text-gray-500">
                    Seleccioná la opción que mejor describa el trabajo.
                  </p>
                </div>

                {aplicacionCompleta && (
                  <div className="flex items-center gap-1.5 rounded-full bg-[#EAF8EC] px-3 py-1.5 text-[11px] font-black text-[#16813A]">
                    <CircleCheck size={15} strokeWidth={2.6} />
                    Completo
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {aplicacionesDisponibles.map((aplicacion) => {
                  const activa =
                    aplicacionSeleccionada === aplicacion;

                  return (
                    <button
                      key={aplicacion}
                      type="button"
                      onClick={() =>
                        setAplicacionSeleccionada(aplicacion)
                      }
                      className={`rounded-full border px-4 py-2.5 text-[12px] font-black transition ${
                        activa
                          ? "border-[#1F9D55] bg-[#1F9D55] text-white shadow-sm"
                          : "border-gray-200 bg-white text-blue-950 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {aplicacion}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* [Medidas] */}

          {grupoSeleccionado &&
            (!necesitaAplicacion ||
              aplicacionSeleccionada !== "") && (
              <section
                ref={medidasRef}
                className={`scroll-mt-28 rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
                  medidasActivas
                    ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/15"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-950">
                      <Ruler size={22} strokeWidth={2.3} />
                    </div>

                    <div>
                      <h2 className="text-[18px] font-black text-blue-950">
                        Cargá las medidas
                      </h2>

                      <p className="text-[12px] font-medium text-gray-500">
                        Podés agregar todas las superficies que necesites.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {medidasCompletas && (
                      <div className="flex items-center gap-1.5 rounded-full bg-[#EAF8EC] px-3 py-1.5 text-[11px] font-black text-[#16813A]">
                        <CircleCheck size={15} strokeWidth={2.6} />
                        Completo
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={agregarSuperficie}
                    className="flex h-10 items-center gap-2 rounded-full bg-blue-950 px-4 text-[12px] font-black text-white transition hover:bg-blue-900"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Agregar superficie
                  </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {superficies.map((superficie, indice) => (
                    <div
                      key={superficie.id}
                      className={`grid grid-cols-[1fr_170px_170px_44px] items-end gap-3 rounded-[18px] border p-4 transition-all duration-300 ${
                        convertirNumero(superficie.ancho) > 0 &&
                        convertirNumero(superficie.alto) > 0
                          ? "border-[#1F9D55] bg-[#F4FCF6]"
                          : "border-gray-100 bg-gray-50/70"
                      }`}
                    >
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.10em] text-gray-400">
                          Superficie {indice + 1}
                        </p>

                        <p className="mt-1 text-[14px] font-black text-blue-950">
                          {aplicacionFinal || grupoSeleccionado}
                        </p>
                      </div>

                      <CampoMedida
                        etiqueta={etiquetas.primera}
                        valor={superficie.ancho}
                        onChange={(valor) =>
                          actualizarSuperficie(
                            superficie.id,
                            "ancho",
                            valor
                          )
                        }
                      />

                      <CampoMedida
                        etiqueta={etiquetas.segunda}
                        valor={superficie.alto}
                        onChange={(valor) =>
                          actualizarSuperficie(
                            superficie.id,
                            "alto",
                            valor
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          eliminarSuperficie(superficie.id)
                        }
                        disabled={superficies.length === 1}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Eliminar superficie"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* [Descuentos] */}

          {grupoSeleccionado &&
            (!necesitaAplicacion ||
              aplicacionSeleccionada !== "") && (
              <section
                ref={descuentosRef}
                className={`scroll-mt-28 rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
                  descuentosActivos
                    ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/15"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-black text-blue-950">
                      ¿Querés descontar aberturas?
                    </h2>

                    <p className="mt-1 text-[12px] font-medium text-gray-500">
                      Restá puertas, ventanas u otras zonas que no vas a pintar.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {descuentosCompletos && (
                      <div className="flex items-center gap-1.5 rounded-full bg-[#EAF8EC] px-3 py-1.5 text-[11px] font-black text-[#16813A]">
                        <CircleCheck size={15} strokeWidth={2.6} />
                        Completo
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={agregarDescuento}
                    className="flex h-10 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 text-[12px] font-black text-blue-950 transition hover:bg-blue-100"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                    Agregar descuento
                  </button>
                  </div>
                </div>

                {descuentos.length === 0 ? (
                  <div className="mt-5 rounded-[18px] border border-dashed border-gray-200 bg-gray-50/70 px-5 py-6 text-center">
                    <p className="text-[12px] font-bold text-gray-500">
                      Todavía no agregaste ningún descuento.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {descuentos.map((descuento, indice) => (
                      <div
                        key={descuento.id}
                        className={`grid grid-cols-[1fr_160px_160px_44px] items-end gap-3 rounded-[18px] border p-4 transition-all duration-300 ${
                          convertirNumero(descuento.ancho) > 0 &&
                          convertirNumero(descuento.alto) > 0
                            ? "border-[#1F9D55] bg-[#F4FCF6]"
                            : "border-gray-100 bg-gray-50/70"
                        }`}
                      >
                        <div>
                          <label className="mb-1.5 block text-[11px] font-black text-gray-500">
                            Nombre
                          </label>

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
                            placeholder={`Ej: Ventana ${indice + 1}`}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[14px] font-bold text-blue-950 outline-none transition focus:border-blue-700"
                          />
                        </div>

                        <CampoMedida
                          etiqueta="Ancho (m)"
                          valor={descuento.ancho}
                          onChange={(valor) =>
                            actualizarDescuento(
                              descuento.id,
                              "ancho",
                              valor
                            )
                          }
                        />

                        <CampoMedida
                          etiqueta="Alto (m)"
                          valor={descuento.alto}
                          onChange={(valor) =>
                            actualizarDescuento(
                              descuento.id,
                              "alto",
                              valor
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            eliminarDescuento(descuento.id)
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50"
                          aria-label="Eliminar descuento"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          {/* [Finalizar Paso 1] */}

          {puedeContinuar && (
            <section className="rounded-[24px] border border-[#1F9D55]/25 bg-gradient-to-r from-[#F3FCF5] via-white to-[#F3FCF5] p-5 shadow-[0_12px_30px_rgba(31,157,85,0.10)]">
              <div className="mb-3 flex items-center justify-center gap-2 text-[#16813A]">
                <CircleCheck
                  size={18}
                  strokeWidth={2.7}
                  className={`transition-all duration-300 ${
                    confirmandoPaso
                      ? "scale-125"
                      : "scale-100"
                  }`}
                />

                <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                  {confirmandoPaso
                    ? "Paso 1 completado"
                    : "Finalizado Paso 1"}
                </p>
              </div>

              <button
                type="button"
                onClick={continuar}
                disabled={confirmandoPaso}
                className={`group flex h-14 w-full items-center justify-center gap-3 rounded-[17px] px-6 text-[15px] font-black text-white shadow-[0_10px_24px_rgba(31,157,85,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(31,157,85,0.32)] active:scale-[0.99] disabled:cursor-wait ${
                  confirmandoPaso
                    ? "bg-[#16813A]"
                    : "bg-[#1F9D55] hover:bg-[#188B49]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                    confirmandoPaso
                      ? "scale-110 bg-white text-[#1F9D55]"
                      : "bg-white/15 text-white"
                  }`}
                >
                  {confirmandoPaso ? (
                    <Check
                      size={18}
                      strokeWidth={3.2}
                      className="animate-[pulse_500ms_ease-out_1]"
                    />
                  ) : (
                    <ArrowRight
                      size={18}
                      strokeWidth={2.7}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  )}
                </span>

                <span>
                  {confirmandoPaso
                    ? "¡Listo! Abriendo Paso 2"
                    : "Ir al Paso 2: elegir pintura"}
                </span>
              </button>
            </section>
          )}
        </div>

        {/* [Resumen] */}

        <aside className="sticky top-28 rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-yellow-500">
            Resumen en vivo
          </p>

          <h2 className="mt-2 text-[22px] font-black tracking-[-0.03em] text-blue-950">
            Tus medidas
          </h2>

          <div className="mt-5 space-y-3">
            <FilaResumen
              etiqueta="Tipo"
              valor={grupoSeleccionado || "Sin seleccionar"}
            />

            <FilaResumen
              etiqueta="Aplicación"
              valor={aplicacionFinal || "Sin seleccionar"}
            />

            <FilaResumen
              etiqueta="Superficie total"
              valor={`${formatearDecimal(superficieTotal)} m²`}
            />

            <FilaResumen
              etiqueta="Descuentos"
              valor={`-${formatearDecimal(descuentosTotal)} m²`}
            />
          </div>

          <div className="mt-5 rounded-[20px] bg-blue-950 px-5 py-5 text-white">
            <p className="text-[11px] font-bold text-white/70">
              Superficie neta
            </p>

            <p className="mt-1 text-[34px] font-black leading-none">
              {formatearDecimal(superficieNeta)} m²
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-[16px] bg-blue-50 px-3 py-3">
            <Check
              size={16}
              strokeWidth={2.6}
              className="mt-0.5 shrink-0 text-blue-950"
            />

            <p className="text-[10px] font-semibold leading-relaxed text-blue-950">
              El cálculo se actualiza automáticamente mientras cargás las medidas.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  activo = false,
}: {
  numero: number;
  titulo: string;
  activo?: boolean;
}) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col items-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-black ${
          activo
            ? "bg-yellow-400 text-blue-950 shadow-sm"
            : "border border-gray-200 bg-gray-100 text-gray-400"
        }`}
      >
        {numero}
      </div>

      <span
        className={`mt-2 text-[12px] font-black ${
          activo ? "text-blue-950" : "text-gray-400"
        }`}
      >
        {titulo}
      </span>
    </div>
  );
}

function Linea({ activo = false }: { activo?: boolean }) {
  return (
    <div
      className={`mt-5 h-[3px] flex-1 rounded-full ${
        activo ? "bg-yellow-400" : "bg-gray-200"
      }`}
    />
  );
}

function CampoMedida({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black text-gray-500">
        {etiqueta}
      </label>

      <input
        type="text"
        inputMode="decimal"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder="0,00"
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[14px] font-bold text-blue-950 outline-none transition focus:border-blue-700"
      />
    </div>
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
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-[12px] font-semibold text-gray-500">
        {etiqueta}
      </span>

      <span className="max-w-[58%] text-right text-[12px] font-black text-blue-950">
        {valor}
      </span>
    </div>
  );
}