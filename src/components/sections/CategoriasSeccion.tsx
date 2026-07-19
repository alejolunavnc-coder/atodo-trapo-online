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
  {
    categoria: "Pinturas",
    nombre: "Pinturas",
    icono: "pinturas.png",
  },
  {
    categoria: "Piscinas",
    nombre: "Piscinas",
    icono: "piscina.png",
  },
  {
    categoria: "Ofertas",
    nombre: "Ofertas",
    icono: "ofertas.png",
  },
  {
    categoria: "Limpieza",
    nombre: "Limpieza",
    icono: "limpieza.png",
  },
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
    categoria: "Iluminación",
    nombre: "Iluminación",
    icono: "iluminacion.png",
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

  const primeraFila = categoriasOrdenadas.slice(0, 6);
  const segundaFila = categoriasOrdenadas.slice(6);

  const renderCategoria = (
    cat: (typeof categoriasOrdenadas)[number]
  ) => {
    const activa = categoria === cat.categoria;

    return (
      <button
        key={cat.nombre}
        type="button"
        onClick={() => {
          setCategoria(cat.categoria);
          setMarca("Todas");
          setVista("productos");
        }}
        className={
          modoCompacto
            ? `group flex h-[84px] w-[130px] shrink-0 flex-col items-center justify-center rounded-[14px] border px-1.5 py-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                activa
                  ? "border-blue-950 bg-blue-50 ring-2 ring-blue-950/10"
                  : "border-gray-200 bg-white"
              }`
            : `group flex h-[96px] w-[150px] shrink-0 flex-col items-center justify-center rounded-[15px] border px-2 py-2.5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                activa
                  ? "border-blue-950 bg-blue-50 ring-2 ring-blue-950/10"
                  : "border-gray-200 bg-white"
              }`
        }
      >
        <div
          className={
            modoCompacto
              ? "mb-1 flex justify-center"
              : "mb-1.5 flex justify-center"
          }
        >
          <img
            src={`/iconos/categorias/${cat.icono}`}
            alt={cat.nombre}
            className={
              modoCompacto
                ? `h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105 ${
                    activa ? "scale-110" : ""
                  }`
                : "h-11 w-11 object-contain transition-transform duration-200 group-hover:scale-105"
            }
          />
        </div>

        <h3
          className={
            modoCompacto
              ? `line-clamp-2 text-center text-[10px] font-semibold leading-[1.05] ${
                  activa
                    ? "text-blue-950"
                    : "text-slate-900"
                }`
              : "break-words text-center text-[12px] font-semibold leading-tight text-slate-900"
          }
        >
          {cat.nombre}
        </h3>
      </button>
    );
  };

  return (
    <section
      id="seccion-categorias"
      className={`w-full scroll-mt-32 ${
        modoCompacto ? "pb-4 pt-2" : "-mt-3 pb-5"
      }`}
    >
      {!modoCompacto && (
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="mb-3 mt-[4px] text-[19px] font-bold text-blue-950">
            Explorá nuestras categorías
          </h2>
        </div>
      )}

      <div
        className={
          modoCompacto
            ? "flex w-full flex-col items-center gap-3"
            : "flex w-full flex-col items-center gap-4"
        }
      >
        <div
          className={
            modoCompacto
              ? "flex w-full justify-center gap-3"
              : "flex w-full justify-center gap-4"
          }
        >
          {primeraFila.map(renderCategoria)}
        </div>

        <div
          className={
            modoCompacto
              ? "flex w-full justify-center gap-3"
              : "flex w-full justify-center gap-4"
          }
        >
          {segundaFila.map(renderCategoria)}
        </div>
      </div>
    </section>
  );
}