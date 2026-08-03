"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  CircleCheck,
  Clock3,
  Droplets,
  ShoppingCart,
} from "lucide-react";

import Paso1VolumenPiscina, {
  type ResumenVolumenPiscina,
} from "./Paso1VolumenPiscina";

import Paso2ExperienciaPiscina, {
  obtenerNombreProblema,
  type CaminoExperiencia,
  type ProblemaAgua,
} from "./Paso2ExperienciaPiscina";

import Paso3TratamientoPiscina, {
  obtenerNombreTratamiento,
  type ProductoPiscina,
  type TratamientoSeleccionado,
} from "./Paso3TratamientoPiscina";

import Paso4ResultadoPiscina, {
  calcularCompraEconomica,
  formatearBaseCompra,
} from "./Paso4ResultadoPiscina";

type PasoCalculadora = 1 | 2 | 3 | 4;

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

function formatearNumero(valor: number) {
  return valor.toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  });
}

function numeroDesdeTexto(valor: unknown) {
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

function obtenerValor(
  producto: import("./Paso3TratamientoPiscina").ProductoPiscina | null,
  ...claves: string[]
) {
  if (!producto) return "";

  for (const clave of claves) {
    const valor = producto[clave];
    if (typeof valor === "string" && valor.trim() !== "") {
      return valor.trim();
    }
  }

  return "";
}


function normalizarTexto(valor: unknown) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obtenerClaveProducto(
  producto: ProductoPiscina
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

function obtenerPrecioFinalProducto(
  producto: ProductoPiscina
) {
  const precio = numeroDesdeTexto(
    obtenerValor(producto, "Precio")
  );

  const precioOferta = numeroDesdeTexto(
    obtenerValor(
      producto,
      "Precio oferta"
    )
  );

  if (
    precioOferta > 0 &&
    (precio <= 0 || precioOferta < precio)
  ) {
    return precioOferta;
  }

  return precio;
}

function formatearPrecio(valor: number) {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

type CalculadoraPiscinaPCProps = {
  onAgregarAlCarrito: (
    items: {
      producto: import("./Paso3TratamientoPiscina").ProductoPiscina;
      cantidad: number;
    }[]
  ) => void;
};

export default function CalculadoraPiscinaPC({
  onAgregarAlCarrito,
}: CalculadoraPiscinaPCProps) {
  const [pasoActual, setPasoActual] =
    useState<PasoCalculadora>(1);

  const [transicionando, setTransicionando] =
    useState(false);

  const [litrosPiscina, setLitrosPiscina] =
    useState(0);

  const [resumenVolumen, setResumenVolumen] =
    useState<ResumenVolumenPiscina | null>(
      null
    );

  const [caminoExperiencia, setCaminoExperiencia] =
    useState<CaminoExperiencia | null>(null);

  const [problemaAgua, setProblemaAgua] =
    useState<ProblemaAgua | null>(null);


  const [tratamientoSeleccionado, setTratamientoSeleccionado] =
    useState<TratamientoSeleccionado | null>(null);

  const [
    seleccionMantenimiento,
    setSeleccionMantenimiento,
  ] = useState<ProductoPiscina[]>([]);

  const esSeleccionMultiple =
    caminoExperiencia === "directo" ||
    problemaAgua === "mantenimiento";

  const pasoDosRef =
    useRef<HTMLDivElement | null>(null);

  const pasoTresRef =
    useRef<HTMLDivElement | null>(null);

  const pasoCuatroRef =
    useRef<HTMLDivElement | null>(null);

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
      const duracion = 900;
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
    }, 220);
  }

  const actualizarVolumenEnVivo =
    useCallback(
      (
        litros: number,
        resumen:
          | ResumenVolumenPiscina
          | null
      ) => {
        setLitrosPiscina(litros);
        setResumenVolumen(resumen);
      },
      []
    );

  function completarPasoUno(
    litros: number,
    resumen: ResumenVolumenPiscina
  ) {
    if (transicionando) {
      return;
    }

    setLitrosPiscina(litros);
    setResumenVolumen(resumen);
    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(2);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicionando(false);
          moverSuaveA(pasoDosRef);
        });
      });
    }, 520);
  }

  function volverAlPasoUno() {
    if (transicionando) {
      return;
    }

    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(1);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicionando(false);

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });
      });
    }, 420);
  }

  function irAlPasoTres() {
    if (
      transicionando ||
      caminoExperiencia === null ||
      (caminoExperiencia === "guiado" &&
        problemaAgua === null)
    ) {
      return;
    }

    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(3);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicionando(false);
          moverSuaveA(pasoTresRef);
        });
      });
    }, 520);
  }

  function volverAlPasoDos() {
    if (transicionando) {
      return;
    }

    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(2);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicionando(false);
          moverSuaveA(pasoDosRef);
        });
      });
    }, 420);
  }

  function irAlPasoCuatro() {
    if (
      transicionando ||
      esSeleccionMultiple ||
      tratamientoSeleccionado === null
    ) {
      return;
    }

    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(4);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicionando(false);
          moverSuaveA(pasoCuatroRef);
        });
      });
    }, 520);
  }

  function volverAlPasoTres() {
    if (transicionando) {
      return;
    }

    setTransicionando(true);

    window.setTimeout(() => {
      setPasoActual(3);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicionando(false);
          moverSuaveA(pasoTresRef);
        });
      });
    }, 420);
  }

  function alternarProductoMantenimiento(
    producto: ProductoPiscina
  ) {
    const clave =
      obtenerClaveProducto(producto);

    setSeleccionMantenimiento(
      (seleccionActual) => {
        const yaSeleccionado =
          seleccionActual.some(
            (item) =>
              obtenerClaveProducto(item) ===
              clave
          );

        if (yaSeleccionado) {
          return seleccionActual.filter(
            (item) =>
              obtenerClaveProducto(item) !==
              clave
          );
        }

        return [
          ...seleccionActual,
          producto,
        ];
      }
    );
  }

  function agregarSeleccionMultipleAlCarrito() {
    if (
      seleccionMantenimiento.length === 0
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
        obtenerPrecioFinalProducto(
          producto
        ),
      0
    );

  const dosisSeleccionada =
    tratamientoSeleccionado !== null
      ? numeroDesdeTexto(
          obtenerValor(
            tratamientoSeleccionado,
            "Dosis"
          )
        )
      : 0;

  const litrosReferenciaSeleccionada =
    tratamientoSeleccionado !== null
      ? numeroDesdeTexto(
          obtenerValor(
            tratamientoSeleccionado,
            "Litros referencia"
          )
        )
      : 0;

  const dosisCalculadaSeleccionada =
    litrosPiscina > 0 &&
    dosisSeleccionada > 0 &&
    litrosReferenciaSeleccionada > 0
      ? (litrosPiscina * dosisSeleccionada) /
        litrosReferenciaSeleccionada
      : 0;

  const compraEconomica =
    tratamientoSeleccionado !== null
      ? calcularCompraEconomica(
          tratamientoSeleccionado,
          dosisCalculadaSeleccionada
        )
      : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
      <div className="space-y-6">
        <section className="rounded-[24px] border border-gray-200 bg-white px-8 py-5 shadow-sm">
          <div className="flex items-start">
            <Paso
              numero={1}
              titulo="Volumen"
              activo={pasoActual === 1}
              completado={pasoActual > 1}
            />

            <Linea activo />

            <Paso
              numero={2}
              titulo="Experiencia"
              activo={pasoActual === 2}
              completado={pasoActual > 2}
            />

            <Linea />

            <Paso
              numero={3}
              titulo={
                caminoExperiencia === "directo"
                  ? "Productos"
                  : problemaAgua === "mantenimiento"
                    ? "Mantenimiento"
                    : "Tratamiento"
              }
              activo={pasoActual === 3}
              completado={pasoActual > 3}
            />

            {!esSeleccionMultiple && (
              <>
                <Linea />

                <Paso
                  numero={4}
                  titulo="Resultado"
                  activo={pasoActual === 4}
                />
              </>
            )}
          </div>
        </section>

        {pasoActual === 1 ? (
          <Paso1VolumenPiscina
            transicionando={transicionando}
            onCambio={actualizarVolumenEnVivo}
            onCompletar={completarPasoUno}
          />
        ) : pasoActual === 2 ? (
          <div ref={pasoDosRef}>
            <Paso2ExperienciaPiscina
              transicionando={transicionando}
              valor={caminoExperiencia}
              problema={problemaAgua}
              onChange={(camino) => {
                setTratamientoSeleccionado(null);
                setSeleccionMantenimiento([]);

                if (camino === "directo") {
                  setProblemaAgua(null);
                }

                setCaminoExperiencia(camino);
              }}
              onCambiarProblema={(problema) => {
                setTratamientoSeleccionado(null);
                setSeleccionMantenimiento([]);
                setProblemaAgua(problema);
              }}
              onVolver={volverAlPasoUno}
              onContinuar={irAlPasoTres}
            />
          </div>
        ) : pasoActual === 3 ? (
          <div ref={pasoTresRef}>
            <Paso3TratamientoPiscina
              transicionando={transicionando}
              camino={caminoExperiencia}
              problema={problemaAgua}
              litrosPiscina={litrosPiscina}
              tratamiento={tratamientoSeleccionado}
              seleccionMantenimiento={
                seleccionMantenimiento
              }
              onCambiarTratamiento={
                setTratamientoSeleccionado
              }
              onAlternarMantenimiento={
                alternarProductoMantenimiento
              }
              onVolver={volverAlPasoDos}
              onContinuar={irAlPasoCuatro}
            />
          </div>
        ) : tratamientoSeleccionado ? (
          <div ref={pasoCuatroRef}>
            <Paso4ResultadoPiscina
              litrosPiscina={litrosPiscina}
              problema={problemaAgua}
              producto={
                tratamientoSeleccionado
              }
              onVolver={volverAlPasoTres}
            />
          </div>
        ) : null}
      </div>

      <aside className="sticky top-24 rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
          Resumen en vivo
        </p>

        <h2 className="mt-2 text-[22px] font-black tracking-[-0.03em] text-blue-950">
          Tu piscina
        </h2>

        <div className="mt-5 space-y-3">
          <FilaResumen
            etiqueta="Paso actual"
            valor={
              pasoActual === 1
                ? "1 · Volumen"
                : pasoActual === 2
                  ? "2 · Experiencia"
                  : pasoActual === 3
                    ? caminoExperiencia === "directo"
                      ? "3 · Productos"
                      : problemaAgua === "mantenimiento"
                        ? "3 · Mantenimiento"
                        : "3 · Tratamiento"
                    : "4 · Resultado"
            }
          />

          <FilaResumen
            etiqueta="Método"
            valor={
              resumenVolumen?.metodo ??
              "Sin completar"
            }
          />

          {resumenVolumen?.forma !==
            "No aplica" && (
            <FilaResumen
              etiqueta="Forma"
              valor={
                resumenVolumen?.forma ??
                "Sin completar"
              }
            />
          )}

          {resumenVolumen?.detalle1Etiqueta && (
            <FilaResumen
              etiqueta={
                resumenVolumen.detalle1Etiqueta
              }
              valor={
                resumenVolumen.detalle1Valor ??
                ""
              }
            />
          )}

          {resumenVolumen?.detalle2Etiqueta && (
            <FilaResumen
              etiqueta={
                resumenVolumen.detalle2Etiqueta
              }
              valor={
                resumenVolumen.detalle2Valor ??
                ""
              }
            />
          )}

          {resumenVolumen?.detalle3Etiqueta && (
            <FilaResumen
              etiqueta={
                resumenVolumen.detalle3Etiqueta
              }
              valor={
                resumenVolumen.detalle3Valor ??
                ""
              }
            />
          )}

          {pasoActual >= 2 && (
            <FilaResumen
              etiqueta="Camino"
              valor={
                caminoExperiencia === "directo"
                  ? "Selección directa"
                  : caminoExperiencia ===
                      "guiado"
                    ? "Ayuda guiada"
                    : "Sin seleccionar"
              }
            />
          )}

          {caminoExperiencia === "guiado" && (
            <FilaResumen
              etiqueta="Estado del agua"
              valor={obtenerNombreProblema(
                problemaAgua
              )}
            />
          )}


          {pasoActual >= 3 &&
          esSeleccionMultiple ? (
            <FilaResumen
              etiqueta="Productos"
              valor={
                seleccionMantenimiento.length === 0
                  ? "Sin seleccionar"
                  : `${seleccionMantenimiento.length} seleccionados`
              }
            />
          ) : (
            pasoActual >= 3 &&
            tratamientoSeleccionado !== null && (
              <FilaResumen
                etiqueta="Producto"
                valor={obtenerNombreTratamiento(
                  tratamientoSeleccionado
                )}
              />
            )
          )}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[16px] bg-gradient-to-br from-[#0D5EA8] via-[#0879C5] to-[#159BE8] px-4 py-3.5 text-white shadow-[0_12px_28px_rgba(8,121,197,0.20)]">
          <div className="pointer-events-none absolute -bottom-20 -right-14 h-36 w-56 rounded-[50%] border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Droplets
                size={16}
                strokeWidth={2.5}
                className="shrink-0"
              />

              <p className="text-[10px] font-bold text-white/75">
                Capacidad de la piscina
              </p>
            </div>

            <p className="shrink-0 text-[22px] font-black leading-none">
              {formatearNumero(litrosPiscina)}{" "}
              <span className="text-[11px] text-white/80">
                litros
              </span>
            </p>
          </div>

          {litrosPiscina > 0 && (
            <div className="relative z-10 mt-2.5 flex items-center justify-between gap-3 rounded-[12px] border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <div className="flex min-w-0 items-center gap-2">
                <Clock3
                  size={14}
                  strokeWidth={2.5}
                  className="shrink-0 text-white/85"
                />

                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-white/70">
                  Recirculación diaria
                </p>
              </div>

              <p className="shrink-0 text-[10px] font-black text-white">
                {formatearRecirculacion(
                  litrosPiscina
                )}{" "}
                DIARIAMENTE
              </p>
            </div>
          )}
        </div>


        {esSeleccionMultiple &&
          pasoActual >= 3 && (
            <div className="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                {caminoExperiencia === "directo"
                  ? "Compra seleccionada"
                  : "Compra de mantenimiento"}
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500">
                    Productos seleccionados
                  </p>

                  <p className="mt-0.5 text-[16px] font-black text-blue-950">
                    {seleccionMantenimiento.length}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold text-gray-500">
                    Total
                  </p>

                  <p className="mt-0.5 text-[20px] font-black text-emerald-700">
                    {totalMantenimiento > 0
                      ? formatearPrecio(
                          totalMantenimiento
                        )
                      : "$0"}
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
                  agregarSeleccionMultipleAlCarrito
                }
                className={`mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-[16px] px-5 text-[13px] font-black transition ${
                  seleccionMantenimiento.length > 0
                    ? "bg-teal-700 text-white shadow-[0_12px_28px_rgba(15,118,110,0.24)] hover:-translate-y-0.5 hover:bg-teal-800 active:scale-[0.99]"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                <ShoppingCart
                  size={18}
                  strokeWidth={2.6}
                />

                {seleccionMantenimiento.length > 0
                  ? "Agregar selección al carrito"
                  : "Seleccioná productos"}
              </button>
            </div>
          )}

        {pasoActual === 4 &&
          tratamientoSeleccionado !== null &&
          !esSeleccionMultiple && (
          <div
            className={`mt-4 rounded-[18px] border p-4 ${
              compraEconomica
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p
              className={`text-[9px] font-black uppercase tracking-[0.12em] ${
                compraEconomica
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
            >
              Opción más económica
            </p>

            {compraEconomica ? (
              <>
                <p className="mt-1 text-[11px] font-black text-blue-950">
                  {compraEconomica.items
                    .map(
                      (item) =>
                        `${item.cantidad} × ${item.contenidoTexto}`
                    )
                    .join(" + ")}
                </p>

                <p className="mt-1 text-[9px] font-semibold text-gray-500">
                  Sobrante:{" "}
                  {formatearBaseCompra(
                    compraEconomica.sobranteBase,
                    compraEconomica.unidadBase,
                    compraEconomica.unidadVisual
                  )}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[10px] font-semibold leading-relaxed text-amber-900">
                No se pudo calcular automáticamente la combinación de envases,
                pero igualmente podés agregar una unidad de este producto al carrito.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                if (!tratamientoSeleccionado) {
                  return;
                }

                if (compraEconomica) {
                  onAgregarAlCarrito(
                    compraEconomica.items.map((item) => ({
                      producto: item.producto,
                      cantidad: item.cantidad,
                    }))
                  );
                  return;
                }

                onAgregarAlCarrito([
                  {
                    producto: tratamientoSeleccionado,
                    cantidad: 1,
                  },
                ]);
              }}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-[16px] bg-teal-700 px-5 text-[13px] font-black text-white shadow-[0_12px_28px_rgba(15,118,110,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-800 active:scale-[0.99]"
            >
              <ShoppingCart size={18} strokeWidth={2.6} />
              {compraEconomica
                ? "Agregar compra recomendada"
                : "Agregar producto al carrito"}
            </button>
          </div>
        )}

      </aside>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  activo = false,
  completado = false,
}: {
  numero: number;
  titulo: string;
  activo?: boolean;
  completado?: boolean;
}) {
  return (
    <div className="flex w-[125px] shrink-0 flex-col items-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-black transition-all duration-300 ${
          completado
            ? "bg-emerald-600 text-white shadow-sm"
            : activo
              ? "bg-sky-600 text-white shadow-sm"
              : "border border-gray-200 bg-gray-100 text-gray-400"
        }`}
      >
        {completado ? (
          <CircleCheck
            size={19}
            strokeWidth={2.7}
          />
        ) : (
          numero
        )}
      </div>

      <span
        className={`mt-2 text-[11px] font-black ${
          completado
            ? "text-emerald-700"
            : activo
              ? "text-blue-950"
              : "text-gray-400"
        }`}
      >
        {titulo}
      </span>
    </div>
  );
}

function Linea({
  activo = false,
}: {
  activo?: boolean;
}) {
  return (
    <div
      className={`mt-5 h-[3px] flex-1 rounded-full ${
        activo ? "bg-sky-500" : "bg-gray-200"
      }`}
    />
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
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-[12px] font-semibold text-gray-500">
        {etiqueta}
      </span>

      <span className="max-w-[58%] text-right text-[12px] font-black text-blue-950">
        {valor}
      </span>
    </div>
  );
}