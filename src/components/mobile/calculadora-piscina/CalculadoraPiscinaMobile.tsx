"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Check,
  ChevronRight,
  CircleCheck,
  Droplets,
  Home,
  Menu,
  ShoppingCart,
  Waves,
} from "lucide-react";

import MobileHeaderCompartido from "../MobileHeaderCompartido";

import Paso1VolumenPiscinaMobile, {
  type ResumenVolumenPiscinaMobile,
} from "./Paso1VolumenPiscinaMobile";

import Paso2ExperienciaPiscinaMobile, {
  obtenerNombreProblemaMobile,
  type CaminoExperienciaMobile,
  type ProblemaAguaMobile,
} from "./Paso2ExperienciaPiscinaMobile";

import Paso3TratamientoPiscinaMobile, {
  obtenerNombreTratamientoMobile,
  type ProductoPiscinaMobile,
  type TratamientoSeleccionadoMobile,
} from "./Paso3TratamientoPiscinaMobile";

import Paso4ResultadoPiscinaMobile from "./Paso4ResultadoPiscinaMobile";

type PasoCalculadoraPiscinaMobile =
  | 1
  | 2
  | 3
  | 4;

type CalculadoraPiscinaMobileProps = {
  cantidadCarrito?: number;
  onVolver: () => void;
  onVolverInicio: () => void;
  onAbrirMenu?: () => void;
  onAbrirCarrito?: () => void;
  onAgregarAlCarrito: (
    items: Array<{
      producto: ProductoPiscinaMobile;
      cantidad: number;
    }>
  ) => void;
  onFinalizado?: () => void;
};

function normalizarTexto(
  valor: unknown
) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function numeroDesdeTexto(
  valor: unknown
) {
  const texto = String(valor || "")
    .trim()
    .replace(/\s/g, "");

  if (!texto) return 0;

  const limpio = texto.replace(
    /[^0-9,.-]/g,
    ""
  );

  if (!limpio) return 0;

  let normalizado = limpio;

  if (
    limpio.includes(",") &&
    limpio.includes(".")
  ) {
    normalizado =
      limpio.lastIndexOf(",") >
      limpio.lastIndexOf(".")
        ? limpio
            .replace(/\./g, "")
            .replace(",", ".")
        : limpio.replace(/,/g, "");
  } else if (limpio.includes(",")) {
    const partes = limpio.split(",");

    normalizado =
      partes.length === 2 &&
      partes[1].length !== 3
        ? `${partes[0]}.${partes[1]}`
        : partes.join("");
  } else if (limpio.includes(".")) {
    const partes = limpio.split(".");

    normalizado =
      partes.length === 2 &&
      partes[1].length !== 3
        ? limpio
        : partes.join("");
  }

  const numero = Number(normalizado);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function obtenerValor(
  producto: ProductoPiscinaMobile | null,
  ...claves: string[]
) {
  if (!producto) return "";

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

function obtenerClaveProducto(
  producto: ProductoPiscinaMobile
) {
  return [
    normalizarTexto(
      obtenerValor(producto, "Marca")
    ),
    normalizarTexto(
      obtenerValor(producto, "Nombre")
    ),
    normalizarTexto(
      obtenerValor(
        producto,
        "Linea",
        "Línea"
      )
    ),
  ].join("::");
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

function formatearPrecio(
  valor: number
) {
  return valor.toLocaleString(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  );
}

function formatearLitros(
  valor: number
) {
  return valor.toLocaleString(
    "es-AR",
    {
      maximumFractionDigits: 0,
    }
  );
}

export default function CalculadoraPiscinaMobile({
  cantidadCarrito = 0,
  onVolver,
  onVolverInicio,
  onAbrirMenu,
  onAbrirCarrito,
  onAgregarAlCarrito,
  onFinalizado,
}: CalculadoraPiscinaMobileProps) {
  const [pasoActual, setPasoActual] =
    useState<PasoCalculadoraPiscinaMobile>(
      1
    );

  const [
    transicionando,
    setTransicionando,
  ] = useState(false);

  const [
    litrosPiscina,
    setLitrosPiscina,
  ] = useState(0);

  const [
    resumenVolumen,
    setResumenVolumen,
  ] =
    useState<ResumenVolumenPiscinaMobile | null>(
      null
    );

  const [
    caminoExperiencia,
    setCaminoExperiencia,
  ] =
    useState<CaminoExperienciaMobile | null>(
      null
    );

  const [
    problemaAgua,
    setProblemaAgua,
  ] =
    useState<ProblemaAguaMobile | null>(
      null
    );

  const [
    tratamientoSeleccionado,
    setTratamientoSeleccionado,
  ] =
    useState<TratamientoSeleccionadoMobile>(
      null
    );

  const [
    seleccionMantenimiento,
    setSeleccionMantenimiento,
  ] = useState<
    ProductoPiscinaMobile[]
  >([]);

  const pasoDosRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pasoTresRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pasoCuatroRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pasoActualRef =
    useRef<PasoCalculadoraPiscinaMobile>(
      1
    );

  pasoActualRef.current =
    pasoActual;

  useEffect(() => {
    (window as any).__pasoCalculadoraPiscina =
      pasoActual;

    (window as any).__manejarAtrasCalculadoraPiscina =
      () => {
        const paso =
          pasoActualRef.current;

        if (paso <= 1) {
          return false;
        }

        const pasoAnterior =
          (paso - 1) as PasoCalculadoraPiscinaMobile;

        setTransicionando(true);

        window.setTimeout(() => {
          setPasoActual(pasoAnterior);

          window.requestAnimationFrame(() => {
            setTransicionando(false);

            if (pasoAnterior === 1) {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              return;
            }

            if (pasoAnterior === 2) {
              moverSuaveA(pasoDosRef);
              return;
            }

            if (pasoAnterior === 3) {
              moverSuaveA(pasoTresRef);
            }
          });
        }, 260);

        return true;
      };

    return () => {
      delete (window as any)
        .__manejarAtrasCalculadoraPiscina;

      (window as any).__pasoCalculadoraPiscina =
        1;
    };
  }, [pasoActual]);

  function registrarPasoInterno(
    paso: PasoCalculadoraPiscinaMobile
  ) {
    window.history.pushState(
      {
        ...window.history.state,
        atodoTrapoMobile: true,
        calculadoraPiscinaPaso:
          paso,
      },
      ""
    );
  }


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
        82;

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

  const actualizarVolumenEnVivo =
    useCallback(
      (
        litros: number,
        resumen:
          | ResumenVolumenPiscinaMobile
          | null
      ) => {
        setLitrosPiscina(litros);
        setResumenVolumen(resumen);
      },
      []
    );

  function completarPasoUno(
    litros: number,
    resumen: ResumenVolumenPiscinaMobile
  ) {
    if (transicionando) return;

    setLitrosPiscina(litros);
    setResumenVolumen(resumen);
    registrarPasoInterno(2);
    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(2);

      window.requestAnimationFrame(
        () => {
          setTransicionando(false);
          moverSuaveA(pasoDosRef);
        }
      );
    }, 430);
  }

  function volverAlPasoUno() {
    if (transicionando) return;

    const manejarAtrasPiscina = (window as any)
      .__manejarAtrasCalculadoraPiscina;

    if (typeof manejarAtrasPiscina === "function") {
      manejarAtrasPiscina();
    }
  }

  function irAlPasoTres() {
    if (
      transicionando ||
      caminoExperiencia === null ||
      (caminoExperiencia ===
        "guiado" &&
        problemaAgua === null)
    ) {
      return;
    }

    registrarPasoInterno(3);
    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(3);

      window.requestAnimationFrame(
        () => {
          setTransicionando(false);
          moverSuaveA(pasoTresRef);
        }
      );
    }, 430);
  }

  function volverAlPasoDos() {
    if (transicionando) return;

    const manejarAtrasPiscina = (window as any)
      .__manejarAtrasCalculadoraPiscina;

    if (typeof manejarAtrasPiscina === "function") {
      manejarAtrasPiscina();
    }
  }

  function irAlPasoCuatro() {
    if (
      transicionando ||
      problemaAgua ===
        "mantenimiento" ||
      tratamientoSeleccionado ===
        null
    ) {
      return;
    }

    registrarPasoInterno(4);
    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(4);

      window.requestAnimationFrame(
        () => {
          setTransicionando(false);
          moverSuaveA(pasoCuatroRef);
        }
      );
    }, 430);
  }

  function volverAlPasoTres() {
    if (transicionando) return;

    const manejarAtrasPiscina = (window as any)
      .__manejarAtrasCalculadoraPiscina;

    if (typeof manejarAtrasPiscina === "function") {
      manejarAtrasPiscina();
    }
  }

  function alternarProductoMantenimiento(
    producto: ProductoPiscinaMobile
  ) {
    const clave =
      obtenerClaveProducto(producto);

    setSeleccionMantenimiento(
      (seleccionActual) => {
        const yaSeleccionado =
          seleccionActual.some(
            (item) =>
              obtenerClaveProducto(
                item
              ) === clave
          );

        if (yaSeleccionado) {
          return seleccionActual.filter(
            (item) =>
              obtenerClaveProducto(
                item
              ) !== clave
          );
        }

        return [
          ...seleccionActual,
          producto,
        ];
      }
    );
  }

  function agregarMantenimiento() {
    if (
      seleccionMantenimiento.length ===
      0
    ) {
      return;
    }

    onAgregarAlCarrito(
      seleccionMantenimiento.map(
        (producto) => ({
          producto,
          cantidad: 1,
        })
      )
    );
  }

  const totalMantenimiento =
    seleccionMantenimiento.reduce(
      (total, producto) =>
        total +
        obtenerPrecioFinal(
          producto
        ),
      0
    );

  const esMantenimiento =
    caminoExperiencia ===
      "guiado" &&
    problemaAgua ===
      "mantenimiento";

  const cantidadPasos =
    esMantenimiento ? 3 : 4;

  return (
    <main className="min-h-screen bg-[#F5F8FC] pb-28 text-gray-900">
      <MobileHeaderCompartido
        cantidadCarrito={
          cantidadCarrito
        }
        onAbrirMenu={
          onAbrirMenu
        }
        onAbrirCarrito={
          onAbrirCarrito
        }
        onVolverInicio={
          onVolverInicio
        }
        mostrarBeneficios={false}
      />

      <section className="px-3 pt-3">
        <div className="rounded-[20px] border border-cyan-100 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onVolver}
              className="flex h-9 items-center gap-1.5 rounded-full bg-gray-100 px-3 text-[10px] font-black text-blue-950 active:scale-[0.98]"
            >
              ‹ Volver
            </button>

            <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-700">
                Calculadora de piscina
              </p>

              <h1 className="mt-0.5 text-[15px] font-black leading-tight text-blue-950">
                Tratamiento personalizado
              </h1>
            </div>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
              <Waves
                size={19}
                strokeWidth={2.5}
              />
            </span>
          </div>
        </div>
      </section>

      <section className="px-3 pt-3">
        <div className="rounded-[20px] border border-gray-200 bg-white px-3 py-3 shadow-sm">
          <div className="flex items-start">
            <PasoIndicador
              numero={1}
              titulo="Volumen"
              activo={
                pasoActual === 1
              }
              completado={
                pasoActual > 1
              }
            />

            <LineaIndicador
              activo={
                pasoActual > 1
              }
            />

            <PasoIndicador
              numero={2}
              titulo="Ayuda"
              activo={
                pasoActual === 2
              }
              completado={
                pasoActual > 2
              }
            />

            <LineaIndicador
              activo={
                pasoActual > 2
              }
            />

            <PasoIndicador
              numero={3}
              titulo={
                esMantenimiento
                  ? "Mantener"
                  : "Producto"
              }
              activo={
                pasoActual === 3
              }
              completado={
                pasoActual > 3
              }
            />

            {!esMantenimiento && (
              <>
                <LineaIndicador
                  activo={
                    pasoActual > 3
                  }
                />

                <PasoIndicador
                  numero={4}
                  titulo="Resultado"
                  activo={
                    pasoActual === 4
                  }
                  completado={false}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-3 pt-3">
        <ResumenCompacto
          pasoActual={pasoActual}
          cantidadPasos={cantidadPasos}
          litrosPiscina={
            litrosPiscina
          }
          resumenVolumen={
            resumenVolumen
          }
          camino={
            caminoExperiencia
          }
          problema={problemaAgua}
          tratamiento={
            tratamientoSeleccionado
          }
          seleccionMantenimiento={
            seleccionMantenimiento
          }
        />
      </section>

      <section className="px-3 pt-3">
        {pasoActual === 1 ? (
          <Paso1VolumenPiscinaMobile
            transicionando={
              transicionando
            }
            onCambio={
              actualizarVolumenEnVivo
            }
            onCompletar={
              completarPasoUno
            }
          />
        ) : pasoActual === 2 ? (
          <div ref={pasoDosRef}>
            <Paso2ExperienciaPiscinaMobile
              transicionando={
                transicionando
              }
              valor={
                caminoExperiencia
              }
              problema={
                problemaAgua
              }
              onChange={(camino) => {
                setTratamientoSeleccionado(
                  null
                );
                setSeleccionMantenimiento(
                  []
                );

                if (
                  camino === "directo"
                ) {
                  setProblemaAgua(
                    null
                  );
                }

                setCaminoExperiencia(
                  camino
                );
              }}
              onCambiarProblema={(
                problema
              ) => {
                setTratamientoSeleccionado(
                  null
                );
                setSeleccionMantenimiento(
                  []
                );
                setProblemaAgua(
                  problema
                );
              }}
              onVolver={
                volverAlPasoUno
              }
              onContinuar={
                irAlPasoTres
              }
            />
          </div>
        ) : pasoActual === 3 ? (
          <div ref={pasoTresRef}>
            <Paso3TratamientoPiscinaMobile
              transicionando={
                transicionando
              }
              camino={
                caminoExperiencia
              }
              problema={
                problemaAgua
              }
              litrosPiscina={
                litrosPiscina
              }
              tratamiento={
                tratamientoSeleccionado
              }
              seleccionMantenimiento={
                seleccionMantenimiento
              }
              onCambiarTratamiento={
                setTratamientoSeleccionado
              }
              onAlternarMantenimiento={
                alternarProductoMantenimiento
              }
              onVolver={
                volverAlPasoDos
              }
              onContinuar={
                irAlPasoCuatro
              }
            />
          </div>
        ) : tratamientoSeleccionado ? (
          <div ref={pasoCuatroRef}>
            <Paso4ResultadoPiscinaMobile
              litrosPiscina={
                litrosPiscina
              }
              problema={
                problemaAgua
              }
              producto={
                tratamientoSeleccionado
              }
              onVolver={
                volverAlPasoTres
              }
              onAgregarAlCarrito={
                onAgregarAlCarrito
              }
            />
          </div>
        ) : null}
      </section>

      {esMantenimiento &&
        pasoActual === 3 && (
          <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-gray-200 bg-white/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_30px_rgba(15,23,42,0.14)] backdrop-blur-md">
            <div className="mx-auto flex max-w-[520px] items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-[0.1em] text-emerald-700">
                  Mantenimiento
                </p>

                <div className="mt-0.5 flex items-end gap-2">
                  <p className="text-[12px] font-black text-blue-950">
                    {
                      seleccionMantenimiento.length
                    }{" "}
                    {seleccionMantenimiento.length ===
                    1
                      ? "producto"
                      : "productos"}
                  </p>

                  <p className="text-[14px] font-black text-emerald-700">
                    {formatearPrecio(
                      totalMantenimiento
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  seleccionMantenimiento.length ===
                  0
                }
                onClick={
                  agregarMantenimiento
                }
                className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-[15px] px-4 text-[11px] font-black transition active:scale-[0.98] ${
                  seleccionMantenimiento.length >
                  0
                    ? "bg-emerald-600 text-white shadow-[0_8px_22px_rgba(16,185,129,0.28)]"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                <ShoppingCart
                  size={17}
                  strokeWidth={2.6}
                />

                Agregar
              </button>
            </div>
          </div>
        )}

      {pasoActual === 4 && (
        <section className="px-3 pt-4">
          <button
            type="button"
            onClick={onVolverInicio}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-cyan-200 bg-white text-[12px] font-black text-cyan-700 shadow-sm active:scale-[0.98]"
          >
            <Home
              size={17}
              strokeWidth={2.5}
            />

            Volver al inicio
          </button>
        </section>
      )}
    </main>
  );
}

function PasoIndicador({
  numero,
  titulo,
  activo,
  completado,
}: {
  numero: number;
  titulo: string;
  activo: boolean;
  completado: boolean;
}) {
  return (
    <div className="flex w-[54px] shrink-0 flex-col items-center text-center">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-black transition ${
          completado
            ? "bg-emerald-600 text-white"
            : activo
              ? "bg-cyan-600 text-white ring-4 ring-cyan-100"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {completado ? (
          <Check
            size={13}
            strokeWidth={3}
          />
        ) : (
          numero
        )}
      </span>

      <p
        className={`mt-1.5 text-[7px] font-black leading-tight ${
          activo ||
          completado
            ? "text-blue-950"
            : "text-gray-400"
        }`}
      >
        {titulo}
      </p>
    </div>
  );
}

function LineaIndicador({
  activo,
}: {
  activo: boolean;
}) {
  return (
    <div
      className={`mt-3.5 h-[2px] min-w-[10px] flex-1 rounded-full ${
        activo
          ? "bg-emerald-500"
          : "bg-gray-200"
      }`}
    />
  );
}

function ResumenCompacto({
  pasoActual,
  cantidadPasos,
  litrosPiscina,
  resumenVolumen,
  camino,
  problema,
  tratamiento,
  seleccionMantenimiento,
}: {
  pasoActual: PasoCalculadoraPiscinaMobile;
  cantidadPasos: number;
  litrosPiscina: number;
  resumenVolumen:
    | ResumenVolumenPiscinaMobile
    | null;
  camino:
    | CaminoExperienciaMobile
    | null;
  problema:
    | ProblemaAguaMobile
    | null;
  tratamiento: TratamientoSeleccionadoMobile;
  seleccionMantenimiento: ProductoPiscinaMobile[];
}) {
  const [abierto, setAbierto] =
    useState(false);

  return (
    <div className="overflow-hidden rounded-[18px] border border-cyan-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() =>
          setAbierto(
            (actual) => !actual
          )
        }
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-cyan-100 text-cyan-700">
            <Droplets
              size={18}
              strokeWidth={2.5}
            />
          </span>

          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-cyan-700">
              Resumen en vivo
            </p>

            <p className="mt-0.5 truncate text-[11px] font-black text-blue-950">
              Paso {pasoActual} de{" "}
              {cantidadPasos}
              {litrosPiscina > 0
                ? ` · ${formatearLitros(
                    litrosPiscina
                  )} litros`
                : ""}
            </p>
          </div>
        </div>

        <ChevronRight
          size={18}
          strokeWidth={2.5}
          className={`shrink-0 text-cyan-700 transition-transform ${
            abierto
              ? "rotate-90"
              : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="border-t border-gray-100 px-3.5 py-3">
          <div className="grid grid-cols-2 gap-2">
            <DatoResumen
              etiqueta="Método"
              valor={
                resumenVolumen?.metodo ??
                "Sin completar"
              }
            />

            <DatoResumen
              etiqueta="Forma"
              valor={
                resumenVolumen?.forma ??
                "Sin completar"
              }
            />

            <DatoResumen
              etiqueta="Camino"
              valor={
                camino === "directo"
                  ? "Producto directo"
                  : camino ===
                      "guiado"
                    ? "Con ayuda"
                    : "Sin elegir"
              }
            />

            <DatoResumen
              etiqueta="Problema"
              valor={
                problema
                  ? obtenerNombreProblemaMobile(
                      problema
                    )
                  : camino ===
                      "directo"
                    ? "No aplica"
                    : "Sin elegir"
              }
            />

            <DatoResumen
              etiqueta={
                problema ===
                "mantenimiento"
                  ? "Productos"
                  : "Producto"
              }
              valor={
                problema ===
                "mantenimiento"
                  ? seleccionMantenimiento.length >
                    0
                    ? `${seleccionMantenimiento.length} seleccionados`
                    : "Sin seleccionar"
                  : tratamiento
                    ? obtenerNombreTratamientoMobile(
                        tratamiento
                      )
                    : "Sin seleccionar"
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DatoResumen({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="rounded-[12px] bg-gray-50 px-2.5 py-2">
      <p className="text-[7px] font-black uppercase tracking-[0.06em] text-gray-400">
        {etiqueta}
      </p>

      <p className="mt-1 line-clamp-2 text-[9px] font-black leading-tight text-blue-950">
        {valor}
      </p>
    </div>
  );
}