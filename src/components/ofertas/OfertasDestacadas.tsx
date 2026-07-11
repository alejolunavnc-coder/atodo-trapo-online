import { useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { contactoConfig } from "@/src/config/contacto";

type Props = {
  ofertasRef: React.RefObject<HTMLElement | null>;
  ofertasAgrupadas: any[];
  tamanosSeleccionados: any;
  coloresSeleccionados: any;
  fraganciasSeleccionadas: any;
  setTamanosSeleccionados: any;
  setColoresSeleccionados: any;
  setFraganciasSeleccionadas: any;
  agregarAlCarrito: (producto: any) => void;
};

export default function OfertasDestacadas({
  ofertasRef,
  ofertasAgrupadas,
  tamanosSeleccionados,
  coloresSeleccionados,
  fraganciasSeleccionadas,
  setTamanosSeleccionados,
  setColoresSeleccionados,
  setFraganciasSeleccionadas,
  agregarAlCarrito,
}: Props) {
  const carruselRef = useRef<HTMLDivElement>(null);
  const reposicionandoRef = useRef(false);

  const ofertasCarrusel =
    ofertasAgrupadas.length > 0
      ? [
          ...ofertasAgrupadas,
          ...ofertasAgrupadas,
          ...ofertasAgrupadas,
        ]
      : [];

  const anchoTarjeta = 190;
  const espacioEntreTarjetas = 16;
  const pasoTarjeta = anchoTarjeta + espacioEntreTarjetas;

  useEffect(() => {
    const carrusel = carruselRef.current;

    if (!carrusel || ofertasAgrupadas.length === 0) return;

    const anchoBloque =
      ofertasAgrupadas.length * pasoTarjeta;

    const colocarEnBloqueCentral = () => {
      carrusel.scrollLeft = anchoBloque;
    };

    const frame = requestAnimationFrame(colocarEnBloqueCentral);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [ofertasAgrupadas.length]);

  const mantenerCarruselInfinito = () => {
    const carrusel = carruselRef.current;

    if (
      !carrusel ||
      ofertasAgrupadas.length === 0 ||
      reposicionandoRef.current
    ) {
      return;
    }

    const anchoBloque =
      ofertasAgrupadas.length * pasoTarjeta;

    if (carrusel.scrollLeft < anchoBloque * 0.5) {
      reposicionandoRef.current = true;
      carrusel.scrollLeft += anchoBloque;

      requestAnimationFrame(() => {
        reposicionandoRef.current = false;
      });

      return;
    }

    if (carrusel.scrollLeft > anchoBloque * 1.5) {
      reposicionandoRef.current = true;
      carrusel.scrollLeft -= anchoBloque;

      requestAnimationFrame(() => {
        reposicionandoRef.current = false;
      });
    }
  };

  const moverCarrusel = (
    direccion: "izquierda" | "derecha"
  ) => {
    carruselRef.current?.scrollBy({
      left:
        direccion === "derecha"
          ? pasoTarjeta * 2
          : -pasoTarjeta * 2,
      behavior: "smooth",
    });
  };

  const precioNumero = (valor: any) =>
    Number(
      String(valor || "")
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;

  return (
    <section
      ref={ofertasRef}
      className="mt-8 hidden scroll-mt-28 pb-10 md:block"
    >
      <div className="rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm">
        {/* [Título ofertas] */}

        <div className="mb-5 flex items-center gap-5">
          <h2 className="text-[30px] font-bold leading-none text-blue-950">
            Ofertas destacadas
          </h2>

          <button className="rounded-xl bg-orange-50 px-4 py-2 text-[14px] font-semibold text-red-600 transition hover:bg-orange-100">
            🔥 Ver todas las ofertas
          </button>
        </div>

        {/* [Contenido ofertas + WhatsApp] */}

        <div className="grid grid-cols-[1fr_300px] gap-7">
          {/* [Carrusel de ofertas] */}

          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => moverCarrusel("izquierda")}
              aria-label="Ver ofertas anteriores"
              className="absolute -left-7 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[27px] font-bold text-white shadow-xl transition hover:scale-105 hover:bg-neutral-800 active:scale-95"
            >
              ‹
            </button>

            <div
              ref={carruselRef}
              onScroll={mantenerCarruselInfinito}
              className="overflow-x-auto scroll-smooth px-12 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex w-max gap-4">
                {ofertasCarrusel.map((grupo, indexCarrusel) => {
                  const indexReal =
                    indexCarrusel % ofertasAgrupadas.length;

                  const claveOferta = `oferta${indexReal}`;

                  const productoSeleccionado =
                    grupo.items.find((item: any) => {
                      const tamanoElegido =
                        tamanosSeleccionados[claveOferta] ||
                        grupo.items[0]?.Tamaño;

                      if (
                        grupo.items.some((i: any) =>
                          i.Color?.trim()
                        )
                      ) {
                        const colorDisponible =
                          coloresSeleccionados[claveOferta] ||
                          grupo.items.find(
                            (i: any) =>
                              i.Tamaño === tamanoElegido
                          )?.Color;

                        return (
                          item.Tamaño === tamanoElegido &&
                          item.Color === colorDisponible
                        );
                      }

                      if (
                        grupo.items.some((i: any) =>
                          i.Fragancias?.trim()
                        )
                      ) {
                        const fraganciaDisponible =
                          fraganciasSeleccionadas[claveOferta] ||
                          grupo.items.find(
                            (i: any) =>
                              i.Tamaño === tamanoElegido
                          )?.Fragancias;

                        return (
                          item.Tamaño === tamanoElegido &&
                          item.Fragancias ===
                            fraganciaDisponible
                        );
                      }

                      return item.Tamaño === tamanoElegido;
                    }) || grupo.items[0];

                  if (!productoSeleccionado) return null;

                  const precio = precioNumero(
                    productoSeleccionado.Precio
                  );

                  const precioOferta = precioNumero(
                    productoSeleccionado["Precio oferta"]
                  );

                  const descuento =
                    precio > 0 && precioOferta > 0
                      ? Math.round(
                          ((precio - precioOferta) / precio) *
                            100
                        )
                      : 0;

                  const ahorro =
                    precio > 0 && precioOferta > 0
                      ? precio - precioOferta
                      : 0;

                  const tamanioActual =
                    tamanosSeleccionados[claveOferta] ||
                    grupo.items[0]?.Tamaño;

                  const opcionesTamanos = [
                    ...new Set(
                      grupo.items.map(
                        (item: any) => item.Tamaño
                      )
                    ),
                  ].filter(Boolean);

                  const opcionesFragancias = [
                    ...new Set(
                      grupo.items
                        .filter(
                          (item: any) =>
                            item.Tamaño === tamanioActual
                        )
                        .map(
                          (item: any) => item.Fragancias
                        )
                        .filter(Boolean)
                    ),
                  ];

                  const opcionesColores = [
                    ...new Set(
                      grupo.items
                        .filter(
                          (item: any) =>
                            item.Tamaño === tamanioActual
                        )
                        .map((item: any) => item.Color)
                        .filter(Boolean)
                    ),
                  ];

                  const tieneFragancias = grupo.items.some(
                    (item: any) =>
                      item.Fragancias?.trim()
                  );

                  const marca =
                    productoSeleccionado.Marca ||
                    grupo.marca ||
                    "";

                  const linea =
                    productoSeleccionado.Linea ||
                    grupo.linea ||
                    "";

                  return (
                    <div
                      key={`${grupo.nombre}-${indexCarrusel}`}
                      className="relative w-[190px] shrink-0 rounded-[18px] border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* [Chapas superiores] */}

                      {descuento > 0 && (
                        <span className="absolute left-3 top-3 z-10 rounded-md bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-blue-950">
                          -{descuento}%
                        </span>
                      )}

                      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                        {marca && (
                          <span className="max-w-[82px] truncate rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[9px] font-bold text-blue-950 shadow-sm">
                            {marca}
                          </span>
                        )}

                        {descuento > 0 && (
                          <span className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">
                            OFERTA
                          </span>
                        )}
                      </div>

                      {/* [Imagen] */}

                      <div className="mb-2 mt-5 flex h-[112px] items-center justify-center">
                        {productoSeleccionado.Imagen?.trim() && (
                          <img
                            src={productoSeleccionado.Imagen.trim()}
                            alt={grupo.nombre}
                            className="max-h-[108px] max-w-full object-contain"
                          />
                        )}
                      </div>

                      {/* [Nombre y línea] */}

                      <div>
                        <h3 className="line-clamp-2 min-h-[24px] text-[15px] font-bold leading-[1.05] text-blue-950">
                          {grupo.nombre}
                        </h3>

                        {linea && (
                          <p className="-mt-0.5 line-clamp-1 text-[12px] font-medium leading-none text-slate-500">
                            {linea}
                          </p>
                        )}
                      </div>

                      {/* [Precios] */}

                      <div className="mt-3">
                        {precio > 0 && precioOferta > 0 && (
                          <p className="text-[12px] leading-none text-red-600 line-through">
                            $
                            {precio.toLocaleString("es-AR")}
                          </p>
                        )}

                        <p className="mt-1 text-[21px] font-bold leading-tight text-blue-950">
                          $
                          {(precioOferta > 0
                            ? precioOferta
                            : precio
                          ).toLocaleString("es-AR")}
                        </p>

                        {ahorro > 0 && (
                          <p className="text-[12px] font-semibold leading-tight text-green-600">
                            Ahorrás $
                            {ahorro.toLocaleString("es-AR")}
                          </p>
                        )}
                      </div>

                      {/* [Tamaños] */}

                      {opcionesTamanos.length > 0 && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <p className="mb-1.5 text-[11px] font-semibold text-blue-950">
                            Tamaño
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {opcionesTamanos.map((tam, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  const primerColorDisponible =
                                    grupo.items.find(
                                      (item: any) =>
                                        item.Tamaño === tam &&
                                        item.Color?.trim()
                                    )?.Color || "";

                                  const primeraFraganciaDisponible =
                                    grupo.items.find(
                                      (item: any) =>
                                        item.Tamaño === tam &&
                                        item.Fragancias?.trim()
                                    )?.Fragancias || "";

                                  setTamanosSeleccionados({
                                    ...tamanosSeleccionados,
                                    [claveOferta]: tam,
                                  });

                                  setColoresSeleccionados({
                                    ...coloresSeleccionados,
                                    [claveOferta]:
                                      primerColorDisponible,
                                  });

                                  setFraganciasSeleccionadas({
                                    ...fraganciasSeleccionadas,
                                    [claveOferta]:
                                      primeraFraganciaDisponible,
                                  });
                                }}
                                className={
                                  tamanioActual === tam
                                    ? "h-7 rounded-md bg-blue-950 px-2 text-[11px] font-semibold text-white"
                                    : "h-7 rounded-md border border-gray-200 bg-white px-2 text-[11px] font-medium text-blue-950 hover:border-blue-300"
                                }
                              >
                                {String(tam)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* [Fragancia o color] */}

                      <div className="mt-3">
                        {tieneFragancias &&
                        opcionesFragancias.length > 0 ? (
                          <>
                            <p className="mb-1.5 text-[11px] font-semibold text-blue-950">
                              Fragancia
                            </p>

                            <select
                              value={
                                fraganciasSeleccionadas[
                                  claveOferta
                                ] ||
                                productoSeleccionado.Fragancias ||
                                ""
                              }
                              onChange={(e) =>
                                setFraganciasSeleccionadas({
                                  ...fraganciasSeleccionadas,
                                  [claveOferta]:
                                    e.target.value,
                                })
                              }
                              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesFragancias.map(
                                (fragancia, i) => (
                                  <option
                                    key={i}
                                    value={String(fragancia)}
                                  >
                                    {String(fragancia)}
                                  </option>
                                )
                              )}
                            </select>
                          </>
                        ) : opcionesColores.length > 0 ? (
                          <>
                            <p className="mb-1.5 text-[11px] font-semibold text-blue-950">
                              Color
                            </p>

                            <select
                              value={
                                coloresSeleccionados[
                                  claveOferta
                                ] ||
                                productoSeleccionado.Color ||
                                ""
                              }
                              onChange={(e) =>
                                setColoresSeleccionados({
                                  ...coloresSeleccionados,
                                  [claveOferta]:
                                    e.target.value,
                                })
                              }
                              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesColores.map(
                                (color, i) => (
                                  <option
                                    key={i}
                                    value={String(color)}
                                  >
                                    {String(color)}
                                  </option>
                                )
                              )}
                            </select>
                          </>
                        ) : null}
                      </div>

                      {/* [Agregar] */}

                      <button
                        type="button"
                        onClick={() =>
                          agregarAlCarrito(
                            productoSeleccionado
                          )
                        }
                        className="mt-4 h-9 w-full whitespace-nowrap rounded-lg bg-yellow-400 text-[12px] font-bold text-blue-950 transition hover:bg-yellow-500"
                      >
                        🛒 Agregar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
  type="button"
  onClick={() => moverCarrusel("derecha")}
  aria-label="Ver más ofertas"
  className="absolute -right-7 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[27px] font-bold text-white shadow-xl transition hover:scale-105 hover:bg-neutral-800 active:scale-95"
>
  ›
</button>
            
          </div>

          {/* [Bloque WhatsApp] */}

          <div className="relative flex min-h-[500px] flex-col justify-between overflow-hidden rounded-[24px] bg-blue-950 p-8">
            <div className="relative z-10">
              <h3 className="text-[26px] font-bold leading-tight text-white">
                ¿Tenés dudas?
              </h3>

              <p className="mt-3 text-[17px] font-bold text-yellow-400">
                Escribinos por WhatsApp
              </p>

              <p className="mt-6 text-[15px] leading-relaxed text-white/90">
                Te respondemos para consultar stock, precios o
                disponibilidad.
              </p>

              <a
                href={`https://wa.me/${
                  contactoConfig.whatsapp
                }?text=${encodeURIComponent(
                  "¡Hola! 👋 Tengo una consulta sobre las ofertas publicadas."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-[16px] font-bold text-white shadow-sm transition hover:bg-green-600"
              >
                <FaWhatsapp size={21} />
                Ir a WhatsApp
              </a>
            </div>

            <div className="absolute bottom-10 right-8 text-[120px] opacity-10">
              💬
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-20 rounded-t-[50%] bg-blue-900/50" />
          </div>
        </div>
      </div>
    </section>
  );
}