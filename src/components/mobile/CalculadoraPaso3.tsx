"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  PackageCheck,
  PaintBucket,
  PartyPopper,
  ShoppingCart,
} from "lucide-react";

import type { Producto } from "@/src/types/producto";
import type { DatosPasoUno } from "./CalculadoraPintura";
import type { DatosPasoDos } from "./CalculadoraPaso2";
import MobileHeaderCompartido from "./MobileHeaderCompartido";

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

export type DatosPasoTres = {
  cantidadNecesaria: number;
  cantidadComprada: number;
  sobrante: number;
  unidad: Unidad;
  precioTotal: number;
  envases: EnvaseRecomendado[];
};

type CalculadoraPaso3Props = {
  datosPasoUno: DatosPasoUno;
  datosPasoDos: DatosPasoDos;
  cantidadCarrito?: number;
  onVolverPaso: () => void;
  onAgregarAlCarrito: (
    items: Array<{
      producto: Producto;
      cantidad: number;
    }>
  ) => void;
  onFinalizado: () => void;
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

  return precioOferta > 0 ? precioOferta : precio;
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

  const texto = normalizarTexto(original)
    .replace(/\s+/g, "");

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

  const litros = texto.match(/^(\d+(?:[.,]\d+)?)l$/i);

  if (litros) {
    return {
      cantidad: Number(litros[1].replace(",", ".")),
      unidad: "L",
    };
  }

  const mililitros = texto.match(
    /^(\d+(?:[.,]\d+)?)(ml|cm3)$/i
  );

  if (mililitros) {
    return {
      cantidad:
        Number(mililitros[1].replace(",", ".")) / 1000,
      unidad: "L",
    };
  }

  const kilos = texto.match(
    /^(\d+(?:[.,]\d+)?)(k|kg)$/i
  );

  if (kilos) {
    return {
      cantidad: Number(kilos[1].replace(",", ".")),
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

  const cantidadLitros = envases.filter(
    (envase) => envase.unidad === "L"
  ).length;

  const cantidadKilos = envases.filter(
    (envase) => envase.unidad === "K"
  ).length;

  return cantidadKilos > cantidadLitros ? "K" : "L";
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
    Math.max(1, Math.round(envase.cantidad * escala))
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

  for (let total = 0; total <= limite; total += 1) {
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

    const sobranteActual = total - objetivo;
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

export default function CalculadoraPaso3({
  datosPasoUno,
  datosPasoDos,
  cantidadCarrito = 0,
  onVolverPaso,
  onAgregarAlCarrito,
  onFinalizado,
}: CalculadoraPaso3Props) {
  const [agregando, setAgregando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);
  const resultado = useMemo<DatosPasoTres>(() => {
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
      datosPasoUno.superficieNeta *
      datosPasoDos.manos /
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

  function agregarAlCarrito() {
    if (
      resultado.envases.length === 0 ||
      agregando
    ) {
      return;
    }

    setAgregando(true);

    onAgregarAlCarrito(
      resultado.envases.map((envase) => ({
        producto: envase.producto,
        cantidad: envase.unidades,
      }))
    );

    setMostrarConfirmacion(true);

    window.setTimeout(() => {
      onFinalizado();
    }, 1050);
  }

  const mostrarAvisoBaseTexturado =
    normalizarTexto(datosPasoUno.grupo) === "texturado" &&
    ["mediano", "grueso"].includes(
      normalizarTexto(datosPasoUno.aplicacion)
    );

  const nombreUnidad =
    resultado.unidad === "K"
      ? "kilos"
      : "litros";

  const simboloUnidad =
    resultado.unidad === "K" ? "kg" : "L";

  return (
    <main className="min-h-screen bg-[#F7F9FC] pb-44 text-[#081B43]">
      <MobileHeaderCompartido
        cantidadCarrito={cantidadCarrito}
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

          <div>
            <h1 className="text-[22px] font-black leading-tight tracking-[-0.04em]">
              Calculadora de pintura
            </h1>

            <p className="mt-0.5 text-[11px] font-medium text-gray-500">
              Resultado final
            </p>
          </div>
        </div>
      </section>

      {/* [Progreso] */}

      <section className="bg-white px-6 pb-4 pt-2">
        <div className="flex items-start">
          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8A400] text-white">
              <Check size={17} strokeWidth={3} />
            </div>

            <span className="mt-1 text-[10px] font-black text-[#081B43]">
              Medidas
            </span>
          </div>

          <div className="mt-4 h-[2px] flex-1 bg-[#F8A400]" />

          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8A400] text-white">
              <Check size={17} strokeWidth={3} />
            </div>

            <span className="mt-1 text-[10px] font-black text-[#081B43]">
              Pintura
            </span>
          </div>

          <div className="mt-4 h-[2px] flex-1 bg-[#1F9D55]" />

          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F9D55] text-[13px] font-black text-white shadow-[0_5px_14px_rgba(31,157,85,0.28)]">
              3
            </div>

            <span className="mt-1 text-[10px] font-black text-[#16813A]">
              Resultado
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-[15px] bg-[#EAF8EC] px-3 py-2.5">
          <PartyPopper
            size={18}
            strokeWidth={2.3}
            className="text-[#1F9D55]"
          />

          <p className="text-[11px] font-black text-[#16813A]">
            ¡Listo! Ya calculamos tu compra
          </p>
        </div>
      </section>

      <div className="space-y-3 px-3 pt-3">
        {/* [Aviso para texturado mediano y grueso] */}

        {mostrarAvisoBaseTexturado && (
          <section className="rounded-[22px] border border-[#F8A400]/45 bg-[#FFF8E7] p-3 shadow-[0_7px_20px_rgba(8,27,67,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8A400] text-[#081B43] shadow-[0_6px_16px_rgba(248,164,0,0.22)]">
                <PaintBucket size={20} strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <h2 className="text-[13px] font-black text-[#081B43]">
                  Importante
                </h2>

                <p className="mt-1 text-[10px] font-semibold leading-relaxed text-gray-600">
                  Aplicá primero una base del color que elijas,
                  similar o combinada con el revestimiento, para
                  evitar que se vea el fondo anterior entre los
                  relieves.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* [Resultado principal] */}

        <section className="rounded-[22px] border border-[#1F9D55] bg-white p-4 shadow-[0_7px_20px_rgba(8,27,67,0.07)] ring-2 ring-[#1F9D55]/20">
          <div className="flex items-center gap-2">
            <PackageCheck
              size={21}
              strokeWidth={2.4}
              className="text-[#1F9D55]"
            />

            <h2 className="text-[15px] font-black">
              Cantidad necesaria
            </h2>
          </div>

          <div className="mt-4 rounded-[18px] bg-[#EAF8EC] px-4 py-5 text-center">
            <p className="text-[10px] font-bold text-[#16813A]">
              Necesitás aproximadamente
            </p>

            <p className="mt-1 text-[32px] font-black leading-none text-[#081B43]">
              {formatearDecimal(
                resultado.cantidadNecesaria
              )}{" "}
              {nombreUnidad}
            </p>
          </div>
        </section>

        {/* [Envases recomendados] */}

        <section className="rounded-[22px] border border-gray-100 bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)]">
          <div className="flex items-center gap-2">
            <PackageCheck
              size={20}
              className="text-[#F8A400]"
            />

            <h2 className="text-[15px] font-black">
              Qué envases comprar
            </h2>
          </div>

          {resultado.envases.length === 0 ? (
            <div className="mt-3 rounded-[16px] border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
              <p className="text-[11px] font-black">
                No encontramos tamaños disponibles
              </p>

              <p className="mt-1 text-[9px] text-gray-500">
                Revisá los tamaños, precios y stock de
                esta pintura.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {resultado.envases.map((envase) => (
                <div
                  key={`${envase.producto.Nombre}-${envase.producto.Tamaño}`}
                  className="flex items-center gap-3 rounded-[16px] border border-gray-100 bg-[#F8FAFD] p-2.5"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-white p-1">
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
                    <p className="text-[11px] font-black">
                      {envase.unidades}{" "}
                      {envase.unidades === 1
                        ? "envase"
                        : "envases"}{" "}
                      de {envase.producto.Tamaño}
                    </p>

                    <p className="mt-0.5 truncate text-[9px] font-semibold text-gray-500">
                      {envase.producto.Nombre}
                    </p>

                    <p className="mt-1 text-[11px] font-black text-[#123A72]">
                      {formatearPrecio(
                        envase.precioUnitario *
                          envase.unidades
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* [Resumen] */}

        <section className="rounded-[22px] border border-gray-100 bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)]">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList
              size={20}
              className="text-[#F8A400]"
            />

            <h2 className="text-[15px] font-black">
              Resumen
            </h2>
          </div>

          <div className="overflow-hidden rounded-[15px] border border-gray-100">
            <FilaResumen
              etiqueta="Superficie"
              valor={`${formatearDecimal(
                datosPasoUno.superficieNeta
              )} m²`}
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

            <div className="flex items-center justify-between bg-[#FFF3D3] px-3 py-3">
              <span className="text-[12px] font-black">
                Total estimado
              </span>

              <span className="text-[17px] font-black">
                {formatearPrecio(
                  resultado.precioTotal
                )}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* [Volver] */}

      <button
        type="button"
        onClick={onVolverPaso}
        className="fixed bottom-[96px] right-4 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#123A72]/90 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-sm transition active:scale-90"
        aria-label="Volver al Paso 2"
      >
        <ArrowLeft
          size={25}
          strokeWidth={2.7}
        />
      </button>

      {/* [Agregar al carrito] */}

      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-gray-100 bg-white/95 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="button"
          onClick={agregarAlCarrito}
          disabled={
            resultado.envases.length === 0 ||
            agregando
          }
          className={`flex h-[56px] w-full touch-manipulation select-none items-center justify-center gap-3 rounded-[18px] text-[15px] font-black transition active:scale-[0.98] ${
            resultado.envases.length > 0 &&
            !agregando
              ? "bg-[#F8A400] text-[#081B43] shadow-[0_8px_22px_rgba(248,164,0,0.3)]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          <ShoppingCart
            size={21}
            strokeWidth={2.5}
          />

          {agregando
            ? "Agregando..."
            : "Agregar al carrito"}
        </button>
      </div>

      {mostrarConfirmacion && (
        <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="flex flex-col items-center rounded-[28px] bg-white/95 px-8 py-7 shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1F9D55] text-white shadow-[0_10px_25px_rgba(31,157,85,0.35)]">
              <Check size={34} strokeWidth={3} />
            </div>

            <p className="mt-3 text-[15px] font-black text-[#081B43]">
              Agregado al carrito
            </p>

            <p className="mt-1 text-[10px] font-semibold text-gray-500">
              Volviendo al inicio…
            </p>
          </div>
        </div>
      )}
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
      <span className="text-[9px] font-medium text-gray-500">
        {etiqueta}
      </span>

      <span className="max-w-[62%] text-right text-[9px] font-black">
        {valor}
      </span>
    </div>
  );
}