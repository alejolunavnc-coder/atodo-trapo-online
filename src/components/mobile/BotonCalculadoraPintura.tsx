"use client";

import { Calculator, PaintBucket } from "lucide-react";

type BotonCalculadoraPinturaProps = {
  onClick: () => void;
};

export default function BotonCalculadoraPintura({
  onClick,
}: BotonCalculadoraPinturaProps) {
  return (
    <section className="px-4 py-2">
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-[20px] border border-gray-100 bg-white p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-[0.98]"
      >
        {/* [Icono] */}
        <div className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#123A72] shadow-[0_7px_16px_rgba(18,58,114,0.22)]">
          <PaintBucket
            size={27}
            strokeWidth={2.1}
            className="text-white"
          />

          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F8A400]">
            <Calculator
              size={13}
              strokeWidth={2.6}
              className="text-[#123A72]"
            />
          </div>
        </div>

        {/* [Textos] */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-black leading-tight tracking-[-0.025em] text-[#123A72]">
            Calculadora de pintura
          </h3>

          <p className="mt-1 text-[10px] font-medium leading-tight text-gray-500">
            Calculá cuántos litros necesitás
          </p>
        </div>

        {/* [Botón amarillo] */}
        <div className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#F8A400] px-4 text-[11px] font-black text-[#123A72] shadow-[0_6px_14px_rgba(248,164,0,0.28)] transition-transform duration-200 group-active:scale-95">
          Calcular
        </div>
      </button>
    </section>
  );
}