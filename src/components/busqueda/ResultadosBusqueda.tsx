import TarjetaProducto from "@/src/components/productos/TarjetaProducto";

type ResultadosBusquedaProps = {
  busqueda: string;
  resultadosBusquedaRef: React.RefObject<HTMLDivElement | null>;
  productosBuscados: any[];
  productoBusquedaAbierto: number | null;
  setProductoBusquedaAbierto: React.Dispatch<React.SetStateAction<number | null>>;
  tamanosSeleccionados: any;
  coloresSeleccionados: any;
  fraganciasSeleccionadas: any;
  setTamanosSeleccionados: any;
  setColoresSeleccionados: any;
  setFraganciasSeleccionadas: any;
  agregarAlCarrito: (producto: any) => void;
};

export default function ResultadosBusqueda({
  busqueda,
  resultadosBusquedaRef,
  productosBuscados,
  productoBusquedaAbierto,
  setProductoBusquedaAbierto,
  tamanosSeleccionados,
  coloresSeleccionados,
  fraganciasSeleccionadas,
  setTamanosSeleccionados,
  setColoresSeleccionados,
  setFraganciasSeleccionadas,
  agregarAlCarrito,
}: ResultadosBusquedaProps) {
  if (busqueda === "") return null;

  return (
    <div
      ref={resultadosBusquedaRef}
      className="bg-white p-6 mt-8 rounded-2xl shadow max-h-[800px] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold text-blue-950 mb-2">
        Resultados de búsqueda
      </h2>

      <p className="text-gray-500 mb-6">
        {productosBuscados.length} productos encontrados
      </p>

      <div className="columns-1 md:columns-2 gap-4">
        {productosBuscados.map((grupo, index) => {
          const keyBusqueda = "busqueda" + index;

          const productoSeleccionado =
            grupo.items.find((item: any) => {
              if (grupo.items.some((i: any) => i.Color?.trim())) {
                return (
                  item.Tamaño ===
                    (tamanosSeleccionados[keyBusqueda] ||
                      grupo.items[0].Tamaño) &&
                  item.Color ===
                    (coloresSeleccionados[keyBusqueda] || grupo.items[0].Color)
                );
              }

              if (grupo.items.some((i: any) => i.Fragancias?.trim())) {
                return (
                  item.Tamaño ===
                    (tamanosSeleccionados[keyBusqueda] ||
                      grupo.items[0].Tamaño) &&
                  item.Fragancias ===
                    (fraganciasSeleccionadas[keyBusqueda] ||
                      grupo.items[0].Fragancias)
                );
              }

              return (
                item.Tamaño ===
                (tamanosSeleccionados[keyBusqueda] || grupo.items[0].Tamaño)
              );
            }) || grupo.items[0];

          const nombreTarjeta = grupo.nombre;
          const lineaTarjeta = grupo.linea;
          const placaTarjeta = grupo.marca || productoSeleccionado?.Marca || "";
          const estaAbierto = productoBusquedaAbierto === index;

          const tieneFragancias = grupo.items.some((i: any) =>
            i.Fragancias?.trim()
          );

          const opcionesTamanos = [
            ...new Set(grupo.items.map((item: any) => item.Tamaño)),
          ].filter(Boolean);

          const tamanioActual =
            tamanosSeleccionados[keyBusqueda] || grupo.items[0].Tamaño;

          const opcionesFragancias = [
            ...new Set(
              grupo.items
                .filter((item: any) => item.Tamaño === tamanioActual)
                .map((item: any) => item.Fragancias)
                .filter(Boolean)
            ),
          ];

          const opcionesColores = [
            ...new Set(
              grupo.items
                .filter((item: any) => item.Tamaño === tamanioActual)
                .map((item: any) => item.Color)
                .filter(Boolean)
            ),
          ];

          const tieneOpciones =
            opcionesTamanos.length > 0 ||
            opcionesFragancias.length > 0 ||
            opcionesColores.length > 0;

          return (
            <div
              key={index}
              className="group break-inside-avoid mb-4 w-full bg-white border border-gray-200 rounded-[22px] shadow-sm hover:shadow-[0_16px_38px_rgba(15,23,42,0.14)] transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 relative">
                <div
                  onClick={(e) => {
                    const target = e.target as HTMLElement;

                    if (target.closest("[data-product-control]")) {
                      return;
                    }

                    setProductoBusquedaAbierto(estaAbierto ? null : index);
                  }}
                  className="relative z-10 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                >
                  <TarjetaProducto
  nombre={nombreTarjeta}
  linea={lineaTarjeta}
  marca={placaTarjeta}
  imagen={productoSeleccionado?.Imagen}
  aromas={productoSeleccionado?.Aromas}
  precio={productoSeleccionado?.Precio}
  precioOferta={productoSeleccionado?.["Precio oferta"]}
/>
                </div>

                <div
                  data-product-control
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`relative z-30 hidden md:block transition-all duration-500 ease-in-out ${
                    estaAbierto
                      ? tieneOpciones
                        ? "max-h-[260px] opacity-100 mt-3 overflow-visible"
                        : "max-h-[70px] opacity-100 mt-2 overflow-visible"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {tieneOpciones && (
                    <div
                      data-product-control
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="relative z-40 ml-[145px] pr-2 -mt-10"
                    >
                      {opcionesTamanos.length > 0 && (
                        <div
                          data-product-control
                          className="grid grid-cols-[72px_1fr] items-center gap-2"
                        >
                          <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                            Tamaño
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {opcionesTamanos.map((tam, i) => (
                              <button
                                key={i}
                                type="button"
                                data-product-control
                                onClick={(e) => {
                                  e.stopPropagation();

                                  const primerColorDisponible = grupo.items.find(
                                    (item: any) => item.Tamaño === tam
                                  )?.Color;

                                  const primeraFraganciaDisponible =
                                    grupo.items.find(
                                      (item: any) => item.Tamaño === tam
                                    )?.Fragancias;

                                  setTamanosSeleccionados({
                                    ...tamanosSeleccionados,
                                    [keyBusqueda]: tam,
                                  });

                                  setColoresSeleccionados({
                                    ...coloresSeleccionados,
                                    [keyBusqueda]: primerColorDisponible,
                                  });

                                  setFraganciasSeleccionadas({
                                    ...fraganciasSeleccionadas,
                                    [keyBusqueda]: primeraFraganciaDisponible,
                                  });
                                }}
                                className={
                                  tamanioActual === tam
                                    ? "h-6 px-2.5 rounded-lg bg-blue-950 text-white text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                                    : "h-6 px-2.5 rounded-lg bg-white border border-gray-200 text-blue-950 text-[11px] font-semibold hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                                }
                              >
                                {String(tam)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-1.5">
                        {tieneFragancias && opcionesFragancias.length > 0 ? (
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
                                fraganciasSeleccionadas[keyBusqueda] ||
                                productoSeleccionado?.Fragancias ||
                                ""
                              }
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setFraganciasSeleccionadas({
                                  ...fraganciasSeleccionadas,
                                  [keyBusqueda]: e.target.value,
                                })
                              }
                              className="w-full h-7 bg-white border border-gray-200 rounded-lg px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesFragancias.map((fragancia, i) => (
                                <option key={i} value={String(fragancia)}>
                                  {String(fragancia)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : opcionesColores.length > 0 ? (
                          <div
                            data-product-control
                            className="grid grid-cols-[72px_1fr] items-center gap-2"
                          >
                            <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                              Color
                            </p>

                            <select
                              data-product-control
                              value={
                                coloresSeleccionados[keyBusqueda] ||
                                productoSeleccionado?.Color ||
                                ""
                              }
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setColoresSeleccionados({
                                  ...coloresSeleccionados,
                                  [keyBusqueda]: e.target.value,
                                })
                              }
                              className="w-full h-7 bg-white border border-gray-200 rounded-lg px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesColores.map((color, i) => (
                                <option key={i} value={String(color)}>
                                  {String(color)}
                                </option>
                              ))}
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
                      agregarAlCarrito(productoSeleccionado);
                    }}
                    className={`w-full h-10 bg-yellow-400 hover:bg-yellow-500 text-blue-950 text-[14px] font-extrabold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                      tieneOpciones ? "mt-4" : "mt-2"
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
    </div>
  );
}