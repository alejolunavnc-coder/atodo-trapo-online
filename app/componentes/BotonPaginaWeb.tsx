"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function BotonPaginaWeb() {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const cerrarTarjeta = () => {
    setCerrando(true);

    setTimeout(() => {
      setAbierto(false);
      setCerrando(false);
    }, 180);
  };

  return (
    <>
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed left-4 top-[30%] -translate-y-1/2 z-[9999] w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <img
            src="/iconoweb.png"
            alt="Página web"
            className="w-[44px] h-[44px] object-contain scale-115"
          />
        </button>
      )}

      {abierto && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={cerrarTarjeta}
          />

          <div
  onClick={(e) => e.stopPropagation()}
  className={`fixed left-4 top-1/2 -translate-y-1/2 z-[9999]
  w-[235px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
  transition-all duration-200 ease-out
  ${
    cerrando
      ? "opacity-0 scale-95 pointer-events-none"
      : "opacity-100 scale-100"
  }`}
>
            <div className="bg-blue-950 text-white p-4 relative">
              <button
                onClick={cerrarTarjeta}
                className="absolute top-3 right-3 text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>

              <img
                src="/iconoweb.png"
                alt="Página web"
                className="w-[58px] h-[58px] object-contain mx-auto mb-2"
              />

              <h3 className="text-[19px] font-extrabold text-center">
                ¿Querés una página así?
              </h3>

              <p className="text-blue-100 text-center text-[12px] mt-2 leading-relaxed">
                Diseñamos páginas web modernas y adaptadas a cada negocio.
              </p>
            </div>

            <div className="p-4">
              <ul className="space-y-2 text-[12px] text-slate-700 mb-4">
                <li>✅ Diseño profesional</li>
                <li>✅ Catálogo online</li>
                <li>✅ WhatsApp integrado</li>
                <li>✅ Adaptada a celulares y PC</li>
              </ul>

              <a
                href="https://wa.me/543786519078?text=Hola!%20Estoy%20pensando%20en%20crear%20una%20página%20web%20para%20mi%20negocio..."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold text-center py-2.5 rounded-xl transition text-[13px]"
              >
                Quiero saber más
              </a>

              <button
                onClick={cerrarTarjeta}
                className="w-full mt-2 text-[12px] font-semibold text-slate-400 hover:text-slate-600"
              >
                No, gracias
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}