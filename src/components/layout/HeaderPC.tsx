import {
  BadgePercent,
  MapPin,
  ShoppingBasket,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { negocioConfig } from "@/src/config/negocio";
import { contactoConfig } from "@/src/config/contacto";
import { localConfig } from "@/src/config/local";
import type { CarritoItem } from "@/src/types/carrito";

type HeaderProps = {
  busqueda: string;
  setBusqueda: React.Dispatch<
    React.SetStateAction<string>
  >;
  busquedaActiva: boolean;
  setBusquedaActiva: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setPosicionAntesBusqueda: React.Dispatch<
    React.SetStateAction<number>
  >;
  ofertasRef: React.RefObject<HTMLElement | null>;
  carrito: CarritoItem[];
  carritoAnimado: boolean;
  setMostrarCarrito: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  onVolverInicio: () => void;
};

export default function HeaderPC({
  busqueda,
  setBusqueda,
  busquedaActiva,
  setBusquedaActiva,
  setPosicionAntesBusqueda,
  ofertasRef,
  carrito,
  carritoAnimado,
  setMostrarCarrito,
  onVolverInicio,
}: HeaderProps) {
  const cantidadCarrito = carrito.reduce(
    (total: number, producto: any) =>
      total + (producto.cantidad || 1),
    0
  );

  return (
    <>
      <div className="hidden bg-blue-950 text-[12px] font-medium tracking-wide text-white/95 md:block">
        <div className="mx-auto grid h-8 max-w-7xl grid-cols-3 items-center px-6">
          <div className="flex items-center justify-start gap-5">
            <div className="flex items-center gap-2">
              <MapPin
                size={15}
                strokeWidth={2}
                className="text-white"
              />

              <span className="font-medium">
                {localConfig.cobertura}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center text-[12px] font-medium">
            <span>
              🕒{" "}
              {
                localConfig.horarios
                  .lunesASabadoCorto
              }
            </span>

            <span className="mx-4 opacity-50">
              •
            </span>

            <span>
              {
                localConfig.horarios
                  .domingoCorto
              }
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 hidden border-b border-gray-100 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.10)] backdrop-blur-md md:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6">
          {/* [Logo - inicio global] */}

          <button
            type="button"
            onClick={onVolverInicio}
            aria-label="Volver al inicio"
            className="shrink-0 rounded-xl outline-none transition active:scale-[0.98]"
          >
            <img
              src={negocioConfig.logo}
              alt={negocioConfig.nombre}
              className="w-48 cursor-pointer object-contain"
            />
          </button>

          {/* [Buscador] */}

          <div className="flex max-w-3xl flex-1">
            <input
              type="text"
              placeholder="Buscá productos, marcas, líneas..."
              value={busqueda}
              onChange={(e) => {
                if (!busquedaActiva) {
                  setPosicionAntesBusqueda(
                    window.scrollY
                  );
                  setBusquedaActiva(true);
                }

                setBusqueda(e.target.value);
              }}
              className="h-11 w-full rounded-l-full border border-gray-200 px-6 text-[15px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-700"
            />

            <button
              type="button"
              className="flex w-12 items-center justify-center rounded-r-full bg-blue-950 text-white transition hover:bg-blue-900"
            >
              🔍
            </button>
          </div>

          {/* [Acciones] */}

          <div className="flex items-center gap-6 text-[13px] text-slate-700">
            <button
              type="button"
              onClick={() =>
                ofertasRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="flex items-center gap-2 transition hover:text-blue-800"
            >
              <BadgePercent
                size={18}
                strokeWidth={2}
                className="text-blue-900"
              />

              <span className="font-medium">
                Ofertas
              </span>
            </button>

            <a
              href={contactoConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition hover:text-blue-800"
            >
              <FaInstagram
                size={19}
                className="text-blue-900"
              />

              <span className="font-medium">
                Instagram
              </span>
            </a>

            <button
              type="button"
              onClick={() =>
                setMostrarCarrito(true)
              }
              className={`relative flex items-center gap-2 transition hover:text-blue-800 ${
                carritoAnimado
                  ? "animate-[cartBounce_0.45s_ease-out]"
                  : ""
              }`}
            >
              <ShoppingBasket
                size={20}
                strokeWidth={2}
                className="text-blue-900"
              />

              <div className="flex flex-col leading-none">
                <span className="text-[13px] font-semibold text-slate-800">
                  Carrito
                </span>

                <span className="text-[10px] text-gray-400">
                  {cantidadCarrito} productos
                </span>
              </div>

              {cantidadCarrito > 0 && (
                <span
                  className={`absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[9px] font-bold text-blue-950 ${
                    carritoAnimado
                      ? "animate-[cartBadgeBounce_0.45s_ease-out]"
                      : ""
                  }`}
                >
                  {cantidadCarrito}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}