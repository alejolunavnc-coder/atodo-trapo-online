"use client";

import {
  ArrowLeft,
  CircleAlert,
  Droplets,
  PaintBucket,
  Zap,
} from "lucide-react";

import type {
  ProblemaAgua,
} from "./Paso2ExperienciaPiscina";

import type {
  ProductoPiscina,
} from "./Paso3TratamientoPiscina";

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

function separarModoDeUso(
  valor: string
) {
  return valor
    .replace(
      /(\d)\.(\d{3})(?=\D|$)/g,
      "$1__MILES__$2"
    )
    .split(/(?:\r?\n|;|\.\s+)+/)
    .map((paso) =>
      paso
        .replace(
          /__MILES__/g,
          "."
        )
        .trim()
    )
    .filter(Boolean);
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
    obtenerValor(
      producto,
      "Unidad dosis"
    ) || "unidades";

  const modoUso =
    obtenerValor(
      producto,
      "Modo de uso"
    );

  const pasosModoUso =
    separarModoDeUso(modoUso);

  const advertencia =
    obtenerValor(
      producto,
      "Advertencia"
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

          <div className="relative mt-5 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0D5EA8] via-[#0879C5] to-[#159BE8] p-5 text-white shadow-[0_18px_38px_rgba(8,121,197,0.24)]">
            <div className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-72 rounded-[50%] border border-white/15" />
            <div className="pointer-events-none absolute -bottom-20 -right-2 h-44 w-80 rounded-[50%] border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-8 h-44 w-80 rounded-[50%] border border-white/10" />
            <div className="pointer-events-none absolute right-6 top-5 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 flex items-center gap-2">
              <Droplets
                size={19}
                strokeWidth={2.5}
              />

              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/75">
                Dosis recomendada para tu piscina
              </p>
            </div>

            <p className="relative z-10 mt-3 text-[38px] font-black leading-none">
              {dosisCalculada > 0
                ? formatearCantidad(
                    dosisCalculada
                  )
                : "—"}
            </p>

            <p className="relative z-10 mt-1 text-[15px] font-black text-white/85">
              {dosisCalculada > 0
                ? unidad
                : "Faltan datos de dosis"}
            </p>
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[20px] border border-gray-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-600">
            Modo de uso
          </p>

          {pasosModoUso.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {pasosModoUso.map(
                (paso, indice) => (
                  <li
                    key={`${paso}-${indice}`}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">
                      {indice + 1}
                    </span>

                    <p className="pt-0.5 text-[11px] font-semibold leading-relaxed text-gray-700">
                      {paso}.
                    </p>
                  </li>
                )
              )}
            </ol>
          ) : (
            <p className="mt-3 text-[11px] font-semibold leading-relaxed text-gray-500">
              Sin información cargada
            </p>
          )}
        </div>

        <div className="rounded-[20px] border border-red-300 bg-red-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-700">
            Advertencia
          </p>

          <p className="mt-3 text-[11px] font-semibold leading-relaxed text-red-900">
            {advertencia ||
              "Sin advertencias cargadas"}
          </p>
        </div>
      </div>
    </section>
  );
}
