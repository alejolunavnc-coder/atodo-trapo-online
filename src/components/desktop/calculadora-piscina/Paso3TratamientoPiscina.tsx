"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardList,
  Clock3,
  Droplets,
  FlaskConical,
  Layers3,
  LoaderCircle,
  MessageCircle,
  PaintBucket,
  Paintbrush,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Papa from "papaparse";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  CaminoExperiencia,
  ProblemaAgua,
} from "./Paso2ExperienciaPiscina";

export type ProductoPiscina = Record<
  string,
  string
>;

export type TratamientoSeleccionado =
  | ProductoPiscina
  | null;

type Paso3TratamientoPiscinaProps = {
  transicionando: boolean;
  camino: CaminoExperiencia | null;
  problema: ProblemaAgua | null;
  litrosPiscina: number;
  tratamiento: TratamientoSeleccionado;
  seleccionMantenimiento: ProductoPiscina[];
  onCambiarTratamiento: (
    tratamiento: ProductoPiscina
  ) => void;
  onAlternarMantenimiento: (
    producto: ProductoPiscina
  ) => void;
  onVolver: () => void;
  onContinuar: () => void;
};

const PALABRAS_CLAVE: Record<
  ProblemaAgua,
  string
> = {
  agua_turbia: "agua turbia",
  agua_verde: "agua verde",
  algas: "algas en paredes o piso",
  mantenimiento: "el agua está bien",
};

export function obtenerNombreTratamiento(
  tratamiento: TratamientoSeleccionado
) {
  return tratamiento?.Nombre?.trim() ||
    "Sin seleccionar";
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

function separarPalabrasClave(
  valor: unknown
) {
  return normalizarTexto(valor)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

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

function formatearPrecio(
  valor: unknown
) {
  const numero = numeroDesdeTexto(valor);

  if (numero <= 0) {
    return "Consultar";
  }

  return numero.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function obtenerDescuento(
  precio: number,
  precioOferta: number
) {
  if (
    precio <= 0 ||
    precioOferta <= 0 ||
    precioOferta >= precio
  ) {
    return 0;
  }

  return Math.round(
    ((precio - precioOferta) / precio) * 100
  );
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

function obtenerIdProducto(
  producto: ProductoPiscina,
  indice: number
) {
  return [
    obtenerValor(producto, "Marca"),
    obtenerValor(producto, "Nombre"),
    obtenerValor(producto, "Tamaño"),
    indice,
  ].join("::");
}

function obtenerClaveSeleccion(
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


function formatearCantidadMantenimiento(
  valor: number
) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}


function esProductoSolidoPiscina(
  producto: ProductoPiscina
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
  producto: ProductoPiscina
) {
  const unidadOriginal =
    obtenerValor(
      producto,
      "Unidad dosis"
    );

  const unidadNormalizada =
    normalizarTexto(unidadOriginal)
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

function calcularDosisMantenimiento(
  producto: ProductoPiscina | undefined,
  litrosPiscina: number
) {
  if (!producto || litrosPiscina <= 0) {
    return "Sin datos disponibles";
  }

  const dosis = numeroDesdeTexto(
    obtenerValor(producto, "Dosis")
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
    );

  if (
    dosis <= 0 ||
    litrosReferencia <= 0 ||
    !unidad
  ) {
    return "Faltan datos en Google Sheets";
  }

  const cantidad =
    (litrosPiscina * dosis) /
    litrosReferencia;

  return `${formatearCantidadMantenimiento(
    cantidad
  )} ${unidad}`;
}

function formatearRecirculacionMantenimiento(
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

export default function Paso3TratamientoPiscina({
  transicionando,
  camino,
  problema,
  litrosPiscina,
  tratamiento,
  seleccionMantenimiento,
  onCambiarTratamiento,
  onAlternarMantenimiento,
  onVolver,
  onContinuar,
}: Paso3TratamientoPiscinaProps) {
  const [productos, setProductos] =
    useState<ProductoPiscina[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    mostrarCatalogoMantenimiento,
    setMostrarCatalogoMantenimiento,
  ] = useState(false);

  const catalogoMantenimientoRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarProductos() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(
          "/api/productos",
          {
            cache: "no-store",
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron cargar los productos."
          );
        }

        const csv = await respuesta.text();

        const resultado =
          Papa.parse<ProductoPiscina>(csv, {
            header: true,
            skipEmptyLines: true,
          });

        if (!activo) {
          return;
        }

        setProductos(resultado.data);
      } catch (errorCarga) {
        console.error(
          "Error cargando productos de piscina:",
          errorCarga
        );

        if (activo) {
          setError(
            "No se pudieron cargar los productos de piscina."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarProductos();

    return () => {
      activo = false;
    };
  }, []);

  const productosPiscinaCalculadora =
    useMemo(() => {
      return productos.filter(
        (producto) => {
          const categoria =
            normalizarTexto(
              obtenerValor(
                producto,
                "Categoría",
                "Categoria"
              )
            );

          const esPiscina =
            categoria === "piscina" ||
            categoria === "piscinas";

          const oculto =
            normalizarTexto(
              obtenerValor(
                producto,
                "Stock"
              )
            ) === "x";

          const tieneUsoPiscina =
            obtenerValor(
              producto,
              "Uso piscina",
              "Uso Piscina"
            ) !== "";

          return (
            esPiscina &&
            !oculto &&
            tieneUsoPiscina
          );
        }
      );
    }, [productos]);

  const productosMantenimiento =
    useMemo(() => {
      function buscarProducto(
        palabras: string[],
        priorizarSolido = false
      ) {
        const coincidentes =
          productosPiscinaCalculadora.filter(
            (producto) => {
              const texto = normalizarTexto(
                [
                  obtenerValor(
                    producto,
                    "Nombre"
                  ),
                  obtenerValor(
                    producto,
                    "Linea",
                    "Línea"
                  ),
                  obtenerValor(
                    producto,
                    "Uso piscina",
                    "Uso Piscina"
                  ),
                ].join(" ")
              );

              return palabras.some(
                (palabra) =>
                  texto.includes(palabra)
              );
            }
          );

        if (priorizarSolido) {
          return (
            coincidentes.find(
              esProductoSolidoPiscina
            ) || coincidentes[0]
          );
        }

        return coincidentes[0];
      }

      const clarificadorClasico =
        productosPiscinaCalculadora.find(
          (producto) => {
            const nombre =
              normalizarTexto(
                obtenerValor(
                  producto,
                  "Nombre"
                )
              );

            return (
              nombre ===
                "clarificador clasico" ||
              nombre.includes(
                "clarificador clasico"
              )
            );
          }
        );

      return {
        cloro: buscarProducto(
          ["cloro"],
          true
        ),
        alguicida: buscarProducto([
          "alguicida",
          "algicida",
        ]),
        clarificador:
          clarificadorClasico ||
          buscarProducto([
            "clarificador",
          ]),
      };
    }, [productosPiscinaCalculadora]);

  const esMantenimiento =
    camino === "guiado" &&
    problema === "mantenimiento";

  const esSeleccionMultiple =
    camino === "directo" ||
    esMantenimiento;

  useEffect(() => {
    if (!esSeleccionMultiple) {
      setMostrarCatalogoMantenimiento(
        false
      );
    }
  }, [esSeleccionMultiple]);

  function abrirCatalogoMantenimiento() {
    setMostrarCatalogoMantenimiento(true);

    window.setTimeout(() => {
      const catalogo =
        catalogoMantenimientoRef.current;

      if (!catalogo) {
        return;
      }

      const inicio = window.scrollY;
      const destino =
        inicio +
        catalogo.getBoundingClientRect().top -
        105;

      const distancia = destino - inicio;
      const duracion = 750;
      const comienzo = performance.now();

      function animarScroll(
        tiempoActual: number
      ) {
        const progreso = Math.min(
          (tiempoActual - comienzo) /
            duracion,
          1
        );

        const suavizado =
          progreso < 0.5
            ? 4 * progreso * progreso * progreso
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
            animarScroll
          );
        }
      }

      window.requestAnimationFrame(
        animarScroll
      );
    }, 180);
  }

  const palabraClave =
    problema !== null
      ? PALABRAS_CLAVE[problema]
      : "";

  const productosFiltrados =
    useMemo(() => {
      if (esSeleccionMultiple) {
        return productosPiscinaCalculadora;
      }

      if (!palabraClave) {
        return [];
      }

      return productosPiscinaCalculadora.filter(
        (producto) => {
          const usos =
            separarPalabrasClave(
              obtenerValor(
                producto,
                "Uso piscina",
                "Uso Piscina"
              )
            );

          return usos.includes(
            normalizarTexto(
              palabraClave
            )
          );
        }
      );
    }, [
      productosPiscinaCalculadora,
      camino,
      esSeleccionMultiple,
      palabraClave,
    ]);

  const productosAgrupados =
    useMemo(() => {
      const grupos = new Map<
        string,
        ProductoPiscina[]
      >();

      productosFiltrados.forEach(
        (producto) => {
          const clave =
            obtenerClaveSeleccion(
              producto
            );

          const grupo =
            grupos.get(clave) || [];

          grupo.push(producto);
          grupos.set(clave, grupo);
        }
      );

      return Array.from(
        grupos.values()
      ).map((presentaciones) => {
        const representante = {
          ...presentaciones[0],
        };

        representante.__PresentacionesPiscina =
          JSON.stringify(
            presentaciones
          );

        return representante;
      });
    }, [productosFiltrados]);

  const mostrarPreparacion =
    camino === "guiado" &&
    problema === "agua_turbia";

  return (
    <section
      className={`scroll-mt-28 space-y-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        transicionando
          ? "translate-y-5 scale-[0.99] opacity-0 blur-[2px]"
          : "translate-y-0 scale-100 opacity-100 blur-0"
      }`}
    >
      <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FlaskConical
                size={23}
                strokeWidth={2.4}
              />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
                Paso 3
              </p>

              <h2 className="mt-1 text-[21px] font-black tracking-[-0.03em] text-blue-950">
                {esMantenimiento
                  ? "Mantenimiento completo"
                  : camino === "directo"
                    ? "Elegí tus productos"
                    : "Elegí un producto"}
              </h2>

              <p className="mt-1 text-[13px] font-medium text-gray-500">
                {esMantenimiento
                  ? "Te mostramos qué necesita tu piscina y con qué frecuencia aplicarlo."
                  : camino === "directo"
                    ? "Revisá la guía y elegí todos los productos que necesitás."
                    : "Mostramos los productos que coinciden con el problema seleccionado."}
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
      </div>

      {mostrarPreparacion && (
        <PreparacionTratamiento />
      )}


      {esSeleccionMultiple && (
        <div className="rounded-[24px] border border-sky-200 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/60 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <ClipboardList
                size={24}
                strokeWidth={2.5}
              />
            </span>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-700">
                Guía de mantenimiento
              </p>

              <h3 className="mt-1 text-[22px] font-black tracking-[-0.03em] text-blue-950">
                Guía para{" "}
                {litrosPiscina.toLocaleString(
                  "es-AR",
                  {
                    maximumFractionDigits: 0,
                  }
                )}{" "}
                litros
              </h3>

              <p className="mt-2 max-w-[720px] text-[12px] font-semibold leading-relaxed text-gray-500">
                Estas cantidades se calculan con la dosis y los litros de referencia cargados en Google Sheets.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <ItemMantenimiento
              numero={1}
              titulo="Cloro"
              cantidad={calcularDosisMantenimiento(
                productosMantenimiento.cloro,
                litrosPiscina
              )}
              frecuencia="Uso diario"
              descripcion="Aplicá la dosis indicada todos los días para mantener el agua desinfectada."
            />

            <ItemMantenimiento
              numero={2}
              titulo="Alguicida preventivo"
              cantidad={calcularDosisMantenimiento(
                productosMantenimiento.alguicida,
                litrosPiscina
              )}
              frecuencia="Una vez por semana"
              descripcion="Ayuda a prevenir la formación de algas en paredes, piso y agua."
            />

            <ItemMantenimiento
              numero={3}
              titulo="Clarificador"
              cantidad={calcularDosisMantenimiento(
                productosMantenimiento.clarificador,
                litrosPiscina
              )}
              frecuencia="Una vez por semana"
              descripcion="Ayuda a mantener el agua clara y a reunir las partículas suspendidas."
            />

            <ItemMantenimiento
              numero={4}
              titulo="Recirculación"
              cantidad={formatearRecirculacionMantenimiento(
                litrosPiscina
              )}
              frecuencia="Todos los días"
              descripcion="Calculado a razón de 1 hora cada 10.000 litros de agua."
            />
          </div>

          <div className="mt-4 rounded-[20px] border border-violet-200 bg-violet-50 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-700">
              Control y regulación del pH
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <DatoPh
                titulo="Menor a 7,2"
                texto="Usar pH+"
              />

              <DatoPh
                titulo="Entre 7,2 y 7,6"
                texto="Nivel correcto"
              />

              <DatoPh
                titulo="Mayor a 7,6"
                texto="Usar pH-"
              />
            </div>

            <p className="mt-3 text-[10px] font-semibold leading-relaxed text-violet-900">
              Primero medí el pH. La calculadora no calcula la cantidad de pH+ o pH- porque depende del resultado de esa medición.
            </p>
          </div>

          {!mostrarCatalogoMantenimiento && (
            <button
              type="button"
              onClick={abrirCatalogoMantenimiento}
              className="group mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-[17px] bg-emerald-600 px-6 text-[15px] font-black text-white shadow-[0_12px_28px_rgba(16,185,129,0.30)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.99]"
            >
              Elegir productos

              <ArrowRight
                size={18}
                strokeWidth={2.7}
              />
            </button>
          )}
        </div>
      )}

      {(!esSeleccionMultiple ||
        mostrarCatalogoMantenimiento) && (
      <div
        ref={catalogoMantenimientoRef}
        className="scroll-mt-24 animate-[fadeIn_.35s_ease-out] rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
              {esSeleccionMultiple
                ? "Catálogo de piscina"
                : palabraClave || "Tratamiento"}
            </p>

            <h3 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-blue-950">
              Productos disponibles
            </h3>

            <p className="mt-2 max-w-[680px] text-[12px] font-semibold leading-relaxed text-gray-500">
              {esSeleccionMultiple
                ? "Podés elegir varios productos. Tocá nuevamente una tarjeta para quitarla de la selección."
                : "Elegí una de las soluciones compatibles. La dosis se calcula automáticamente según los litros de tu piscina y los datos cargados en Google Sheets."}
            </p>
          </div>

        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div>
            <p className="text-[12px] font-black text-blue-950">
              ¿Tenés una consulta específica sobre algún producto?
            </p>

            <p className="mt-1 text-[10px] font-semibold text-gray-500">
              Contactanos por WhatsApp y te ayudamos a elegir la opción adecuada.
            </p>
          </div>

          <a
            href="https://wa.me/5493765225808?text=%C2%A1Hola%21%20Tengo%20una%20duda%20con%20un%20producto%20de%20piscina."
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] active:scale-[0.98]"
          >
            <MessageCircle
              size={18}
              strokeWidth={2.6}
            />

            Consultar por WhatsApp
          </a>
        </div>

        {cargando ? (
          <div className="flex min-h-[220px] items-center justify-center gap-3 text-sky-700">
            <LoaderCircle
              className="animate-spin"
              size={22}
            />

            <p className="text-[12px] font-black">
              Cargando productos…
            </p>
          </div>
        ) : error ? (
          <AvisoError texto={error} />
        ) : productosAgrupados.length ===
          0 ? (
          <AvisoError
            texto={
              camino === "directo"
                ? "No hay productos de piscina disponibles."
                : `No encontramos productos con “Uso piscina: ${palabraClave}”.`
            }
          />
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-4 xl:grid-cols-4">
            {productosAgrupados.map(
              (producto, indice) => {
                const id =
                  obtenerIdProducto(
                    producto,
                    indice
                  );

                const nombre =
                  obtenerValor(
                    producto,
                    "Nombre"
                  ) ||
                  "Producto para piscina";

                return (
                  <TarjetaProducto
                    key={id}
                    producto={producto}
                    litrosPiscina={
                      litrosPiscina
                    }
                    camino={camino}
                    activo={
                      esSeleccionMultiple
                        ? seleccionMantenimiento.some(
                            (seleccionado) =>
                              obtenerClaveSeleccion(
                                seleccionado
                              ) ===
                              obtenerClaveSeleccion(
                                producto
                              )
                          )
                        : tratamiento !== null &&
                          obtenerClaveSeleccion(
                            tratamiento
                          ) ===
                            obtenerClaveSeleccion(
                              producto
                            )
                    }
                    onClick={() => {
                      if (esSeleccionMultiple) {
                        onAlternarMantenimiento(
                          producto
                        );
                        return;
                      }

                      onCambiarTratamiento(
                        producto
                      );
                    }}
                  />
                );
              }
            )}
          </div>
        )}

        {tratamiento !== null &&
          !esSeleccionMultiple && (
          <div className="mt-5 rounded-[24px] border border-sky-300 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 shadow-[0_14px_34px_rgba(14,165,233,0.14)]">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-sky-600 text-white shadow-sm">
                <ClipboardList
                  size={21}
                  strokeWidth={2.6}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">
                  Modo de uso del producto seleccionado
                </p>

                <h3 className="mt-1 text-[16px] font-black text-blue-950">
                  {obtenerNombreTratamiento(tratamiento)}
                </h3>

                {obtenerValor(
                  tratamiento,
                  "Modo de uso",
                  "Modo uso",
                  "Modo de Uso",
                  "Modo Uso"
                ) ? (
                  <ol className="mt-4 space-y-2">
                    {obtenerValor(
                      tratamiento,
                      "Modo de uso",
                      "Modo uso",
                      "Modo de Uso",
                      "Modo Uso"
                    )
                      .split(".")
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item, indice) => (
                        <li
                          key={`${item}-${indice}`}
                          className="flex items-start gap-3 rounded-[14px] border border-sky-100 bg-white px-4 py-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">
                            {indice + 1}
                          </span>

                          <p className="pt-0.5 text-[11px] font-semibold leading-relaxed text-slate-700">
                            {item}.
                          </p>
                        </li>
                      ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-[11px] font-semibold text-gray-500">
                    Este producto no tiene un modo de uso cargado en Google Sheets.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {esSeleccionMultiple ? (
          seleccionMantenimiento.length > 0 && (
            <div className="mt-5 rounded-[24px] border border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_14px_34px_rgba(16,185,129,0.18)] ring-2 ring-emerald-400/15">
              <div className="mb-3 flex items-center justify-center gap-2 text-emerald-700">
                <Check
                  size={18}
                  strokeWidth={2.8}
                />

                <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                  Productos seleccionados
                </p>
              </div>

              <p className="text-center text-[13px] font-bold text-blue-950">
                {seleccionMantenimiento.length}{" "}
                {seleccionMantenimiento.length === 1
                  ? "producto seleccionado"
                  : "productos seleccionados"}
              </p>

              <p className="mt-3 text-center text-[10px] font-semibold text-gray-500">
                Tocá nuevamente una tarjeta para quitarla. La compra se confirma desde el Resumen en vivo.
              </p>
            </div>
          )
        ) : (
          tratamiento !== null && (
            <div className="mt-5 rounded-[24px] border border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_14px_34px_rgba(16,185,129,0.18)] ring-2 ring-emerald-400/15">
              <div className="mb-3 flex items-center justify-center gap-2 text-emerald-700">
                <Check
                  size={18}
                  strokeWidth={2.8}
                />

                <p className="text-[11px] font-black uppercase tracking-[0.14em]">
                  Paso 3 completado
                </p>
              </div>

              <p className="mb-4 text-center text-[13px] font-bold text-blue-950">
                Producto seleccionado:{" "}
                {obtenerNombreTratamiento(
                  tratamiento
                )}
              </p>

              <button
                type="button"
                onClick={onContinuar}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-[17px] bg-emerald-600 px-6 text-[15px] font-black text-white shadow-[0_12px_28px_rgba(16,185,129,0.34)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.99]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight
                    size={18}
                    strokeWidth={2.7}
                  />
                </span>

                Ir al Paso 4: ver resultado
              </button>
            </div>
          )
        )}
      </div>
      )}

      {problema === "agua_turbia" && (
        <ExplicacionProductos />
      )}
    </section>
  );
}

function TarjetaProducto({
  producto,
  litrosPiscina: _litrosPiscina,
  camino,
  activo,
  onClick,
}: {
  producto: ProductoPiscina;
  litrosPiscina: number;
  camino: CaminoExperiencia | null;
  activo: boolean;
  onClick: () => void;
}) {
  const marca = obtenerValor(
    producto,
    "Marca"
  );

  const nombre =
    obtenerValor(
      producto,
      "Nombre"
    ) || "Producto para piscina";

  const linea = obtenerValor(
    producto,
    "Linea",
    "Línea"
  );

  const modoUso = obtenerValor(
    producto,
    "Modo de uso",
    "Modo uso",
    "Modo de Uso",
    "Modo Uso"
  );

  const imagen = obtenerValor(
    producto,
    "Imagen"
  );

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

  const tieneOferta =
    precioOferta > 0 &&
    precio > 0 &&
    precioOferta < precio;

  const precioFinal =
    tieneOferta
      ? precioOferta
      : precio;

  const descuento =
    obtenerDescuento(
      precio,
      precioOferta
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-w-0 rounded-[16px] border-2 bg-white p-2.5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] ${
        activo
          ? "border-[#1F9D55] ring-2 ring-[#1F9D55]/15"
          : "border-gray-100"
      }`}
    >
      <div className="relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-[13px] bg-gray-50 p-2.5">
        {marca && (
          <span className="absolute left-2 top-2 z-10 max-w-[86px] truncate rounded-full bg-white px-2.5 py-1 text-[8px] font-black text-gray-800 shadow-sm">
            {marca}
          </span>
        )}

        {tieneOferta &&
          descuento > 0 && (
            <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[8px] font-black text-white shadow-sm">
              -{descuento}%
            </span>
          )}

        {activo && (
          <span className="absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#1F9D55] text-white shadow-md">
            <Check
              size={15}
              strokeWidth={3}
            />
          </span>
        )}

        {imagen ? (
          <img
            src={imagen}
            alt={nombre}
            className="h-[88%] w-[88%] object-contain transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <PaintBucket
            size={52}
            className="mb-4 text-gray-300"
          />
        )}
      </div>

      <div className="mt-2">
        <p className="line-clamp-2 min-h-[24px] text-[12px] font-black leading-[1.08] text-slate-900">
          {nombre}
        </p>

        {linea && (
          <p className="mt-[1px] truncate text-[9px] font-semibold leading-none text-gray-500">
            {linea}
          </p>
        )}

        {modoUso &&
          camino === "directo" && (
            <div className="mt-2 flex items-center gap-1.5 rounded-[10px] border border-sky-100 bg-sky-50 px-2.5 py-2">
              <ClipboardList
                size={12}
                strokeWidth={2.4}
                className="shrink-0 text-sky-700"
              />

              <p className="text-[8px] font-black leading-tight text-sky-700">
                Modo de uso disponible abajo
              </p>
            </div>
          )}

        <div className="mt-1.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Precio
          </p>

          {tieneOferta &&
            precio > 0 && (
              <p className="mt-[2px] text-[9px] font-bold leading-none text-red-500 line-through">
                {formatearPrecio(
                  precio
                )}
              </p>
            )}

          <p className="mt-1 text-[15px] font-black leading-none text-blue-950">
            {precioFinal > 0
              ? formatearPrecio(
                  precioFinal
                )
              : "Consultar"}
          </p>
        </div>

      </div>
    </button>
  );
}

function ItemMantenimiento({
  numero,
  titulo,
  cantidad,
  frecuencia,
  descripcion,
}: {
  numero: number;
  titulo: string;
  cantidad: string;
  frecuencia: string;
  descripcion: string;
}) {
  return (
    <div className="rounded-[20px] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-[12px] font-black text-white">
          {numero}
        </span>

        <div className="min-w-0">
          <h4 className="text-[14px] font-black text-blue-950">
            {titulo}
          </h4>

          <p className="mt-1 text-[17px] font-black text-sky-700">
            {cantidad}
          </p>

          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">
            {frecuencia}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[10px] font-semibold leading-relaxed text-gray-500">
        {descripcion}
      </p>
    </div>
  );
}

function DatoPh({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-[15px] border border-violet-100 bg-white px-4 py-3 text-center">
      <p className="text-[11px] font-black text-blue-950">
        {titulo}
      </p>

      <p className="mt-1 text-[10px] font-black text-violet-700">
        {texto}
      </p>
    </div>
  );
}

function PreparacionTratamiento() {
  return (
    <div className="rounded-[24px] border border-amber-300 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <ShieldCheck
            size={25}
            strokeWidth={2.4}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
            Antes de utilizar productos
          </p>

          <h3 className="mt-1 text-[19px] font-black tracking-[-0.03em] text-blue-950">
            Prepará correctamente la piscina
          </h3>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Consejo
              icono={
                <Paintbrush
                  size={19}
                  strokeWidth={2.4}
                />
              }
              titulo="Revisá el modo de uso"
              texto="Seguí la indicación específica cargada en Google Sheets para el producto que elijas."
            />

            <Consejo
              icono={
                <Droplets
                  size={19}
                  strokeWidth={2.4}
                />
              }
              titulo="Controlá el pH"
              texto="Ajustalo y continuá cuando esté entre 7,2 y 7,6."
            />

            <Consejo
              icono={
                <Sparkles
                  size={19}
                  strokeWidth={2.4}
                />
              }
              titulo="Aplicá al final del día"
              texto="Se recomienda utilizar productos después de la jornada de pileta."
            />
          </div>

          <div className="mt-4 rounded-[16px] bg-amber-100/70 px-4 py-3">
            <p className="text-[11px] font-bold leading-relaxed text-amber-900">
              Seguí siempre la dosis, el modo de uso, el tiempo de espera y las advertencias indicadas para el producto elegido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplicacionProductos() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-[20px] border border-sky-200 bg-sky-50 p-5">
        <div className="flex items-center gap-3">
          <Droplets
            size={21}
            className="text-sky-700"
          />

          <h3 className="text-[14px] font-black text-blue-950">
            ¿Cómo actúa un clarificador?
          </h3>
        </div>

        <p className="mt-3 text-[11px] font-semibold leading-relaxed text-gray-600">
          Envuelve las partículas suspendidas y les da peso para que bajen al fondo. Después deben retirarse con el limpiafondo.
        </p>
      </div>

      <div className="rounded-[20px] border border-violet-200 bg-violet-50 p-5">
        <div className="flex items-center gap-3">
          <Layers3
            size={21}
            className="text-violet-700"
          />

          <h3 className="text-[14px] font-black text-blue-950">
            ¿Cómo actúa un floculante?
          </h3>
        </div>

        <p className="mt-3 text-[11px] font-semibold leading-relaxed text-gray-600">
          Agrupa varias partículas pequeñas, las envuelve y forma conjuntos más pesados para facilitar que caigan al fondo.
        </p>
      </div>
    </div>
  );
}

function Consejo({
  icono,
  titulo,
  texto,
}: {
  icono: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-[18px] border border-amber-200 bg-white p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        {icono}
      </span>

      <p className="mt-3 text-[12px] font-black text-blue-950">
        {titulo}
      </p>

      <p className="mt-1.5 text-[10px] font-semibold leading-relaxed text-gray-500">
        {texto}
      </p>
    </div>
  );
}

function AvisoError({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="mt-6 rounded-[20px] border border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <CircleAlert
          size={21}
          className="mt-0.5 shrink-0 text-amber-700"
        />

        <p className="text-[12px] font-bold leading-relaxed text-amber-900">
          {texto}
        </p>
      </div>
    </div>
  );
}