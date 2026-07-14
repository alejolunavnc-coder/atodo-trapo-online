"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Layers3,
  PaintBucket,
  PaintRoller,
  SearchX,
} from "lucide-react";

import type { Producto } from "@/src/types/producto";
import type { DatosPasoUnoPC } from "./CalculadoraPinturaPC";
import CalculadoraPaso3PC from "./CalculadoraPaso3PC";

type PinturaAgrupada = {
  id: string;
  productoBase: Producto;
  variantes: Producto[];
  manosRecomendadas: number;
  poderCubritivo: number;
};

export type DatosPasoDosPC = {
  pintura: Producto;
  variantes: Producto[];
  manos: number;
  poderCubritivo: number;
};

type CalculadoraPaso2PCProps = {
  datosPasoUno: DatosPasoUnoPC;
  productos: Producto[];
  onVolverPaso: () => void;
  onContinuar: (datos: DatosPasoDosPC) => void;
  onAgregarAlCarrito: (
    items: Array<{
      producto: Producto;
      cantidad: number;
    }>
  ) => void;
};

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function convertirNumero(valor: unknown) {
  const limpio = String(valor ?? "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numero = Number(limpio);

  return Number.isFinite(numero) ? numero : 0;
}

function obtenerPalabrasClave(valor: unknown) {
  const ignoradas = [
    "para",
    "con",
    "sin",
    "del",
    "las",
    "los",
    "una",
    "uno",
  ];

  return normalizarTexto(valor)
    .split(/[^a-z0-9]+/)
    .filter(
      (palabra) =>
        palabra.length >= 3 &&
        !ignoradas.includes(palabra)
    );
}

function coincidePorPalabras(
  textoProducto: unknown,
  textoSeleccionado: unknown
) {
  const palabrasProducto =
    obtenerPalabrasClave(textoProducto);

  const palabrasSeleccionadas =
    obtenerPalabrasClave(textoSeleccionado);

  if (palabrasSeleccionadas.length === 0) {
    return true;
  }

  return palabrasSeleccionadas.some((palabra) =>
    palabrasProducto.includes(palabra)
  );
}


function obtenerAplicacionesCalculadora(valor: unknown) {
  return String(valor ?? "")
    .split(/[|,;]/)
    .map((aplicacion) => normalizarTexto(aplicacion))
    .filter(Boolean);
}


function obtenerGruposCalculadora(valor: unknown) {
  return String(valor ?? "")
    .split(/[|,;]/)
    .map((grupo) => normalizarTexto(grupo))
    .filter(Boolean);
}

function productoTieneStock(producto: Producto) {
  return normalizarTexto(producto.Stock) !== "x";
}

function obtenerClaveProducto(producto: Producto) {
  return [
    normalizarTexto(producto.Marca),
    normalizarTexto(producto.Linea),
    normalizarTexto(producto.Nombre),
  ].join("|");
}

function obtenerPrecio(producto: Producto) {
  return convertirNumero(producto.Precio);
}

function obtenerPrecioOferta(producto: Producto) {
  return convertirNumero(producto["Precio oferta"]);
}

function productoEnOferta(producto: Producto) {
  const precio = obtenerPrecio(producto);
  const precioOferta = obtenerPrecioOferta(producto);

  return (
    precioOferta > 0 &&
    precio > 0 &&
    precioOferta < precio
  );
}

function obtenerPrecioFinal(producto: Producto) {
  return productoEnOferta(producto)
    ? obtenerPrecioOferta(producto)
    : obtenerPrecio(producto);
}

function obtenerDescuento(producto: Producto) {
  const precio = obtenerPrecio(producto);
  const precioOferta = obtenerPrecioOferta(producto);

  if (
    precio <= 0 ||
    precioOferta <= 0 ||
    precioOferta >= precio
  ) {
    return 0;
  }

  return Math.round(
    ((precio - precioOferta) / precio) * 100
  );
}

function formatearPrecio(valor: number) {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function formatearDecimal(valor: number) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function interpretarTamano(valor: unknown) {
  const texto = normalizarTexto(valor)
    .replace(/\s+/g, "");

  if (!texto) {
    return Number.POSITIVE_INFINITY;
  }

  if (texto === "1/2l") {
    return 0.5;
  }

  const litros = texto.match(
    /^(\d+(?:[.,]\d+)?)l$/i
  );

  if (litros) {
    return Number(litros[1].replace(",", "."));
  }

  const mililitros = texto.match(
    /^(\d+(?:[.,]\d+)?)(ml|cm3)$/i
  );

  if (mililitros) {
    return (
      Number(mililitros[1].replace(",", ".")) /
      1000
    );
  }

  const kilos = texto.match(
    /^(\d+(?:[.,]\d+)?)(k|kg)$/i
  );

  if (kilos) {
    return Number(kilos[1].replace(",", "."));
  }

  const gramos = texto.match(
    /^(\d+(?:[.,]\d+)?)(g|gr|grm)$/i
  );

  if (gramos) {
    return (
      Number(gramos[1].replace(",", ".")) /
      1000
    );
  }

  return Number.POSITIVE_INFINITY;
}

function elegirVarianteMasChica(
  variantes: Producto[]
) {
  const ordenadas = [...variantes].sort(
    (a, b) => {
      const tamanoA = interpretarTamano(a.Tamaño);
      const tamanoB = interpretarTamano(b.Tamaño);

      if (tamanoA !== tamanoB) {
        return tamanoA - tamanoB;
      }

      return (
        obtenerPrecioFinal(a) -
        obtenerPrecioFinal(b)
      );
    }
  );

  return ordenadas[0] ?? variantes[0];
}

export default function CalculadoraPaso2PC({
  datosPasoUno,
  productos,
  onVolverPaso,
  onContinuar,
  onAgregarAlCarrito,
}: CalculadoraPaso2PCProps) {
  const pasosRef = useRef<HTMLElement | null>(null);
  const manosRef = useRef<HTMLElement | null>(null);
  const finalPasoRef = useRef<HTMLElement | null>(null);

  const [
    pinturaSeleccionadaId,
    setPinturaSeleccionadaId,
  ] = useState("");

  const [cantidadManos, setCantidadManos] =
    useState(0);

  const [datosPasoDosGuardados, setDatosPasoDosGuardados] =
    useState<DatosPasoDosPC | null>(null);

  const [vistaVisible, setVistaVisible] =
    useState(false);

  const [cambiandoPaso, setCambiandoPaso] =
    useState(false);

  const [confirmandoPaso, setConfirmandoPaso] =
    useState(false);

  const pinturasCompatibles =
    useMemo<PinturaAgrupada[]>(() => {
      const grupoBuscado = normalizarTexto(
        datosPasoUno.grupo
      );

      const aplicacionBuscada = normalizarTexto(
        datosPasoUno.aplicacion
      );

      const filasCompatibles = productos.filter(
        (producto) => {
          if (!productoTieneStock(producto)) {
            return false;
          }

          const gruposProducto =
            obtenerGruposCalculadora(
              producto["Grupo calculadora"]
            );

          const aplicacionesProducto =
            obtenerAplicacionesCalculadora(
              producto["Aplicación calculadora"]
            );

          const manos = convertirNumero(
            producto.Manos
          );

          const poderCubritivo = convertirNumero(
            producto["Poder cubritivo"]
          );

          const coincideGrupo =
            gruposProducto.some((grupo) =>
              coincidePorPalabras(
                grupo,
                grupoBuscado
              )
            );

          const coincideAplicacion =
            aplicacionesProducto.some(
              (aplicacion) =>
                coincidePorPalabras(
                  aplicacion,
                  aplicacionBuscada
                )
            );

          return (
            gruposProducto.length > 0 &&
            aplicacionesProducto.length > 0 &&
            manos > 0 &&
            poderCubritivo > 0 &&
            coincideGrupo &&
            coincideAplicacion
          );
        }
      );

      const mapa = new Map<string, Producto[]>();

      filasCompatibles.forEach((producto) => {
        const clave =
          obtenerClaveProducto(producto);

        const actuales = mapa.get(clave) ?? [];

        mapa.set(clave, [
          ...actuales,
          producto,
        ]);
      });

      return Array.from(mapa.entries()).map(
        ([id, variantes]) => {
          const productoConDatos =
            variantes.find(
              (producto) =>
                convertirNumero(producto.Manos) >
                  0 &&
                convertirNumero(
                  producto["Poder cubritivo"]
                ) > 0
            ) ?? variantes[0];

          const productoBase =
            elegirVarianteMasChica(variantes);

          return {
            id,
            productoBase,
            variantes,
            manosRecomendadas:
              convertirNumero(
                productoConDatos.Manos
              ) || 1,
            poderCubritivo:
              convertirNumero(
                productoConDatos[
                  "Poder cubritivo"
                ]
              ) || 0,
          };
        }
      );
    }, [
      datosPasoUno.aplicacion,
      datosPasoUno.grupo,
      productos,
    ]);

  const pinturaSeleccionada =
    pinturasCompatibles.find(
      (pintura) =>
        pintura.id === pinturaSeleccionadaId
    ) ?? null;

  useEffect(() => {
    const mostrar = window.setTimeout(() => {
      setVistaVisible(true);
    }, 40);

    const posicionar = window.setTimeout(() => {
      const pasos = pasosRef.current;

      if (!pasos) {
        return;
      }

      const destino =
        pasos.getBoundingClientRect().top +
        window.scrollY -
        92;

      window.scrollTo({
        top: destino,
        behavior: "smooth",
      });
    }, 180);

    return () => {
      window.clearTimeout(mostrar);
      window.clearTimeout(posicionar);
    };
  }, []);

  useEffect(() => {
    setCantidadManos(0);

    if (!pinturaSeleccionada) {
      return;
    }

    window.setTimeout(() => {
      const elemento = manosRef.current;

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
  }, [pinturaSeleccionada]);

  useEffect(() => {
    if (cantidadManos <= 0) {
      return;
    }

    window.setTimeout(() => {
      const elemento = finalPasoRef.current;

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
          window.requestAnimationFrame(animar);
        }
      }

      window.requestAnimationFrame(animar);
    }, 220);
  }, [cantidadManos]);

  const puedeContinuar =
    pinturaSeleccionada !== null &&
    cantidadManos > 0 &&
    pinturaSeleccionada.poderCubritivo > 0;

  function continuar() {
    if (
      !pinturaSeleccionada ||
      !puedeContinuar
    ) {
      return;
    }

    const datos: DatosPasoDosPC = {
      pintura:
        pinturaSeleccionada.productoBase,
      variantes:
        pinturaSeleccionada.variantes,
      manos: cantidadManos,
      poderCubritivo:
        pinturaSeleccionada.poderCubritivo,
    };

    setConfirmandoPaso(true);

    window.setTimeout(() => {
      setCambiandoPaso(true);
    }, 520);

    window.setTimeout(() => {
      setDatosPasoDosGuardados(datos);
      onContinuar(datos);
      setConfirmandoPaso(false);
    }, 820);
  }

  if (datosPasoDosGuardados) {
    return (
      <CalculadoraPaso3PC
        datosPasoUno={datosPasoUno}
        datosPasoDos={datosPasoDosGuardados}
        onVolverPaso={() => {
          setDatosPasoDosGuardados(null);
          setCambiandoPaso(false);
          setConfirmandoPaso(false);
          setVistaVisible(true);

          window.setTimeout(() => {
            const elemento =
              finalPasoRef.current ??
              manosRef.current ??
              pasosRef.current;

            if (!elemento) {
              return;
            }

            const destino =
              elemento.getBoundingClientRect().top +
              window.scrollY -
              110;

            window.scrollTo({
              top: destino,
              behavior: "smooth",
            });
          }, 80);
        }}
        onAgregarAlCarrito={onAgregarAlCarrito}
      />
    );
  }

  return (
    <div
      className={`space-y-6 transition-all duration-300 ease-out ${
        vistaVisible && !cambiandoPaso
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0"
      }`}
    >
      {/* [Pasos] */}

      <section
        ref={pasosRef}
        className="scroll-mt-4 rounded-[24px] border border-gray-200 bg-white px-8 py-5 shadow-sm"
      >
        <div className="flex items-start">
          <PasoCompletado titulo="Medidas" />

          <Linea activa />

          <PasoActivo
            numero={2}
            titulo="Pintura"
          />

          <Linea />

          <PasoPendiente
            numero={3}
            titulo="Resultado"
          />
        </div>
      </section>

      {/* [Contenido] */}

      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
        <div className="space-y-6">
          {/* [Elegir pintura] */}

          <section className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-[22px] font-black tracking-[-0.03em] text-blue-950">
                Elegí la pintura
              </h2>

              <p className="mt-1 text-[13px] font-medium text-gray-500">
                Te mostramos las opciones compatibles
                con tu superficie y aplicación.
              </p>
            </div>

            <div className="p-5">
              <p className="mb-4 text-[12px] font-black text-blue-950">
                Opciones compatibles encontradas
              </p>

              {pinturasCompatibles.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[20px] border border-dashed border-gray-300 bg-gray-50 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <SearchX
                      size={27}
                      strokeWidth={2.2}
                    />
                  </div>

                  <h3 className="mt-4 text-[16px] font-black text-blue-950">
                    No hay pinturas compatibles
                  </h3>

                  <p className="mt-2 max-w-[330px] text-[12px] font-medium leading-relaxed text-gray-500">
                    Revisá los datos técnicos de las
                    pinturas disponibles.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
                  {pinturasCompatibles.map(
                    (pintura) => {
                      const activa =
                        pinturaSeleccionadaId ===
                        pintura.id;

                      const producto =
                        pintura.productoBase;

                      const precio =
                        obtenerPrecio(producto);

                      const precioOferta =
                        obtenerPrecioOferta(
                          producto
                        );

                      const tieneOferta =
                        productoEnOferta(producto);

                      const precioFinal =
                        obtenerPrecioFinal(producto);

                      const descuento =
                        obtenerDescuento(producto);

                      return (
                        <button
                          key={pintura.id}
                          type="button"
                          onClick={() =>
                            setPinturaSeleccionadaId(
                              pintura.id
                            )
                          }
                          className={`group relative min-w-0 rounded-[16px] border-2 bg-white p-2.5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] ${
                            activa
                              ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/15"
                              : "border-gray-100"
                          }`}
                        >
                          <div className="relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-[13px] bg-gray-50 p-2.5">
                            {producto.Marca && (
                              <span className="absolute left-2 top-2 z-10 max-w-[86px] truncate rounded-full bg-white px-2.5 py-1 text-[8px] font-black text-gray-800 shadow-sm">
                                {producto.Marca}
                              </span>
                            )}

                            {tieneOferta &&
                              descuento > 0 && (
                                <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[8px] font-black text-white shadow-sm">
                                  -{descuento}%
                                </span>
                              )}

                            {activa && (
                              <span className="absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#1F9D55] text-white shadow-md">
                                <Check
                                  size={15}
                                  strokeWidth={3}
                                />
                              </span>
                            )}

                            {producto.Imagen ? (
                              <img
                                src={producto.Imagen}
                                alt={producto.Nombre}
                                className="h-[88%] w-[88%] object-contain transition-transform duration-200 group-hover:scale-105"
                              />
                            ) : (
                              <PaintBucket
                                size={52}
                                className="mb-4 text-gray-300"
                              />
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="line-clamp-2 min-h-[24px] text-[12px] font-black leading-[1.08] text-slate-900">
                              {producto.Nombre}
                            </p>

                            {producto.Linea && (
                              <p className="mt-[1px] truncate text-[9px] font-semibold leading-none text-gray-500">
                                {producto.Linea}
                              </p>
                            )}

                            <div className="mt-1.5">
                              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-gray-400">
                                Desde
                              </p>

                              {tieneOferta &&
                                precio > 0 && (
                                  <p className="mt-[2px] text-[9px] font-bold leading-none text-red-500 line-through">
                                    {formatearPrecio(
                                      precio
                                    )}
                                  </p>
                                )}

                              <p className="mt-1 text-[15px] font-black leading-none text-blue-950">
                                {precioFinal > 0
                                  ? formatearPrecio(
                                      precioFinal
                                    )
                                  : "Consultar"}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>

          {/* [Cantidad de manos] */}

          {pinturaSeleccionada && (
            <section
              ref={manosRef}
              className="relative scroll-mt-28 rounded-[24px] border border-[#1F9D55] bg-white p-6 shadow-sm ring-2 ring-[#1F9D55]/10"
            >
              <div className="absolute right-5 top-5 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-[10px] font-black text-[#A35F00] shadow-sm">
                Podés elegir
              </div>

              <div className="flex items-start gap-3 pr-28">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF8EC] text-[#16813A]">
                  <PaintRoller
                    size={23}
                    strokeWidth={2.3}
                  />
                </div>

                <div>
                  <h2 className="text-[18px] font-black text-blue-950">
                    ¿Cuántas manos vas a aplicar?
                  </h2>

                  <p className="mt-1 text-[12px] font-semibold text-gray-600">
                    Para esta pintura, la marca
                    recomienda{" "}
                    <span className="font-black text-[#16813A]">
                      {
                        pinturaSeleccionada.manosRecomendadas
                      }{" "}
                      {pinturaSeleccionada.manosRecomendadas ===
                      1
                        ? "mano"
                        : "manos"}
                    </span>
                    .
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-gray-500">
                    La recomendación es orientativa: podés elegir otra cantidad según el estado de la superficie.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((cantidad) => {
                  const activa =
                    cantidadManos === cantidad;

                  const recomendada =
                    cantidad ===
                    pinturaSeleccionada.manosRecomendadas;

                  return (
                    <button
                      key={cantidad}
                      type="button"
                      onClick={() =>
                        setCantidadManos(cantidad)
                      }
                      className={`flex h-12 items-center justify-center rounded-full border text-[14px] font-black transition-all duration-200 hover:-translate-y-0.5 ${
                        activa
                          ? recomendada
                            ? "border-[#1F9D55] bg-[#1F9D55] text-white"
                            : "border-yellow-400 bg-yellow-400 text-blue-950"
                          : recomendada
                            ? "border-[#1F9D55] bg-[#EAF8EC] text-[#16813A]"
                            : "border-gray-200 bg-white text-blue-950 hover:border-blue-300"
                      }`}
                    >
                      {cantidad}

                      {activa && (
                        <Check
                          size={16}
                          strokeWidth={3}
                          className="ml-2"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {cantidadManos === 0 ? (
                <div className="mt-4 rounded-[16px] border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[11px] font-black text-blue-950">
                    Elegí cuántas manos vas a aplicar.
                    La opción en verde es la recomendada por la marca.
                  </p>
                </div>
              ) : cantidadManos ===
                pinturaSeleccionada.manosRecomendadas ? (
                <div className="mt-4 flex items-center gap-2 rounded-[16px] bg-[#EAF8EC] px-4 py-3 text-[#16813A]">
                  <Check
                    size={17}
                    strokeWidth={2.8}
                  />

                  <p className="text-[11px] font-black">
                    Seleccionaste la recomendación de
                    la marca.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-[16px] bg-yellow-50 px-4 py-3">
                  <p className="text-[11px] font-black text-[#A35F00]">
                    Modificaste la recomendación del
                    fabricante.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* [Finalizar Paso 2] */}

          {puedeContinuar && (
            <section
              ref={finalPasoRef}
              className="scroll-mt-28 rounded-[24px] border border-[#1F9D55]/25 bg-gradient-to-r from-[#F3FCF5] via-white to-[#F3FCF5] p-5 shadow-[0_12px_30px_rgba(31,157,85,0.10)]"
            >
              <div className="mb-3 flex items-center justify-center gap-2 text-[#16813A]">
                <Check
                  size={18}
                  strokeWidth={2.8}
                  className={`transition-all duration-300 ${
                    confirmandoPaso
                      ? "scale-125"
                      : "scale-100"
                  }`}
                />

                <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                  {confirmandoPaso
                    ? "Paso 2 completado"
                    : "Finalizado Paso 2"}
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
                    ? "¡Listo! Abriendo resultado"
                    : "Ir al Paso 3: ver resultado"}
                </span>
              </button>
            </section>
          )}
        </div>

        {/* [Resumen] */}

        <aside className="sticky top-28 rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
          <div className="flex items-center gap-2">
            <ClipboardList
              size={21}
              className="text-yellow-500"
            />

            <h2 className="text-[21px] font-black tracking-[-0.03em] text-blue-950">
              Resumen
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            <FilaResumen
              etiqueta="Superficie neta"
              valor={`${formatearDecimal(
                datosPasoUno.superficieNeta
              )} m²`}
            />

            <FilaResumen
              etiqueta="Tipo de superficie"
              valor={datosPasoUno.grupo}
            />

            <FilaResumen
              etiqueta="Aplicación"
              valor={datosPasoUno.aplicacion}
            />

            <FilaResumen
              etiqueta="Pintura elegida"
              valor={
                pinturaSeleccionada
                  ? pinturaSeleccionada
                      .productoBase.Nombre
                  : "Sin seleccionar"
              }
            />

            <FilaResumen
              etiqueta="Manos seleccionadas"
              valor={
                cantidadManos > 0
                  ? String(cantidadManos)
                  : "—"
              }
              destacar={cantidadManos > 0}
            />
          </div>

          {pinturaSeleccionada && (
            <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-gray-100 bg-gray-50 p-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[14px] bg-white p-2">
                {pinturaSeleccionada.productoBase
                  .Imagen ? (
                  <img
                    src={
                      pinturaSeleccionada
                        .productoBase.Imagen
                    }
                    alt={
                      pinturaSeleccionada
                        .productoBase.Nombre
                    }
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <PaintBucket className="text-gray-300" />
                )}
              </div>

              <div className="min-w-0">
                <p className="line-clamp-2 text-[12px] font-black leading-tight text-blue-950">
                  {
                    pinturaSeleccionada
                      .productoBase.Nombre
                  }
                </p>

                {pinturaSeleccionada.productoBase
                  .Linea && (
                  <p className="mt-[1px] truncate text-[9px] font-semibold leading-none text-gray-500">
                    {
                      pinturaSeleccionada
                        .productoBase.Linea
                    }
                  </p>
                )}

                <p className="mt-2 text-[11px] font-black text-[#16813A]">
                  {cantidadManos}{" "}
                  {cantidadManos === 1
                    ? "mano"
                    : "manos"}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onVolverPaso}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-blue-950 bg-white text-[13px] font-black text-blue-950 transition hover:bg-blue-50"
          >
            <ArrowLeft
              size={18}
              strokeWidth={2.5}
            />
            Volver a medidas
          </button>

          <div className="mt-4 flex items-start gap-2 rounded-[16px] bg-blue-50 px-3 py-3">
            <Layers3
              size={16}
              className="mt-0.5 shrink-0 text-blue-950"
            />

            <p className="text-[10px] font-semibold leading-relaxed text-blue-950">
              El precio mostrado corresponde a la
              presentación más chica disponible.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PasoCompletado({
  titulo,
}: {
  titulo: string;
}) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F9D55] text-white shadow-sm">
        <Check size={19} strokeWidth={3} />
      </div>

      <span className="mt-2 text-[12px] font-black text-[#16813A]">
        {titulo}
      </span>

      <span className="mt-0.5 text-[9px] font-bold text-[#16813A]">
        Completado
      </span>
    </div>
  );
}

function PasoActivo({
  numero,
  titulo,
}: {
  numero: number;
  titulo: string;
}) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-[14px] font-black text-blue-950 shadow-sm">
        {numero}
      </div>

      <span className="mt-2 text-[12px] font-black text-blue-950">
        {titulo}
      </span>

      <span className="mt-0.5 text-[9px] font-bold text-yellow-600">
        En progreso
      </span>
    </div>
  );
}

function PasoPendiente({
  numero,
  titulo,
}: {
  numero: number;
  titulo: string;
}) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[14px] font-black text-gray-400">
        {numero}
      </div>

      <span className="mt-2 text-[12px] font-black text-gray-400">
        {titulo}
      </span>

      <span className="mt-0.5 text-[9px] font-bold text-gray-400">
        Pendiente
      </span>
    </div>
  );
}

function Linea({
  activa = false,
}: {
  activa?: boolean;
}) {
  return (
    <div
      className={`mt-5 h-[3px] flex-1 rounded-full ${
        activa ? "bg-[#1F9D55]" : "bg-gray-200"
      }`}
    />
  );
}

function FilaResumen({
  etiqueta,
  valor,
  destacar = false,
}: {
  etiqueta: string;
  valor: string;
  destacar?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-[11px] font-semibold text-gray-500">
        {etiqueta}
      </span>

      <span
        className={`max-w-[58%] text-right text-[11px] font-black ${
          destacar
            ? "text-[#16813A]"
            : "text-blue-950"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}