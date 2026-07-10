import React from "react";

type CategoriasProps = {
  vista: string;
  busqueda: string;
  productos: any[];
  categoria: string;
  setCategoria: (categoria: string) => void;
  setMarca: (marca: string) => void;
  setVista: (vista: string) => void;
};

const categoriasOrdenadas = [
  { categoria: "Pinturas", nombre: "Pinturas", icono: "pinturas.png" },
  { categoria: "Piscinas", nombre: "Piscinas", icono: "piscina.png" },
  { categoria: "Ofertas", nombre: "Ofertas", icono: "ofertas.png" },
  { categoria: "Limpieza", nombre: "Limpieza", icono: "limpieza.png" },
  {
    categoria: "Auto y Moto",
    nombre: "Auto y Moto",
    icono: "auto-y-moto.png",
  },
  {
    categoria: "Aromatizantes",
    nombre: "Aromatizantes",
    icono: "aromatizantes.png",
  },
  {
    categoria: "Plasticos",
    nombre: "Plásticos",
    icono: "plasticos.png",
  },
  {
    categoria: "Jardinería",
    nombre: "Jardinería",
    icono: "jardineria.png",
  },
  {
    categoria: "Control Plagas",
    nombre: "Control Plagas",
    icono: "control-plagas.png",
  },
  {
    categoria: "Accesorios",
    nombre: "Accesorios",
    icono: "accesorios.png",
  },
];

export default function CategoriasSeccion({
  vista,
  busqueda,
  categoria,
  setCategoria,
  setMarca,
  setVista,
}: CategoriasProps) {
  if (busqueda !== "") return null;

  const modoCompacto = vista !== "categorias";

  return (
    <section
      id="seccion-categorias"
      className={`scroll-mt-32 ${
        modoCompacto ? "pt-2 pb-4" : "-mt-3 pb-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        {!modoCompacto && (
          <h2 className="mb-1 -ml-2 mt-[4px] text-[19px] font-bold text-blue-950">
            Explorá nuestras categorías
          </h2>
        )}

        <div
          className={
            modoCompacto
              ? "grid grid-cols-10 gap-3"
              : "mt-0 -ml-2 grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-8"
          }
        >
          {categoriasOrdenadas.map((cat) => {
            const activa = categoria === cat.categoria;

            return (
              <button
                key={cat.nombre}
                onClick={() => {
                  setCategoria(cat.categoria);
                  setMarca("Todas");
                  setVista("productos");
                }}
                className={
                  modoCompacto
                    ? `group flex h-[88px] min-w-0 flex-col items-center justify-center rounded-[14px] border px-1.5 py-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        activa
                          ? "border-blue-950 bg-blue-50 ring-2 ring-blue-950/10"
                          : "border-gray-200 bg-white"
                      }`
                    : "group h-[112px] w-[118px] rounded-[16px] border border-gray-200 bg-white px-3 py-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                }
              >
                <div
                  className={
                    modoCompacto
                      ? "mb-1 flex justify-center"
                      : "mb-2 flex justify-center"
                  }
                >
                  <img
                    src={`/iconos/categorias/${cat.icono}`}
                    alt={cat.nombre}
                    className={
                      modoCompacto
                        ? `h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105 ${
                            activa ? "scale-110" : ""
                          }`
                        : "h-14 w-14 object-contain transition-transform duration-200 group-hover:scale-105"
                    }
                  />
                </div>

                <h3
                  className={
                    modoCompacto
                      ? `line-clamp-2 text-center text-[10px] font-semibold leading-[1.05] ${
                          activa ? "text-blue-950" : "text-slate-900"
                        }`
                      : "break-words text-center text-[13px] font-semibold leading-tight text-slate-900"
                  }
                >
                  {cat.nombre}
                </h3>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}