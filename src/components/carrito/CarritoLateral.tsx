import { contactoConfig } from "@/src/config/contacto";
import type { CarritoItem } from "@/src/types/carrito";
import type { Producto } from "@/src/types/producto";

type CarritoLateralProps = {
  mostrarCarrito: boolean;
  setMostrarCarrito: React.Dispatch<React.SetStateAction<boolean>>;
  carrito: CarritoItem[];
  setCarrito: React.Dispatch<React.SetStateAction<CarritoItem[]>>;
  productos: Producto[];
};

export default function CarritoLateral({
  mostrarCarrito,
  setMostrarCarrito,
  carrito,
  setCarrito,
  productos,
}: CarritoLateralProps) {
  if (!mostrarCarrito) return null;

  return (
    <div className="hidden md:block fixed inset-0 z-[999]">
      <div
        onClick={() => setMostrarCarrito(false)}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 h-full w-[460px] bg-white shadow-2xl rounded-l-[28px] overflow-hidden animate-[cartSlideIn_0.25s_ease-out]">
        <div className="h-full flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                🛒 Mi carrito
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {carrito.length === 0
                  ? "Todavía no agregaste productos"
                  : `${carrito.length} productos agregados`}
              </p>
            </div>

            <button
              onClick={() => setMostrarCarrito(false)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl flex items-center justify-center transition"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50/60">
            {carrito.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl mb-4">
                  🧺
                </div>

                <h3 className="text-lg font-bold text-slate-800">
                  Tu carrito está vacío
                </h3>

                <p className="text-sm text-gray-500 mt-2 max-w-[260px]">
                  Agregá productos al carrito y después coordiná tu pedido por WhatsApp.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrito.map((producto, index) => {
                  const imagenProducto = producto.imagen || "";

                  const precioOriginal = producto.precioOriginal;

                  const ahorro =
                    precioOriginal && precioOriginal > producto.precio
                      ? precioOriginal - producto.precio
                      : 0;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {imagenProducto ? (
                            <img
                              src={imagenProducto}
                              alt={producto.nombre}
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-2xl">🛒</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-3">
                            <div>
                              {producto.marca?.trim() && (
  <span className="inline-flex items-center bg-blue-950 text-white text-[9px] font-extrabold uppercase tracking-[0.10em] px-2.5 py-0.5 rounded-full shadow-sm mb-1">
    {producto.marca}
  </span>
)}

                              <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                                {producto.nombre || "Producto"}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 leading-snug">
                                {[
                                  producto.linea,
                                  producto.tamano,
                                  producto.fragancia || producto.color,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                setCarrito(carrito.filter((_, i) => i !== index))
                              }
                              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold transition shrink-0"
                            >
                              ×
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-3">
                            <div>
                              {precioOriginal && precioOriginal > producto.precio && (
                                <p className="text-xs text-gray-400 line-through">
                                  ${precioOriginal.toLocaleString("es-AR")}
                                </p>
                              )}

                              <p className="text-lg font-bold text-green-700 leading-none">
                                ${producto.precio.toLocaleString("es-AR")}
                              </p>

                              {ahorro > 0 && (
                                <p className="text-xs font-semibold text-green-600 mt-1">
                                  Ahorrás ${ahorro.toLocaleString("es-AR")}
                                </p>
                              )}
                            </div>

                            <div className="text-sm font-bold text-blue-950">
  x{(producto as any).cantidad || 1}
</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {carrito.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-5 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    $
                    {carrito
                      .reduce((total, producto) => total + producto.precio, 0)
                      .toLocaleString("es-AR")}
                  </span>
                </div>

                {(() => {
                  const ahorroTotal = carrito.reduce((totalAhorro, producto) => {
                    const ahorro =
                      producto.precioOriginal &&
                      producto.precioOriginal > producto.precio
                        ? producto.precioOriginal - producto.precio
                        : 0;

                    return totalAhorro + ahorro;
                  }, 0);

                  return ahorroTotal > 0 ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-semibold">
                        Ahorrás
                      </span>
                      <span className="font-bold text-green-600">
                        ${ahorroTotal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  ) : null;
                })()}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="font-semibold text-blue-900">
                    A coordinar
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between mb-4">
                <span className="text-base font-bold text-slate-900">
                  Total
                </span>

                <span className="text-3xl font-black text-slate-900">
                  $
                  {carrito
                    .reduce((total, producto) => total + producto.precio, 0)
                    .toLocaleString("es-AR")}
                </span>
              </div>

              <a
                href={`https://wa.me/${contactoConfig.whatsapp}?text=${encodeURIComponent(
                  "Hola!\n" +
                    "Quiero realizar el siguiente pedido:\n\n" +
                    carrito
                      .map(
                        (producto, index) =>
                          `${index + 1}. ${producto.nombre}\n   $${producto.precio.toLocaleString("es-AR")}`
                      )
                      .join("\n\n") +
                    "\n\nTotal: $" +
                    carrito
                      .reduce((total, producto) => total + producto.precio, 0)
                      .toLocaleString("es-AR") +
                    "\n\nMi dirección es: "
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg text-base"
              >
                💬 Finalizar pedido por WhatsApp
              </a>

              <button
                onClick={() => setCarrito([])}
                className="w-full mt-3 border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-2xl transition text-sm"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}