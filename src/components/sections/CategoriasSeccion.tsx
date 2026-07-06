import React from "react";

type CategoriasProps = {
  vista: string;
  busqueda: string;
  productos: any[];
  setCategoria: (categoria: string) => void;
  setMarca: (marca: string) => void;
  setVista: (vista: string) => void;
};

export default function CategoriasSeccion({
  vista,
  busqueda,
  productos,
  setCategoria,
  setMarca,
  setVista,
}: CategoriasProps) {
  if (vista !== "categorias") return null;
  if (busqueda !== "") return null;

  return (
    <section id="seccion-categorias" className="-mt-3 pb-5 scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[19px] font-bold text-blue-950 mb-1 -ml-2 mt-[4px]">
          Explorá nuestras categorías
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mt-0 -ml-2">
          {[...new Set(productos.map((p) => p.Categoría?.trim()))]
            .filter(Boolean)
            .map((categoria) => {
              const nombreCategoria = String(categoria).toLowerCase();

              const iconoCategoria =
                nombreCategoria.includes("pintura")
                  ? "pinturas.png"
                  : nombreCategoria.includes("pincel") ||
                    nombreCategoria.includes("rodillo")
                  ? "pinceles.png"
                  : nombreCategoria.includes("limpieza")
                  ? "limpieza.png"
                  : nombreCategoria.includes("piscina")
                  ? "piscina.png"
                  : nombreCategoria.includes("jardin") ||
                    nombreCategoria.includes("jardineria") ||
                    nombreCategoria.includes("jardinería")
                  ? "jardineria.png"
                  : nombreCategoria.includes("hogar")
                  ? "hogar.png"
                  : nombreCategoria.includes("aroma")
                  ? "aromatizantes.png"
                  : nombreCategoria.includes("plaga") ||
                    nombreCategoria.includes("insecticida")
                  ? "insecticidas.png"
                  : nombreCategoria.includes("electric")
                  ? "electricidad.png"
                  : nombreCategoria.includes("plastico") ||
                    nombreCategoria.includes("plástico")
                  ? "plasticos.png"
                  : "hogar.png";

              return (
                <button
                  key={String(categoria)}
                  onClick={() => {
                    setCategoria(String(categoria));

                    if (nombreCategoria.includes("pintura")) {
  setMarca("Todas");
  setVista("productos");
} else {
  setMarca("Todas");
  setVista("productos");
}
                  }}
                  className="group bg-white border border-gray-200 rounded-[16px] h-[112px] w-[118px] px-3 py-3 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex justify-center mb-2">
                    <img
                      src={`/iconos/categorias/${iconoCategoria}`}
                      alt={String(categoria)}
                      className="w-14 h-14 object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="font-semibold text-[13px] text-slate-900 leading-tight text-center break-words">
                    {categoria}
                  </h3>
                </button>
              );
            })}
        </div>
      </div>
    </section>
  );
}