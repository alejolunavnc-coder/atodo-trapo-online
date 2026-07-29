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

  const tiempoEspera =
    obtenerValor(
      producto,
      "Tiempo de espera"
    );

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
        <div className="flex min-h-[280px] items-center justify-center rounded-[20px] bg-gray-50 p-5">
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
          {marca && (
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1.5 text-[10px] font-black text-sky-700">
              {marca}
            </span>
          )}

          <h3 className="mt-3 text-[24px] font-black tracking-[-0.03em] text-blue-950">
            {nombre}
          </h3>

          <div className="mt-5 rounded-[22px] bg-gradient-to-br from-[#0D5EA8] to-[#078ACB] p-5 text-white">
            <div className="flex items-center gap-2">
              <Droplets
                size={19}
                strokeWidth={2.5}
              />

              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/75">
                Dosis recomendada para tu piscina
              </p>
            </div>

            <p className="mt-3 text-[38px] font-black leading-none">
              {dosisCalculada > 0
                ? formatearCantidad(
                    dosisCalculada
                  )
                : "—"}
            </p>

            <p className="mt-1 text-[15px] font-black text-white/85">
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

      <div className="grid grid-cols-3 gap-4">
        <DatoResultado
          titulo="Modo de uso"
          valor={
            modoUso ||
            "Sin información cargada"
          }
        />

        <DatoResultado
          titulo="Tiempo de espera"
          valor={
            tiempoEspera ||
            "Sin información cargada"
          }
        />

        <DatoResultado
          titulo="Advertencia"
          valor={
            advertencia ||
            "Sin advertencias cargadas"
          }
          advertencia
        />
      </div>
    </section>
  );
}

function DatoResultado({
  titulo,
  valor,
  advertencia = false,
}: {
  titulo: string;
  valor: string;
  advertencia?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-5 ${
        advertencia
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-[0.12em] ${
          advertencia
            ? "text-amber-700"
            : "text-sky-600"
        }`}
      >
        {titulo}
      </p>

      <p className="mt-3 text-[11px] font-semibold leading-relaxed text-gray-700">
        {valor}
      </p>
    </div>
  );
}