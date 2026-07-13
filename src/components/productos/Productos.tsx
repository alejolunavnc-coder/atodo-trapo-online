import TarjetaProducto from "@/src/components/productos/TarjetaProducto";

type ProductosProps = {
  vista: string;
  marca: string;
  categoria: string;
  productosAgrupados: any[];
  tamanosSeleccionados: any;
  coloresSeleccionados: any;
  fraganciasSeleccionadas: any;
  setTamanosSeleccionados: any;
  setColoresSeleccionados: any;
  setFraganciasSeleccionadas: any;
  productoAbierto: number | null;
  setProductoAbierto: any;
  setGrupoDetalle: any;
  setDetalleAbierto: any;
  agregarAlCarrito: (producto: any) => void;
};

export default function Productos({
  vista,
  productosAgrupados,
  tamanosSeleccionados,
  coloresSeleccionados,
  fraganciasSeleccionadas,
  setTamanosSeleccionados,
  setColoresSeleccionados,
  setFraganciasSeleccionadas,
  productoAbierto,
  setProductoAbierto,
  setGrupoDetalle,
  setDetalleAbierto,
  agregarAlCarrito,
}: ProductosProps) {
  if (vista !== "productos") return null;

  return (
    <section id="productos" className="scroll-mt-32 pb-10">
      <div className="mb-7 flex items-center justify-between">
        <div />
      </div>

      <div className="columns-1 gap-4 md:columns-2">
        {productosAgrupados.map((grupo, index) => {
          const tieneFragancias = grupo.items.some((item: any) =>
            item.Fragancias?.trim()
          );

          const tieneColores = grupo.items.some((item: any) =>
            item.Color?.trim()
          );

          const opcionesTamanos = [
            ...new Set(
              grupo.items
                .map((item: any) => item.Tamaño?.trim())
                .filter(Boolean)
            ),
          ];

          const primerTamano =
  opcionesTamanos[0] || grupo.items[0]?.Tamaño || "";

const tamanioGuardado = tamanosSeleccionados[index];

const tamanioActual = opcionesTamanos.includes(tamanioGuardado)
  ? tamanioGuardado
  : primerTamano;

          const itemsDelTamano = grupo.items.filter(
            (item: any) =>
              !tamanioActual ||
              item.Tamaño?.trim() === String(tamanioActual).trim()
          );

          const opcionesFragancias = [
            ...new Set(
              itemsDelTamano
                .map((item: any) => item.Fragancias?.trim())
                .filter(Boolean)
            ),
          ];

          const opcionesColores = [
            ...new Set(
              itemsDelTamano
                .map((item: any) => item.Color?.trim())
                .filter(Boolean)
            ),
          ];

          const primeraFragancia =
            opcionesFragancias[0] || "";

          const primerColor =
            opcionesColores[0] || "";

          const fraganciaActual =
            fraganciasSeleccionadas[index] || primeraFragancia;

          const colorActual =
            coloresSeleccionados[index] || primerColor;

          const productoSeleccionado =
            grupo.items.find((item: any) => {
              const mismoTamano =
                !tamanioActual ||
                item.Tamaño?.trim() ===
                  String(tamanioActual).trim();

              if (!mismoTamano) return false;

              if (tieneFragancias) {
                return (
                  !fraganciaActual ||
                  item.Fragancias?.trim() ===
                    String(fraganciaActual).trim()
                );
              }

              if (tieneColores) {
                return (
                  !colorActual ||
                  item.Color?.trim() ===
                    String(colorActual).trim()
                );
              }

              return true;
            }) ||
            itemsDelTamano[0] ||
            grupo.items[0];

          const nombreTarjeta = grupo.nombre;
          const lineaTarjeta = grupo.linea;
          const placaTarjeta =
            grupo.items[0]?.Marca || "";

          const estaAbierto = productoAbierto === index;

          const tieneOpciones =
            opcionesTamanos.length > 0 ||
            opcionesFragancias.length > 0 ||
            opcionesColores.length > 0;

          const abrirProducto = () => {
            const primerItemTamano =
              grupo.items.find(
                (item: any) =>
                  item.Tamaño?.trim() ===
                  String(primerTamano).trim()
              ) || grupo.items[0];

            const colorInicial =
              grupo.items.find(
                (item: any) =>
                  item.Tamaño?.trim() ===
                    String(primerTamano).trim() &&
                  item.Color?.trim()
              )?.Color ||
              primerItemTamano?.Color ||
              "";

            const fraganciaInicial =
              grupo.items.find(
                (item: any) =>
                  item.Tamaño?.trim() ===
                    String(primerTamano).trim() &&
                  item.Fragancias?.trim()
              )?.Fragancias ||
              primerItemTamano?.Fragancias ||
              "";

            setTamanosSeleccionados((actual: any) => ({
              ...actual,
              [index]:
                actual[index] || primerTamano,
            }));

            if (tieneColores) {
              setColoresSeleccionados((actual: any) => ({
                ...actual,
                [index]:
                  actual[index] || colorInicial,
              }));
            }

            if (tieneFragancias) {
              setFraganciasSeleccionadas(
                (actual: any) => ({
                  ...actual,
                  [index]:
                    actual[index] || fraganciaInicial,
                })
              );
            }
          };

          return (
            <div
              key={index}
              className="group mb-4 w-full break-inside-avoid overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.14)]"
            >
              <div className="relative p-4">
                <div
                  onClick={(e) => {
                    const target =
                      e.target as HTMLElement;

                    if (
                      target.closest(
                        "[data-product-control]"
                      )
                    ) {
                      return;
                    }

                    if (window.innerWidth < 768) {
                      abrirProducto();

                      setGrupoDetalle({
                        grupo,
                        index,
                        producto:
                          productoSeleccionado,
                      });

                      setDetalleAbierto(true);
                    } else {
                      if (!estaAbierto) {
                        abrirProducto();
                        setProductoAbierto(index);
                      } else {
                        setProductoAbierto(null);
                      }
                    }
                  }}
                  className="relative z-10 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                >
                  <TarjetaProducto
                    nombre={nombreTarjeta}
                    linea={lineaTarjeta}
                    marca={placaTarjeta}
                    imagen={
                      productoSeleccionado?.Imagen
                    }
                    aromas={
                      productoSeleccionado?.Aromas
                    }
                    precio={
                      productoSeleccionado?.Precio
                    }
                    precioOferta={
                      productoSeleccionado?.[
                        "Precio oferta"
                      ]
                    }
                  />
                </div>

                <div
                  data-product-control
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  onMouseDown={(e) =>
                    e.stopPropagation()
                  }
                  onPointerDown={(e) =>
                    e.stopPropagation()
                  }
                  className={`relative z-30 hidden transition-all duration-500 ease-in-out md:block ${
                    estaAbierto
                      ? tieneOpciones
                        ? "mt-3 max-h-[260px] overflow-visible opacity-100"
                        : "mt-2 max-h-[70px] overflow-visible opacity-100"
                      : "max-h-0 overflow-hidden opacity-0"
                  }`}
                >
                  {tieneOpciones && (
                    <div
                      data-product-control
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                      onMouseDown={(e) =>
                        e.stopPropagation()
                      }
                      onPointerDown={(e) =>
                        e.stopPropagation()
                      }
                      className="relative z-40 -mt-10 ml-[145px] pr-2"
                    >
                      {opcionesTamanos.length >
                        0 && (
                        <div
                          data-product-control
                          className="grid grid-cols-[72px_1fr] items-center gap-2"
                        >
                          <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                            Tamaño
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {opcionesTamanos.map(
                              (tam, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  data-product-control
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const primerColorDisponible =
                                      grupo.items.find(
                                        (
                                          item: any
                                        ) =>
                                          item.Tamaño?.trim() ===
                                            String(
                                              tam
                                            ).trim() &&
                                          item.Color?.trim()
                                      )?.Color || "";

                                    const primeraFraganciaDisponible =
                                      grupo.items.find(
                                        (
                                          item: any
                                        ) =>
                                          item.Tamaño?.trim() ===
                                            String(
                                              tam
                                            ).trim() &&
                                          item.Fragancias?.trim()
                                      )
                                        ?.Fragancias ||
                                      "";

                                    setTamanosSeleccionados(
                                      (
                                        actual: any
                                      ) => ({
                                        ...actual,
                                        [index]: tam,
                                      })
                                    );

                                    setColoresSeleccionados(
                                      (
                                        actual: any
                                      ) => ({
                                        ...actual,
                                        [index]:
                                          primerColorDisponible,
                                      })
                                    );

                                    setFraganciasSeleccionadas(
                                      (
                                        actual: any
                                      ) => ({
                                        ...actual,
                                        [index]:
                                          primeraFraganciaDisponible,
                                      })
                                    );
                                  }}
                                  className={
                                    String(
                                      tamanioActual
                                    ).trim() ===
                                    String(tam).trim()
                                      ? "h-6 rounded-lg bg-blue-950 px-2.5 text-[11px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                                      : "h-6 rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-blue-950 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-blue-300"
                                  }
                                >
                                  {String(tam)}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-1.5">
                        {tieneFragancias &&
                        opcionesFragancias.length >
                          0 ? (
                          <div
                            data-product-control
                            className="grid grid-cols-[72px_1fr] items-center gap-2"
                          >
                            <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                              Fragancia
                            </p>

                            <select
                              data-product-control
                              value={
                                fraganciaActual
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              onMouseDown={(e) =>
                                e.stopPropagation()
                              }
                              onPointerDown={(e) =>
                                e.stopPropagation()
                              }
                              onChange={(e) =>
                                setFraganciasSeleccionadas(
                                  (
                                    actual: any
                                  ) => ({
                                    ...actual,
                                    [index]:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              className="h-7 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesFragancias.map(
                                (
                                  fragancia,
                                  i
                                ) => (
                                  <option
                                    key={i}
                                    value={String(
                                      fragancia
                                    )}
                                  >
                                    {String(
                                      fragancia
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        ) : tieneColores &&
                          opcionesColores.length >
                            0 ? (
                          <div
                            data-product-control
                            className="grid grid-cols-[72px_1fr] items-center gap-2"
                          >
                            <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                              Color
                            </p>

                            <select
                              data-product-control
                              value={colorActual}
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              onMouseDown={(e) =>
                                e.stopPropagation()
                              }
                              onPointerDown={(e) =>
                                e.stopPropagation()
                              }
                              onChange={(e) =>
                                setColoresSeleccionados(
                                  (
                                    actual: any
                                  ) => ({
                                    ...actual,
                                    [index]:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              className="h-7 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesColores.map(
                                (color, i) => (
                                  <option
                                    key={i}
                                    value={String(
                                      color
                                    )}
                                  >
                                    {String(
                                      color
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    data-product-control
                    onClick={(e) => {
                      e.stopPropagation();

                      agregarAlCarrito(
                        productoSeleccionado
                      );
                    }}
                    className={`h-10 w-full rounded-xl bg-yellow-400 text-[14px] font-extrabold text-blue-950 shadow-sm transition-all duration-200 hover:bg-yellow-500 hover:shadow-md ${
                      tieneOpciones
                        ? "mt-4"
                        : "mt-2"
                    }`}
                  >
                    🛒 Agregar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}