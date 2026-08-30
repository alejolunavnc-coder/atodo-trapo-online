"use client";

import {
  ArrowLeft,
  CircleAlert,
  Droplets,
  Info,
  PackageCheck,
  PaintBucket,
  ShoppingCart,
  Zap,
} from "lucide-react";

import type {
  ProblemaAguaMobile,
} from "./Paso2ExperienciaPiscinaMobile";

import type {
  ProductoPiscinaMobile,
} from "./Paso3TratamientoPiscinaMobile";

export type ItemCompraPiscinaMobile = {
  producto: ProductoPiscinaMobile;
  cantidad: number;
  contenidoBase: number;
  contenidoTexto: string;
  precioUnitario: number;
};

export type CompraEconomicaPiscinaMobile = {
  items: ItemCompraPiscinaMobile[];
  cantidadNecesariaBase: number;
  cantidadCompradaBase: number;
  sobranteBase: number;
  precioTotal: number;
  unidadBase: "ml" | "g";
  unidadVisual: "L" | "kg";
};

type Paso4ResultadoPiscinaMobileProps = {
  litrosPiscina: number;
  problema: ProblemaAguaMobile | null;
  producto: ProductoPiscinaMobile;
  onVolver: () => void;
  onAgregarAlCarrito: (
    items: Array<{
      producto: ProductoPiscinaMobile;
      cantidad: number;
    }>
  ) => void;
};

function numeroDesdeTexto(
  valor: unknown
) {
  const texto = String(valor || "")
    .trim()
    .replace(/\s/g, "");

  if (!texto) return 0;

  const normalizado =
    texto.includes(",") &&
    texto.includes(".")
      ? texto.lastIndexOf(",") >
        texto.lastIndexOf(".")
        ? texto
            .replace(/\./g, "")
            .replace(",", ".")
        : texto.replace(/,/g, "")
      : texto.replace(",", ".");

  const numero = Number(normalizado);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function obtenerValor(
  producto: ProductoPiscinaMobile,
  ...claves: string[]
) {
  for (const clave of claves) {
    const valor = producto[clave];

    if (
      typeof valor === "string" &&
      valor.trim() !== ""
    ) {
      return valor.trim();
    }
  }

  return "";
}

function normalizarUnidad(
  valor: unknown
) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
}

function normalizarTexto(
  valor: unknown
) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function convertirABase(
  cantidad: number,
  unidad: string
) {
  const unidadNormalizada =
    normalizarUnidad(unidad)
      .replace(/³/g, "3")
      .replace(/\s+/g, "");

  if (
    unidadNormalizada === "l" ||
    unidadNormalizada === "lt" ||
    unidadNormalizada === "lts" ||
    unidadNormalizada.includes("litro")
  ) {
    return {
      valor: cantidad * 1000,
      unidadBase: "ml" as const,
      unidadVisual: "L" as const,
    };
  }

  if (
    unidadNormalizada === "ml" ||
    unidadNormalizada === "cc" ||
    unidadNormalizada === "cm3" ||
    unidadNormalizada.includes("mililitro") ||
    unidadNormalizada.includes(
      "centimetrocubico"
    )
  ) {
    return {
      valor: cantidad,
      unidadBase: "ml" as const,
      unidadVisual: "L" as const,
    };
  }

  if (
    unidadNormalizada === "kg" ||
    unidadNormalizada === "kgs" ||
    unidadNormalizada.includes("kilo")
  ) {
    return {
      valor: cantidad * 1000,
      unidadBase: "g" as const,
      unidadVisual: "kg" as const,
    };
  }

  if (
    unidadNormalizada === "g" ||
    unidadNormalizada === "gr" ||
    unidadNormalizada === "grs" ||
    unidadNormalizada === "gs" ||
    unidadNormalizada.includes("gramo")
  ) {
    return {
      valor: cantidad,
      unidadBase: "g" as const,
      unidadVisual: "kg" as const,
    };
  }

  return null;
}

function esProductoSolido(
  producto: ProductoPiscinaMobile
) {
  const texto = normalizarTexto(
    [
      obtenerValor(producto, "Nombre"),
      obtenerValor(
        producto,
        "Linea",
        "Línea"
      ),
      obtenerValor(
        producto,
        "Tamaño",
        "Tamano"
      ),
    ].join(" ")
  );

  return (
    texto.includes("granulado") ||
    texto.includes("granular") ||
    texto.includes("pastilla") ||
    texto.includes("tableta") ||
    /(^|\s)\d+(?:[.,]\d+)?\s*(kg|kgs|kilo|kilos|g|gr|grs|gramo|gramos)(\s|$)/i.test(
      texto
    )
  );
}

function obtenerUnidadDosisCorregida(
  producto: ProductoPiscinaMobile
) {
  const unidadOriginal =
    obtenerValor(
      producto,
      "Unidad dosis"
    );

  const unidadNormalizada =
    normalizarUnidad(unidadOriginal)
      .replace(/³/g, "3")
      .replace(/\s+/g, "");

  const esUnidadLiquida =
    unidadNormalizada === "ml" ||
    unidadNormalizada === "cc" ||
    unidadNormalizada === "cm3" ||
    unidadNormalizada === "l" ||
    unidadNormalizada === "lt" ||
    unidadNormalizada === "lts" ||
    unidadNormalizada.includes("litro") ||
    unidadNormalizada.includes(
      "mililitro"
    );

  if (
    esProductoSolido(producto) &&
    esUnidadLiquida
  ) {
    return "g";
  }

  return unidadOriginal;
}

function obtenerPresentaciones(
  producto: ProductoPiscinaMobile
) {
  const serializadas =
    producto.__PresentacionesPiscina;

  if (!serializadas) {
    return [producto];
  }

  try {
    const presentaciones =
      JSON.parse(serializadas);

    return Array.isArray(
      presentaciones
    )
      ? (presentaciones as ProductoPiscinaMobile[])
      : [producto];
  } catch {
    return [producto];
  }
}

function obtenerContenidoPresentacion(
  producto: ProductoPiscinaMobile
) {
  const texto =
    obtenerValor(
      producto,
      "Tamaño",
      "Tamano"
    );

  const coincidencia = texto.match(
    /(\d+(?:[.,]\d+)?)\s*(ml|mililitros?|cc|cm³|cm3|centímetros?\s*cúbicos?|l|lt|lts|litros?|g|gr|grs|gs|gramos?|kg|kgs|kilos?|k)/i
  );

  if (!coincidencia) {
    return null;
  }

  let unidad =
    coincidencia[2];

  if (
    normalizarTexto(unidad) === "k"
  ) {
    unidad = "kg";
  }

  const cantidad =
    numeroDesdeTexto(
      coincidencia[1]
    );

  const convertido =
    convertirABase(
      cantidad,
      unidad
    );

  if (
    !convertido ||
    convertido.valor <= 0
  ) {
    return null;
  }

  return {
    ...convertido,
    texto,
  };
}

function obtenerPrecioFinal(
  producto: ProductoPiscinaMobile
) {
  const precio =
    numeroDesdeTexto(
      obtenerValor(
        producto,
        "Precio"
      )
    );

  const precioOferta =
    numeroDesdeTexto(
      obtenerValor(
        producto,
        "Precio oferta"
      )
    );

  if (
    precioOferta > 0 &&
    (precio <= 0 ||
      precioOferta < precio)
  ) {
    return precioOferta;
  }

  return precio;
}

export function calcularCompraEconomicaMobile(
  producto: ProductoPiscinaMobile,
  dosisCalculada: number
): CompraEconomicaPiscinaMobile | null {
  if (dosisCalculada <= 0) {
    return null;
  }

  const unidadDosis =
    obtenerUnidadDosisCorregida(
      producto
    );

  const dosisBase =
    convertirABase(
      dosisCalculada,
      unidadDosis
    );

  if (!dosisBase) {
    return null;
  }

  const opciones =
    obtenerPresentaciones(producto)
      .map((presentacion) => {
        const contenido =
          obtenerContenidoPresentacion(
            presentacion
          );

        const precio =
          obtenerPrecioFinal(
            presentacion
          );

        if (
          !contenido ||
          precio <= 0 ||
          contenido.unidadBase !==
            dosisBase.unidadBase
        ) {
          return null;
        }

        return {
          producto:
            presentacion,
          contenidoBase:
            Math.round(
              contenido.valor
            ),
          contenidoTexto:
            contenido.texto,
          precioUnitario: precio,
        };
      })
      .filter(
        (
          opcion
        ): opcion is NonNullable<
          typeof opcion
        > => opcion !== null
      );

  if (
    opciones.length === 0
  ) {
    return null;
  }

  const necesaria =
    Math.ceil(
      dosisBase.valor
    );

  let mejor: {
    cantidades: number[];
    total: number;
    comprado: number;
    envases: number;
  } | null = null;

  const cantidades =
    new Array(
      opciones.length
    ).fill(0);

  function esMejor(
    total: number,
    comprado: number,
    envases: number
  ) {
    if (!mejor) return true;

    if (
      total !== mejor.total
    ) {
      return total < mejor.total;
    }

    const sobrante =
      comprado - necesaria;

    const mejorSobrante =
      mejor.comprado -
      necesaria;

    if (
      sobrante !==
      mejorSobrante
    ) {
      return (
        sobrante <
        mejorSobrante
      );
    }

    return (
      envases <
      mejor.envases
    );
  }

  function explorar(
    indice: number,
    comprado: number,
    total: number,
    envases: number
  ) {
    if (
      mejor &&
      total > mejor.total
    ) {
      return;
    }

    if (
      indice ===
      opciones.length
    ) {
      if (
        comprado >= necesaria &&
        esMejor(
          total,
          comprado,
          envases
        )
      ) {
        mejor = {
          cantidades: [
            ...cantidades,
          ],
          total,
          comprado,
          envases,
        };
      }

      return;
    }

    const opcion =
      opciones[indice];

    const faltante =
      Math.max(
        0,
        necesaria -
          comprado
      );

    const maximoNecesario =
      Math.ceil(
        faltante /
          opcion.contenidoBase
      ) + 1;

    for (
      let cantidad = 0;
      cantidad <=
      maximoNecesario;
      cantidad += 1
    ) {
      cantidades[indice] =
        cantidad;

      explorar(
        indice + 1,
        comprado +
          cantidad *
            opcion.contenidoBase,
        total +
          cantidad *
            opcion.precioUnitario,
        envases + cantidad
      );
    }

    cantidades[indice] = 0;
  }

  explorar(
    0,
    0,
    0,
    0
  );

  if (!mejor) {
    return null;
  }

  const resultado =
    mejor as {
      cantidades: number[];
      total: number;
      comprado: number;
      envases: number;
    };

  const items =
    opciones
      .map(
        (
          opcion,
          indice
        ) => ({
          ...opcion,
          cantidad:
            resultado
              .cantidades[
              indice
            ],
        })
      )
      .filter(
        (item) =>
          item.cantidad >
          0
      );

  return {
    items,
    cantidadNecesariaBase:
      necesaria,
    cantidadCompradaBase:
      resultado.comprado,
    sobranteBase:
      resultado.comprado -
      necesaria,
    precioTotal:
      resultado.total,
    unidadBase:
      dosisBase.unidadBase,
    unidadVisual:
      dosisBase.unidadVisual,
  };
}

export function formatearBaseCompraMobile(
  valorBase: number,
  unidadVisual: "L" | "kg"
) {
  const valor =
    valorBase / 1000;

  return `${valor.toLocaleString(
    "es-AR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )} ${unidadVisual}`;
}

function formatearCantidad(
  valor: number
) {
  return valor.toLocaleString(
    "es-AR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );
}

function tieneDosisPotenciada(
  producto: ProductoPiscinaMobile
) {
  return (
    obtenerValor(
      producto,
      "Dosis potenciada"
    )
      .trim()
      .toLowerCase() === "x"
  );
}

function obtenerTextoPotenciado(
  problema: ProblemaAguaMobile | null
) {
  if (
    problema === "agua_turbia"
  ) {
    return "Si el agua está extremadamente turbia o casi no se ve el fondo, podés duplicar la dosis recomendada.";
  }

  if (
    problema === "agua_verde"
  ) {
    return "Si el agua está extremadamente verde, podés duplicar la dosis recomendada.";
  }

  if (
    problema === "algas"
  ) {
    return "Si hay una presencia intensa de algas, podés duplicar la dosis recomendada.";
  }

  return "Ante una situación extrema, podés duplicar la dosis recomendada.";
}

export default function Paso4ResultadoPiscinaMobile({
  litrosPiscina,
  problema,
  producto,
  onVolver,
  onAgregarAlCarrito,
}: Paso4ResultadoPiscinaMobileProps) {
  const nombre =
    obtenerValor(
      producto,
      "Nombre"
    ) ||
    "Producto para piscina";

  const marca =
    obtenerValor(
      producto,
      "Marca"
    );

  const imagen =
    obtenerValor(
      producto,
      "Imagen"
    );

  const dosis =
    numeroDesdeTexto(
      obtenerValor(
        producto,
        "Dosis"
      )
    );

  const litrosReferencia =
    numeroDesdeTexto(
      obtenerValor(
        producto,
        "Litros referencia"
      )
    );

  const unidad =
    obtenerUnidadDosisCorregida(
      producto
    ) || "unidades";

  const modoUso =
    obtenerValor(
      producto,
      "Modo de uso",
      "Modo uso",
      "Modo de Uso",
      "Modo Uso"
    );

  const pasosModoUso =
    modoUso
      .split(".")
      .map(
        (paso) =>
          paso.trim()
      )
      .filter(Boolean);

  const advertencia =
    obtenerValor(
      producto,
      "Advertencia"
    );

  const datos =
    obtenerValor(
      producto,
      "Datos",
      "Tiempo de espera"
    );

  const dosisCalculada =
    litrosPiscina > 0 &&
    dosis > 0 &&
    litrosReferencia > 0
      ? (litrosPiscina *
          dosis) /
        litrosReferencia
      : 0;

  const compraEconomica =
    calcularCompraEconomicaMobile(
      producto,
      dosisCalculada
    );

  const mostrarPotenciada =
    tieneDosisPotenciada(
      producto
    );

  function agregarCompra() {
    if (compraEconomica) {
      onAgregarAlCarrito(
        compraEconomica.items.map(
          (item) => ({
            producto:
              item.producto,
            cantidad:
              item.cantidad,
          })
        )
      );

      return;
    }

    onAgregarAlCarrito([
      {
        producto,
        cantidad: 1,
      },
    ]);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">
              Paso 4
            </p>

            <h2 className="mt-1 text-[17px] font-black leading-tight text-blue-950">
              Resultado del tratamiento
            </h2>

            <p className="mt-1 text-[9px] font-medium leading-relaxed text-gray-500">
              Calculamos la cantidad según los litros de tu piscina.
            </p>
          </div>

          <button
            type="button"
            onClick={onVolver}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-[10px] font-black text-blue-950 shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft
              size={14}
              strokeWidth={2.6}
            />

            Volver
          </button>
        </div>
      </section>

      <section className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
          <div className="relative flex min-h-[132px] items-center justify-center overflow-hidden rounded-[16px] bg-gray-50 p-2.5">
            {marca && (
              <span className="absolute left-2 top-2 z-10 max-w-[88px] truncate rounded-full bg-white px-2 py-1 text-[7px] font-black text-cyan-700 shadow-sm">
                {marca}
              </span>
            )}

            {imagen ? (
              <img
                src={imagen}
                alt={nombre}
                className="h-[92%] w-[92%] object-contain"
              />
            ) : (
              <PaintBucket
                size={44}
                className="text-gray-300"
              />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-black leading-tight text-blue-950">
              {nombre}
            </h3>

            <div className="relative mt-3 overflow-hidden rounded-[16px] bg-gradient-to-br from-[#0759A8] via-[#087CC8] to-[#20A9E8] p-3.5 text-white shadow-[0_12px_28px_rgba(8,124,200,0.26)]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-white/15">
                  <Droplets
                    size={16}
                    strokeWidth={2.5}
                  />
                </span>

                <p className="text-[8px] font-black uppercase tracking-[0.08em] text-white/80">
                  Dosis recomendada
                </p>
              </div>

              <div className="mt-3 flex items-end gap-1.5">
                <p className="text-[28px] font-black leading-none">
                  {dosisCalculada > 0
                    ? formatearCantidad(
                        dosisCalculada
                      )
                    : "—"}
                </p>

                <p className="pb-0.5 text-[11px] font-black text-white/90">
                  {dosisCalculada > 0
                    ? unidad
                    : "Sin datos"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {mostrarPotenciada &&
          dosisCalculada > 0 && (
            <div className="mt-3 rounded-[16px] border border-violet-300 bg-violet-50 p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-violet-600 text-white">
                  <Zap
                    size={18}
                    strokeWidth={2.6}
                  />
                </span>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-violet-700">
                    Tratamiento shock
                  </p>

                  <p className="mt-1 text-[10px] font-black text-blue-950">
                    Dosis principal:{" "}
                    {formatearCantidad(
                      dosisCalculada
                    )}{" "}
                    {unidad}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[9px] font-semibold leading-relaxed text-gray-700">
                {obtenerTextoPotenciado(
                  problema
                )}
              </p>
            </div>
          )}

        {dosisCalculada <= 0 && (
          <div className="mt-3 flex items-start gap-2.5 rounded-[15px] border border-amber-300 bg-amber-50 p-3">
            <CircleAlert
              size={17}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <p className="text-[9px] font-bold leading-relaxed text-amber-900">
              Completá Dosis, Unidad dosis y Litros referencia en Google Sheets.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[20px] border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/50 p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-cyan-100 text-cyan-700">
            <Droplets
              size={18}
              strokeWidth={2.5}
            />
          </span>

          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">
            Modo de uso
          </p>
        </div>

        {pasosModoUso.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {pasosModoUso.map(
              (paso, indice) => (
                <li
                  key={`${paso}-${indice}`}
                  className="flex items-start gap-3 rounded-[13px] border border-cyan-100 bg-white px-3 py-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-[8px] font-black text-white">
                    {indice + 1}
                  </span>

                  <p className="pt-0.5 text-[9px] font-semibold leading-relaxed text-slate-700">
                    {paso}.
                  </p>
                </li>
              )
            )}
          </ol>
        ) : (
          <p className="mt-3 rounded-[13px] border border-amber-200 bg-amber-50 px-3 py-3 text-[9px] font-bold leading-relaxed text-amber-900">
            Este producto no tiene un modo de uso cargado.
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <InfoProducto
          titulo="Advertencia"
          texto={
            advertencia ||
            "Sin advertencias cargadas"
          }
          tono="rojo"
        />

        <InfoProducto
          titulo="Datos importantes"
          texto={
            datos ||
            "Sin datos adicionales cargados"
          }
          tono="verde"
        />
      </div>

      <section className="rounded-[20px] border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-emerald-600 text-white">
            <PackageCheck
              size={18}
              strokeWidth={2.6}
            />
          </span>

          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-emerald-700">
              Opción más económica
            </p>

            <p className="mt-1 text-[12px] font-black text-blue-950">
              Compra recomendada
            </p>
          </div>
        </div>

        {compraEconomica ? (
          <>
            <div className="mt-3 space-y-2">
              {compraEconomica.items.map(
                (item, indice) => (
                  <div
                    key={`${item.contenidoTexto}-${indice}`}
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-emerald-100 bg-white px-3 py-2.5"
                  >
                    <p className="text-[9px] font-bold text-slate-700">
                      {item.cantidad}{" "}
                      {item.cantidad === 1
                        ? "envase"
                        : "envases"}{" "}
                      de{" "}
                      {
                        item.contenidoTexto
                      }
                    </p>

                    <p className="text-[9px] font-black text-emerald-700">
                      {(
                        item.precioUnitario *
                        item.cantidad
                      ).toLocaleString(
                        "es-AR",
                        {
                          style:
                            "currency",
                          currency:
                            "ARS",
                          maximumFractionDigits:
                            0,
                        }
                      )}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <DatoCompra
                etiqueta="Necesitás"
                valor={formatearBaseCompraMobile(
                  compraEconomica.cantidadNecesariaBase,
                  compraEconomica.unidadVisual
                )}
              />

              <DatoCompra
                etiqueta="Comprás"
                valor={formatearBaseCompraMobile(
                  compraEconomica.cantidadCompradaBase,
                  compraEconomica.unidadVisual
                )}
              />

              <DatoCompra
                etiqueta="Sobrante"
                valor={formatearBaseCompraMobile(
                  compraEconomica.sobranteBase,
                  compraEconomica.unidadVisual
                )}
              />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-[13px] bg-emerald-600 px-3 py-3 text-white">
              <span className="text-[9px] font-black uppercase tracking-[0.06em]">
                Total estimado
              </span>

              <span className="text-[15px] font-black">
                {compraEconomica.precioTotal.toLocaleString(
                  "es-AR",
                  {
                    style:
                      "currency",
                    currency:
                      "ARS",
                    maximumFractionDigits:
                      0,
                  }
                )}
              </span>
            </div>
          </>
        ) : (
          <p className="mt-3 rounded-[13px] border border-amber-200 bg-amber-50 px-3 py-3 text-[9px] font-semibold leading-relaxed text-amber-900">
            No se pudo calcular automáticamente la combinación de envases, pero igualmente podés agregar una unidad al carrito.
          </p>
        )}

        <button
          type="button"
          onClick={agregarCompra}
          className="mt-3 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[16px] bg-teal-700 px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(15,118,110,0.26)] transition active:scale-[0.98]"
        >
          <ShoppingCart
            size={18}
            strokeWidth={2.6}
          />

          {compraEconomica
            ? "Agregar compra recomendada"
            : "Agregar producto al carrito"}
        </button>
      </section>

    </div>
  );
}

function DatoCompra({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="rounded-[11px] border border-emerald-100 bg-white px-1.5 py-2 text-center">
      <p className="text-[7px] font-black uppercase tracking-[0.06em] text-gray-400">
        {etiqueta}
      </p>

      <p className="mt-1 text-[9px] font-black text-blue-950">
        {valor}
      </p>
    </div>
  );
}

function InfoProducto({
  titulo,
  texto,
  tono,
}: {
  titulo: string;
  texto: string;
  tono: "rojo" | "verde";
}) {
  const esRojo =
    tono === "rojo";

  return (
    <section
      className={`rounded-[16px] border p-3 ${
        esRojo
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] ${
            esRojo
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {esRojo ? (
            <CircleAlert
              size={16}
              strokeWidth={2.6}
            />
          ) : (
            <Info
              size={16}
              strokeWidth={2.6}
            />
          )}
        </span>

        <p
          className={`text-[8px] font-black uppercase tracking-[0.08em] ${
            esRojo
              ? "text-red-700"
              : "text-emerald-700"
          }`}
        >
          {titulo}
        </p>
      </div>

      <p
        className={`mt-2.5 text-[8px] font-bold leading-relaxed ${
          esRojo
            ? "text-red-950"
            : "text-emerald-950"
        }`}
      >
        {texto}
      </p>
    </section>
  );
}