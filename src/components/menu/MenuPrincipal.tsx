"use client";

import {
  Calculator,
  Sparkles,
  Waves,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";
import { contactoConfig } from "@/src/config/contacto";
import type { Producto } from "@/src/types/producto";

type MenuPrincipalProps = {
  productos: Producto[];
  setCategoria: (categoria: string) => void;
  setMarca: (marca: string) => void;
  setVista: (vista: string) => void;
  onAbrirCalculadoraPintura: () => void;
  onAbrirCalculadoraPiscina: () => void;
};

export default function MenuPrincipal({
  onAbrirCalculadoraPintura,
  onAbrirCalculadoraPiscina,
}: MenuPrincipalProps) {
  return (
    <>
      <nav className="hidden border-b border-gray-200 bg-white md:block">
        <div className="mx-auto flex h-[54px] max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 text-[14px] font-semibold text-[#162a63]">
            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="relative mr-4 font-semibold text-[#162a63] transition-colors duration-200 hover:text-[#0d3fb8]"
            >
              Inicio

              <span className="absolute -bottom-[17px] left-0 h-[3px] w-full rounded-full bg-yellow-400" />
            </button>

            <button
              type="button"
              onClick={onAbrirCalculadoraPintura}
              style={{
                animation:
                  "latidoSuaveCalculadora 1.8s ease-in-out infinite",
                transformOrigin: "center",
              }}
              className="group relative flex h-10 items-center gap-3 overflow-hidden rounded-[14px] bg-[#F8C400] px-4 text-[#081B43] shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition-[background-color,box-shadow,filter] duration-300 hover:bg-[#FFD21A] hover:shadow-[0_12px_28px_rgba(15,23,42,0.22)] hover:brightness-105 active:scale-[0.98]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 shadow-sm">
                <Calculator
                  size={17}
                  strokeWidth={2.4}
                />
              </span>

              <span className="text-[14px] font-black tracking-[-0.02em]">
                Calculadora de pintura
              </span>

              <span className="flex items-center gap-1 rounded-full bg-[#081B43] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">
                <Sparkles
                  size={10}
                  strokeWidth={2.6}
                />

                Nuevo
              </span>

              <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-[30%] skew-x-[-20deg] bg-white/30 blur-[1px] transition-all duration-700 group-hover:left-[120%]" />
            </button>

            <button
              type="button"
              onClick={onAbrirCalculadoraPiscina}
              style={{
                animation:
                  "latidoSuaveCalculadora 1.8s ease-in-out infinite",
                animationDelay: "0.9s",
                transformOrigin: "center",
              }}
              className="group relative flex h-10 items-center gap-3 overflow-hidden rounded-[14px] bg-gradient-to-r from-[#0D5EA8] to-[#078ACB] px-4 text-white shadow-[0_8px_22px_rgba(7,138,203,0.28)] transition-[box-shadow,filter] duration-300 hover:brightness-110 hover:shadow-[0_12px_30px_rgba(7,138,203,0.38)] active:scale-[0.98]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0878BC] shadow-sm">
                <Waves
                  size={17}
                  strokeWidth={2.4}
                />
              </span>

              <span className="text-[14px] font-extrabold tracking-[-0.015em]">
                Calculadora de piscina
              </span>

              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">
                <Sparkles
                  size={10}
                  strokeWidth={2.6}
                />

                Nuevo
              </span>

              <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-[30%] skew-x-[-20deg] bg-white/30 blur-[1px] transition-all duration-700 group-hover:left-[120%]" />
            </button>
          </div>

          <a
            href={`https://wa.me/${
              contactoConfig.whatsapp
            }?text=${encodeURIComponent(
              "¡Hola! Tengo una consulta por un producto."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1FAF5A] px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#198F49]"
          >
            <FaWhatsapp size={17} />

            <span>Consultanos por WhatsApp</span>
          </a>
        </div>
      </nav>

      <style>{`
        @keyframes latidoSuaveCalculadora {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.04);
          }

          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}