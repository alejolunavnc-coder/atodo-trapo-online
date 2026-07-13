"use client";

// [Imports]

import Image from "next/image";
import {
  CreditCard,
  Handshake,
  Menu,
  Palette,
  ShoppingCart,
  Truck,
} from "lucide-react";

type MobileHeaderCompartidoProps = {
  cantidadCarrito?: number;
  onAbrirMenu?: () => void;
  onAbrirCarrito?: () => void;
  mostrarBeneficios?: boolean;
};

export default function MobileHeaderCompartido({
  cantidadCarrito = 0,
  onAbrirMenu,
  onAbrirCarrito,
  mostrarBeneficios = true,
}: MobileHeaderCompartidoProps) {
  return (
    <>
      {/* [Header] */}

      <section
        className="relative overflow-hidden px-4 pb-7 pt-3"
        style={{
          backgroundImage: "url('/header.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative flex items-center justify-between">
          {/* [Menú] */}

          <button
            type="button"
            onClick={onAbrirMenu}
            className="flex h-11 w-11 items-center justify-center text-white transition active:scale-95"
            aria-label="Abrir menú"
          >
            <Menu
              size={31}
              strokeWidth={2.6}
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            />
          </button>

          {/* [Logo] */}

          <div className="absolute left-1/2 -top-5 -translate-x-1/2">
            <div className="relative h-[88px] w-[210px]">
              <Image
                src="/logo.png"
                alt="A Todo Trapo Online"
                fill
                priority
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* [Carrito] */}

          <button
            type="button"
            onClick={onAbrirCarrito}
            className="relative flex h-11 w-11 items-center justify-center text-white transition active:scale-95"
            aria-label="Abrir carrito"
          >
            <ShoppingCart
              size={31}
              strokeWidth={2.5}
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            />

            {cantidadCarrito > 0 && (
              <span
                key={cantidadCarrito}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-[reboteCarrito_0.35s_ease-out] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-lg"
              >
                {cantidadCarrito}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* [Barra de beneficios] */}

      {mostrarBeneficios && (
        <section className="relative z-20 -mt-4 px-4">
          <div className="grid grid-cols-4 rounded-[24px] bg-white px-2 py-2 shadow-[0_8px_22px_rgba(0,0,0,0.14)] ring-1 ring-gray-100">
            <div className="flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 text-center">
              <Palette
                size={17}
                strokeWidth={2.2}
                className="text-[#123A72]"
              />

              <p className="text-[7px] font-black leading-tight text-gray-800">
                Tintométrico
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 text-center">
              <Truck
                size={17}
                strokeWidth={2.2}
                className="text-[#123A72]"
              />

              <p className="text-[7px] font-black leading-tight text-gray-800">
                Envíos
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 text-center">
              <CreditCard
                size={17}
                strokeWidth={2.2}
                className="text-[#123A72]"
              />

              <p className="text-[7px] font-black leading-tight text-gray-800">
                Pagos
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-0.5 text-center">
              <Handshake
                size={17}
                strokeWidth={2.2}
                className="text-[#123A72]"
              />

              <p className="text-[7px] font-black leading-tight text-gray-800">
                Confianza
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}