"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  PackageSearch,
  SearchCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export type CaminoExperienciaMobile =
  | "directo"
  | "guiado";

export type ProblemaAguaMobile =
  | "agua_turbia"
  | "agua_verde"
  | "algas"
  | "mantenimiento";

type Paso2ExperienciaPiscinaMobileProps = {
  transicionando: boolean;
  valor: CaminoExperienciaMobile | null;
  problema: ProblemaAguaMobile | null;
  onChange: (
    camino: CaminoExperienciaMobile
  ) => void;
  onCambiarProblema: (
    problema: ProblemaAguaMobile
  ) => void;
  onVolver: () => void;
  onContinuar: () => void;
};

const OPCIONES_PROBLEMA: Array<{
  valor: ProblemaAguaMobile;
  numero: number;
  titulo: string;
  descripcion: string;
}> = [
  {
    valor: "agua_turbia",
    numero: 1,
    titulo: "Agua turbia",
    descripcion:
      "Se ve opaca o cuesta ver el fondo.",
  },
  {
    valor: "agua_verde",
    numero: 2,
    titulo: "Agua verde",
    descripcion:
      "El agua tiene un tono verdoso.",
  },
  {
    valor: "algas",
    numero: 3,
    titulo: "Algas",
    descripcion:
      "Hay manchas o superficies resbalosas.",
  },
  {
    valor: "mantenimiento",
    numero: 4,
    titulo: "El agua está bien",
    descripcion:
      "Quiero mantenerla limpia y clara.",
  },
];

export function obtenerNombreProblemaMobile(
  problema: ProblemaAguaMobile | null
) {
  return (
    OPCIONES_PROBLEMA.find(
      (opcion) =>
        opcion.valor === problema
    )?.titulo ?? "Sin seleccionar"
  );
}

export default function Paso2ExperienciaPiscinaMobile({
  transicionando,
  valor,
  problema,
  onChange,
  onCambiarProblema,
  onVolver,
  onContinuar,
}: Paso2ExperienciaPiscinaMobileProps) {
  const [caminoLocal, setCaminoLocal] =
    useState<CaminoExperienciaMobile | null>(
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
      const elemento =
        referencia.current;

      if (!elemento) return;

      const inicio =
        window.scrollY;

      const destino =
        inicio +
        elemento.getBoundingClientRect().top -
        92;

      const distancia =
        destino - inicio;

      const duracion = 720;
      const comienzo =
        performance.now();

      function animar(
        tiempoActual: number
      ) {
        const progreso = Math.min(
          (tiempoActual - comienzo) /
            duracion,
          1
        );

        const suavizado =
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

        window.scrollTo(
          0,
          inicio +
            distancia * suavizado
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
    }, 170);
  }

  useEffect(() => {
    if (
      caminoLocal === "guiado"
    ) {
      moverSuaveA(
        preguntaProblemaRef
      );
    }
  }, [caminoLocal]);

  useEffect(() => {
    if (completo) {
      moverSuaveA(continuarRef);
    }
  }, [completo]);

  function seleccionarCamino(
    camino: CaminoExperienciaMobile
  ) {
    setCaminoLocal(camino);
    onChange(camino);
  }

  return (
    <div
      className={`space-y-4 transition-all duration-500 ${
        transicionando
          ? "translate-y-3 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <section
        className={`rounded-[20px] border bg-white p-4 shadow-sm ${
          caminoLocal === null
            ? "border-cyan-500 ring-2 ring-cyan-500/10"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <EncabezadoBloque
            titulo="¿Cómo querés continuar?"
            descripcion="Elegí si ya sabés qué producto necesitás o si querés ayuda."
            icono={
              <SearchCheck
                size={20}
                strokeWidth={2.5}
              />
            }
          />

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

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <BotonCamino
            titulo="Ya sé qué necesito"
            descripcion="Ir directo a los productos."
            activo={
              caminoLocal === "directo"
            }
            onClick={() =>
              seleccionarCamino("directo")
            }
            icono={
              <PackageSearch
                size={20}
                strokeWidth={2.4}
              />
            }
          />

          <BotonCamino
            titulo="Necesito ayuda"
            descripcion="Contar qué le pasa al agua."
            activo={
              caminoLocal === "guiado"
            }
            onClick={() =>
              seleccionarCamino("guiado")
            }
            icono={
              <SearchCheck
                size={20}
                strokeWidth={2.4}
              />
            }
          />
        </div>

        {caminoLocal === null && (
          <Aviso texto="Elegí una opción para continuar." />
        )}
      </section>

      {caminoLocal === "guiado" && (
        <section
          ref={preguntaProblemaRef}
          className={`scroll-mt-24 rounded-[20px] border bg-white p-4 shadow-sm ${
            problema === null
              ? "border-cyan-500 ring-2 ring-cyan-500/10"
              : "border-gray-200"
          }`}
        >
          <EncabezadoBloque
            titulo="¿Qué problema tiene el agua?"
            descripcion="Elegí la opción que mejor describe su estado."
            icono={
              <Waves
                size={20}
                strokeWidth={2.5}
              />
            }
          />

          <div className="mt-4 grid grid-cols-2 gap-2.5">
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
            <Aviso texto="Elegí el estado del agua para continuar." />
          )}
        </section>
      )}

      {completo && (
        <section
          ref={continuarRef}
          className="scroll-mt-24 rounded-[20px] border border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 shadow-[0_12px_28px_rgba(16,185,129,0.16)]"
        >
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <CircleCheck
              size={17}
              strokeWidth={2.7}
            />

            <p className="text-[10px] font-black uppercase tracking-[0.12em]">
              Paso 2 completado
            </p>
          </div>

          <div className="mt-3 rounded-[15px] border border-emerald-100 bg-white px-3.5 py-3 text-center">
            <Sparkles
              size={18}
              strokeWidth={2.4}
              className="mx-auto text-emerald-600"
            />

            <p className="mt-2 text-[11px] font-black leading-relaxed text-blue-950">
              {caminoLocal === "directo"
                ? "Vas a elegir directamente el producto que necesitás."
                : problema === "mantenimiento"
                  ? "Vamos a preparar el mantenimiento de tu piscina."
                  : `Vamos a buscar una solución para: ${obtenerNombreProblemaMobile(
                      problema
                    )}.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onContinuar}
            className="mt-3 flex h-13 w-full items-center justify-center gap-2.5 rounded-[16px] bg-cyan-600 px-5 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)] transition active:scale-[0.98]"
          >
            <ArrowRight
              size={18}
              strokeWidth={2.7}
            />

            {problema === "mantenimiento"
              ? "Ir al Paso 3: mantenimiento"
              : "Ir al Paso 3: tratamiento"}
          </button>
        </section>
      )}
    </div>
  );
}

function EncabezadoBloque({
  titulo,
  descripcion,
  icono,
}: {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cyan-100 text-cyan-700">
        {icono}
      </div>

      <div className="min-w-0">
        <h2 className="text-[16px] font-black leading-tight text-blue-950">
          {titulo}
        </h2>

        <p className="mt-1 text-[10px] font-medium leading-relaxed text-gray-500">
          {descripcion}
        </p>
      </div>
    </div>
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
      className={`flex min-h-[112px] flex-col items-center justify-center rounded-[16px] border px-2.5 py-3 text-center transition active:scale-[0.98] ${
        activo
          ? "border-cyan-600 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/10"
          : "border-gray-200 bg-white text-slate-700"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${
          activo
            ? "bg-cyan-600 text-white"
            : "bg-cyan-50 text-cyan-700"
        }`}
      >
        {icono}
      </span>

      <span className="mt-2 block text-[11px] font-black leading-tight">
        {titulo}
      </span>

      <span className="mt-1 block text-[8px] font-semibold leading-relaxed text-gray-500">
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
      className={`min-h-[108px] rounded-[16px] border p-3 text-left transition active:scale-[0.98] ${
        activo
          ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-500/10"
          : "border-gray-200 bg-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-[11px] text-[11px] font-black ${
          activo
            ? "bg-cyan-600 text-white"
            : "bg-cyan-50 text-cyan-700"
        }`}
      >
        {numero}
      </span>

      <span className="mt-2.5 block text-[11px] font-black leading-tight text-blue-950">
        {titulo}
      </span>

      <span className="mt-1 block text-[8px] font-semibold leading-relaxed text-gray-500">
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
    <div className="mt-3 rounded-[13px] border border-dashed border-cyan-300 bg-cyan-50 px-3 py-2.5 text-center">
      <p className="text-[9px] font-black text-cyan-700">
        {texto}
      </p>
    </div>
  );
}