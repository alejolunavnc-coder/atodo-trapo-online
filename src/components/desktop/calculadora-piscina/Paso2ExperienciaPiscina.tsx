"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  PackageSearch,
  SearchCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export type CaminoExperiencia =
  | "directo"
  | "guiado";

export type ProblemaAgua =
  | "agua_turbia"
  | "agua_verde"
  | "algas"
  | "mantenimiento";


type Paso2ExperienciaPiscinaProps = {
  transicionando: boolean;
  valor: CaminoExperiencia | null;
  problema: ProblemaAgua | null;
  onChange: (
    camino: CaminoExperiencia
  ) => void;
  onCambiarProblema: (
    problema: ProblemaAgua
  ) => void;
  onVolver: () => void;
  onContinuar: () => void;
};

const OPCIONES_PROBLEMA: Array<{
  valor: ProblemaAgua;
  numero: number;
  titulo: string;
  descripcion: string;
}> = [
  {
    valor: "agua_turbia",
    numero: 1,
    titulo: "Agua turbia",
    descripcion:
      "El agua se ve opaca o no permite ver claramente el fondo.",
  },
  {
    valor: "agua_verde",
    numero: 2,
    titulo: "Agua verde",
    descripcion:
      "El agua cambió de color y presenta un tono verdoso.",
  },
  {
    valor: "algas",
    numero: 3,
    titulo: "Algas en paredes o piso",
    descripcion:
      "Hay superficies resbalosas o manchas adheridas.",
  },
  {
    valor: "mantenimiento",
    numero: 4,
    titulo: "El agua está bien",
    descripcion:
      "Quiero mantenerla limpia, clara y en buenas condiciones.",
  },
];

export function obtenerNombreProblema(
  problema: ProblemaAgua | null
) {
  return (
    OPCIONES_PROBLEMA.find(
      (opcion) =>
        opcion.valor === problema
    )?.titulo ?? "Sin seleccionar"
  );
}

export default function Paso2ExperienciaPiscina({
  transicionando,
  valor,
  problema,
  onChange,
  onCambiarProblema,
  onVolver,
  onContinuar,
}: Paso2ExperienciaPiscinaProps) {
  const [caminoLocal, setCaminoLocal] =
    useState<CaminoExperiencia | null>(
      valor
    );

  const preguntaProblemaRef =
    useRef<HTMLElement | null>(null);


  const continuarRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCaminoLocal(valor);
  }, [valor]);

  const completo =
    caminoLocal === "directo" ||
    (caminoLocal === "guiado" &&
      problema !== null);

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
        window.innerHeight * 0.24;

      const distancia = destino - inicio;
      const duracion = 850;
      const tiempoInicial =
        performance.now();

      const suavizar = (
        progreso: number
      ) =>
        progreso < 0.5
          ? 4 *
            progreso *
            progreso *
            progreso
          : 1 -
            Math.pow(
              -2 * progreso + 2,
              3
            ) /
              2;

      function animar(
        tiempoActual: number
      ) {
        const progreso = Math.min(
          (tiempoActual -
            tiempoInicial) /
            duracion,
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

      window.requestAnimationFrame(
        animar
      );
    }, 240);
  }

  useEffect(() => {
    if (caminoLocal !== "guiado") {
      return;
    }

    const timer = window.setTimeout(() => {
      moverSuaveA(
        preguntaProblemaRef
      );
    }, 50);

    return () =>
      window.clearTimeout(timer);
  }, [caminoLocal]);


  useEffect(() => {
    if (completo) {
      moverSuaveA(continuarRef);
    }
  }, [completo]);

  function seleccionarCamino(
    camino: CaminoExperiencia
  ) {
    setCaminoLocal(camino);
    onChange(camino);

    window.setTimeout(() => {
      if (camino === "guiado") {
        moverSuaveA(
          preguntaProblemaRef
        );
      }

      if (camino === "directo") {
        moverSuaveA(continuarRef);
      }
    }, 80);
  }

  return (
    <section
      className={`scroll-mt-28 space-y-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        transicionando
          ? "translate-y-5 scale-[0.99] opacity-0 blur-[2px]"
          : "translate-y-0 scale-100 opacity-100 blur-0"
      }`}
    >
      <div
        className={`rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
          caminoLocal === null
            ? "border-sky-500 ring-2 ring-sky-500/10"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <SearchCheck
                size={23}
                strokeWidth={2.4}
              />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
                Paso 2
              </p>

              <h2 className="mt-1 text-[21px] font-black tracking-[-0.03em] text-blue-950">
                ¿Cómo querés continuar?
              </h2>

              <p className="mt-1 text-[13px] font-medium text-gray-500">
                Elegí si ya sabés qué producto necesitás o si querés que te ayudemos a encontrar la solución.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onVolver}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-[12px] font-black text-blue-950 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
          >
            <ArrowLeft
              size={16}
              strokeWidth={2.5}
            />

            Volver
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <BotonCamino
            titulo="Sé qué producto necesito"
            descripcion="Ir directo al catálogo de productos para piscina y calcular la dosis."
            activo={caminoLocal === "directo"}
            onClick={() =>
              seleccionarCamino("directo")
            }
            icono={
              <PackageSearch
                size={24}
                strokeWidth={2.3}
              />
            }
          />

          <BotonCamino
            titulo="Ayudame a encontrar la solución"
            descripcion="Contar qué problema tiene el agua y recibir una recomendación guiada."
            activo={caminoLocal === "guiado"}
            onClick={() =>
              seleccionarCamino("guiado")
            }
            icono={
              <SearchCheck
                size={24}
                strokeWidth={2.3}
              />
            }
          />
        </div>

        {caminoLocal === null && (
          <Aviso texto="Elegí una opción para continuar." />
        )}
      </div>

      {caminoLocal === "guiado" && (
        <section
          ref={preguntaProblemaRef}
          className={`scroll-mt-28 rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
            problema === null
              ? "border-sky-500 ring-2 ring-sky-500/10"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <SearchCheck
                size={22}
                strokeWidth={2.4}
              />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
                Diagnóstico guiado
              </p>

              <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-blue-950">
                ¿Qué problema tiene el agua?
              </h2>

              <p className="mt-1 text-[12px] font-medium text-gray-500">
                Elegí la opción que mejor describe el estado actual de tu piscina.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {OPCIONES_PROBLEMA.map(
              (opcion) => (
                <BotonProblema
                  key={opcion.valor}
                  numero={opcion.numero}
                  titulo={opcion.titulo}
                  descripcion={
                    opcion.descripcion
                  }
                  activo={
                    problema ===
                    opcion.valor
                  }
                  onClick={() =>
                    onCambiarProblema(
                      opcion.valor
                    )
                  }
                />
              )
            )}
          </div>

          {problema === null && (
            <Aviso texto="Elegí el estado actual del agua para continuar." />
          )}
        </section>
      )}


      {completo ? (
        <div
          ref={continuarRef}
          className="scroll-mt-28 rounded-[24px] border border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_14px_34px_rgba(16,185,129,0.18)] ring-2 ring-emerald-400/15"
        >
          <div className="mb-3 flex items-center justify-center gap-2 text-emerald-700">
            <CircleCheck
              size={18}
              strokeWidth={2.7}
            />

            <p className="text-[11px] font-black uppercase tracking-[0.14em]">
              Paso 2 completado
            </p>
          </div>

          <p className="mb-4 text-center text-[13px] font-bold text-blue-950">
            {caminoLocal === "directo"
              ? "Vas a elegir directamente los productos que necesitás."
              : `Vamos a buscar una solución para: ${obtenerNombreProblema(
                  problema
                )}.`}
          </p>

          <button
            type="button"
            onClick={onContinuar}
            className="group flex h-14 w-full items-center justify-center gap-3 rounded-[17px] bg-emerald-600 px-6 text-[15px] font-black text-white shadow-[0_12px_28px_rgba(16,185,129,0.34)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.99]"
            style={{
              animation:
                "pulsoPasoCompleto 1.9s ease-in-out infinite",
            }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
              <ArrowRight
                size={18}
                strokeWidth={2.7}
              />
            </span>

            {caminoLocal === "directo"
              ? "Ir al Paso 3: productos"
              : problema === "mantenimiento"
                ? "Ir al Paso 3: mantenimiento"
                : "Ir al Paso 3: tratamiento"}
          </button>

          <style jsx>{`
            @keyframes pulsoPasoCompleto {
              0%,
              100% {
                transform: scale(1);
                box-shadow: 0 12px 28px
                  rgba(16, 185, 129, 0.34);
              }

              50% {
                transform: scale(1.015);
                box-shadow: 0 16px 36px
                  rgba(16, 185, 129, 0.46);
              }
            }
          `}</style>
        </div>
      ) : null}
    </section>
  );
}

function BotonCamino({
  titulo,
  descripcion,
  activo,
  onClick,
  icono,
}: {
  titulo: string;
  descripcion: string;
  activo: boolean;
  onClick: () => void;
  icono: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[156px] rounded-[20px] border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        activo
          ? "border-sky-600 bg-sky-50 ring-2 ring-sky-500/15"
          : "border-gray-300 bg-white hover:border-sky-400 hover:bg-sky-50/50"
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
          activo
            ? "bg-sky-600 text-white"
            : "border border-sky-200 bg-sky-50 text-sky-700 group-hover:bg-sky-100"
        }`}
      >
        {icono}
      </span>

      <span className="mt-4 block text-[15px] font-black tracking-[-0.02em] text-blue-950">
        {titulo}
      </span>

      <span className="mt-2 block text-[11px] font-semibold leading-relaxed text-gray-500">
        {descripcion}
      </span>
    </button>
  );
}

function BotonProblema({
  numero,
  titulo,
  descripcion,
  activo,
  onClick,
}: {
  numero: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[126px] rounded-[19px] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        activo
          ? "border-sky-600 bg-sky-50 ring-2 ring-sky-500/15"
          : "border-gray-300 bg-white hover:border-sky-400 hover:bg-sky-50/50"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-black transition ${
          activo
            ? "bg-sky-600 text-white"
            : "border border-sky-200 bg-sky-50 text-sky-700"
        }`}
      >
        {numero}
      </span>

      <span className="mt-3 block text-[14px] font-black text-blue-950">
        {titulo}
      </span>

      <span className="mt-1.5 block text-[10px] font-semibold leading-relaxed text-gray-500">
        {descripcion}
      </span>
    </button>
  );
}

function Aviso({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="mt-4 rounded-[16px] border border-dashed border-sky-300 bg-sky-50/60 px-4 py-3 text-center">
      <p className="text-[11px] font-black text-sky-700">
        {texto}
      </p>
    </div>
  );
}