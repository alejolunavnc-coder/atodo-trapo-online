
"use client";

/* Imports */

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";


import BotonPaginaWeb from "@/src/components/productos/BotonPaginaWeb";
import type { Producto } from "@/src/types/producto";
import type { CarritoItem } from "@/src/types/carrito";
import BannerPrincipal from "@/src/components/layout/BannerPrincipal";
import HeaderPC from "@/src/components/layout/HeaderPC";
import Footer from "@/src/components/layout/Footer";
import Beneficios from "@/src/components/sections/Beneficios";
import PorqueElegirnos from "@/src/components/sections/PorqueElegirnos";
import Marcas from "@/src/components/sections/Marcas";
import CategoriasSeccion from "@/src/components/sections/CategoriasSeccion";
import Productos from "@/src/components/productos/Productos";
import CarritoLateral from "@/src/components/carrito/CarritoLateral";
import useProductos from "@/src/hooks/useProductos";
import OfertasDestacadas from "@/src/components/ofertas/OfertasDestacadas";
import useCarrito from "@/src/hooks/useCarrito";
import ResultadosBusqueda from "@/src/components/busqueda/ResultadosBusqueda";
import DetalleProducto from "@/src/components/detalle/DetalleProducto";
import MenuPrincipal from "@/src/components/menu/MenuPrincipal";
import DesktopShell from "@/src/components/desktop/home/DesktopShell";
import DesktopCatalogSection from "@/src/components/desktop/home/DesktopCatalogSection";

/* Componente principal */

export default function DesktopHome() {

  /* Estados */


  const [vista, setVista] = useState("categorias");
  const [subcategoria, setSubcategoria] = useState("Todas");
  const [categoria, setCategoria] = useState("");
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [carritoAnimado, setCarritoAnimado] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [coloresSeleccionados, setColoresSeleccionados] = useState<any>({});
  const [fraganciasSeleccionadas, setFraganciasSeleccionadas] = useState<any>({});
  const [tamanosSeleccionados, setTamanosSeleccionados] = useState<any>({});
  const [busqueda, setBusqueda] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [grupoDetalle, setGrupoDetalle] = useState<any>(null);
  const panelDetalleRef = useRef<HTMLDivElement>(null);
  const resultadosBusquedaRef = useRef<HTMLDivElement>(null);
  const [productoAbierto, setProductoAbierto] = useState<number | null>(null);
  const [productoBusquedaAbierto, setProductoBusquedaAbierto] = useState<number | null>(null);
  const ofertasRef = useRef<HTMLElement>(null);
  const [bannerActual, setBannerActual] = useState(0);
  const [posicionAntesBusqueda, setPosicionAntesBusqueda] = useState(0);
  const [busquedaActiva, setBusquedaActiva] = useState(false);
  const {
    agregarAlCarrito,
    vaciarCarrito,
    eliminarDelCarrito,
  } = useCarrito(
    carrito,
    setCarrito,
    setCarritoAnimado
  );
  const {
    productosBuscados,
    productosAgrupados,
    ofertasAgrupadas,
    productoDetalle,
  } = useProductos({
  productos,
  categoria,
  subcategoria,
    busqueda,
    grupoDetalle,
    tamanosSeleccionados,
    coloresSeleccionados,
    fraganciasSeleccionadas,
  });

  /* useEffect */

  useEffect(() => {
    Papa.parse(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=0&single=true&output=csv",
      {
        download: true,
        header: true,
        complete: (resultado: Papa.ParseResult<Producto>) => {
          setProductos(resultado.data);

        },
      }
    );
  }, []);

  useEffect(() => {
    if (busqueda.trim() === "") return;

    setTimeout(() => {
      resultadosBusquedaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }, [busqueda]);


  /* Render */

  return (
  <DesktopShell>

      <HeaderPC
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        busquedaActiva={busquedaActiva}
        setBusquedaActiva={setBusquedaActiva}
        setPosicionAntesBusqueda={setPosicionAntesBusqueda}
        ofertasRef={ofertasRef}
        carrito={carrito}
        carritoAnimado={carritoAnimado}
        setMostrarCarrito={setMostrarCarrito}
      />

      <CarritoLateral
        mostrarCarrito={mostrarCarrito}
        setMostrarCarrito={setMostrarCarrito}
        carrito={carrito}
        setCarrito={setCarrito}
        productos={productos}
      />

      {/* Menú normal */}
      <MenuPrincipal
  productos={productos}
  setCategoria={setCategoria}
  setMarca={setSubcategoria}
  setVista={setVista}
/>

      <BannerPrincipal
        bannerActual={bannerActual}
        setBannerActual={setBannerActual}
      />

      <Beneficios />

      {/* Contenedor principal del catálogo */}

      <DesktopCatalogSection>

          <div className="col-span-3"></div>

          <ResultadosBusqueda
            busqueda={busqueda}
            resultadosBusquedaRef={resultadosBusquedaRef}
            productosBuscados={productosBuscados}
            productoBusquedaAbierto={productoBusquedaAbierto}
            setProductoBusquedaAbierto={setProductoBusquedaAbierto}
            tamanosSeleccionados={tamanosSeleccionados}
            coloresSeleccionados={coloresSeleccionados}
            fraganciasSeleccionadas={fraganciasSeleccionadas}
            setTamanosSeleccionados={setTamanosSeleccionados}
            setColoresSeleccionados={setColoresSeleccionados}
            setFraganciasSeleccionadas={setFraganciasSeleccionadas}
            agregarAlCarrito={agregarAlCarrito}
          />


          <CategoriasSeccion
  vista={vista}
  busqueda={busqueda}
  productos={productos}
  setCategoria={setCategoria}
  setMarca={setSubcategoria}
  setVista={setVista}
/>

          <Marcas
  vista={vista}
  productos={productos}
  categoria={categoria}
  marca={subcategoria}
  setMarca={setSubcategoria}
  setVista={setVista}
/>

          <Productos
  vista={vista}
  marca={subcategoria}
            categoria={categoria}
            productosAgrupados={productosAgrupados}
            tamanosSeleccionados={tamanosSeleccionados}
            coloresSeleccionados={coloresSeleccionados}
            fraganciasSeleccionadas={fraganciasSeleccionadas}
            setTamanosSeleccionados={setTamanosSeleccionados}
            setColoresSeleccionados={setColoresSeleccionados}
            setFraganciasSeleccionadas={setFraganciasSeleccionadas}
            productoAbierto={productoAbierto}
            setProductoAbierto={setProductoAbierto}
            setGrupoDetalle={setGrupoDetalle}
            setDetalleAbierto={setDetalleAbierto}
            agregarAlCarrito={agregarAlCarrito}
          />

          {vista === "categorias" && busqueda === "" && (
  <OfertasDestacadas
    ofertasRef={ofertasRef}
    ofertasAgrupadas={ofertasAgrupadas}
    tamanosSeleccionados={tamanosSeleccionados}
    coloresSeleccionados={coloresSeleccionados}
    fraganciasSeleccionadas={fraganciasSeleccionadas}
    setTamanosSeleccionados={setTamanosSeleccionados}
    setColoresSeleccionados={setColoresSeleccionados}
    setFraganciasSeleccionadas={setFraganciasSeleccionadas}
    agregarAlCarrito={agregarAlCarrito}
  />
)}

          <PorqueElegirnos />

        </DesktopCatalogSection>

      <Footer />


      {/* Botón flotante búsqueda eliminado */}

      <DetalleProducto
        detalleAbierto={detalleAbierto}
        grupoDetalle={grupoDetalle}
        productoDetalle={productoDetalle}
        setDetalleAbierto={setDetalleAbierto}
        panelDetalleRef={panelDetalleRef}
        mostrarCarrito={mostrarCarrito}
        setMostrarCarrito={setMostrarCarrito}
        carritoAnimado={carritoAnimado}
        carrito={carrito}
        eliminarDelCarrito={eliminarDelCarrito}
        vaciarCarrito={vaciarCarrito}
        agregarAlCarrito={agregarAlCarrito}
        tamanosSeleccionados={tamanosSeleccionados}
        coloresSeleccionados={coloresSeleccionados}
        fraganciasSeleccionadas={fraganciasSeleccionadas}
        setTamanosSeleccionados={setTamanosSeleccionados}
        setColoresSeleccionados={setColoresSeleccionados}
        setFraganciasSeleccionadas={setFraganciasSeleccionadas}
      />



      {/* Botón flotante carrito eliminado en PC */}

      {/* Botón volver flotante */}
      {(vista !== "categorias" || busqueda !== "") && !detalleAbierto && (
        <button
          onClick={() => {
            if (busqueda !== "") {
              setBusqueda("");
              setBusquedaActiva(false);

              setTimeout(() => {
                window.scrollTo({
                  top: posicionAntesBusqueda,
                  behavior: "smooth",
                });
              }, 50);

              return;
            }

            if (vista === "productos") {
              if (categoria.toLowerCase().includes("pintura")) {
                setVista("marcas");

                setTimeout(() => {
                  document
                    .getElementById("seccion-marcas")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }, 100);
              } else {
                setVista("categorias");
                setSubcategoria("Todas");

                setTimeout(() => {
                  document
                    .getElementById("seccion-categorias")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }, 100);
              }
            } else if (vista === "marcas") {
              setVista("categorias");
              setSubcategoria("Todas");

              setTimeout(() => {
                document
                  .getElementById("seccion-categorias")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }, 100);
            }
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
               flex items-center gap-3
               bg-white/95 backdrop-blur-md
               border border-gray-200
               rounded-full
               px-3 py-2
               shadow-[0_12px_35px_rgba(0,0,0,0.18)]
               hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]
               hover:-translate-y-1
               transition-all duration-300"
        >
          <div className="w-9 h-9 rounded-full bg-blue-950 flex items-center justify-center text-white text-lg shadow-sm">
            ←
          </div>

          <span className="pr-2 text-[15px] font-extrabold tracking-[-0.02em] text-blue-950">
            Volver
          </span>
        </button>
      )}

      {/* Botón flotante WhatsApp eliminado */}



      {/* Últimas secciones de la página */}

      <BotonPaginaWeb />

    </DesktopShell>
  );
  
}


