import { BadgePercent, MapPin, ShoppingBasket } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { negocioConfig } from "@/src/config/negocio";
import { contactoConfig } from "@/src/config/contacto";
import { localConfig } from "@/src/config/local";
import type { CarritoItem } from "@/src/types/carrito";

type HeaderProps = {
  busqueda: string;
  setBusqueda: React.Dispatch<React.SetStateAction<string>>;
  busquedaActiva: boolean;
  setBusquedaActiva: React.Dispatch<React.SetStateAction<boolean>>;
  setPosicionAntesBusqueda: React.Dispatch<React.SetStateAction<number>>;
  ofertasRef: React.RefObject<HTMLElement | null>;
  carrito: CarritoItem[];
  carritoAnimado: boolean;
  setMostrarCarrito: React.Dispatch<React.SetStateAction<boolean>>;
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
}: HeaderProps) {
  const cantidadCarrito = carrito.reduce(
    (total: number, producto: any) => total + (producto.cantidad || 1),
    0
  );

  return (
    <>
      <div className="hidden md:block bg-blue-950 text-white/95 text-[12px] font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-6 h-8 grid grid-cols-3 items-center">
          <div className="flex items-center gap-5 justify-start">
            <div className="flex items-center gap-2">
              <MapPin size={15} strokeWidth={2} className="text-white" />
              <span className="font-medium">{localConfig.cobertura}</span>
            </div>
          </div>

          <div className="flex items-center justify-center text-[12px] font-medium">
            <span>🕒 {localConfig.horarios.lunesASabadoCorto}</span>
            <span className="mx-4 opacity-50">•</span>
            <span>{localConfig.horarios.domingoCorto}</span>
          </div>
        </div>
      </div>

      <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <img
            src={negocioConfig.logo}
            alt={negocioConfig.nombre}
            className="w-48 object-contain"
          />

          <div className="flex-1 max-w-3xl flex">
            <input
              type="text"
              placeholder="Buscá productos, marcas, líneas..."
              value={busqueda}
              onChange={(e) => {
                if (!busquedaActiva) {
                  setPosicionAntesBusqueda(window.scrollY);
                  setBusquedaActiva(true);
                }

                setBusqueda(e.target.value);
              }}
              className="w-full h-11 border border-gray-200 rounded-l-full px-6 text-[15px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-700 transition"
            />

            <button className="bg-blue-950 hover:bg-blue-900 text-white w-12 rounded-r-full flex items-center justify-center transition">
              🔍
            </button>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-slate-700">
            <button
              onClick={() =>
                ofertasRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="flex items-center gap-2 hover:text-blue-800 transition"
            >
              <BadgePercent size={18} strokeWidth={2} className="text-blue-900" />
              <span className="font-medium">Ofertas</span>
            </button>

            <a
              href={contactoConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-800 transition"
            >
              <FaInstagram size={19} className="text-blue-900" />
              <span className="font-medium">Instagram</span>
            </a>

            <button
              onClick={() => setMostrarCarrito(true)}
              className={`relative flex items-center gap-2 hover:text-blue-800 transition ${
                carritoAnimado ? "animate-[cartBounce_0.45s_ease-out]" : ""
              }`}
            >
              <ShoppingBasket size={20} strokeWidth={2} className="text-blue-900" />

              <div className="flex flex-col leading-none">
                <span className="font-semibold text-[13px] text-slate-800">
                  Carrito
                </span>

                <span className="text-[10px] text-gray-400">
                  {cantidadCarrito} productos
                </span>
              </div>

              {cantidadCarrito > 0 && (
                <span
                  className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 text-[9px] text-blue-950 flex items-center justify-center font-bold ${
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