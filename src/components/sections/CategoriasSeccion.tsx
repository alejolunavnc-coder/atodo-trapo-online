import React from "react";

type CategoriasProps = {
  vista: string;
  busqueda: string;
  productos: any[];
  setCategoria: (categoria: string) => void;
  setMarca: (marca: string) => void;
  setVista: (vista: string) => void;
};

const categoriasOrdenadas = [
  { categoria: "Pinturas", nombre: "Pinturas", icono: "pinturas.png" },
  { categoria: "Piscinas", nombre: "Piscinas", icono: "piscina.png" },
  { categoria: "Ofertas", nombre: "Ofertas", icono: "ofertas.png" },
  { categoria: "Limpieza", nombre: "Limpieza", icono: "limpieza.png" },
  { categoria: "Auto", nombre: "Auto y Moto", icono: "auto-y-moto.png" },
  { categoria: "Aromatizantes", nombre: "Aromatizantes", icono: "aromatizantes.png" },
  { categoria: "Plasticos", nombre: "Plásticos", icono: "plasticos.png" },
  { categoria: "Jardinería", nombre: "Jardinería", icono: "jardineria.png" },
  { categoria: "Control Plagas", nombre: "Control Plagas", icono: "control-plagas.png" },
  { categoria: "Accesorios", nombre: "Accesorios", icono: "accesorios.png" },
];

export default function CategoriasSeccion({
  vista,
  busqueda,
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
          {categoriasOrdenadas.map((cat) => (
            <button
              key={cat.nombre}
              onClick={() => {
                setCategoria(cat.categoria);
                setMarca("Todas");
                setVista("productos");
              }}
              className="group bg-white border border-gray-200 rounded-[16px] h-[112px] w-[118px] px-3 py-3 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex justify-center mb-2">
                <img
                  src={`/iconos/categorias/${cat.icono}`}
                  alt={cat.nombre}
                  className="w-14 h-14 object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              <h3 className="font-semibold text-[13px] text-slate-900 leading-tight text-center break-words">
                {cat.nombre}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}