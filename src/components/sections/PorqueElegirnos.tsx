import {
  CircleDashed,
  Truck,
  CreditCard,
  PaintBucket,
} from "lucide-react";

export default function PorqueElegirnos() {
  return (
    <section className="mt-6 pb-3">
      <div className="bg-white border border-gray-100 rounded-[22px] shadow-sm overflow-hidden">
        <div className="grid grid-cols-4">

          <div className="relative flex items-center gap-4 px-8 py-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <CircleDashed
                size={28}
                className="text-blue-950"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-blue-950 leading-tight">
                Sistema tintométrico
              </h3>

              <p className="text-[13px] text-slate-600 mt-1 leading-snug">
                +1500 colores computarizados
              </p>
            </div>

            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-px bg-gray-200" />
          </div>

          <div className="relative flex items-center gap-4 px-8 py-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck
                size={28}
                className="text-blue-950"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-blue-950">
                Envíos rápidos
              </h3>

              <p className="text-[13px] text-slate-600 mt-1 leading-snug">
                Entregas en Candelaria y zonas aledañas
              </p>
            </div>

            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-px bg-gray-200" />
          </div>

          <div className="relative flex items-center gap-4 px-8 py-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard
                size={28}
                className="text-blue-950"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-blue-950">
                Pagos seguros
              </h3>

              <p className="text-[13px] text-slate-600 mt-1 leading-snug">
                Efectivo, tarjetas y transferencias
              </p>
            </div>

            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-px bg-gray-200" />
          </div>

          <div className="flex items-center gap-4 px-8 py-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <PaintBucket
                size={28}
                className="text-blue-950"
                strokeWidth={2}
              />
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-blue-950">
                Gran variedad
              </h3>

              <p className="text-[13px] text-slate-600 mt-1 leading-snug">
                Pinturas, limpieza, hogar y más
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}