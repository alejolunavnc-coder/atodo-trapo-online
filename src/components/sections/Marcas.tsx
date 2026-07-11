import React, { useEffect, useRef, useState } from "react";

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
  const carruselRef = useRef<HTMLDivElement>(null);

  const [mostrarFlechaIzquierda, setMostrarFlechaIzquierda] =
    useState(false);

  const [mostrarFlechaDerecha, setMostrarFlechaDerecha] =
    useState(false);

  const esPinturas = categoria
    ?.trim()
    .toLowerCase()
    .includes("pintura");

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

  const actualizarFlechas = () => {
    const carrusel = carruselRef.current;

    if (!carrusel) return;

    const margen = 4;

    const llegoAlInicio = carrusel.scrollLeft <= margen;

    const llegoAlFinal =
      carrusel.scrollLeft + carrusel.clientWidth >=
      carrusel.scrollWidth - margen;

    setMostrarFlechaIzquierda(!llegoAlInicio);
    setMostrarFlechaDerecha(!llegoAlFinal);
  };

  useEffect(() => {
    const carrusel = carruselRef.current;

    if (!carrusel) return;

    const revisarCarrusel = () => {
      actualizarFlechas();
    };

    const frame = requestAnimationFrame(revisarCarrusel);

    carrusel.addEventListener("scroll", revisarCarrusel);
    window.addEventListener("resize", revisarCarrusel);

    return () => {
      cancelAnimationFrame(frame);
      carrusel.removeEventListener("scroll", revisarCarrusel);
      window.removeEventListener("resize", revisarCarrusel);
    };
  }, [productos, categoria, vista]);

  if (vista !== "marcas" && vista !== "productos") return null;
  if (!esPinturas) return null;

  const normalizarSubcategoria = (valor: string) =>
    String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "y")
      .replace(/[\/_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const imagenesSubcategorias: Record<string, string> = {
    todas: "todas.png",

    aerosol: "aerosoles.png",
    aerosoles: "aerosoles.png",

    enduido: "enduidos.png",
    enduidos: "enduidos.png",

    madera: "madera.png",
    maderas: "madera.png",

    interior: "pintura-interior.png",
    "pintura interior": "pintura-interior.png",

    exterior: "pintura-exterior.png",
    "pintura exterior": "pintura-exterior.png",

    "interior exterior": "pintura-int-ext.png",
    "int ext": "pintura-int-ext.png",
    "pintura int ext": "pintura-int-ext.png",
    "pintura interior exterior": "pintura-int-ext.png",

    piscina: "piscinas.png",
    piscinas: "piscinas.png",
    "p piscinas": "piscinas.png",
    "pinturas para piscinas": "piscinas.png",

    piso: "pisos.png",
    pisos: "pisos.png",
    "pintura para pisos": "pisos.png",

    sellador: "sellador-fijador.png",
    fijador: "sellador-fijador.png",
    "sellador fijador": "sellador-fijador.png",
    "selladores y fijadores": "sellador-fijador.png",

    sintetico: "sintetico-3-en-1.png",
    "sintetico 3 en 1": "sintetico-3-en-1.png",

    texturado: "texturado.png",
    texturados: "texturado.png",

    pinceles: "pinceles-y-rodillos.png",
    rodillos: "pinceles-y-rodillos.png",
    "pinceles y rodillos": "pinceles-y-rodillos.png",
  };

  const nombresVisibles: Record<string, string> = {
    todas: "Todas",

    "p piscinas": "Piscinas",
    "pinturas para piscinas": "Piscinas",

    "interior exterior": "Interior / Exterior",
    "int ext": "Interior / Exterior",
    "pintura int ext": "Interior / Exterior",
    "pintura interior exterior": "Interior / Exterior",

    "selladores y fijadores": "Sellador / Fijador",

    "sintetico 3 en 1": "Sintético 3 en 1",

    pinceles: "Pinceles y Rodillos",
    rodillos: "Pinceles y Rodillos",
    "pinceles y rodillos": "Pinceles y Rodillos",
  };

  const moverCarrusel = (
    direccion: "izquierda" | "derecha"
  ) => {
    carruselRef.current?.scrollBy({
      left: direccion === "derecha" ? 500 : -500,
      behavior: "smooth",
    });
  };

  return (
    <section id="seccion-marcas" className="pt-5 pb-7">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative">
          {mostrarFlechaIzquierda && (
            <button
              type="button"
              onClick={() => moverCarrusel("izquierda")}
              aria-label="Ver subcategorías anteriores"
              className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[25px] font-bold text-blue-950 shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition hover:scale-105 hover:bg-blue-50 active:scale-95"
            >
              ‹
            </button>
          )}

          <div
            ref={carruselRef}
            onScroll={actualizarFlechas}
            className="overflow-x-auto scroll-smooth px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max gap-4">
              {subcategorias.map((subcategoria) => {
                const subcategoriaTexto = String(subcategoria);

                const claveSubcategoria =
                  normalizarSubcategoria(subcategoriaTexto);

                const imagen =
                  imagenesSubcategorias[claveSubcategoria] ||
                  "pintura-int-ext.png";

                const nombreVisible =
                  nombresVisibles[claveSubcategoria] ||
                  subcategoriaTexto;

                const activa = marca === subcategoriaTexto;

                return (
                  <button
                    key={subcategoriaTexto}
                    onClick={() => {
  setMarca(subcategoriaTexto);
  setVista("productos");
}}
                    className={`group w-[150px] shrink-0 overflow-hidden rounded-[18px] border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                      activa
                        ? "border-[#F8A400] ring-2 ring-[#F8A400]/20"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="relative h-[105px] w-full overflow-hidden bg-gray-100">
                      <img
                        src={`/iconos/subcategorias/${imagen}`}
                        alt={nombreVisible}
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          activa ? "scale-[1.03]" : ""
                        }`}
                      />

                      {activa && (
                        <div className="absolute inset-0 bg-[#F8A400]/10" />
                      )}
                    </div>

                    <div className="flex min-h-[48px] items-center px-3 py-2">
                      <span
                        className={`line-clamp-2 text-[12px] font-bold leading-tight ${
                          activa
                            ? "text-[#F8A400]"
                            : "text-blue-950"
                        }`}
                      >
                        {nombreVisible}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {mostrarFlechaDerecha && (
            <button
              type="button"
              onClick={() => moverCarrusel("derecha")}
              aria-label="Ver más subcategorías"
              className="absolute right-0 top-1/2 z-20 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[25px] font-bold text-blue-950 shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition hover:scale-105 hover:bg-blue-50 active:scale-95"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
}