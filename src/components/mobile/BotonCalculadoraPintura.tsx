"use client";

import { Calculator, ChevronRight } from "lucide-react";

type BotonCalculadoraPinturaProps = {
  onClick: () => void;
};

export default function BotonCalculadoraPintura({
  onClick,
}: BotonCalculadoraPinturaProps) {
  return (
    <div className="bg-white px-3 pb-3 pt-1">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-[20px] bg-[#123A72] px-4 py-3 text-left text-white shadow-[0_8px_22px_rgba(18,58,114,0.22)] transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8A400] text-[#081B43]">
            <Calculator size={22} strokeWidth={2.4} />
          </div>

          <div>
            <p className="text-[14px] font-black leading-tight">
              Calculadora de pintura
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-white/75">
              Calculá cuántos litros necesitás
            </p>
          </div>
        </div>

        <ChevronRight
          size={22}
          strokeWidth={2.5}
          className="shrink-0"
        />
      </button>
    </div>
  );
}