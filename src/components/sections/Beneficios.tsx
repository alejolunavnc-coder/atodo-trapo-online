import {
  Truck,
  CircleDashed,
  Waves,
  CreditCard,
} from "lucide-react";

import { beneficiosConfig } from "@/src/config/beneficios";

export default function Beneficios() {
  return (
    <section className="-mt-4 bg-slate-50 pb-5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-[18px] border border-gray-100 bg-white">
          <div className="grid grid-cols-4">
            <div className="relative flex min-w-0 items-center gap-2.5 px-6 py-3.5">
              <Truck
                size={23}
                strokeWidth={2}
                className="shrink-0 text-blue-900"
              />

              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold leading-tight text-blue-950">
                  {beneficiosConfig[0].titulo}
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  {beneficiosConfig[0].descripcion}
                </p>
              </div>

              <span className="absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 bg-gray-200" />
            </div>

            <div className="relative flex min-w-0 items-center gap-2.5 px-6 py-3.5">
              <CircleDashed
                size={23}
                strokeWidth={2}
                className="shrink-0 text-blue-900"
              />

              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold leading-tight text-blue-950">
                  {beneficiosConfig[1].titulo}
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  {beneficiosConfig[1].descripcion}
                </p>
              </div>

              <span className="absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 bg-gray-200" />
            </div>

            <div className="relative flex min-w-0 items-center gap-2.5 px-6 py-3.5">
              <Waves
                size={23}
                strokeWidth={2}
                className="shrink-0 text-blue-900"
              />

              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold leading-tight text-blue-950">
                  {beneficiosConfig[2].titulo}
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  {beneficiosConfig[2].descripcion}
                </p>
              </div>

              <span className="absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 bg-gray-200" />
            </div>

            <div className="flex min-w-0 items-center gap-2.5 px-6 py-3.5">
              <CreditCard
                size={23}
                strokeWidth={2}
                className="shrink-0 text-blue-900"
              />

              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold leading-tight text-blue-950">
                  {beneficiosConfig[3].titulo}
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-500">
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