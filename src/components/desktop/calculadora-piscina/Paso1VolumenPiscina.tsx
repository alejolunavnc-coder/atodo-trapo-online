"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Calculator,
  Circle,
  CircleCheck,
  Clock3,
  Droplets,
  Ruler,
  Waves,
} from "lucide-react";

export type FormaPiscina =
  | "Rectangular"
  | "Redonda";

export type ModoVolumen =
  | "manual"
  | "calcular";

export type ResumenVolumenPiscina = {
  metodo: string;
  forma: string;
  detalle1Etiqueta?: string;
  detalle1Valor?: string;
  detalle2Etiqueta?: string;
  detalle2Valor?: string;
  detalle3Etiqueta?: string;
  detalle3Valor?: string;
};

type Paso1VolumenPiscinaProps = {
  transicionando: boolean;
  onCambio: (
    litros: number,
    resumen: ResumenVolumenPiscina | null
  ) => void;
  onCompletar: (
    litros: number,
    resumen: ResumenVolumenPiscina
  ) => void;
};

function formatearRecirculacion(
  litrosPiscina: number
) {
  if (litrosPiscina <= 0) {
    return "—";
  }

  const minutosTotales = Math.max(
    1,
    Math.round(
      (litrosPiscina / 10000) * 60
    )
  );

  const horas = Math.floor(
    minutosTotales / 60
  );

  const minutos =
    minutosTotales % 60;

  if (horas > 0 && minutos > 0) {
    return `${horas} h ${minutos} min`;
  }

  if (horas > 0) {
    return `${horas} h`;
  }

  return `${minutos} min`;
}

function convertirNumero(valor: string) {
  const texto = String(valor || "")
    .trim()
    .replace(/\s/g, "");

  if (!texto) {
    return 0;
  }

  const soloNumero = texto.replace(
    /[^0-9,.-]/g,
    ""
  );

  if (!soloNumero) {
    return 0;
  }

  const tieneComa =
    soloNumero.includes(",");

  const tienePunto =
    soloNumero.includes(".");

  let normalizado = soloNumero;

  if (tieneComa && tienePunto) {
    const ultimaComa =
      soloNumero.lastIndexOf(",");

    const ultimoPunto =
      soloNumero.lastIndexOf(".");

    const separadorDecimal =
      ultimaComa > ultimoPunto
        ? ","
        : ".";

    const separadorMiles =
      separadorDecimal === ","
        ? "."
        : ",";

    normalizado = soloNumero
      .replace(
        new RegExp(
          `\\${separadorMiles}`,
          "g"
        ),
        ""
      )
      .replace(
        separadorDecimal,
        "."
      );
  } else if (tieneComa || tienePunto) {
    const separador =
      tieneComa ? "," : ".";

    const partes =
      soloNumero.split(separador);

    const ultimaParte =
      partes[partes.length - 1] || "";

    const pareceSeparadorDeMiles =
      partes.length > 1 &&
      partes
        .slice(1)
        .every(
          (parte) =>
            parte.length === 3
        );

    if (pareceSeparadorDeMiles) {
      normalizado =
        partes.join("");
    } else {
      normalizado =
        partes.length === 2
          ? `${partes[0]}.${partes[1]}`
          : `${partes
              .slice(0, -1)
              .join("")}.${ultimaParte}`;
    }
  }

  const numero = Number(normalizado);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function formatearDecimal(valor: number) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function Paso1VolumenPiscina({
  transicionando,
  onCambio,
  onCompletar,
}: Paso1VolumenPiscinaProps) {
  const [modoVolumen, setModoVolumen] =
    useState<ModoVolumen | null>(null);

  const [litrosManuales, setLitrosManuales] =
    useState("");

  const [forma, setForma] =
    useState<FormaPiscina | null>(null);

  const [largo, setLargo] = useState("");
  const [ancho, setAncho] = useState("");
  const [profundidadMinima, setProfundidadMinima] =
    useState("");
  const [profundidadMaxima, setProfundidadMaxima] =
    useState("");

  const [diametro, setDiametro] = useState("");
  const [profundidadRedonda, setProfundidadRedonda] =
    useState("");

  const ingresoLitrosRef =
    useRef<HTMLElement | null>(null);

  const calculoMedidasRef =
    useRef<HTMLDivElement | null>(null);

  const camposMedidasRef =
    useRef<HTMLElement | null>(null);

  const continuarRef =
    useRef<HTMLElement | null>(null);

  const litrosManualesNumero =
    convertirNumero(litrosManuales);

  const largoNumero = convertirNumero(largo);
  const anchoNumero = convertirNumero(ancho);

  const profundidadMinimaNumero =
    convertirNumero(profundidadMinima);

  const profundidadMaximaNumero =
    convertirNumero(profundidadMaxima);

  const diametroNumero =
    convertirNumero(diametro);

  const profundidadRedondaNumero =
    convertirNumero(profundidadRedonda);

  const profundidadPromedio = useMemo(() => {
    if (
      profundidadMinimaNumero <= 0 ||
      profundidadMaximaNumero <= 0
    ) {
      return 0;
    }

    return (
      (profundidadMinimaNumero +
        profundidadMaximaNumero) /
      2
    );
  }, [
    profundidadMinimaNumero,
    profundidadMaximaNumero,
  ]);

  const litrosCalculados = useMemo(() => {
    if (forma === null) {
      return 0;
    }

    if (forma === "Rectangular") {
      if (
        largoNumero <= 0 ||
        anchoNumero <= 0 ||
        profundidadPromedio <= 0
      ) {
        return 0;
      }

      return (
        largoNumero *
        anchoNumero *
        profundidadPromedio *
        1000
      );
    }

    if (
      diametroNumero <= 0 ||
      profundidadRedondaNumero <= 0
    ) {
      return 0;
    }

    const radio = diametroNumero / 2;

    return (
      Math.PI *
      radio *
      radio *
      profundidadRedondaNumero *
      1000
    );
  }, [
    forma,
    largoNumero,
    anchoNumero,
    profundidadPromedio,
    diametroNumero,
    profundidadRedondaNumero,
  ]);

  const litrosPiscina =
    modoVolumen === "manual"
      ? litrosManualesNumero
      : modoVolumen === "calcular"
        ? litrosCalculados
        : 0;

  const volumenCompleto =
    litrosPiscina > 0;

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
        window.innerHeight * 0.35;

      const distancia = destino - inicio;
      const duracion = 850;
      const tiempoInicial = performance.now();

      const suavizar = (progreso: number) =>
        progreso < 0.5
          ? 4 * progreso * progreso * progreso
          : 1 -
            Math.pow(-2 * progreso + 2, 3) / 2;

      function animar(tiempoActual: number) {
        const progreso = Math.min(
          (tiempoActual - tiempoInicial) /
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

      window.requestAnimationFrame(animar);
    }, 250);
  }

  useEffect(() => {
    if (modoVolumen === "manual") {
      moverSuaveA(ingresoLitrosRef);
    }

    if (modoVolumen === "calcular") {
      moverSuaveA(calculoMedidasRef);
    }
  }, [modoVolumen]);

  useEffect(() => {
    if (
      modoVolumen === "calcular" &&
      forma !== null
    ) {
      moverSuaveA(camposMedidasRef);
    }
  }, [forma, modoVolumen]);

  useEffect(() => {
    if (
      modoVolumen === "calcular" &&
      volumenCompleto
    ) {
      moverSuaveA(continuarRef);
    }
  }, [modoVolumen, volumenCompleto]);

  const resumenEnVivo =
    useMemo<ResumenVolumenPiscina | null>(() => {
      if (modoVolumen === null) {
        return null;
      }

      if (modoVolumen === "manual") {
        return {
          metodo: "Litros ingresados",
          forma: "No aplica",
        };
      }

      if (forma === null) {
        return {
          metodo: "Calculado por medidas",
          forma: "Sin seleccionar",
        };
      }

      if (forma === "Rectangular") {
        return {
          metodo: "Calculado por medidas",
          forma,
          detalle1Etiqueta: "Largo",
          detalle1Valor:
            largoNumero > 0
              ? `${formatearDecimal(largoNumero)} m`
              : "Sin completar",
          detalle2Etiqueta: "Ancho",
          detalle2Valor:
            anchoNumero > 0
              ? `${formatearDecimal(anchoNumero)} m`
              : "Sin completar",
          detalle3Etiqueta:
            "Profundidad promedio",
          detalle3Valor:
            profundidadPromedio > 0
              ? `${formatearDecimal(
                  profundidadPromedio
                )} m`
              : "Sin completar",
        };
      }

      return {
        metodo: "Calculado por medidas",
        forma,
        detalle1Etiqueta: "Diámetro",
        detalle1Valor:
          diametroNumero > 0
            ? `${formatearDecimal(
                diametroNumero
              )} m`
            : "Sin completar",
        detalle2Etiqueta: "Profundidad",
        detalle2Valor:
          profundidadRedondaNumero > 0
            ? `${formatearDecimal(
                profundidadRedondaNumero
              )} m`
            : "Sin completar",
      };
    }, [
      modoVolumen,
      forma,
      largoNumero,
      anchoNumero,
      profundidadPromedio,
      diametroNumero,
      profundidadRedondaNumero,
    ]);

  useEffect(() => {
    onCambio(
      litrosPiscina,
      resumenEnVivo
    );
  }, [
    litrosPiscina,
    resumenEnVivo,
    onCambio,
  ]);

  function continuar() {
    if (!volumenCompleto) {
      return;
    }

    if (modoVolumen === "manual") {
      onCompletar(litrosPiscina, {
        metodo: "Litros ingresados",
        forma: "No aplica",
      });

      return;
    }

    if (forma === "Rectangular") {
      onCompletar(litrosPiscina, {
        metodo: "Calculado por medidas",
        forma,
        detalle1Etiqueta: "Largo",
        detalle1Valor: `${formatearDecimal(
          largoNumero
        )} m`,
        detalle2Etiqueta: "Ancho",
        detalle2Valor: `${formatearDecimal(
          anchoNumero
        )} m`,
        detalle3Etiqueta:
          "Profundidad promedio",
        detalle3Valor: `${formatearDecimal(
          profundidadPromedio
        )} m`,
      });

      return;
    }

    onCompletar(litrosPiscina, {
      metodo: "Calculado por medidas",
      forma: "Redonda",
      detalle1Etiqueta: "Diámetro",
      detalle1Valor: `${formatearDecimal(
        diametroNumero
      )} m`,
      detalle2Etiqueta: "Profundidad",
      detalle2Valor: `${formatearDecimal(
        profundidadRedondaNumero
      )} m`,
    });
  }

  return (
    <div
      className={`space-y-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        transicionando
          ? "translate-y-4 scale-[0.99] opacity-0 blur-[2px]"
          : "translate-y-0 scale-100 opacity-100 blur-0"
      }`}
    >
      <section
        className={`rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
          modoVolumen === null
            ? "border-sky-500 ring-2 ring-sky-500/10"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Droplets
              size={23}
              strokeWidth={2.4}
            />
          </div>

          <div>
            <h2 className="text-[20px] font-black tracking-[-0.03em] text-blue-950">
              ¿Ya sabés cuántos litros tiene tu piscina?
            </h2>

            <p className="text-[13px] font-medium text-gray-500">
              Podés escribirlos directamente o calcularlos con las medidas.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <BotonModo
            titulo="Sí, ya sé los litros"
            descripcion="Ingresar la capacidad directamente"
            activo={modoVolumen === "manual"}
            onClick={() =>
              setModoVolumen("manual")
            }
            icono={
              <Droplets
                size={22}
                strokeWidth={2.4}
              />
            }
          />

          <BotonModo
            titulo="No, quiero calcularlos"
            descripcion="Usar forma y medidas"
            activo={modoVolumen === "calcular"}
            onClick={() =>
              setModoVolumen("calcular")
            }
            icono={
              <Calculator
                size={22}
                strokeWidth={2.4}
              />
            }
          />
        </div>

        {modoVolumen === null && (
          <Aviso texto="Elegí una de las dos opciones para continuar." />
        )}
      </section>

      {modoVolumen === "manual" && (
        <section
          ref={ingresoLitrosRef}
          className="scroll-mt-28 rounded-[24px] border border-sky-500 bg-white p-6 shadow-sm ring-2 ring-sky-500/10"
        >
          <TituloBloque
            titulo="Ingresá la capacidad"
            descripcion="Escribí la cantidad total de litros."
            completo={volumenCompleto}
            icono={
              <Droplets
                size={22}
                strokeWidth={2.3}
              />
            }
          />

          <div className="mt-6">
            <CampoLitros
              valor={litrosManuales}
              onChange={setLitrosManuales}
            />
          </div>

          <div className="mt-5 rounded-[18px] bg-blue-50 px-5 py-4">
            <p className="text-[12px] font-bold leading-relaxed text-blue-950">
              Ejemplo: si tu piscina tiene 25.000 litros, escribí 25000.
            </p>
          </div>
        </section>
      )}

      {modoVolumen === "calcular" && (
        <div
          ref={calculoMedidasRef}
          className="scroll-mt-28 space-y-6"
        >
          <section
            className={`rounded-[24px] border bg-white p-6 shadow-sm transition-all duration-300 ${
              forma === null
                ? "border-sky-500 ring-2 ring-sky-500/10"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Waves
                  size={23}
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <h2 className="text-[20px] font-black tracking-[-0.03em] text-blue-950">
                  ¿Qué forma tiene tu piscina?
                </h2>

                <p className="text-[13px] font-medium text-gray-500">
                  Elegí la forma que más se parece a tu piscina.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <BotonForma
                titulo="Rectangular"
                activo={forma === "Rectangular"}
                onClick={() =>
                  setForma("Rectangular")
                }
                icono={
                  <Ruler
                    size={22}
                    strokeWidth={2.4}
                  />
                }
              />

              <BotonForma
                titulo="Redonda"
                activo={forma === "Redonda"}
                onClick={() =>
                  setForma("Redonda")
                }
                icono={
                  <Circle
                    size={23}
                    strokeWidth={2.4}
                  />
                }
              />
            </div>

            {forma === null && (
              <Aviso texto="Elegí una forma para cargar las medidas." />
            )}
          </section>

          {forma !== null && (
            <section
              ref={camposMedidasRef}
              className="scroll-mt-28 rounded-[24px] border border-sky-500 bg-white p-6 shadow-sm ring-2 ring-sky-500/10"
            >
              <TituloBloque
                titulo="Cargá las medidas"
                descripcion="Ingresá las medidas interiores en metros."
                completo={volumenCompleto}
                icono={
                  <Ruler
                    size={22}
                    strokeWidth={2.3}
                  />
                }
              />

              {forma === "Rectangular" ? (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <CampoMedida
                      etiqueta="Largo"
                      ayuda="De punta a punta"
                      valor={largo}
                      onChange={setLargo}
                    />

                    <CampoMedida
                      etiqueta="Ancho"
                      ayuda="De lado a lado"
                      valor={ancho}
                      onChange={setAncho}
                    />

                    <CampoMedida
                      etiqueta="Profundidad mínima"
                      ayuda="Parte menos profunda"
                      valor={profundidadMinima}
                      onChange={
                        setProfundidadMinima
                      }
                    />

                    <CampoMedida
                      etiqueta="Profundidad máxima"
                      ayuda="Parte más profunda"
                      valor={profundidadMaxima}
                      onChange={
                        setProfundidadMaxima
                      }
                    />
                  </div>

                  <Info texto="Si toda la piscina tiene la misma profundidad, colocá el mismo valor en profundidad mínima y máxima." />
                </>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <CampoMedida
                      etiqueta="Diámetro"
                      ayuda="Medida completa de lado a lado"
                      valor={diametro}
                      onChange={setDiametro}
                    />

                    <CampoMedida
                      etiqueta="Profundidad"
                      ayuda="Profundidad interior del agua"
                      valor={profundidadRedonda}
                      onChange={
                        setProfundidadRedonda
                      }
                    />
                  </div>

                  <Info texto="Medí el diámetro atravesando el centro de la piscina, de un borde al otro." />
                </>
              )}
            </section>
          )}
        </div>
      )}

      {volumenCompleto && (
        <section
          ref={continuarRef}
          className="scroll-mt-28 rounded-[24px] border border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_14px_34px_rgba(16,185,129,0.18)] ring-2 ring-emerald-400/15"
        >
          <div className="mb-3 flex items-center justify-center gap-2 text-emerald-700">
            <CircleCheck
              size={18}
              strokeWidth={2.7}
            />

            <p className="text-[11px] font-black uppercase tracking-[0.14em]">
              Paso 1 completado
            </p>
          </div>

          <div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-4 rounded-[18px] border border-sky-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-600">
                Capacidad calculada
              </p>

              <p className="mt-1 text-[24px] font-black leading-none text-blue-950">
                {litrosPiscina.toLocaleString(
                  "es-AR",
                  {
                    maximumFractionDigits: 0,
                  }
                )}{" "}
                <span className="text-[13px] text-sky-700">
                  litros
                </span>
              </p>
            </div>

            <div className="flex min-w-[250px] items-start gap-3 rounded-[15px] bg-sky-50 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
                <Clock3
                  size={17}
                  strokeWidth={2.5}
                />
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-sky-700">
                  Recirculación diaria
                </p>

                <p className="mt-0.5 text-[12px] font-black text-blue-950">
                  {formatearRecirculacion(
                    litrosPiscina
                  )}{" "}
                  DIARIAMENTE
                </p>

                <p className="mt-0.5 text-[9px] font-semibold text-gray-500">
                  1 hora cada 10.000 litros.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={continuar}
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

            Ir al Paso 2: experiencia
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
        </section>
      )}
    </div>
  );
}

function TituloBloque({
  titulo,
  descripcion,
  completo,
  icono,
}: {
  titulo: string;
  descripcion: string;
  completo: boolean;
  icono: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-950">
          {icono}
        </div>

        <div>
          <h2 className="text-[19px] font-black text-blue-950">
            {titulo}
          </h2>

          <p className="text-[12px] font-medium text-gray-500">
            {descripcion}
          </p>
        </div>
      </div>

      {completo && (
        <div className="flex items-center gap-1.5 rounded-full bg-[#EAF8EC] px-3 py-1.5 text-[11px] font-black text-[#16813A]">
          <CircleCheck
            size={15}
            strokeWidth={2.6}
          />
          Completo
        </div>
      )}
    </div>
  );
}

function BotonModo({
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
      className={`flex min-h-[112px] items-center gap-4 rounded-[18px] border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50/60 hover:shadow-md ${
        activo
          ? "border-sky-600 bg-sky-50 text-sky-700 ring-2 ring-sky-500/15"
          : "border-gray-300 bg-white text-slate-700 shadow-sm"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          activo
            ? "bg-sky-600 text-white"
            : "border border-sky-200 bg-sky-50 text-sky-700"
        }`}
      >
        {icono}
      </span>

      <span>
        <span className="block text-[13px] font-black">
          {titulo}
        </span>

        <span className="mt-1 block text-[10px] font-semibold text-gray-500">
          {descripcion}
        </span>
      </span>
    </button>
  );
}

function BotonForma({
  titulo,
  activo,
  onClick,
  icono,
}: {
  titulo: FormaPiscina;
  activo: boolean;
  onClick: () => void;
  icono: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[18px] border px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50/60 hover:shadow-md ${
        activo
          ? "border-sky-600 bg-sky-50 text-sky-700 ring-2 ring-sky-500/15"
          : "border-gray-300 bg-white text-slate-700 shadow-sm"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          activo
            ? "bg-sky-600 text-white"
            : "bg-blue-50 text-blue-950"
        }`}
      >
        {icono}
      </span>

      <span className="text-[13px] font-black">
        {titulo}
      </span>
    </button>
  );
}

function CampoLitros({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="rounded-[18px] border border-gray-200 bg-gray-50/60 p-4">
      <label className="block text-[12px] font-black text-blue-950">
        Litros de la piscina
      </label>

      <p className="mt-0.5 text-[10px] font-medium text-gray-400">
        Capacidad total aproximada
      </p>

      <div className="relative mt-3">
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={(evento) =>
            onChange(evento.target.value)
          }
          placeholder="Ej: 25000"
          className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 pr-20 text-[20px] font-black text-blue-950 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-500/10"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400">
          litros
        </span>
      </div>
    </div>
  );
}

function CampoMedida({
  etiqueta,
  ayuda,
  valor,
  onChange,
}: {
  etiqueta: string;
  ayuda: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="rounded-[18px] border border-gray-200 bg-gray-50/60 p-4">
      <label className="block text-[12px] font-black text-blue-950">
        {etiqueta}
      </label>

      <p className="mt-0.5 text-[10px] font-medium text-gray-400">
        {ayuda}
      </p>

      <div className="relative mt-3">
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(evento) =>
            onChange(evento.target.value)
          }
          placeholder="0,00"
          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-[16px] font-black text-blue-950 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-500/10"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400">
          m
        </span>
      </div>
    </div>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="mt-4 rounded-[16px] border border-dashed border-sky-300 bg-sky-50/60 px-4 py-3 text-center">
      <p className="text-[11px] font-black text-sky-700">
        {texto}
      </p>
    </div>
  );
}

function Info({ texto }: { texto: string }) {
  return (
    <div className="mt-5 rounded-[18px] bg-blue-50 px-5 py-4">
      <p className="text-[12px] font-bold leading-relaxed text-blue-950">
        {texto}
      </p>
    </div>
  );
}