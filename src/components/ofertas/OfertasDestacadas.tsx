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
  return (
    <section
      ref={ofertasRef}
      className="hidden md:block mt-8 pb-10 scroll-mt-28"
    >
      <div className="bg-white border border-gray-100 rounded-[26px] shadow-sm p-6">
        <div className="flex items-center gap-5 mb-5">
          <h2 className="text-[30px] font-bold text-blue-950 leading-none">
            Ofertas destacadas
          </h2>

          <button className="bg-orange-50 text-red-600 px-4 py-2 rounded-xl text-[14px] font-semibold hover:bg-orange-100 transition">
            🔥 Ver todas las ofertas
          </button>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="grid grid-cols-4 gap-4">
            {ofertasAgrupadas.slice(0, 4).map((grupo, index) => {
              const productoSeleccionado =
                grupo.items.find((item: any) => {
                  if (grupo.items.some((i: any) => i.Color?.trim())) {
                    return (
                      item.Tamaño ===
                        (tamanosSeleccionados["oferta" + index] ||
                          grupo.items[0].Tamaño) &&
                      item.Color ===
                        (coloresSeleccionados["oferta" + index] ||
                          grupo.items.find(
                            (i: any) =>
                              i.Tamaño ===
                              (tamanosSeleccionados["oferta" + index] ||
                                grupo.items[0].Tamaño)
                          )?.Color)
                    );
                  }

                  if (grupo.items.some((i: any) => i.Fragancias?.trim())) {
                    return (
                      item.Tamaño ===
                        (tamanosSeleccionados["oferta" + index] ||
                          grupo.items[0].Tamaño) &&
                      item.Fragancias ===
                        (fraganciasSeleccionadas["oferta" + index] ||
                          grupo.items[0].Fragancias)
                    );
                  }

                  return (
                    item.Tamaño ===
                    (tamanosSeleccionados["oferta" + index] ||
                      grupo.items[0].Tamaño)
                  );
                }) || grupo.items[0];

              return (
                <div
                  key={index}
                  className="relative bg-white border border-gray-200 rounded-[18px] p-3 shadow-sm hover:shadow-md transition"
                >
                  {productoSeleccionado?.Oferta?.trim().toLowerCase() ===
                    "si" && (
                    <>
                      <span className="absolute top-3 left-3 bg-yellow-400 text-blue-950 text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                        -
                        {Math.round(
                          (1 -
                            Number(productoSeleccionado["Precio oferta"]) /
                              Number(productoSeleccionado.Precio)) *
                            100
                        )}
                        %
                      </span>

                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                        OFERTA
                      </span>
                    </>
                  )}

                  <div className="h-[120px] flex items-center justify-center mb-2 mt-4">
                    {productoSeleccionado?.Imagen?.trim() && (
                      <img
                        src={productoSeleccionado.Imagen.trim()}
                        alt={grupo.nombre}
                        className="max-h-[115px] max-w-full object-contain"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-blue-950 leading-tight">
                      {productoSeleccionado?.Marca || grupo.nombre}
                    </h3>

                    <p className="text-[13px] text-blue-950 leading-tight mt-0.5">
                      {grupo.nombre}
                    </p>

                    <p className="text-[13px] text-blue-950 leading-tight mt-0.5">
                      {productoSeleccionado?.Tamaño}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-[13px] text-red-600 line-through leading-none">
                      ${Number(productoSeleccionado.Precio).toLocaleString("es-AR")}
                    </p>

                    <p className="text-[23px] font-bold text-blue-950 leading-tight mt-1">
                      ${Number(productoSeleccionado["Precio oferta"]).toLocaleString("es-AR")}
                    </p>

                    <p className="text-[13px] font-semibold text-green-600 leading-tight">
                      Ahorrás ${(
                        Number(productoSeleccionado.Precio) -
                        Number(productoSeleccionado["Precio oferta"])
                      ).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                      Tamaño
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(grupo.items.map((item: any) => item.Tamaño))]
                        .filter(Boolean)
                        .map((tam, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const primerColorDisponible = grupo.items.find(
                                (item: any) => item.Tamaño === tam
                              )?.Color;

                              const primeraFraganciaDisponible = grupo.items.find(
                                (item: any) => item.Tamaño === tam
                              )?.Fragancias;

                              setTamanosSeleccionados({
                                ...tamanosSeleccionados,
                                ["oferta" + index]: tam,
                              });

                              setColoresSeleccionados({
                                ...coloresSeleccionados,
                                ["oferta" + index]: primerColorDisponible,
                              });

                              setFraganciasSeleccionadas({
                                ...fraganciasSeleccionadas,
                                ["oferta" + index]: primeraFraganciaDisponible,
                              });
                            }}
                            className={
                              (tamanosSeleccionados["oferta" + index] ||
                                grupo.items[0].Tamaño) === tam
                                ? "h-7 px-2 rounded-md bg-blue-950 text-white text-[11px] font-semibold"
                                : "h-7 px-2 rounded-md bg-white border border-gray-200 text-blue-950 text-[11px] font-medium hover:border-blue-300"
                            }
                          >
                            {String(tam)}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    {grupo.items.some((i: any) => i.Fragancias?.trim()) ? (
                      <>
                        <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                          Fragancia
                        </p>

                        <select
                          value={
                            fraganciasSeleccionadas["oferta" + index] ||
                            productoSeleccionado?.Fragancias ||
                            ""
                          }
                          onChange={(e) =>
                            setFraganciasSeleccionadas({
                              ...fraganciasSeleccionadas,
                              ["oferta" + index]: e.target.value,
                            })
                          }
                          className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-[12px] text-blue-950 outline-none focus:border-blue-800"
                        >
                          {[
                            ...new Set(
                              grupo.items
                                .filter(
                                  (item: any) =>
                                    item.Tamaño ===
                                    (tamanosSeleccionados["oferta" + index] ||
                                      grupo.items[0].Tamaño)
                                )
                                .map((item: any) => item.Fragancias)
                                .filter(Boolean)
                            ),
                          ].map((fragancia, i) => (
                            <option key={i} value={String(fragancia)}>
                              {String(fragancia)}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                          Color
                        </p>

                        <select
                          value={
                            coloresSeleccionados["oferta" + index] ||
                            productoSeleccionado?.Color ||
                            ""
                          }
                          onChange={(e) =>
                            setColoresSeleccionados({
                              ...coloresSeleccionados,
                              ["oferta" + index]: e.target.value,
                            })
                          }
                          className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-[12px] text-blue-950 outline-none focus:border-blue-800"
                        >
                          {[
                            ...new Set(
                              grupo.items
                                .filter(
                                  (item: any) =>
                                    item.Tamaño ===
                                    (tamanosSeleccionados["oferta" + index] ||
                                      grupo.items[0].Tamaño)
                                )
                                .map((item: any) => item.Color)
                                .filter(Boolean)
                            ),
                          ].map((color, i) => (
                            <option key={i} value={String(color)}>
                              {String(color)}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => agregarAlCarrito(productoSeleccionado)}
                    className="mt-4 w-full h-9 bg-yellow-400 hover:bg-yellow-500 text-blue-950 rounded-lg text-[12px] font-bold transition whitespace-nowrap"
                  >
                    🛒 Agregar
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-950 rounded-[24px] p-8 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
            <div className="relative z-10">
              <h3 className="text-[26px] font-bold text-white leading-tight">
                ¿Tenés dudas?
              </h3>

              <p className="text-[17px] font-bold text-yellow-400 mt-3">
                Escribinos por WhatsApp
              </p>

              <p className="text-[15px] text-white/90 mt-6 leading-relaxed">
                Te respondemos al instante para consultar stock, precios o disponibilidad.
              </p>

              <a
                href={`https://wa.me/${contactoConfig.whatsapp}?text=${encodeURIComponent(
                  "¡Hola! 👋 Tengo una consulta sobre las ofertas publicadas."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-[16px] font-bold transition mt-8 shadow-sm"
              >
                <FaWhatsapp size={21} />
                Ir a WhatsApp
              </a>
            </div>

            <div className="absolute right-8 bottom-10 text-[120px] opacity-10">
              💬
            </div>

            <div className="absolute left-0 right-0 bottom-0 h-20 bg-blue-900/50 rounded-t-[50%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
