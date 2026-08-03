"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardList,
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
  CaminoExperienciaMobile,
  ProblemaAguaMobile,
} from "./Paso2ExperienciaPiscinaMobile";

export type ProductoPiscinaMobile = Record<
  string,
  string
>;

export type TratamientoSeleccionadoMobile =
  | ProductoPiscinaMobile
  | null;

type Paso3TratamientoPiscinaMobileProps = {
  transicionando: boolean;
  camino: CaminoExperienciaMobile | null;
  problema: ProblemaAguaMobile | null;
  litrosPiscina: number;
  tratamiento: TratamientoSeleccionadoMobile;
  seleccionMantenimiento: ProductoPiscinaMobile[];
  onCambiarTratamiento: (
    tratamiento: ProductoPiscinaMobile
  ) => void;
  onAlternarMantenimiento: (
    producto: ProductoPiscinaMobile
  ) => void;
  onVolver: () => void;
  onContinuar: () => void;
};

const PALABRAS_CLAVE: Record<
  ProblemaAguaMobile,
  string
> = {
  agua_turbia: "agua turbia",
  agua_verde: "agua verde",
  algas: "algas en paredes o piso",
  mantenimiento: "el agua está bien",
};

export function obtenerNombreTratamientoMobile(
  tratamiento: TratamientoSeleccionadoMobile
) {
  return (
    tratamiento?.Nombre?.trim() ||
    "Sin seleccionar"
  );
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

  if (!texto) return 0;

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
  const numero =
    numeroDesdeTexto(valor);

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
    ((precio - precioOferta) /
      precio) *
      100
  );
}

function obtenerValor(
  producto: ProductoPiscinaMobile,
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
  producto: ProductoPiscinaMobile,
  indice: number
) {
  return [
    obtenerValor(
      producto,
      "Marca"
    ),
    obtenerValor(
      producto,
      "Nombre"
    ),
    obtenerValor(
      producto,
      "Tamaño"
    ),
    indice,
  ].join("::");
}

function obtenerClaveSeleccion(
  producto: ProductoPiscinaMobile
) {
  return [
    normalizarTexto(
      obtenerValor(
        producto,
        "Marca"
      )
    ),
    normalizarTexto(
      obtenerValor(
        producto,
        "Nombre"
      )
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

function formatearCantidad(
  valor: number
) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function esProductoSolido(
  producto: ProductoPiscinaMobile
) {
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
  producto: ProductoPiscinaMobile
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
    esProductoSolido(producto) &&
    esUnidadLiquida
  ) {
    return "g";
  }

  return unidadOriginal;
}

function calcularDosisMantenimiento(
  producto:
    | ProductoPiscinaMobile
    | undefined,
  litrosPiscina: number
) {
  if (
    !producto ||
    litrosPiscina <= 0
  ) {
    return "Sin datos";
  }

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
    );

  if (
    dosis <= 0 ||
    litrosReferencia <= 0 ||
    !unidad
  ) {
    return "Faltan datos";
  }

  const cantidad =
    (litrosPiscina * dosis) /
    litrosReferencia;

  return `${formatearCantidad(
    cantidad
  )} ${unidad}`;
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
      (litrosPiscina / 10000) *
        60
    )
  );

  const horas = Math.floor(
    minutosTotales / 60
  );

  const minutos =
    minutosTotales % 60;

  if (
    horas > 0 &&
    minutos > 0
  ) {
    return `${horas} h ${minutos} min`;
  }

  if (horas > 0) {
    return `${horas} h`;
  }

  return `${minutos} min`;
}

export default function Paso3TratamientoPiscinaMobile({
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
}: Paso3TratamientoPiscinaMobileProps) {
  const [productos, setProductos] =
    useState<
      ProductoPiscinaMobile[]
    >([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    mostrarCatalogoMantenimiento,
    setMostrarCatalogoMantenimiento,
  ] = useState(false);

  const catalogoRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    let activo = true;

    async function cargarProductos() {
      try {
        setCargando(true);
        setError("");

        const respuesta =
          await fetch(
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

        const csv =
          await respuesta.text();

        const resultado =
          Papa.parse<ProductoPiscinaMobile>(
            csv,
            {
              header: true,
              skipEmptyLines: true,
            }
          );

        if (activo) {
          setProductos(
            resultado.data
          );
        }
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

  const productosPiscina =
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
            categoria ===
              "piscina" ||
            categoria ===
              "piscinas";

          const oculto =
            normalizarTexto(
              obtenerValor(
                producto,
                "Stock"
              )
            ) === "x";

          const tieneUso =
            obtenerValor(
              producto,
              "Uso piscina",
              "Uso Piscina"
            ) !== "";

          return (
            esPiscina &&
            !oculto &&
            tieneUso
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
          productosPiscina.filter(
            (producto) => {
              const texto =
                normalizarTexto(
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
                  texto.includes(
                    palabra
                  )
              );
            }
          );

        if (priorizarSolido) {
          return (
            coincidentes.find(
              esProductoSolido
            ) ||
            coincidentes[0]
          );
        }

        return coincidentes[0];
      }

      const clarificadorClasico =
        productosPiscina.find(
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
        alguicida:
          buscarProducto([
            "alguicida",
            "algicida",
          ]),
        clarificador:
          clarificadorClasico ||
          buscarProducto([
            "clarificador",
          ]),
      };
    }, [productosPiscina]);

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

  function moverSuaveAlCatalogo() {
    window.setTimeout(() => {
      const elemento =
        catalogoRef.current;

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
    }, 180);
  }

  function abrirCatalogo() {
    setMostrarCatalogoMantenimiento(
      true
    );

    moverSuaveAlCatalogo();
  }

  const palabraClave =
    problema !== null
      ? PALABRAS_CLAVE[problema]
      : "";

  const productosFiltrados =
    useMemo(() => {
      if (
        esSeleccionMultiple
      ) {
        return productosPiscina;
      }

      if (!palabraClave) {
        return [];
      }

      return productosPiscina.filter(
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
      productosPiscina,
      camino,
      esSeleccionMultiple,
      palabraClave,
    ]);

  const productosAgrupados =
    useMemo(() => {
      const grupos = new Map<
        string,
        ProductoPiscinaMobile[]
      >();

      productosFiltrados.forEach(
        (producto) => {
          const clave =
            obtenerClaveSeleccion(
              producto
            );

          const grupo =
            grupos.get(clave) ||
            [];

          grupo.push(producto);
          grupos.set(clave, grupo);
        }
      );

      return Array.from(
        grupos.values()
      ).map(
        (presentaciones) => {
          const representante = {
            ...presentaciones[0],
          };

          representante.__PresentacionesPiscina =
            JSON.stringify(
              presentaciones
            );

          return representante;
        }
      );
    }, [productosFiltrados]);

  const mostrarPreparacion =
    camino === "guiado" &&
    problema === "agua_turbia";

  return (
    <div
      className={`space-y-4 transition-all duration-500 ${
        transicionando
          ? "translate-y-3 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <section className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cyan-100 text-cyan-700">
              <FlaskConical
                size={20}
                strokeWidth={2.5}
              />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">
                Paso 3
              </p>

              <h2 className="mt-1 text-[16px] font-black leading-tight text-blue-950">
                {esMantenimiento
                  ? "Mantenimiento completo"
                  : camino === "directo"
                    ? "Elegí tus productos"
                    : "Elegí un producto"}
              </h2>

              <p className="mt-1 text-[9px] font-medium leading-relaxed text-gray-500">
                {esMantenimiento
                  ? "Te mostramos qué necesita tu piscina y cada cuánto aplicarlo."
                  : camino ===
                      "directo"
                    ? "Revisá la guía y elegí todos los productos que necesitás."
                    : "Mostramos los productos compatibles con el problema."}
              </p>
            </div>
          </div>

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
      </section>

      {mostrarPreparacion && (
        <PreparacionTratamiento />
      )}

      {esSeleccionMultiple && (
        <section className="rounded-[20px] border border-cyan-200 bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/60 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cyan-600 text-white">
              <ClipboardList
                size={20}
                strokeWidth={2.5}
              />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">
                Guía de mantenimiento
              </p>

              <h3 className="mt-1 text-[15px] font-black leading-tight text-blue-950">
                Para{" "}
                {litrosPiscina.toLocaleString(
                  "es-AR",
                  {
                    maximumFractionDigits:
                      0,
                  }
                )}{" "}
                litros
              </h3>

              <p className="mt-1 text-[9px] font-semibold leading-relaxed text-gray-500">
                Las cantidades salen de los datos cargados en Google Sheets.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <ItemMantenimiento
              numero={1}
              titulo="Cloro"
              cantidad={calcularDosisMantenimiento(
                productosMantenimiento.cloro,
                litrosPiscina
              )}
              frecuencia="Uso diario"
              descripcion="Mantiene el agua desinfectada."
            />

            <ItemMantenimiento
              numero={2}
              titulo="Alguicida"
              cantidad={calcularDosisMantenimiento(
                productosMantenimiento.alguicida,
                litrosPiscina
              )}
              frecuencia="Una vez por semana"
              descripcion="Ayuda a prevenir algas."
            />

            <ItemMantenimiento
              numero={3}
              titulo="Clarificador"
              cantidad={calcularDosisMantenimiento(
                productosMantenimiento.clarificador,
                litrosPiscina
              )}
              frecuencia="Una vez por semana"
              descripcion="Ayuda a mantener el agua clara."
            />

            <ItemMantenimiento
              numero={4}
              titulo="Recirculación"
              cantidad={formatearRecirculacion(
                litrosPiscina
              )}
              frecuencia="Todos los días"
              descripcion="1 hora cada 10.000 litros."
            />
          </div>

          <div className="mt-3 rounded-[16px] border border-violet-200 bg-violet-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-violet-700">
              Control del pH
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <DatoPh
                titulo="< 7,2"
                texto="Usar pH+"
              />

              <DatoPh
                titulo="7,2 a 7,6"
                texto="Correcto"
              />

              <DatoPh
                titulo="> 7,6"
                texto="Usar pH-"
              />
            </div>

            <p className="mt-2.5 text-[8px] font-semibold leading-relaxed text-violet-900">
              Primero medí el pH. La cantidad de regulador depende del resultado.
            </p>
          </div>

          {!mostrarCatalogoMantenimiento && (
            <button
              type="button"
              onClick={abrirCatalogo}
              className="mt-4 flex h-13 w-full items-center justify-center gap-2.5 rounded-[16px] bg-emerald-600 px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(16,185,129,0.26)] transition active:scale-[0.98]"
            >
              Elegir productos

              <ArrowRight
                size={17}
                strokeWidth={2.7}
              />
            </button>
          )}
        </section>
      )}

      {(!esSeleccionMultiple ||
        mostrarCatalogoMantenimiento) && (
        <section
          ref={catalogoRef}
          className="scroll-mt-24 rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">
              {esSeleccionMultiple
                ? "Catálogo de piscina"
                : palabraClave ||
                  "Tratamiento"}
            </p>

            <h3 className="mt-1 text-[16px] font-black text-blue-950">
              Productos disponibles
            </h3>

            <p className="mt-1.5 text-[9px] font-semibold leading-relaxed text-gray-500">
              {esSeleccionMultiple
                ? "Podés elegir varios. Tocá otra vez una tarjeta para quitarla."
                : "Elegí una solución compatible. La dosis se calcula según los litros."}
            </p>
          </div>

          <a
            href="https://wa.me/5493765225808?text=%C2%A1Hola%21%20Tengo%20una%20duda%20con%20un%20producto%20de%20piscina."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] px-4 text-[11px] font-black text-white shadow-[0_8px_20px_rgba(37,211,102,0.22)] active:scale-[0.98]"
          >
            <MessageCircle
              size={17}
              strokeWidth={2.6}
            />

            Consultar por WhatsApp
          </a>

          {cargando ? (
            <div className="flex min-h-[160px] items-center justify-center gap-2.5 text-cyan-700">
              <LoaderCircle
                className="animate-spin"
                size={20}
              />

              <p className="text-[11px] font-black">
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
                  : `No encontramos productos para “${palabraClave}”.`
              }
            />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {productosAgrupados.map(
                (
                  producto,
                  indice
                ) => {
                  const activo =
                    esSeleccionMultiple
                      ? seleccionMantenimiento.some(
                          (
                            seleccionado
                          ) =>
                            obtenerClaveSeleccion(
                              seleccionado
                            ) ===
                            obtenerClaveSeleccion(
                              producto
                            )
                        )
                      : tratamiento !==
                          null &&
                        obtenerClaveSeleccion(
                          tratamiento
                        ) ===
                          obtenerClaveSeleccion(
                            producto
                          );

                  return (
                    <TarjetaProducto
                      key={obtenerIdProducto(
                        producto,
                        indice
                      )}
                      producto={producto}
                      activo={activo}
                      onClick={() => {
                        if (
                          esSeleccionMultiple
                        ) {
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

          {esSeleccionMultiple ? (
            seleccionMantenimiento.length >
              0 && (
              <div className="mt-4 rounded-[18px] border border-emerald-400 bg-emerald-50 p-3.5 ring-2 ring-emerald-400/10">
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <Check
                    size={16}
                    strokeWidth={2.8}
                  />

                  <p className="text-[9px] font-black uppercase tracking-[0.1em]">
                    Productos seleccionados
                  </p>
                </div>

                <p className="mt-2 text-center text-[11px] font-black text-blue-950">
                  {
                    seleccionMantenimiento.length
                  }{" "}
                  {seleccionMantenimiento.length ===
                  1
                    ? "producto"
                    : "productos"}
                </p>

                <p className="mt-1.5 text-center text-[8px] font-semibold text-gray-500">
                  La compra se confirma desde el resumen de la calculadora.
                </p>
              </div>
            )
          ) : (
            tratamiento !== null && (
              <div className="mt-4 rounded-[18px] border border-emerald-400 bg-gradient-to-br from-emerald-50 to-white p-3.5 ring-2 ring-emerald-400/10">
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <Check
                    size={16}
                    strokeWidth={2.8}
                  />

                  <p className="text-[9px] font-black uppercase tracking-[0.1em]">
                    Paso 3 completado
                  </p>
                </div>

                <p className="mt-2 text-center text-[11px] font-black text-blue-950">
                  {obtenerNombreTratamientoMobile(
                    tratamiento
                  )}
                </p>

                <button
                  type="button"
                  onClick={onContinuar}
                  className="mt-3 flex h-13 w-full items-center justify-center gap-2.5 rounded-[16px] bg-emerald-600 px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition active:scale-[0.98]"
                >
                  <ArrowRight
                    size={17}
                    strokeWidth={2.7}
                  />

                  Ir al Paso 4
                </button>
              </div>
            )
          )}
        </section>
      )}

      {problema ===
        "agua_turbia" && (
        <ExplicacionProductos />
      )}
    </div>
  );
}

function TarjetaProducto({
  producto,
  activo,
  onClick,
}: {
  producto: ProductoPiscinaMobile;
  activo: boolean;
  onClick: () => void;
}) {
  const marca =
    obtenerValor(
      producto,
      "Marca"
    );

  const nombre =
    obtenerValor(
      producto,
      "Nombre"
    ) ||
    "Producto para piscina";

  const linea =
    obtenerValor(
      producto,
      "Linea",
      "Línea"
    );

  const imagen =
    obtenerValor(
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
      className={`relative min-w-0 rounded-[15px] border-2 bg-white p-2 text-left transition active:scale-[0.98] ${
        activo
          ? "border-emerald-500 ring-2 ring-emerald-500/10"
          : "border-gray-100"
      }`}
    >
      <div className="relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-[12px] bg-gray-50 p-2">
        {marca && (
          <span className="absolute left-1.5 top-1.5 z-10 max-w-[76px] truncate rounded-full bg-white px-2 py-1 text-[7px] font-black text-gray-800 shadow-sm">
            {marca}
          </span>
        )}

        {tieneOferta &&
          descuento > 0 && (
            <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-red-600 px-2 py-1 text-[7px] font-black text-white">
              -{descuento}%
            </span>
          )}

        {activo && (
          <span className="absolute bottom-1.5 right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
            <Check
              size={13}
              strokeWidth={3}
            />
          </span>
        )}

        {imagen ? (
          <img
            src={imagen}
            alt={nombre}
            className="h-[88%] w-[88%] object-contain"
          />
        ) : (
          <PaintBucket
            size={42}
            className="mb-3 text-gray-300"
          />
        )}
      </div>

      <div className="mt-2">
        <p className="line-clamp-2 min-h-[24px] text-[10px] font-black leading-[1.15] text-slate-900">
          {nombre}
        </p>

        {linea && (
          <p className="mt-1 truncate text-[8px] font-semibold text-gray-500">
            {linea}
          </p>
        )}

        <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.08em] text-gray-400">
          Precio
        </p>

        {tieneOferta &&
          precio > 0 && (
            <p className="mt-0.5 text-[8px] font-bold text-red-500 line-through">
              {formatearPrecio(
                precio
              )}
            </p>
          )}

        <p className="mt-1 text-[13px] font-black leading-none text-blue-950">
          {precioFinal > 0
            ? formatearPrecio(
                precioFinal
              )
            : "Consultar"}
        </p>
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
    <div className="rounded-[16px] border border-cyan-100 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-cyan-600 text-[9px] font-black text-white">
          {numero}
        </span>

        <div className="min-w-0">
          <h4 className="text-[10px] font-black leading-tight text-blue-950">
            {titulo}
          </h4>

          <p className="mt-1 text-[12px] font-black leading-tight text-cyan-700">
            {cantidad}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[8px] font-black uppercase tracking-[0.05em] text-emerald-700">
        {frecuencia}
      </p>

      <p className="mt-1 text-[8px] font-semibold leading-relaxed text-gray-500">
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
    <div className="rounded-[11px] border border-violet-100 bg-white px-1.5 py-2 text-center">
      <p className="text-[8px] font-black text-blue-950">
        {titulo}
      </p>

      <p className="mt-1 text-[7px] font-black text-violet-700">
        {texto}
      </p>
    </div>
  );
}

function PreparacionTratamiento() {
  return (
    <section className="rounded-[20px] border border-amber-300 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-amber-100 text-amber-700">
          <ShieldCheck
            size={20}
            strokeWidth={2.5}
          />
        </span>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">
            Antes del tratamiento
          </p>

          <h3 className="mt-1 text-[14px] font-black text-blue-950">
            Prepará la piscina
          </h3>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Consejo
          icono={
            <Paintbrush
              size={15}
              strokeWidth={2.4}
            />
          }
          titulo="Modo de uso"
          texto="Seguí la indicación del producto."
        />

        <Consejo
          icono={
            <Droplets
              size={15}
              strokeWidth={2.4}
            />
          }
          titulo="Controlá pH"
          texto="Debe estar entre 7,2 y 7,6."
        />

        <Consejo
          icono={
            <Sparkles
              size={15}
              strokeWidth={2.4}
            />
          }
          titulo="Final del día"
          texto="Aplicá sin bañistas."
        />
      </div>
    </section>
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
    <div className="rounded-[13px] border border-amber-200 bg-white p-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-amber-100 text-amber-700">
        {icono}
      </span>

      <p className="mt-2 text-[8px] font-black leading-tight text-blue-950">
        {titulo}
      </p>

      <p className="mt-1 text-[7px] font-semibold leading-relaxed text-gray-500">
        {texto}
      </p>
    </div>
  );
}

function ExplicacionProductos() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="rounded-[16px] border border-cyan-200 bg-cyan-50 p-3">
        <div className="flex items-center gap-2">
          <Droplets
            size={17}
            className="text-cyan-700"
          />

          <h3 className="text-[9px] font-black text-blue-950">
            Clarificador
          </h3>
        </div>

        <p className="mt-2 text-[8px] font-semibold leading-relaxed text-gray-600">
          Da peso a las partículas para que bajen al fondo.
        </p>
      </div>

      <div className="rounded-[16px] border border-violet-200 bg-violet-50 p-3">
        <div className="flex items-center gap-2">
          <Layers3
            size={17}
            className="text-violet-700"
          />

          <h3 className="text-[9px] font-black text-blue-950">
            Floculante
          </h3>
        </div>

        <p className="mt-2 text-[8px] font-semibold leading-relaxed text-gray-600">
          Agrupa partículas pequeñas para facilitar su caída.
        </p>
      </div>
    </div>
  );
}

function AvisoError({
  texto,
}: {
  texto: string;
}) {
  return (
    <div className="mt-4 rounded-[16px] border border-amber-300 bg-amber-50 p-3.5">
      <div className="flex items-start gap-2.5">
        <CircleAlert
          size={18}
          className="mt-0.5 shrink-0 text-amber-700"
        />

        <p className="text-[9px] font-bold leading-relaxed text-amber-900">
          {texto}
        </p>
      </div>
    </div>
  );
}