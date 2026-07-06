import {
  Truck,
  CircleDashed,
  Waves,
  CreditCard,
} from "lucide-react";

import { beneficiosConfig } from "@/src/config/beneficios";

export default function Beneficios() {
  return (
    <section className="bg-slate-50 -mt-4 pb-5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white border border-gray-100 rounded-[18px] overflow-hidden">
          <div className="grid grid-cols-4">

            <div className="relative flex items-center gap-2.5 px-6 py-3.5">
              <Truck
                size={23}
                strokeWidth={2}
                className="text-blue-900 shrink-0"
              />

              <div>
                <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
                  {beneficiosConfig[0].titulo}
                </h3>

                <p className="text-gray-500 text-[11px] mt-0.5">
                  {beneficiosConfig[0].descripcion}
                </p>
              </div>

              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
            </div>

            <div className="relative flex items-center gap-2.5 px-6 py-3.5">
              <CircleDashed
                size={23}
                strokeWidth={2}
                className="text-blue-900 shrink-0"
              />

              <div>
                <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
                  {beneficiosConfig[1].titulo}
                </h3>

                <p className="text-gray-500 text-[11px] mt-0.5">
                  {beneficiosConfig[1].descripcion}
                </p>
              </div>

              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
            </div>

            <div className="relative flex items-center gap-2.5 px-6 py-3.5">
              <Waves
                size={23}
                strokeWidth={2}
                className="text-blue-900 shrink-0"
              />

              <div>
                <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
                  {beneficiosConfig[2].titulo}
                </h3>

                <p className="text-gray-500 text-[11px] mt-0.5">
                  {beneficiosConfig[2].descripcion}
                </p>
              </div>

              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
            </div>

            <div className="flex items-center gap-2.5 px-6 py-3.5">
              <CreditCard
                size={23}
                strokeWidth={2}
                className="text-blue-900 shrink-0"
              />

              <div>
                <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
                  {beneficiosConfig[3].titulo}
                </h3>

                <p className="text-gray-500 text-[11px] mt-0.5">
                  {beneficiosConfig[3].descripcion}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}