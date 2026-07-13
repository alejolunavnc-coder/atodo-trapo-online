type DetalleProductoProps = {
  detalleAbierto: boolean;
  grupoDetalle: any;
  productoDetalle: any;

  setDetalleAbierto: any;
  panelDetalleRef: any;

  mostrarCarrito: boolean;
  setMostrarCarrito: any;
  carritoAnimado: boolean;

  carrito: any[];
  eliminarDelCarrito: (index: number) => void;
  vaciarCarrito: () => void;
  agregarAlCarrito: (producto: any) => void;

  tamanosSeleccionados: any;
  coloresSeleccionados: any;
  fraganciasSeleccionadas: any;
  setTamanosSeleccionados: any;
  setColoresSeleccionados: any;
  setFraganciasSeleccionadas: any;
};

function precioNumero(valor: any) {
  return (
    Number(
      String(valor || "")
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0
  );
}

function productoEnOferta(producto: any) {
  const precio = precioNumero(producto?.Precio);

  const precioOferta = precioNumero(
    producto?.["Precio oferta"]
  );

  return (
    precioOferta > 0 &&
    precio > 0 &&
    precioOferta < precio
  );
}

export default function DetalleProducto({
  detalleAbierto,
  grupoDetalle,
  productoDetalle,
  setDetalleAbierto,
  panelDetalleRef,
  mostrarCarrito,
  setMostrarCarrito,
  carritoAnimado,
  carrito,
  eliminarDelCarrito,
  vaciarCarrito,
  agregarAlCarrito,
  tamanosSeleccionados,
  coloresSeleccionados,
  fraganciasSeleccionadas,
  setTamanosSeleccionados,
  setColoresSeleccionados,
  setFraganciasSeleccionadas,
}: DetalleProductoProps) {
  if (!detalleAbierto || !grupoDetalle) {
    return null;
  }

  const precio = precioNumero(
    productoDetalle?.Precio
  );

  const precioOferta = precioNumero(
    productoDetalle?.["Precio oferta"]
  );

  const tieneOferta =
    productoEnOferta(productoDetalle);

  const descuento =
    tieneOferta && precio > 0
      ? Math.round(
          ((precio - precioOferta) / precio) * 100
        )
      : 0;

  const ahorro =
    tieneOferta
      ? precio - precioOferta
      : 0;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        onClick={() => setDetalleAbierto(false)}
        className="absolute inset-0 bg-black/40"
      />

      <div className="absolute bottom-0 left-0 right-0 z-[60]">
        <div className="absolute -top-8 right-5 z-[80]">
          {/* [Carrito dentro del modal] */}

          {mostrarCarrito && (
            <div className="absolute bottom-0 right-[72px] max-h-80 w-52 overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
              <h3 className="mb-2 text-lg font-bold text-black">
                🛒 Carrito
              </h3>

              <p className="mb-3 text-sm text-gray-500">
                {carrito.length} productos
              </p>

              <div className="text-left text-black">
                {carrito.map(
                  (producto, index) => (
                    <div
                      key={index}
                      className="mb-2 flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="text-[10px] leading-tight text-black">
                          {producto.nombre}
                        </p>

                        <p className="text-sm font-bold text-green-700">
                          $
                          {(
                            producto.precio *
                            (producto.cantidad || 1)
                          ).toLocaleString(
                            "es-AR"
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          eliminarDelCarrito(
                            index
                          )
                        }
                        className="rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}

                <p className="mt-3 text-lg font-bold text-black">
                  Total: $
                  {carrito
                    .reduce(
                      (
                        total,
                        producto
                      ) =>
                        total +
                        producto.precio *
                          (producto.cantidad ||
                            1),
                      0
                    )
                    .toLocaleString(
                      "es-AR"
                    )}
                </p>

                <button
                  onClick={vaciarCarrito}
                  className="mt-3 w-full rounded-xl bg-red-500 px-3 py-2 text-sm text-white"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() =>
              setMostrarCarrito(
                !mostrarCarrito
              )
            }
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-2xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:from-teal-700 hover:to-teal-900 ${
              carritoAnimado
                ? "scale-125"
                : "scale-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386a1.5 1.5 0 011.464 1.175L5.383 6m0 0h13.867l-1.313 6.126a1.5 1.5 0 01-1.466 1.174H7.189a1.5 1.5 0 01-1.466-1.174L5.383 6zm2.367 11.25a.75.75 0 100 1.5.75.75 0 000-1.5zm9 0a.75.75 0 100 1.5.75.75 0 000-1.5z"
              />
            </svg>

            <span className="absolute -right-1 -top-1 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-lg">
              {carrito.reduce(
                (total, producto) =>
                  total +
                  (producto.cantidad ||
                    1),
                0
              )}
            </span>
          </button>
        </div>

        <div
          ref={panelDetalleRef}
          className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl"
        >
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gray-300" />

          <button
            onClick={() =>
              setDetalleAbierto(false)
            }
            className="absolute right-4 top-4 text-2xl text-gray-500"
          >
            ×
          </button>

          <div className="flex items-start gap-2">
            <div className="relative flex w-28 shrink-0 justify-center">
              {tieneOferta &&
                descuento > 0 && (
                  <div className="absolute left-0 top-0 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                    -{descuento}%
                  </div>
                )}

              {grupoDetalle.producto
                ?.Imagen?.trim() && (
                <img
                  src={grupoDetalle.producto.Imagen.trim()}
                  alt={
                    grupoDetalle.grupo
                      .nombre
                  }
                  className="h-28 w-28 object-contain"
                />
              )}
            </div>

            <div className="flex-1 pl-4 pr-2">
              <h2 className="text-lg font-bold leading-tight text-gray-800">
                {
                  grupoDetalle.grupo
                    .nombre
                }
              </h2>

              <p className="mt-1 text-sm leading-tight text-gray-500">
                {
                  grupoDetalle.grupo
                    .linea
                }
              </p>

              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                  Tamaño
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Set(
                      grupoDetalle.grupo.items.map(
                        (item: any) =>
                          item.Tamaño
                      )
                    ),
                  ].map(
                    (
                      tam: any,
                      i: number
                    ) => (
                      <button
                        key={i}
                        onClick={() =>
                          setTamanosSeleccionados(
                            {
                              ...tamanosSeleccionados,
                              ["detalle" +
                              grupoDetalle.index]:
                                tam,
                            }
                          )
                        }
                        className={
                          (tamanosSeleccionados[
                            "detalle" +
                              grupoDetalle.index
                          ] ||
                            grupoDetalle
                              .grupo.items[0]
                              .Tamaño) ===
                          tam
                            ? "rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-medium text-white"
                            : "rounded-xl bg-gray-100 px-3 py-1.5 text-xs text-gray-700"
                        }
                      >
                        {tam}
                      </button>
                    )
                  )}
                </div>

                {grupoDetalle.grupo.items.some(
                  (item: any) =>
                    item.Color?.trim()
                ) ? (
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Color
                    </p>

                    <select
                      className="w-full rounded-xl border px-3 py-2 text-sm text-black"
                      value={
                        coloresSeleccionados[
                          "detalle" +
                            grupoDetalle.index
                        ] ||
                        grupoDetalle.grupo
                          .items[0].Color
                      }
                      onChange={(e) =>
                        setColoresSeleccionados(
                          {
                            ...coloresSeleccionados,
                            ["detalle" +
                            grupoDetalle.index]:
                              e.target.value,
                          }
                        )
                      }
                    >
                      {grupoDetalle.grupo.items
                        .filter(
                          (item: any) =>
                            item.Tamaño ===
                            (tamanosSeleccionados[
                              "detalle" +
                                grupoDetalle.index
                            ] ||
                              grupoDetalle
                                .grupo
                                .items[0]
                                .Tamaño)
                        )
                        .map(
                          (
                            item: any,
                            i: number
                          ) => (
                            <option
                              key={i}
                              value={
                                item.Color
                              }
                            >
                              {
                                item.Color
                              }
                            </option>
                          )
                        )}
                    </select>
                  </div>
                ) : grupoDetalle.grupo.items.some(
                    (item: any) =>
                      item.Fragancias?.trim()
                  ) ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      Fragancia
                    </p>

                    <select
                      className="w-full rounded-xl border px-3 py-2 text-sm text-black"
                      value={
                        fraganciasSeleccionadas[
                          "detalle" +
                            grupoDetalle.index
                        ] ||
                        grupoDetalle.grupo
                          .items[0]
                          .Fragancias
                      }
                      onChange={(e) =>
                        setFraganciasSeleccionadas(
                          {
                            ...fraganciasSeleccionadas,
                            ["detalle" +
                            grupoDetalle.index]:
                              e.target.value,
                          }
                        )
                      }
                    >
                      {grupoDetalle.grupo.items
                        .filter(
                          (item: any) =>
                            item.Tamaño ===
                            (tamanosSeleccionados[
                              "detalle" +
                                grupoDetalle.index
                            ] ||
                              grupoDetalle
                                .grupo
                                .items[0]
                                .Tamaño)
                        )
                        .map(
                          (
                            item: any,
                            i: number
                          ) => (
                            <option
                              key={i}
                              value={
                                item.Fragancias
                              }
                            >
                              {
                                item.Fragancias
                              }
                            </option>
                          )
                        )}
                    </select>
                  </div>
                ) : null}

                {productoDetalle && (
                  <div className="mt-1">
                    {tieneOferta ? (
                      <>
                        <p className="text-xl font-bold leading-none text-green-700">
                          $
                          {precioOferta.toLocaleString(
                            "es-AR"
                          )}
                        </p>

                        <div className="mt-1 flex items-center gap-3">
                          <p className="text-sm text-gray-400 line-through">
                            $
                            {precio.toLocaleString(
                              "es-AR"
                            )}
                          </p>

                          <p className="text-sm font-semibold text-green-600">
                            Ahorrás $
                            {ahorro.toLocaleString(
                              "es-AR"
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-green-700">
                        $
                        {precio.toLocaleString(
                          "es-AR"
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {productoDetalle && (
            <button
              onClick={() =>
                agregarAlCarrito(
                  productoDetalle
                )
              }
              className="mt-3 w-full rounded-2xl bg-teal-700 py-2.5 text-base font-semibold text-white hover:bg-teal-800"
            >
              🛒 Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}