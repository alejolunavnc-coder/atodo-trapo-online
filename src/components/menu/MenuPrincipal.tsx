import { Calculator, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { contactoConfig } from "@/src/config/contacto";
import type { Producto } from "@/src/types/producto";

type MenuPrincipalProps = {
  productos: Producto[];
  setCategoria: (categoria: string) => void;
  setMarca: (marca: string) => void;
  setVista: (vista: string) => void;
  onAbrirCalculadoraPintura: () => void;
};

export default function MenuPrincipal({
  onAbrirCalculadoraPintura,
}: MenuPrincipalProps) {
  return (
    <nav className="hidden border-b border-gray-200 bg-white md:block">
      <div className="mx-auto flex h-[54px] max-w-7xl items-center justify-between px-6">
        <div className="ml-[80px] flex items-center gap-7 text-[14px] font-semibold text-[#162a63]">
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="relative font-semibold text-[#162a63] transition-colors duration-200 hover:text-[#0d3fb8]"
          >
            Inicio

            <span className="absolute left-0 -bottom-[17px] h-[3px] w-full rounded-full bg-yellow-400" />
          </button>

          <button
            type="button"
            onClick={onAbrirCalculadoraPintura}
            className="group relative flex h-10 items-center gap-3 overflow-hidden rounded-[14px] bg-[#F8C400] px-4 text-[#081B43] shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFD21A] hover:shadow-[0_12px_28px_rgba(15,23,42,0.22)] active:scale-[0.98] animate-[latidoCalculadora_2.2s_ease-in-out_infinite]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 shadow-sm">
              <Calculator size={17} strokeWidth={2.4} />
            </span>

            <span className="text-[14px] font-black tracking-[-0.02em]">
              Calculadora de pintura
            </span>

            <span className="flex items-center gap-1 rounded-full bg-[#081B43] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">
              <Sparkles size={10} strokeWidth={2.6} />
              Nuevo
            </span>

            <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-[30%] skew-x-[-20deg] bg-white/30 blur-[1px] transition-all duration-700 group-hover:left-[120%]" />
          </button>
        </div>

        <a
          href={`https://wa.me/${contactoConfig.whatsapp}?text=${encodeURIComponent(
            "¡Hola! Tengo una consulta por un producto."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[#1FAF5A] px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#198F49]"
        >
          <FaWhatsapp size={17} />
          <span>Consultanos por WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}