"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Droplets,
  FlaskConical,
  Layers3,
  LoaderCircle,
  PaintBucket,
  Paintbrush,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Papa from "papaparse";
import {
  useEffect,
  useMemo,
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
  onCambiarTratamiento: (
    tratamiento: ProductoPiscina
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

export default function Paso3TratamientoPiscina({
  transicionando,
  camino,
  problema,
  litrosPiscina,
  tratamiento,
  onCambiarTratamiento,
  onVolver,
  onContinuar,
}: Paso3TratamientoPiscinaProps) {
  const [productos, setProductos] =
    useState<ProductoPiscina[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

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

  const palabraClave =
    problema !== null
      ? PALABRAS_CLAVE[problema]
      : "";

  const productosFiltrados =
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

          if (!esPiscina || oculto) {
            return false;
          }

          if (camino === "directo") {
            return true;
          }

          if (!palabraClave) {
            return false;
          }

          const usos =
            separarPalabrasClave(
              obtenerValor(
                producto,
                "Uso piscina"
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
      productos,
      camino,
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
                Elegí un producto
              </h2>

              <p className="mt-1 text-[13px] font-medium text-gray-500">
                Mostramos los productos de Google Sheets que coinciden con el uso seleccionado.
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

      <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">
              {camino === "directo"
                ? "Productos para piscina"
                : palabraClave || "Tratamiento"}
            </p>

            <h3 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-blue-950">
              Productos disponibles
            </h3>

            <p className="mt-2 max-w-[680px] text-[12px] font-semibold leading-relaxed text-gray-500">
              Elegí el producto que preferís. La dosis se calcula automáticamente según los litros de tu piscina y los datos cargados en Google Sheets.
            </p>
          </div>

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
                    activo={
                      tratamiento !== null &&
                      obtenerClaveSeleccion(
                        tratamiento
                      ) ===
                        obtenerClaveSeleccion(
                          producto
                        )
                    }
                    onClick={() =>
                      onCambiarTratamiento(
                        producto
                      )
                    }
                  />
                );
              }
            )}
          </div>
        )}

        {tratamiento !== null && (
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
        )}
      </div>

      {problema === "agua_turbia" && (
        <ExplicacionProductos />
      )}
    </section>
  );
}

function TarjetaProducto({
  producto,
  litrosPiscina: _litrosPiscina,
  activo,
  onClick,
}: {
  producto: ProductoPiscina;
  litrosPiscina: number;
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
              titulo="Cepillá"
              texto="Cepillá las paredes y el piso antes de aplicar el producto."
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