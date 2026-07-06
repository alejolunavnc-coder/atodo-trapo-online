import { FaWhatsapp } from "react-icons/fa";
import { contactoConfig } from "@/src/config/contacto";
import type { Producto } from "@/src/types/producto";

type MenuPrincipalProps = {
  productos: Producto[];
  setCategoria: (categoria: string) => void;
  setMarca: (marca: string) => void;
  setVista: (vista: string) => void;
};

export default function MenuPrincipal({
  productos,
  setCategoria,
  setMarca,
  setVista,
}: MenuPrincipalProps) {
  return (
    <nav className="hidden md:block bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-[54px] px-6 flex items-center justify-between">
        <div className="flex items-center gap-10 ml-[80px] text-[14px] font-semibold text-[#162a63]">
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="relative font-semibold text-[#162a63] hover:text-[#0d3fb8] transition-colors duration-200"
          >
            Inicio
            <span className="absolute left-0 -bottom-[17px] w-full h-[3px] bg-yellow-400 rounded-full"></span>
          </button>

          {["Pinturas", "Piscina"].map((categoriaMenu) => {
            const marcasCategoria = [
              ...new Set(
                productos
                  .filter((p) => p.Categoría?.trim() === categoriaMenu)
                  .map((p) => p.Marca?.trim())
              ),
            ].filter(Boolean);

            const tieneMarcas = marcasCategoria.length > 0;

            if (tieneMarcas) {
              return (
                <div
                  key={categoriaMenu}
                  className="relative group h-[54px] flex items-center"
                >
                  <button className="flex items-center gap-1 font-semibold text-[#162a63] hover:text-[#0d3fb8] transition-colors duration-200">
                    {categoriaMenu}
                    <span className="text-[10px] mt-0.5">▼</span>
                  </button>

                  <div className="absolute left-0 top-[54px] w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.16)] p-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-[80]">
                    {marcasCategoria.map((marca) => (
                      <button
                        key={String(marca)}
                        onClick={() => {
                          setCategoria(categoriaMenu);
                          setMarca(String(marca));
                          setVista("productos");

                          setTimeout(() => {
                            document.getElementById("productos")?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }, 50);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl text-[14px] font-medium text-[#162a63] hover:bg-yellow-50 hover:text-[#0d3fb8] transition-all duration-200"
                      >
                        {String(marca)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={categoriaMenu}
                onClick={() => {
                  setCategoria(categoriaMenu);
                  setMarca("");
                  setVista("productos");

                  setTimeout(() => {
                    document.getElementById("productos")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 50);
                }}
                className="font-semibold text-[#162a63] hover:text-[#0d3fb8] transition-colors duration-200"
              >
                {categoriaMenu}
              </button>
            );
          })}
        </div>

        <a
          href={`https://wa.me/${contactoConfig.whatsapp}?text=${encodeURIComponent(
            "¡Hola! Tengo una consulta por un producto."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1FAF5A] hover:bg-[#198F49] text-white px-5 py-2 rounded-xl text-[14px] font-semibold transition shadow-sm"
        >
          <FaWhatsapp size={17} />
          <span>Consultanos por WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}