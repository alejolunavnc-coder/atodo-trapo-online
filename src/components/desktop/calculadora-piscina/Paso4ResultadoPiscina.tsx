"use client";

import {
  ArrowLeft,
  CircleAlert,
  Droplets,
  Info,
  PackageCheck,
  PaintBucket,
  Zap,
} from "lucide-react";

import type {
  ProblemaAgua,
} from "./Paso2ExperienciaPiscina";

import type {
  ProductoPiscina,
} from "./Paso3TratamientoPiscina";

export type ItemCompraPiscina = {
  producto: ProductoPiscina;
  cantidad: number;
  contenidoBase: number;
  contenidoTexto: string;
  precioUnitario: number;
};

export type CompraEconomicaPiscina = {
  items: ItemCompraPiscina[];
  cantidadNecesariaBase: number;
  cantidadCompradaBase: number;
  sobranteBase: number;
  precioTotal: number;
  unidadBase: "ml" | "g";
  unidadVisual: "L" | "kg";
};

function normalizarUnidad(valor: unknown) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
}

function convertirABase(cantidad: number, unidad: string) {
  const unidadNormalizada = normalizarUnidad(unidad)
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
    unidadNormalizada.includes("centimetrocubico")
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

function obtenerPresentaciones(producto: ProductoPiscina) {
  const serializadas = producto.__PresentacionesPiscina;

  if (!serializadas) {
    return [producto];
  }

  try {
    const presentaciones = JSON.parse(serializadas);
    return Array.isArray(presentaciones)
      ? (presentaciones as ProductoPiscina[])
      : [producto];
  } catch {
    return [producto];
  }
}

function obtenerContenidoPresentacion(producto: ProductoPiscina) {
  const texto = obtenerValor(producto, "Tamaño", "Tamano");
  const coincidencia = texto.match(
    /(\d+(?:[.,]\d+)?)\s*(ml|mililitros?|cc|cm³|cm3|centímetros?\s*cúbicos?|l|lt|lts|litros?|g|gr|grs|gs|gramos?|kg|kgs|kilos?)/i
  );

  if (!coincidencia) {
    return null;
  }

  const cantidad = numeroDesdeTexto(coincidencia[1]);
  const convertido = convertirABase(cantidad, coincidencia[2]);

  if (!convertido || convertido.valor <= 0) {
    return null;
  }

  return { ...convertido, texto };
}

function obtenerPrecioFinal(producto: ProductoPiscina) {
  const precio = numeroDesdeTexto(obtenerValor(producto, "Precio"));
  const precioOferta = numeroDesdeTexto(obtenerValor(producto, "Precio oferta"));

  if (precioOferta > 0 && (precio <= 0 || precioOferta < precio)) {
    return precioOferta;
  }

  return precio;
}


function normalizarTextoProducto(
  valor: unknown
) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function esProductoSolidoPiscina(
  producto: ProductoPiscina
) {
  const texto = normalizarTextoProducto(
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
  producto: ProductoPiscina
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
    unidadNormalizada.includes(
      "litro"
    ) ||
    unidadNormalizada.includes(
      "mililitro"
    );

  if (
    esProductoSolidoPiscina(producto) &&
    esUnidadLiquida
  ) {
    return "g";
  }

  return unidadOriginal;
}

export function calcularCompraEconomica(
  producto: ProductoPiscina,
  dosisCalculada: number
): CompraEconomicaPiscina | null {
  if (dosisCalculada <= 0) {
    return null;
  }

  const unidadDosis =
    obtenerUnidadDosisCorregida(
      producto
    );
  const dosisBase = convertirABase(dosisCalculada, unidadDosis);

  if (!dosisBase) {
    return null;
  }

  const opciones = obtenerPresentaciones(producto)
    .map((presentacion) => {
      const contenido = obtenerContenidoPresentacion(presentacion);
      const precio = obtenerPrecioFinal(presentacion);

      if (!contenido || precio <= 0 || contenido.unidadBase !== dosisBase.unidadBase) {
        return null;
      }

      return {
        producto: presentacion,
        contenidoBase: Math.round(contenido.valor),
        contenidoTexto: contenido.texto,
        precioUnitario: precio,
      };
    })
    .filter((opcion): opcion is NonNullable<typeof opcion> => opcion !== null);

  if (opciones.length === 0) {
    return null;
  }

  const necesaria = Math.ceil(dosisBase.valor);
  let mejor: {
    cantidades: number[];
    total: number;
    comprado: number;
    envases: number;
  } | null = null;

  const cantidades = new Array(opciones.length).fill(0);

  function esMejor(total: number, comprado: number, envases: number) {
    if (!mejor) return true;
    if (total !== mejor.total) return total < mejor.total;

    const sobrante = comprado - necesaria;
    const mejorSobrante = mejor.comprado - necesaria;
    if (sobrante !== mejorSobrante) return sobrante < mejorSobrante;

    return envases < mejor.envases;
  }

  function explorar(indice: number, comprado: number, total: number, envases: number) {
    if (mejor && total > mejor.total) return;

    if (indice === opciones.length) {
      if (comprado >= necesaria && esMejor(total, comprado, envases)) {
        mejor = {
          cantidades: [...cantidades],
          total,
          comprado,
          envases,
        };
      }
      return;
    }

    const opcion = opciones[indice];
    const faltante = Math.max(0, necesaria - comprado);
    const maximoNecesario = Math.ceil(faltante / opcion.contenidoBase) + 1;

    for (let cantidad = 0; cantidad <= maximoNecesario; cantidad += 1) {
      cantidades[indice] = cantidad;
      explorar(
        indice + 1,
        comprado + cantidad * opcion.contenidoBase,
        total + cantidad * opcion.precioUnitario,
        envases + cantidad
      );
    }

    cantidades[indice] = 0;
  }

  explorar(0, 0, 0, 0);

  if (!mejor) {
    return null;
  }

  const resultado = mejor as {
    cantidades: number[];
    total: number;
    comprado: number;
    envases: number;
  };

  const items = opciones
    .map((opcion, indice) => ({
      ...opcion,
      cantidad:
        resultado.cantidades[indice],
    }))
    .filter(
      (item) => item.cantidad > 0
    );

  return {
    items,
    cantidadNecesariaBase:
      necesaria,
    cantidadCompradaBase:
      resultado.comprado,
    sobranteBase:
      resultado.comprado - necesaria,
    precioTotal:
      resultado.total,
    unidadBase:
      dosisBase.unidadBase,
    unidadVisual:
      dosisBase.unidadVisual,
  };
}

export function formatearBaseCompra(
  valorBase: number,
  unidadBase: "ml" | "g",
  unidadVisual: "L" | "kg"
) {
  const valor = valorBase / 1000;

  return `${valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${unidadVisual}`;
}

type Paso4ResultadoPiscinaProps = {
  litrosPiscina: number;
  problema: ProblemaAgua | null;
  producto: ProductoPiscina;
  onVolver: () => void;
};

function numeroDesdeTexto(
  valor: unknown
) {
  const texto = String(valor || "")
    .trim()
    .replace(/\s/g, "");

  if (!texto) {
    return 0;
  }

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
  producto: ProductoPiscina,
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

function formatearCantidad(
  valor: number
) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function tieneDosisPotenciada(
  producto: ProductoPiscina
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
  problema: ProblemaAgua | null
) {
  if (problema === "agua_turbia") {
    return "Si el agua está extremadamente turbia o casi no se ve el fondo, este producto permite realizar un tratamiento shock duplicando la dosis recomendada.";
  }

  if (problema === "agua_verde") {
    return "Si el agua está extremadamente verde, este producto permite realizar un tratamiento shock duplicando la dosis recomendada.";
  }

  if (problema === "algas") {
    return "Si hay una presencia intensa de algas en las paredes o el piso, este producto permite realizar un tratamiento shock duplicando la dosis recomendada.";
  }

  if (problema === "mantenimiento") {
    return "Ante lluvia, uso intenso o una pérdida importante de claridad, este producto permite realizar un tratamiento shock duplicando la dosis recomendada.";
  }

  return "Ante una situación extrema, este producto permite realizar un tratamiento shock duplicando la dosis recomendada.";
}

export default function Paso4ResultadoPiscina({
  litrosPiscina,
  problema,
  producto,
  onVolver,
}: Paso4ResultadoPiscinaProps) {
  const nombre =
    obtenerValor(
      producto,
      "Nombre"
    ) || "Producto para piscina";

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

  const pasosModoUso = modoUso
    .split(".")
    .map((paso) => paso.trim())
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


  const mostrarPotenciada =
    tieneDosisPotenciada(producto);

  const dosisCalculada =
    litrosPiscina > 0 &&
    dosis > 0 &&
    litrosReferencia > 0
      ? (litrosPiscina *
          dosis) /
        litrosReferencia
      : 0;

  const compraEconomica =
    calcularCompraEconomica(
      producto,
      dosisCalculada
    );

  return (
    <section className="space-y-6">
      <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
              Paso 4
            </p>

            <h2 className="mt-1 text-[22px] font-black tracking-[-0.03em] text-blue-950">
              Resultado del tratamiento
            </h2>

            <p className="mt-1 text-[13px] font-medium text-gray-500">
              Calculamos la cantidad necesaria según la capacidad de tu piscina.
            </p>
          </div>

          <button
            type="button"
            onClick={onVolver}
            className="flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-[12px] font-black text-blue-950 shadow-sm transition hover:bg-sky-50"
          >
            <ArrowLeft
              size={16}
              strokeWidth={2.5}
            />
            Volver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-6 rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="relative flex min-h-[280px] items-center justify-center rounded-[20px] bg-gray-50 p-5">
          {marca && (
            <span className="absolute left-4 top-4 z-10 inline-flex max-w-[150px] truncate rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-sky-700 shadow-sm ring-1 ring-sky-100">
              {marca}
            </span>
          )}

          {imagen ? (
            <img
              src={imagen}
              alt={nombre}
              className="h-full max-h-[250px] w-full object-contain"
            />
          ) : (
            <PaintBucket
              size={70}
              className="text-gray-300"
            />
          )}
        </div>

        <div>
          <h3 className="text-[24px] font-black tracking-[-0.03em] text-blue-950">
            {nombre}
          </h3>

          <div className="relative mt-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0759A8] via-[#087CC8] to-[#20A9E8] p-5 text-white shadow-[0_20px_44px_rgba(8,124,200,0.30)]">
            <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-3 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-72 rounded-[50%] border border-white/15" />
            <div className="pointer-events-none absolute -bottom-24 left-12 h-44 w-80 rounded-[50%] border border-white/10" />
            <div className="pointer-events-none absolute bottom-2 right-6 h-16 w-16 rounded-full bg-cyan-200/10 blur-2xl" />

            <div className="relative z-10 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Droplets
                  size={19}
                  strokeWidth={2.5}
                />
              </span>

              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/80">
                Dosis recomendada para tu piscina
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-end gap-2">
              <p className="text-[42px] font-black leading-none">
                {dosisCalculada > 0
                  ? formatearCantidad(
                      dosisCalculada
                    )
                  : "—"}
              </p>

              <p className="pb-1 text-[16px] font-black text-white/90">
                {dosisCalculada > 0
                  ? unidad
                  : "Faltan datos"}
              </p>
            </div>

          </div>

          {mostrarPotenciada &&
            dosisCalculada > 0 && (
            <div className="mt-4 rounded-[20px] border border-violet-300 bg-violet-50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
                  <Zap
                    size={20}
                    strokeWidth={2.6}
                  />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-700">
                    Tratamiento shock disponible
                  </p>

                  <p className="mt-1 text-[12px] font-black text-blue-950">
                    La dosis principal sigue siendo{" "}
                    {formatearCantidad(
                      dosisCalculada
                    )}{" "}
                    {unidad}.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[11px] font-semibold leading-relaxed text-gray-700">
                {obtenerTextoPotenciado(
                  problema
                )}
              </p>
            </div>
          )}

          {dosisCalculada <= 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-amber-300 bg-amber-50 p-4">
              <CircleAlert
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-[11px] font-bold leading-relaxed text-amber-900">
                Completá Dosis, Unidad dosis y Litros referencia en Google Sheets para calcular el resultado.
              </p>
            </div>
          )}

          {compraEconomica && (
            <div className="mt-4 rounded-[20px] border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <PackageCheck size={20} strokeWidth={2.6} />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    Opción más económica
                  </p>

                  <p className="mt-1 text-[13px] font-black text-blue-950">
                    Compra recomendada
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {compraEconomica.items.map((item, indice) => (
                  <div
                    key={`${item.contenidoTexto}-${indice}`}
                    className="flex items-center justify-between gap-4 rounded-[14px] border border-emerald-100 bg-white px-4 py-3"
                  >
                    <p className="text-[11px] font-bold text-slate-700">
                      {item.cantidad} {item.cantidad === 1 ? "envase" : "envases"} de {item.contenidoTexto}
                    </p>

                    <p className="text-[11px] font-black text-emerald-700">
                      {(item.precioUnitario * item.cantidad).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <DatoCompra
                  etiqueta="Necesitás"
                  valor={formatearBaseCompra(
                    compraEconomica.cantidadNecesariaBase,
                    compraEconomica.unidadBase,
                    compraEconomica.unidadVisual
                  )}
                />

                <DatoCompra
                  etiqueta="Comprás"
                  valor={formatearBaseCompra(
                    compraEconomica.cantidadCompradaBase,
                    compraEconomica.unidadBase,
                    compraEconomica.unidadVisual
                  )}
                />

                <DatoCompra
                  etiqueta="Sobrante"
                  valor={formatearBaseCompra(
                    compraEconomica.sobranteBase,
                    compraEconomica.unidadBase,
                    compraEconomica.unidadVisual
                  )}
                />
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[14px] bg-emerald-600 px-4 py-3 text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.08em]">
                  Total estimado
                </span>

                <span className="text-[17px] font-black">
                  {compraEconomica.precioTotal.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-[22px] border border-sky-200 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-sky-100 text-sky-700 ring-1 ring-sky-200">
              <Droplets
                size={21}
                strokeWidth={2.5}
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">
                Modo de uso
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-[3px] w-12 rounded-full bg-sky-600" />
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              </div>
            </div>
          </div>

          {pasosModoUso.length > 0 ? (
            <ol className="mt-4 space-y-2.5">
              {pasosModoUso.map(
                (paso, indice) => (
                  <li
                    key={`${paso}-${indice}`}
                    className="group flex items-start gap-4 rounded-[15px] border border-sky-100 bg-white px-3.5 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-blue-700 text-[10px] font-black text-white shadow-sm">
                      {indice + 1}
                    </span>

                    <p className="pt-0.5 text-[11px] font-semibold leading-relaxed text-slate-700">
                      {paso}.
                    </p>
                  </li>
                )
              )}
            </ol>
          ) : (
            <div className="mt-4 rounded-[15px] border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-[11px] font-bold leading-relaxed text-amber-900">
                Este producto no tiene un modo de uso cargado en Google Sheets.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-rows-2 gap-4">
          <div className="rounded-[22px] border border-red-300 bg-gradient-to-br from-red-50 to-white p-5 shadow-[0_10px_24px_rgba(127,29,29,0.07)]">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-red-100 text-red-700 ring-1 ring-red-200">
                <CircleAlert
                  size={21}
                  strokeWidth={2.6}
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-700">
                  Advertencia
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-[3px] w-12 rounded-full bg-red-600" />
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[15px] border-l-4 border-red-500 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-bold leading-relaxed text-red-950">
                {advertencia ||
                  "Sin advertencias cargadas"}
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_10px_24px_rgba(6,95,70,0.07)]">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                <Info
                  size={21}
                  strokeWidth={2.6}
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                  Datos importantes
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-[3px] w-12 rounded-full bg-emerald-600" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[15px] border-l-4 border-emerald-500 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-bold leading-relaxed text-emerald-950">
                {datos ||
                  "Sin datos adicionales cargados"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <div className="rounded-[13px] border border-emerald-100 bg-white px-3 py-2.5 text-center">
      <p className="text-[8px] font-black uppercase tracking-[0.08em] text-gray-400">
        {etiqueta}
      </p>

      <p className="mt-1 text-[11px] font-black text-blue-950">
        {valor}
      </p>
    </div>
  );
}