import React from "react";

type MarcasProps = {
  vista: string;
  productos: any[];
  categoria: string;
  setMarca: (marca: string) => void;
  marca: string;
  setVista: (vista: string) => void;
};

export default function Marcas({
  vista,
  productos,
  categoria,
  marca,
setMarca,
setVista,
}: MarcasProps) {
  if (vista !== "marcas" && vista !== "productos") return null;

  const esPinturas = categoria?.trim().toLowerCase().includes("pintura");

  if (!esPinturas) return null;

  const subcategorias = [
    "Todas",
    ...Array.from(
      new Set(
        productos
          .filter(
            (p) =>
              p.Categoría?.trim().toLowerCase() ===
              categoria?.trim().toLowerCase()
          )
          .map((p) => p.Subcategoría?.trim())
          .filter(Boolean)
      )
    ),
  ];

  return (
    <section id="seccion-marcas" className="-mt-4 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[22px] font-bold text-blue-950 mb-4 -ml-2 mt-[4px]">
          Pinturas
        </h2>

        <div className="flex flex-wrap gap-3 -ml-2">
          {subcategorias.map((subcategoria) => (
            <button
              key={String(subcategoria)}
              onClick={() => {
  setMarca(String(subcategoria));

  setVista("productos");

                setTimeout(() => {
                  document.getElementById("productos")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 50);
              }}
              className={`px-5 py-2.5 rounded-full border font-bold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
  marca === subcategoria
    ? "bg-blue-950 text-white border-blue-950"
    : "bg-white text-blue-950 border-gray-200"
}`}
            >
              {String(subcategoria)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}