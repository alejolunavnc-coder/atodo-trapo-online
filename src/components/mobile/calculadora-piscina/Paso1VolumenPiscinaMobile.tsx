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

export type FormaPiscinaMobile =
  | "Rectangular"
  | "Redonda";

export type ModoVolumenMobile =
  | "manual"
  | "calcular";

export type ResumenVolumenPiscinaMobile = {
  metodo: string;
  forma: string;
  detalle1Etiqueta?: string;
  detalle1Valor?: string;
  detalle2Etiqueta?: string;
  detalle2Valor?: string;
  detalle3Etiqueta?: string;
  detalle3Valor?: string;
};

type Paso1VolumenPiscinaMobileProps = {
  transicionando: boolean;
  onCambio: (
    litros: number,
    resumen: ResumenVolumenPiscinaMobile | null
  ) => void;
  onCompletar: (
    litros: number,
    resumen: ResumenVolumenPiscinaMobile
  ) => void;
};

function convertirNumero(valor: string) {
  const texto = String(valor || "")
    .trim()
    .replace(/\s/g, "");

  if (!texto) return 0;

  const soloNumero = texto.replace(
    /[^0-9,.-]/g,
    ""
  );

  if (!soloNumero) return 0;

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

    const pareceMiles =
      partes.length > 1 &&
      partes
        .slice(1)
        .every(
          (parte) =>
            parte.length === 3
        );

    normalizado = pareceMiles
      ? partes.join("")
      : partes.length === 2
        ? `${partes[0]}.${partes[1]}`
        : `${partes
            .slice(0, -1)
            .join("")}.${partes.at(-1) || ""}`;
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

export default function Paso1VolumenPiscinaMobile({
  transicionando,
  onCambio,
  onCompletar,
}: Paso1VolumenPiscinaMobileProps) {
  const [modoVolumen, setModoVolumen] =
    useState<ModoVolumenMobile | null>(
      null
    );

  const [litrosManuales, setLitrosManuales] =
    useState("");

  const [forma, setForma] =
    useState<FormaPiscinaMobile | null>(
      null
    );

  const [largo, setLargo] =
    useState("");
  const [ancho, setAncho] =
    useState("");

  const [
    profundidadMinima,
    setProfundidadMinima,
  ] = useState("");

  const [
    profundidadMaxima,
    setProfundidadMaxima,
  ] = useState("");

  const [diametro, setDiametro] =
    useState("");

  const [
    profundidadRedonda,
    setProfundidadRedonda,
  ] = useState("");

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

  const largoNumero =
    convertirNumero(largo);

  const anchoNumero =
    convertirNumero(ancho);

  const profundidadMinimaNumero =
    convertirNumero(
      profundidadMinima
    );

  const profundidadMaximaNumero =
    convertirNumero(
      profundidadMaxima
    );

  const diametroNumero =
    convertirNumero(diametro);

  const profundidadRedondaNumero =
    convertirNumero(
      profundidadRedonda
    );

  const profundidadPromedio =
    useMemo(() => {
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

  const litrosCalculados =
    useMemo(() => {
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

      if (forma === "Redonda") {
        if (
          diametroNumero <= 0 ||
          profundidadRedondaNumero <= 0
        ) {
          return 0;
        }

        const radio =
          diametroNumero / 2;

        return (
          Math.PI *
          radio *
          radio *
          profundidadRedondaNumero *
          1000
        );
      }

      return 0;
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
      const elemento =
        referencia.current;

      if (!elemento) return;

      const inicio =
        window.scrollY;

      const destino =
        inicio +
        elemento.getBoundingClientRect()
          .top -
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
    if (volumenCompleto) {
      moverSuaveA(continuarRef);
    }
  }, [volumenCompleto]);

  const resumenEnVivo =
    useMemo<ResumenVolumenPiscinaMobile | null>(
      () => {
        if (modoVolumen === null) {
          return null;
        }

        if (
          modoVolumen === "manual"
        ) {
          return {
            metodo:
              "Litros ingresados",
            forma: "No aplica",
          };
        }

        if (forma === null) {
          return {
            metodo:
              "Calculado por medidas",
            forma:
              "Sin seleccionar",
          };
        }

        if (
          forma === "Rectangular"
        ) {
          return {
            metodo:
              "Calculado por medidas",
            forma,
            detalle1Etiqueta:
              "Largo",
            detalle1Valor:
              largoNumero > 0
                ? `${formatearDecimal(
                    largoNumero
                  )} m`
                : "Sin completar",
            detalle2Etiqueta:
              "Ancho",
            detalle2Valor:
              anchoNumero > 0
                ? `${formatearDecimal(
                    anchoNumero
                  )} m`
                : "Sin completar",
            detalle3Etiqueta:
              "Profundidad promedio",
            detalle3Valor:
              profundidadPromedio >
              0
                ? `${formatearDecimal(
                    profundidadPromedio
                  )} m`
                : "Sin completar",
          };
        }

        return {
          metodo:
            "Calculado por medidas",
          forma,
          detalle1Etiqueta:
            "Diámetro",
          detalle1Valor:
            diametroNumero > 0
              ? `${formatearDecimal(
                  diametroNumero
                )} m`
              : "Sin completar",
          detalle2Etiqueta:
            "Profundidad",
          detalle2Valor:
            profundidadRedondaNumero >
            0
              ? `${formatearDecimal(
                  profundidadRedondaNumero
                )} m`
              : "Sin completar",
        };
      },
      [
        modoVolumen,
        forma,
        largoNumero,
        anchoNumero,
        profundidadPromedio,
        diametroNumero,
        profundidadRedondaNumero,
      ]
    );

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
    if (
      !volumenCompleto ||
      modoVolumen === null
    ) {
      return;
    }

    if (
      modoVolumen === "manual"
    ) {
      onCompletar(
        litrosPiscina,
        {
          metodo:
            "Litros ingresados",
          forma: "No aplica",
        }
      );

      return;
    }

    if (
      forma === "Rectangular"
    ) {
      onCompletar(
        litrosPiscina,
        {
          metodo:
            "Calculado por medidas",
          forma,
          detalle1Etiqueta:
            "Largo",
          detalle1Valor:
            `${formatearDecimal(
              largoNumero
            )} m`,
          detalle2Etiqueta:
            "Ancho",
          detalle2Valor:
            `${formatearDecimal(
              anchoNumero
            )} m`,
          detalle3Etiqueta:
            "Profundidad promedio",
          detalle3Valor:
            `${formatearDecimal(
              profundidadPromedio
            )} m`,
        }
      );

      return;
    }

    onCompletar(
      litrosPiscina,
      {
        metodo:
          "Calculado por medidas",
        forma: "Redonda",
        detalle1Etiqueta:
          "Diámetro",
        detalle1Valor:
          `${formatearDecimal(
            diametroNumero
          )} m`,
        detalle2Etiqueta:
          "Profundidad",
        detalle2Valor:
          `${formatearDecimal(
            profundidadRedondaNumero
          )} m`,
      }
    );
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
          modoVolumen === null
            ? "border-cyan-500 ring-2 ring-cyan-500/10"
            : "border-gray-200"
        }`}
      >
        <EncabezadoBloque
          titulo="¿Ya sabés cuántos litros tiene tu piscina?"
          descripcion="Podés ingresarlos o calcularlos con las medidas."
          icono={
            <Droplets
              size={20}
              strokeWidth={2.5}
            />
          }
        />

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <BotonModo
            titulo="Sí"
            descripcion="Ingresar litros"
            activo={
              modoVolumen === "manual"
            }
            onClick={() =>
              setModoVolumen("manual")
            }
            icono={
              <Droplets
                size={19}
                strokeWidth={2.4}
              />
            }
          />

          <BotonModo
            titulo="No"
            descripcion="Calcular medidas"
            activo={
              modoVolumen === "calcular"
            }
            onClick={() =>
              setModoVolumen(
                "calcular"
              )
            }
            icono={
              <Calculator
                size={19}
                strokeWidth={2.4}
              />
            }
          />
        </div>

        {modoVolumen === null && (
          <Aviso texto="Elegí una opción para continuar." />
        )}
      </section>

      {modoVolumen === "manual" && (
        <section
          ref={ingresoLitrosRef}
          className="scroll-mt-24 rounded-[20px] border border-cyan-500 bg-white p-4 shadow-sm ring-2 ring-cyan-500/10"
        >
          <TituloBloque
            titulo="Ingresá la capacidad"
            descripcion="Cantidad total aproximada."
            completo={volumenCompleto}
            icono={
              <Droplets
                size={19}
                strokeWidth={2.4}
              />
            }
          />

          <div className="mt-4">
            <CampoLitros
              valor={litrosManuales}
              onChange={
                setLitrosManuales
              }
            />
          </div>

          <Info texto="Ejemplo: para 25.000 litros escribí 25000." />
        </section>
      )}

      {modoVolumen === "calcular" && (
        <div
          ref={calculoMedidasRef}
          className="scroll-mt-24 space-y-4"
        >
          <section
            className={`rounded-[20px] border bg-white p-4 shadow-sm ${
              forma === null
                ? "border-cyan-500 ring-2 ring-cyan-500/10"
                : "border-gray-200"
            }`}
          >
            <EncabezadoBloque
              titulo="¿Qué forma tiene?"
              descripcion="Elegí la forma más parecida."
              icono={
                <Waves
                  size={20}
                  strokeWidth={2.4}
                />
              }
            />

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <BotonForma
                titulo="Rectangular"
                activo={
                  forma ===
                  "Rectangular"
                }
                onClick={() =>
                  setForma(
                    "Rectangular"
                  )
                }
                icono={
                  <Ruler
                    size={19}
                    strokeWidth={2.4}
                  />
                }
              />

              <BotonForma
                titulo="Redonda"
                activo={
                  forma === "Redonda"
                }
                onClick={() =>
                  setForma("Redonda")
                }
                icono={
                  <Circle
                    size={19}
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
              className="scroll-mt-24 rounded-[20px] border border-cyan-500 bg-white p-4 shadow-sm ring-2 ring-cyan-500/10"
            >
              <TituloBloque
                titulo="Cargá las medidas"
                descripcion="Medidas interiores en metros."
                completo={volumenCompleto}
                icono={
                  <Ruler
                    size={19}
                    strokeWidth={2.4}
                  />
                }
              />

              {forma ===
              "Rectangular" ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <CampoMedida
                      etiqueta="Largo"
                      valor={largo}
                      onChange={
                        setLargo
                      }
                    />

                    <CampoMedida
                      etiqueta="Ancho"
                      valor={ancho}
                      onChange={
                        setAncho
                      }
                    />

                    <CampoMedida
                      etiqueta="Prof. mínima"
                      valor={
                        profundidadMinima
                      }
                      onChange={
                        setProfundidadMinima
                      }
                    />

                    <CampoMedida
                      etiqueta="Prof. máxima"
                      valor={
                        profundidadMaxima
                      }
                      onChange={
                        setProfundidadMaxima
                      }
                    />
                  </div>

                  <Info texto="Si tiene la misma profundidad, repetí el mismo valor." />
                </>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <CampoMedida
                      etiqueta="Diámetro"
                      valor={diametro}
                      onChange={
                        setDiametro
                      }
                    />

                    <CampoMedida
                      etiqueta="Profundidad"
                      valor={
                        profundidadRedonda
                      }
                      onChange={
                        setProfundidadRedonda
                      }
                    />
                  </div>

                  <Info texto="Medí el diámetro pasando por el centro." />
                </>
              )}
            </section>
          )}
        </div>
      )}

      {volumenCompleto && (
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
              Paso 1 completado
            </p>
          </div>

          <div className="mt-3 rounded-[16px] border border-cyan-200 bg-white p-3.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-cyan-700">
                  Capacidad
                </p>

                <p className="mt-1 text-[23px] font-black leading-none text-blue-950">
                  {litrosPiscina.toLocaleString(
                    "es-AR",
                    {
                      maximumFractionDigits:
                        0,
                    }
                  )}{" "}
                  <span className="text-[11px] text-cyan-700">
                    litros
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-[12px] bg-cyan-50 px-2.5 py-2">
                <Clock3
                  size={14}
                  strokeWidth={2.5}
                  className="text-cyan-700"
                />

                <div>
                  <p className="text-[7px] font-black uppercase tracking-[0.08em] text-cyan-700">
                    Recirculación
                  </p>

                  <p className="text-[9px] font-black text-blue-950">
                    {formatearRecirculacion(
                      litrosPiscina
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={continuar}
            className="mt-3 flex h-13 w-full items-center justify-center gap-2.5 rounded-[16px] bg-cyan-600 px-5 text-[14px] font-black text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)] transition active:scale-[0.98]"
          >
            <ArrowRight
              size={18}
              strokeWidth={2.7}
            />

            Ir al Paso 2
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
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cyan-100 text-cyan-700">
        {icono}
      </div>

      <div>
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
    <div className="flex items-start justify-between gap-3">
      <EncabezadoBloque
        titulo={titulo}
        descripcion={descripcion}
        icono={icono}
      />

      {completo && (
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black text-emerald-700">
          Completo
        </span>
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
      className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[16px] border px-2.5 py-3 text-center transition active:scale-[0.98] ${
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

      <span>
        <span className="block text-[12px] font-black">
          {titulo}
        </span>

        <span className="mt-0.5 block text-[8px] font-semibold text-gray-500">
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
  titulo: FormaPiscinaMobile;
  activo: boolean;
  onClick: () => void;
  icono: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-[16px] border px-2 py-3 transition active:scale-[0.98] ${
        activo
          ? "border-cyan-600 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/10"
          : "border-gray-200 bg-white text-slate-700"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${
          activo
            ? "bg-cyan-600 text-white"
            : "bg-blue-50 text-blue-950"
        }`}
      >
        {icono}
      </span>

      <span className="text-[11px] font-black">
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
    <div className="rounded-[16px] border border-gray-200 bg-gray-50 p-3">
      <label className="text-[10px] font-black text-blue-950">
        Litros de la piscina
      </label>

      <div className="relative mt-2">
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={(evento) =>
            onChange(
              evento.target.value
            )
          }
          placeholder="Ej: 25000"
          className="h-12 w-full rounded-[12px] border border-gray-200 bg-white px-3 pr-16 text-[18px] font-black text-blue-950 outline-none focus:border-cyan-600"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">
          litros
        </span>
      </div>
    </div>
  );
}

function CampoMedida({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="rounded-[15px] border border-gray-200 bg-gray-50 p-2.5">
      <label className="block min-h-[24px] text-[9px] font-black leading-tight text-blue-950">
        {etiqueta}
      </label>

      <div className="relative mt-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(evento) =>
            onChange(
              evento.target.value
            )
          }
          placeholder="0,00"
          className="h-11 w-full rounded-[11px] border border-gray-200 bg-white px-3 pr-8 text-[15px] font-black text-blue-950 outline-none focus:border-cyan-600"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">
          m
        </span>
      </div>
    </div>
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

function Info({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="mt-3 rounded-[14px] bg-blue-50 px-3.5 py-3">
      <p className="text-[9px] font-bold leading-relaxed text-blue-950">
        {texto}
      </p>
    </div>
  );
}