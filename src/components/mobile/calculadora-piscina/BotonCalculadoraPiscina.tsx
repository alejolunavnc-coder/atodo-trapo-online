"use client";

import {
  ChevronRight,
  Waves,
} from "lucide-react";

type BotonCalculadoraPiscinaProps = {
  onClick: () => void;
};

export default function BotonCalculadoraPiscina({
  onClick,
}: BotonCalculadoraPiscinaProps) {
  return (
    <div className="bg-white px-3 pb-3 pt-0">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-[20px] bg-[#0879C5] px-4 py-3 text-left text-white shadow-[0_8px_22px_rgba(8,121,197,0.24)] transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B9F3FF] text-[#075985]">
            <Waves
              size={22}
              strokeWidth={2.4}
            />
          </div>

          <div>
            <p className="text-[14px] font-black leading-tight">
              Calculadora de piscina
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-white/80">
              Calculá el tratamiento ideal
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