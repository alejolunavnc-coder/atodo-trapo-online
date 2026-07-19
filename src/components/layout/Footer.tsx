import { FaInstagram } from "react-icons/fa";
import { negocioConfig } from "@/src/config/negocio";
import { contactoConfig } from "@/src/config/contacto";
import { localConfig } from "@/src/config/local";

export default function Footer() {
  return (
    <footer className="bg-slate-50 pb-10 pt-3">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-[1.05fr_1.25fr_1fr]">
            {/* Logo */}

            <div className="flex min-w-0 items-center gap-4 px-8 py-7">
              <img
                src={negocioConfig.logo}
                alt={negocioConfig.nombre}
                className="w-44 shrink-0 object-contain"
              />

              <div className="min-w-0 leading-tight">
                <h2 className="text-[18px] font-extrabold leading-tight tracking-[-0.03em] text-teal-700">
                  {negocioConfig.nombre}
                </h2>

                <p className="mt-1 text-[13px] font-medium leading-snug text-slate-500">
                  {negocioConfig.subtitulo}
                </p>
              </div>
            </div>

            {/* Dirección y horarios */}

            <div className="flex min-w-0 flex-col justify-center border-l border-r border-gray-200 px-10 py-7">
              <p className="flex items-start gap-3 text-[14px] font-medium tracking-[-0.01em] text-slate-700">
                <span className="shrink-0 text-[15px]">
                  📍
                </span>

                <span>
                  {localConfig.direccion}
                </span>
              </p>

              <p className="mt-3 flex items-start gap-3 text-[14px] font-medium tracking-[-0.01em] text-slate-700">
                <span className="shrink-0 text-[15px]">
                  🕘
                </span>

                <span>
                  {localConfig.horarios.lunesASabado}
                </span>
              </p>

              <p className="mt-0 pl-[32px] text-[14px] font-medium tracking-[-0.01em] text-slate-600">
                {localConfig.horarios.domingo}
              </p>
            </div>

            {/* Redes */}

            <div className="flex min-w-0 flex-col items-start justify-center px-10 py-7">
              <a
                href={contactoConfig.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-950"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <FaInstagram
                    size={21}
                    className="text-white"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-white">
                    Instagram
                  </h3>

                  <p className="mt-0.5 text-[12px] text-slate-300">
                    Seguinos para ver ofertas y novedades
                  </p>
                </div>
              </a>

              <p className="mt-6 text-[13px] font-medium tracking-[-0.01em] text-slate-400">
                © 2026 Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}