import { FaInstagram } from "react-icons/fa";
import { negocioConfig } from "@/src/config/negocio";
import { contactoConfig } from "@/src/config/contacto";
import { localConfig } from "@/src/config/local";

export default function Footer() {
  return (
    <footer className="bg-slate-50 pt-3 pb-10">
      <div className="bg-white border border-gray-100 rounded-[22px] shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.05fr_1.25fr_1fr]">
          {/* Logo */}
          <div className="flex items-center gap-4 px-8 py-7">
            <img
              src={negocioConfig.logo}
              alt={negocioConfig.nombre}
              className="w-44 object-contain"
            />

            <div className="leading-tight">
              <h2 className="text-[18px] font-extrabold text-teal-700 tracking-[-0.03em] leading-tight">
                {negocioConfig.nombre}
              </h2>

              <p className="text-[13px] font-medium text-slate-500 mt-1 leading-snug">
                {negocioConfig.subtitulo}
              </p>
            </div>
          </div>

          {/* Dirección */}
          <div className="border-l border-r border-gray-200 px-10 py-7 flex flex-col justify-center">
            <p className="flex items-center gap-3 text-[14px] font-medium text-slate-700 tracking-[-0.01em]">
              <span className="text-[15px]">📍</span>
              {localConfig.direccion}
            </p>

            <p className="flex items-center gap-3 text-[14px] font-medium text-slate-700 tracking-[-0.01em] mt-3">
              <span className="text-[15px]">🕘</span>
              {localConfig.horarios.lunesASabado}
            </p>

            <p className="pl-[32px] text-[14px] font-medium text-slate-600 tracking-[-0.01em] mt-0">
              {localConfig.horarios.domingo}
            </p>
          </div>

          {/* Redes */}
          <div className="px-10 py-7 flex flex-col justify-center items-start">
            <a
              href={contactoConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 bg-slate-900 hover:bg-blue-950 border border-slate-700 rounded-2xl px-5 py-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <FaInstagram size={21} className="text-white" />
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-white">
                  Instagram
                </h3>

                <p className="text-[12px] text-slate-300 mt-0.5">
                  Seguinos para ver ofertas y novedades
                </p>
              </div>
            </a>

            <p className="text-[13px] font-medium text-slate-400 tracking-[-0.01em] mt-6">
              © 2026 Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
