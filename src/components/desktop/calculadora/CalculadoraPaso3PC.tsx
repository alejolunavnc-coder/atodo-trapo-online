"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Info,
  PackageCheck,
  PaintBucket,
  ShoppingCart,
} from "lucide-react";

import type { Producto } from "@/src/types/producto";
import type { DatosPasoUnoPC } from "./CalculadoraPinturaPC";
import type { DatosPasoDosPC } from "./CalculadoraPaso2PC";

type Unidad = "L" | "K";

type EnvaseDisponible = {
  producto: Producto;
  cantidad: number;
  unidad: Unidad;
  precioUnitario: number;
};

type EnvaseRecomendado = EnvaseDisponible & {
  unidades: number;
};

export type DatosPasoTresPC = {
  cantidadNecesaria: number;
  cantidadComprada: number;
  sobrante: number;
  unidad: Unidad;
  precioTotal: number;
  envases: EnvaseRecomendado[];
};

type CalculadoraPaso3PCProps = {
  datosPasoUno: DatosPasoUnoPC;
  datosPasoDos: DatosPasoDosPC;
  onVolverPaso: () => void;
  onAgregarAlCarrito?: (
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

function obtenerPrecio(producto: Producto) {
  const precio = convertirNumero(producto.Precio);
  const precioOferta = convertirNumero(
    producto["Precio oferta"]
  );

  return precioOferta > 0 && precioOferta < precio
    ? precioOferta
    : precio;
}

function productoTieneStock(producto: Producto) {
  return normalizarTexto(producto.Stock) !== "x";
}

function interpretarTamano(
  valor: unknown
): {
  cantidad: number;
  unidad: Unidad;
} | null {
  const original = String(valor ?? "").trim();

  if (!original) {
    return null;
  }

  const texto = normalizarTexto(original).replace(
    /\s+/g,
    ""
  );

  if (
    texto.includes("para") ||
    texto.includes("mts") ||
    texto.includes("metro") ||
    texto.includes("x")
  ) {
    return null;
  }

  if (texto === "1/2l") {
    return {
      cantidad: 0.5,
      unidad: "L",
    };
  }

  const litros = texto.match(
    /^(\d+(?:[.,]\d+)?)l$/i
  );

  if (litros) {
    return {
      cantidad: Number(
        litros[1].replace(",", ".")
      ),
      unidad: "L",
    };
  }

  const mililitros = texto.match(
    /^(\d+(?:[.,]\d+)?)(ml|cm3)$/i
  );

  if (mililitros) {
    return {
      cantidad:
        Number(
          mililitros[1].replace(",", ".")
        ) / 1000,
      unidad: "L",
    };
  }

  const kilos = texto.match(
    /^(\d+(?:[.,]\d+)?)(k|kg)$/i
  );

  if (kilos) {
    return {
      cantidad: Number(
        kilos[1].replace(",", ".")
      ),
      unidad: "K",
    };
  }

  const gramos = texto.match(
    /^(\d+(?:[.,]\d+)?)(g|gr|grm)$/i
  );

  if (gramos) {
    return {
      cantidad:
        Number(
          gramos[1].replace(",", ".")
        ) / 1000,
      unidad: "K",
    };
  }

  return null;
}

function formatearDecimal(valor: number) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatearPrecio(valor: number) {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function obtenerUnidadPrincipal(
  producto: Producto,
  envases: EnvaseDisponible[]
): Unidad {
  const grupo = normalizarTexto(
    producto["Grupo calculadora"]
  );

  if (grupo.includes("texturado")) {
    return "K";
  }

  const litros = envases.filter(
    (envase) => envase.unidad === "L"
  ).length;

  const kilos = envases.filter(
    (envase) => envase.unidad === "K"
  ).length;

  return kilos > litros ? "K" : "L";
}

function buscarMejorCombinacion(
  envases: EnvaseDisponible[],
  cantidadNecesaria: number
): EnvaseRecomendado[] {
  if (
    envases.length === 0 ||
    cantidadNecesaria <= 0
  ) {
    return [];
  }

  const escala = 100;
  const objetivo = Math.ceil(
    cantidadNecesaria * escala
  );

  const tamanos = envases.map((envase) =>
    Math.max(
      1,
      Math.round(envase.cantidad * escala)
    )
  );

  const mayorTamano = Math.max(...tamanos);
  const limite = objetivo + mayorTamano;

  type Estado = {
    precio: number;
    cantidades: number[];
  };

  const dp: Array<Estado | null> = Array(
    limite + 1
  ).fill(null);

  dp[0] = {
    precio: 0,
    cantidades: Array(envases.length).fill(0),
  };

  for (
    let total = 0;
    total <= limite;
    total += 1
  ) {
    const estado = dp[total];

    if (!estado) {
      continue;
    }

    envases.forEach((envase, indice) => {
      const siguienteTotal =
        total + tamanos[indice];

      if (siguienteTotal > limite) {
        return;
      }

      const siguientePrecio =
        estado.precio + envase.precioUnitario;

      const existente = dp[siguienteTotal];

      if (
        !existente ||
        siguientePrecio < existente.precio
      ) {
        const cantidades = [
          ...estado.cantidades,
        ];

        cantidades[indice] += 1;

        dp[siguienteTotal] = {
          precio: siguientePrecio,
          cantidades,
        };
      }
    });
  }

  let mejorTotal = -1;
  let mejorEstado: Estado | null = null;

  for (
    let total = objetivo;
    total <= limite;
    total += 1
  ) {
    const estado = dp[total];

    if (!estado) {
      continue;
    }

    if (mejorTotal === -1) {
      mejorTotal = total;
      mejorEstado = estado;
      continue;
    }

    const sobranteActual =
      total - objetivo;

    const mejorSobrante =
      mejorTotal - objetivo;

    if (
      sobranteActual < mejorSobrante ||
      (sobranteActual === mejorSobrante &&
        estado.precio <
          (mejorEstado?.precio ?? Infinity))
    ) {
      mejorTotal = total;
      mejorEstado = estado;
    }
  }

  if (!mejorEstado) {
    return [];
  }

  return envases
    .map((envase, indice) => ({
      ...envase,
      unidades:
        mejorEstado?.cantidades[indice] ?? 0,
    }))
    .filter((envase) => envase.unidades > 0)
    .sort((a, b) => b.cantidad - a.cantidad);
}

export default function CalculadoraPaso3PC({
  datosPasoUno,
  datosPasoDos,
  onVolverPaso,
  onAgregarAlCarrito,
}: CalculadoraPaso3PCProps) {
  const listoRef = useRef<HTMLElement | null>(null);

  const [vistaVisible, setVistaVisible] =
    useState(false);

  useEffect(() => {
    const mostrar = window.setTimeout(() => {
      setVistaVisible(true);
    }, 90);

    return () => {
      window.clearTimeout(mostrar);
    };
  }, []);

  const resultado = useMemo<DatosPasoTresPC>(() => {
    const envasesDisponibles: EnvaseDisponible[] =
      datosPasoDos.variantes
        .filter(productoTieneStock)
        .map((producto) => {
          const tamano = interpretarTamano(
            producto.Tamaño
          );

          if (!tamano) {
            return null;
          }

          const precioUnitario =
            obtenerPrecio(producto);

          if (precioUnitario <= 0) {
            return null;
          }

          return {
            producto,
            cantidad: tamano.cantidad,
            unidad: tamano.unidad,
            precioUnitario,
          };
        })
        .filter(
          (
            envase
          ): envase is EnvaseDisponible =>
            envase !== null
        );

    const unidad = obtenerUnidadPrincipal(
      datosPasoDos.pintura,
      envasesDisponibles
    );

    const envasesMismaUnidad =
      envasesDisponibles.filter(
        (envase) => envase.unidad === unidad
      );

    const cantidadNecesaria =
      (datosPasoUno.superficieNeta *
        datosPasoDos.manos) /
      datosPasoDos.poderCubritivo;

    const envases = buscarMejorCombinacion(
      envasesMismaUnidad,
      cantidadNecesaria
    );

    const cantidadComprada = envases.reduce(
      (total, envase) =>
        total +
        envase.cantidad * envase.unidades,
      0
    );

    const precioTotal = envases.reduce(
      (total, envase) =>
        total +
        envase.precioUnitario *
          envase.unidades,
      0
    );

    return {
      cantidadNecesaria,
      cantidadComprada,
      sobrante: Math.max(
        cantidadComprada - cantidadNecesaria,
        0
      ),
      unidad,
      precioTotal,
      envases,
    };
  }, [datosPasoDos, datosPasoUno.superficieNeta]);

  const mostrarAvisoBaseTexturado =
    normalizarTexto(datosPasoUno.grupo) ===
      "texturado" &&
    ["mediano", "grueso"].includes(
      normalizarTexto(datosPasoUno.aplicacion)
    );

  const simboloUnidad =
    resultado.unidad === "K" ? "kg" : "L";

  const nombreUnidad =
    resultado.unidad === "K"
      ? "kilos"
      : "litros";

  function agregarAlCarrito() {
    if (
      resultado.envases.length === 0 ||
      !onAgregarAlCarrito
    ) {
      return;
    }

    onAgregarAlCarrito(
      resultado.envases.map((envase) => ({
        producto: envase.producto,
        cantidad: envase.unidades,
      }))
    );
  }

  return (
    <div
      className={`space-y-6 transition-opacity duration-500 ease-in-out ${
        vistaVisible
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* [Pasos] */}

      <section className="rounded-[24px] border border-gray-200 bg-white px-8 py-5 shadow-sm">
        <div className="flex items-start">
          <PasoCompletado titulo="Medidas" />

          <Linea activa />

          <PasoCompletado titulo="Pintura" />

          <Linea activa />

          <PasoActivo
            numero={3}
            titulo="Resultado"
          />
        </div>
      </section>

      {/* [Felicidades] */}

      <section
        ref={listoRef}
        className="scroll-mt-6 flex items-center justify-center gap-3 rounded-[20px] border border-[#1F9D55]/30 bg-[#EAF8EC] px-5 py-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F9D55] text-white">
          <Check size={22} strokeWidth={3} />
        </div>

        <div>
          <p className="text-[15px] font-black text-[#16813A]">
            ¡Listo! Ya calculamos tu compra
          </p>

          <p className="text-[11px] font-semibold text-[#16813A]/80">
            Esta es la combinación de envases recomendada.
          </p>
        </div>
      </section>

      {/* [Aviso texturado] */}

      {mostrarAvisoBaseTexturado && (
        <section className="rounded-[22px] border border-yellow-300 bg-yellow-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-blue-950">
              <Info size={22} strokeWidth={2.4} />
            </div>

            <div>
              <h2 className="text-[15px] font-black text-blue-950">
                Importante
              </h2>

              <p className="mt-1 max-w-4xl text-[12px] font-semibold leading-relaxed text-gray-600">
                Aplicá primero una base del color que elijas,
                similar o combinada con el revestimiento, para
                evitar que se vea el fondo anterior entre los
                relieves.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* [Contenido] */}

      <div className="grid grid-cols-[minmax(0,1fr)_370px] items-start gap-6">
        <div className="space-y-6">
          {/* [Cantidad necesaria] */}

          <section className="rounded-[24px] border border-[#1F9D55] bg-white p-6 shadow-sm ring-2 ring-[#1F9D55]/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF8EC] text-[#16813A]">
                <PackageCheck
                  size={24}
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <h2 className="text-[20px] font-black text-blue-950">
                  Cantidad necesaria
                </h2>

                <p className="text-[12px] font-medium text-gray-500">
                  Calculada según superficie, manos y rendimiento.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#EAF8EC] px-6 py-7 text-center">
              <p className="text-[12px] font-black text-[#16813A]">
                Necesitás aproximadamente
              </p>

              <p className="mt-2 text-[44px] font-black leading-none tracking-[-0.04em] text-blue-950">
                {formatearDecimal(
                  resultado.cantidadNecesaria
                )}{" "}
                {nombreUnidad}
              </p>
            </div>
          </section>

          {/* [Envases] */}

          <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <PaintBucket
                  size={23}
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <h2 className="text-[20px] font-black text-blue-950">
                  Qué envases comprar
                </h2>

                <p className="text-[12px] font-medium text-gray-500">
                  Elegimos la combinación con menor sobrante.
                </p>
              </div>
            </div>

            {resultado.envases.length === 0 ? (
              <div className="mt-5 rounded-[20px] border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                <p className="text-[13px] font-black text-blue-950">
                  No encontramos tamaños disponibles
                </p>

                <p className="mt-1 text-[11px] text-gray-500">
                  Revisá los tamaños, precios y stock de esta pintura.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-4">
                {resultado.envases.map((envase) => (
                  <article
                    key={`${envase.producto.Nombre}-${envase.producto.Tamaño}`}
                    className="flex items-center gap-4 rounded-[20px] border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[16px] bg-white p-2">
                      {envase.producto.Imagen ? (
                        <img
                          src={envase.producto.Imagen}
                          alt={envase.producto.Nombre}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <PaintBucket className="text-gray-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-black text-blue-950">
                        {envase.unidades}{" "}
                        {envase.unidades === 1
                          ? "envase"
                          : "envases"}{" "}
                        de {envase.producto.Tamaño}
                      </p>

                      <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-gray-500">
                        {envase.producto.Nombre}
                      </p>

                      <p className="mt-3 text-[16px] font-black text-blue-950">
                        {formatearPrecio(
                          envase.precioUnitario *
                            envase.unidades
                        )}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* [Resumen final] */}

        <aside className="sticky top-28 rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
          <div className="flex items-center gap-2">
            <ClipboardList
              size={21}
              className="text-yellow-500"
            />

            <h2 className="text-[21px] font-black tracking-[-0.03em] text-blue-950">
              Resumen final
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
              etiqueta="Tipo"
              valor={datosPasoUno.grupo}
            />

            <FilaResumen
              etiqueta="Aplicación"
              valor={datosPasoUno.aplicacion}
            />

            <FilaResumen
              etiqueta="Manos"
              valor={String(datosPasoDos.manos)}
            />

            <FilaResumen
              etiqueta="Cantidad calculada"
              valor={`${formatearDecimal(
                resultado.cantidadNecesaria
              )} ${simboloUnidad}`}
            />

            <FilaResumen
              etiqueta="Cantidad comprada"
              valor={`${formatearDecimal(
                resultado.cantidadComprada
              )} ${simboloUnidad}`}
            />

            <FilaResumen
              etiqueta="Sobrante estimado"
              valor={`${formatearDecimal(
                resultado.sobrante
              )} ${simboloUnidad}`}
            />
          </div>

          <div className="mt-5 rounded-[20px] bg-blue-950 px-5 py-5 text-white">
            <p className="text-[11px] font-bold text-white/70">
              Total estimado
            </p>

            <p className="mt-1 text-[32px] font-black leading-none">
              {formatearPrecio(
                resultado.precioTotal
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={agregarAlCarrito}
            disabled={
              resultado.envases.length === 0 ||
              !onAgregarAlCarrito
            }
            className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] text-[14px] font-black transition ${
              resultado.envases.length > 0 &&
              onAgregarAlCarrito
                ? "bg-yellow-400 text-blue-950 shadow-[0_8px_20px_rgba(15,23,42,0.14)] hover:bg-yellow-500"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
          >
            <ShoppingCart
              size={19}
              strokeWidth={2.5}
            />
            Agregar al carrito
          </button>

          <button
            type="button"
            onClick={onVolverPaso}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-blue-950 bg-white text-[13px] font-black text-blue-950 transition hover:bg-blue-50"
          >
            <ArrowLeft
              size={18}
              strokeWidth={2.5}
            />
            Volver a pintura
          </button>
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
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F9D55] text-[14px] font-black text-white shadow-sm">
        {numero}
      </div>

      <span className="mt-2 text-[12px] font-black text-[#16813A]">
        {titulo}
      </span>

      <span className="mt-0.5 text-[9px] font-bold text-[#16813A]">
        Finalizado
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
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-[11px] font-semibold text-gray-500">
        {etiqueta}
      </span>

      <span className="max-w-[58%] text-right text-[11px] font-black text-blue-950">
        {valor}
      </span>
    </div>
  );
}