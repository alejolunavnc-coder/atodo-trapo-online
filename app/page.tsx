
"use client";

/* Imports */

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

import TarjetaProducto from "./componentes/TarjetaProducto";
import SelectorProducto from "./componentes/SelectorProducto";
import BotonPaginaWeb from "./componentes/BotonPaginaWeb";

import {
  Truck,
  CircleDashed,
  Waves,
  CreditCard,
  MapPin,
  Clock3,
  BadgePercent,
  MessagesSquare,
  ShoppingBasket,
  PaintBucket,
  Brush,
  SprayCan,
  Leaf,
  House,
  Package,
  Bug,
  Sparkles,
  Lightbulb,
} from "lucide-react";

import {
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa";

/* Tipos */

type Producto = {
  Categoría: string;
  Emoji: string;
  Marca: string;
  Linea: string;
  Nombre: string;
  Tamaño: string;
  Color: string;
  Precio: string;
  "Precio oferta": string;
  Oferta: string;
  Imagen: string;
  Fragancias: string;
  Aromas: string;
};

/* Componente principal */

export default function Home() {

  /* Estados */

const [mostrarMas, setMostrarMas] = useState(false);
const [vista, setVista] = useState("categorias");
const [marca, setMarca] = useState("");
const [categoria, setCategoria] = useState("");
const [carrito, setCarrito] = useState<{ nombre: string; precio: number }[]>([]);
const [mostrarCarrito, setMostrarCarrito] = useState(false);
const [carritoAnimado, setCarritoAnimado] = useState(false);
const [productos, setProductos] = useState<Producto[]>([]);
const [seleccionados, setSeleccionados] = useState<any>({});
const [coloresSeleccionados, setColoresSeleccionados] = useState<any>({});
const [fraganciasSeleccionadas, setFraganciasSeleccionadas] = useState<any>({});
const [tamanosSeleccionados, setTamanosSeleccionados] = useState<any>({});
const [busqueda, setBusqueda] = useState("");
const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
const [detalleAbierto, setDetalleAbierto] = useState(false);
const [grupoDetalle, setGrupoDetalle] = useState<any>(null);
const inputBusquedaRef = useRef<HTMLInputElement>(null);
const panelDetalleRef = useRef<HTMLDivElement>(null);
const resultadosBusquedaRef = useRef<HTMLDivElement>(null);
const [altoPanelDetalle, setAltoPanelDetalle] = useState(0);
const [productoAbierto, setProductoAbierto] = useState<number | null>(null);
const [productoBusquedaAbierto, setProductoBusquedaAbierto] = useState<number | null>(null);

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

useEffect(() => {
  if (!detalleAbierto || !panelDetalleRef.current) return;

  const medirPanel = () => {
    const alto = panelDetalleRef.current?.offsetHeight || 0;
    setAltoPanelDetalle(alto);
  };

  medirPanel();

  window.addEventListener("resize", medirPanel);

  return () => {
    window.removeEventListener("resize", medirPanel);
  };
}, [detalleAbierto, grupoDetalle]);

/* Funciones */

function agregarAlCarrito(nombre: string, precio: number) {
  setCarrito([
    ...carrito,
    {
      nombre,
      precio,
    },
  ]);

  setCarritoAnimado(true);

  setTimeout(() => {
    setCarritoAnimado(false);
  }, 300);
}

/* Datos calculados */

const productosEnOferta = productos.filter(
  (producto) => producto.Oferta?.trim().toLowerCase() === "si"
);

const productosFiltrados = productos.filter(
  (producto) =>
    producto.Marca?.trim() === marca &&
    producto.Categoría?.trim() === categoria
);
const productosBuscados = Object.values(
  
  
  productos
    .filter((producto) =>
      (
  (producto.Nombre || "") +
  " " +
  (producto.Marca || "") +
  " " +
  (producto.Linea || "") +
  " " +
  (producto.Color || "") +
  " " +
  (producto.Fragancias || "") +
  " " +
  (producto.Aromas || "") +
  " " +
  (producto.Tamaño || "") +
  " " +
  (producto.Categoría || "")
)
.toLowerCase()
.includes(busqueda.trim().toLowerCase())
    )
    .reduce(
      (
        acc: Record<
          string,
          {
            nombre: string;
            linea: string;
            items: Producto[];
          }
        >,
        producto: Producto
      ) => {

        const clave = producto.Linea + "-" + producto.Nombre;

        if (!acc[clave]) {
          acc[clave] = {
            nombre: producto.Nombre,
            linea: producto.Linea,
            items: [],
          };
        }

        acc[clave].items.push(producto);

        return acc;

      },
      {}
    )
);

const productosAgrupados: {
  nombre: string;
  linea: string;
  items: Producto[];
}[] = Object.values(
  productosFiltrados.reduce((acc: Record<string, {
  nombre: string;
  linea: string;
  items: Producto[];
}>, producto: Producto) => {

    const clave =
      producto.Linea + "-" + producto.Nombre;

    if (!acc[clave]) {
      acc[clave] = {
        nombre: producto.Nombre,
        linea: producto.Linea,
        items: [],
      };
    }

    acc[clave].items.push(producto);

    return acc;

  }, {})
);
const ofertasAgrupadas: {
  nombre: string;
  linea: string;
  items: Producto[];
}[] = Object.values(
  productosEnOferta.reduce(
    (
      acc: Record<
        string,
        {
          nombre: string;
          linea: string;
          items: Producto[];
        }
      >,
      producto: Producto
    ) => {
      const clave = producto.Linea + "-" + producto.Nombre;

      if (!acc[clave]) {
        acc[clave] = {
          nombre: producto.Nombre,
          linea: producto.Linea,
          items: [],
        };
      }

      acc[clave].items.push(producto);

      return acc;
    },
    {}
  )
);

const productoDetalle =
  grupoDetalle
    ? grupoDetalle.grupo.items.find((item:any) => {
        if (grupoDetalle.grupo.items.some((i:any) => i.Color?.trim())) {
          return (
            item.Tamaño ===
              (tamanosSeleccionados["detalle"+grupoDetalle.index] ||
                grupoDetalle.grupo.items[0].Tamaño)
            &&
            item.Color ===
              (coloresSeleccionados["detalle"+grupoDetalle.index] ||
                grupoDetalle.grupo.items[0].Color)
          );
        }

        if (grupoDetalle.grupo.items.some((i:any) => i.Fragancias?.trim())) {
          return (
            item.Tamaño ===
              (tamanosSeleccionados["detalle"+grupoDetalle.index] ||
                grupoDetalle.grupo.items[0].Tamaño)
            &&
            item.Fragancias ===
              (fraganciasSeleccionadas["detalle"+grupoDetalle.index] ||
                grupoDetalle.grupo.items[0].Fragancias)
          );
        }

        return (
          item.Tamaño ===
          (tamanosSeleccionados["detalle"+grupoDetalle.index] ||
            grupoDetalle.grupo.items[0].Tamaño)
        );
      })
    : null;

/* Render */
    
    return (
    <main className="min-h-screen bg-gray-100 overflow-x-clip max-w-full">

{/* Barra azul superior */}
<div className="hidden md:block bg-blue-950 text-white/95 text-[12px] font-medium tracking-wide">
  <div className="max-w-7xl mx-auto px-6 h-8 grid grid-cols-3 items-center">
    <div className="flex items-center gap-5 justify-start">
      <div className="flex items-center gap-2">
        <MapPin size={15} strokeWidth={2} className="text-white" />
        <span className="font-medium">
          Envíos a Candelaria y zonas aledañas
        </span>
      </div>
    </div>

    <div className="flex items-center justify-center text-[12px] font-medium">

  <span>
    🕒 Lun-Sáb 8:00–12:00 | 16:00–19:15
  </span>

  <span className="mx-4 opacity-50">
    •
  </span>

  <span>
    Dom. 9:30–12:00
  </span>

</div>
  </div>
</div>

{/* Franja sticky: logo + buscador + acciones */}
<header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
  <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">

    <img
      src="/logo.png"
      alt="A Todo Trapo"
      className="w-48 object-contain"
    />

    <div className="flex-1 max-w-3xl flex">
      <input
        type="text"
        placeholder="Buscá productos, marcas, líneas..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full h-11 border border-gray-200 rounded-l-full px-6 text-[15px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-700 transition"
      />

      <button className="bg-blue-950 hover:bg-blue-900 text-white w-12 rounded-r-full flex items-center justify-center transition">
        🔍
      </button>
    </div>

    <div className="flex items-center gap-6 text-[13px] text-slate-700">

      <button className="flex items-center gap-2 hover:text-blue-800 transition">
        <BadgePercent
          size={18}
          strokeWidth={2}
          className="text-blue-900"
        />
        <span className="font-medium">Ofertas</span>
      </button>

      <a
        href="https://www.instagram.com/atodo_trapo01/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-blue-800 transition"
      >
        <FaInstagram
          size={19}
          className="text-blue-900"
        />
        <span className="font-medium">Instagram</span>
      </a>

      <button
        onClick={() => setMostrarCarrito(!mostrarCarrito)}
        className="relative flex items-center gap-2 hover:text-blue-800 transition"
      >
        <ShoppingBasket
          size={20}
          strokeWidth={2}
          className="text-blue-900"
        />

        <div className="flex flex-col leading-none">
          <span className="font-semibold text-[13px] text-slate-800">
            Carrito
          </span>

          <span className="text-[10px] text-gray-400">
            {carrito.length} productos
          </span>
        </div>

        {carrito.length > 0 && (
          <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 text-[9px] text-blue-950 flex items-center justify-center font-bold">
            {carrito.length}
          </span>
        )}
      </button>

    </div>
  </div>
</header>

{/* Menú normal */}
<nav className="hidden md:block bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto h-[54px] px-6 flex items-center justify-between">

    <div className="flex items-center gap-10 ml-[80px] text-[14px] font-semibold text-[#162a63]">
      <a href="#" className="relative font-semibold text-[#162a63] hover:text-[#0d3fb8] transition-colors duration-200">
        Inicio
        <span className="absolute left-0 -bottom-[17px] w-full h-[3px] bg-yellow-400 rounded-full"></span>
      </a>

      <a href="#" className="font-semibold text-[#162a63] hover:text-[#0d3fb8] transition-colors duration-200">
        Productos
      </a>

      <a href="#" className="font-semibold text-[#162a63] hover:text-[#0d3fb8] transition-colors duration-200">
        Marcas
      </a>
    </div>

    <a
      href="https://wa.me/5493764354249"
      target="_blank"
      className="flex items-center gap-2 bg-[#1FAF5A] hover:bg-[#198F49] text-white px-5 py-2 rounded-xl text-[14px] font-semibold transition shadow-sm"
    >
      <FaWhatsapp size={17} />
      <span>Consultanos por WhatsApp</span>
    </a>

  </div>
</nav>

      {/* Banner principal */}
<section className="bg-slate-50 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 pt-1 pb-6">

    <div className="relative h-[300px] rounded-[32px] overflow-hidden shadow-none">

      <img
        src="/banner.png"
        alt="A Todo Trapo"
        className="absolute -top-16 left-0 w-full h-[360px] object-cover object-center"
      />
        
      {/* Botón Ver productos */}
<button
  className="absolute left-[54px] bottom-[25px] inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-[15px] px-6 py-3 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.03]"
>
  Ver productos

  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5l7 7-7 7"
    />
  </svg>
</button>

    </div>

  </div>
</section>
      
      {/* Beneficios */}
<section className="bg-slate-50 -mt-4 pb-5">
  <div className="max-w-7xl mx-auto px-6">

    <div className="bg-white border border-gray-100 rounded-[18px] overflow-hidden">

      <div className="grid grid-cols-4">

        <div className="relative flex items-center gap-2.5 px-6 py-3.5">
          <Truck
            size={23}
            strokeWidth={2}
            className="text-blue-900 shrink-0"
          />

          <div>
            <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
              Envíos rápidos
            </h3>

            <p className="text-gray-500 text-[11px] mt-0.5">
              a Candelaria y zonas aledañas
            </p>
          </div>

          <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
        </div>

        <div className="relative flex items-center gap-2.5 px-6 py-3.5">
          <CircleDashed
            size={23}
            strokeWidth={2}
            className="text-blue-900 shrink-0"
          />

          <div>
            <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
              Sistema tintométrico
            </h3>

            <p className="text-gray-500 text-[11px] mt-0.5">
              Miles de colores al instante
            </p>
          </div>

          <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
        </div>

        <div className="relative flex items-center gap-2.5 px-6 py-3.5">
          <Waves
            size={23}
            strokeWidth={2}
            className="text-blue-900 shrink-0"
          />

          <div>
            <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
              Especialistas en piscinas
            </h3>

            <p className="text-gray-500 text-[11px] mt-0.5">
              Todo para el cuidado del agua
            </p>
          </div>

          <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
        </div>

        <div className="flex items-center gap-2.5 px-6 py-3.5">
          <CreditCard
            size={23}
            strokeWidth={2}
            className="text-blue-900 shrink-0"
          />

          <div>
            <h3 className="font-semibold text-blue-950 text-[14px] leading-tight">
              Todos los medios de pago
            </h3>

            <p className="text-gray-500 text-[11px] mt-0.5">
              Efectivo, tarjetas y transferencias
            </p>
          </div>
        </div>

      </div>

    </div>

  </div>
</section>

{/* Contenedor principal del catálogo */}

<div className="bg-slate-50">
  <div className="max-w-7xl mx-auto px-6">

    <div className="col-span-3"></div>

{/* Resultados de búsqueda */}
{busqueda !== "" && (
  <div
    ref={resultadosBusquedaRef}
    className="bg-white p-6 mt-8 rounded-2xl shadow max-h-[800px] overflow-y-auto"
  >
    <h2 className="text-2xl font-bold text-blue-950 mb-2">
      Resultados de búsqueda
    </h2>

    <p className="text-gray-500 mb-6">
      {productosBuscados.length} productos encontrados
    </p>

    <div className="columns-1 md:columns-2 gap-4">
      {productosBuscados.map((grupo, index) => {
        const keyBusqueda = "busqueda" + index;

        const productoSeleccionado =
          grupo.items.find((item) => {
            if (grupo.items.some((i) => i.Color?.trim())) {
              return (
                item.Tamaño ===
                  (tamanosSeleccionados[keyBusqueda] || grupo.items[0].Tamaño) &&
                item.Color ===
                  (coloresSeleccionados[keyBusqueda] || grupo.items[0].Color)
              );
            }

            if (grupo.items.some((i) => i.Fragancias?.trim())) {
              return (
                item.Tamaño ===
                  (tamanosSeleccionados[keyBusqueda] || grupo.items[0].Tamaño) &&
                item.Fragancias ===
                  (fraganciasSeleccionadas[keyBusqueda] || grupo.items[0].Fragancias)
              );
            }

            return (
              item.Tamaño ===
              (tamanosSeleccionados[keyBusqueda] || grupo.items[0].Tamaño)
            );
          }) || grupo.items[0];

        const nombreTarjeta = grupo.nombre;
        const lineaTarjeta = grupo.linea;
        const placaTarjeta = grupo.nombre;
        const estaAbierto = productoBusquedaAbierto === index;

        const tieneFragancias = grupo.items.some((i) => i.Fragancias?.trim());

        const opcionesTamanos = [
          ...new Set(grupo.items.map((item) => item.Tamaño)),
        ].filter(Boolean);

        const tamanioActual =
          tamanosSeleccionados[keyBusqueda] || grupo.items[0].Tamaño;

        const opcionesFragancias = [
          ...new Set(
            grupo.items
              .filter((item: any) => item.Tamaño === tamanioActual)
              .map((item: any) => item.Fragancias)
              .filter(Boolean)
          ),
        ];

        const opcionesColores = [
          ...new Set(
            grupo.items
              .filter((item: any) => item.Tamaño === tamanioActual)
              .map((item: any) => item.Color)
              .filter(Boolean)
          ),
        ];

        const tieneOpciones =
          opcionesTamanos.length > 0 ||
          opcionesFragancias.length > 0 ||
          opcionesColores.length > 0;

        return (
          <div
            key={index}
            className="group break-inside-avoid mb-4 w-full bg-white border border-gray-200 rounded-[22px] shadow-sm hover:shadow-[0_16px_38px_rgba(15,23,42,0.14)] transition-all duration-300 overflow-hidden"
          >
            <div className="p-4 relative">

              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement;

                  if (target.closest("[data-product-control]")) {
                    return;
                  }

                  setProductoBusquedaAbierto(estaAbierto ? null : index);
                }}
                className="relative z-10 cursor-pointer hover:-translate-y-1 transition-all duration-300"
              >
                <TarjetaProducto
                  nombre={nombreTarjeta}
                  linea={lineaTarjeta}
                  marca={placaTarjeta}
                  imagen={productoSeleccionado?.Imagen}
                  aromas={productoSeleccionado?.Aromas}
                  precio={productoSeleccionado?.Precio}
                  precioOferta={productoSeleccionado?.["Precio oferta"]}
                  oferta={productoSeleccionado?.Oferta}
                />
              </div>

              <div
                data-product-control
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className={`relative z-30 hidden md:block transition-all duration-500 ease-in-out ${
                  estaAbierto
                    ? tieneOpciones
                      ? "max-h-[260px] opacity-100 mt-3 overflow-visible"
                      : "max-h-[70px] opacity-100 mt-2 overflow-visible"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {tieneOpciones && (
                  <div
                    data-product-control
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="relative z-40 ml-[145px] pr-2 -mt-10"
                  >
                    {opcionesTamanos.length > 0 && (
                      <div
                        data-product-control
                        className="grid grid-cols-[72px_1fr] items-center gap-2"
                      >
                        <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                          Tamaño
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {opcionesTamanos.map((tam, i) => (
                            <button
                              key={i}
                              type="button"
                              data-product-control
                              onClick={(e) => {
                                e.stopPropagation();

                                const primerColorDisponible =
                                  grupo.items.find((item) => item.Tamaño === tam)?.Color;

                                const primeraFraganciaDisponible =
                                  grupo.items.find((item) => item.Tamaño === tam)?.Fragancias;

                                setTamanosSeleccionados({
                                  ...tamanosSeleccionados,
                                  [keyBusqueda]: tam,
                                });

                                setColoresSeleccionados({
                                  ...coloresSeleccionados,
                                  [keyBusqueda]: primerColorDisponible,
                                });

                                setFraganciasSeleccionadas({
                                  ...fraganciasSeleccionadas,
                                  [keyBusqueda]: primeraFraganciaDisponible,
                                });
                              }}
                              className={
                                tamanioActual === tam
                                  ? "h-6 px-2.5 rounded-lg bg-blue-950 text-white text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                                  : "h-6 px-2.5 rounded-lg bg-white border border-gray-200 text-blue-950 text-[11px] font-semibold hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                              }
                            >
                              {tam}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-1.5">
                      {tieneFragancias && opcionesFragancias.length > 0 ? (
                        <div
                          data-product-control
                          className="grid grid-cols-[72px_1fr] items-center gap-2"
                        >
                          <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                            Fragancia
                          </p>

                          <select
                            data-product-control
                            value={
                              fraganciasSeleccionadas[keyBusqueda] ||
                              productoSeleccionado?.Fragancias ||
                              ""
                            }
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setFraganciasSeleccionadas({
                                ...fraganciasSeleccionadas,
                                [keyBusqueda]: e.target.value,
                              })
                            }
                            className="w-full h-7 bg-white border border-gray-200 rounded-lg px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                          >
                            {opcionesFragancias.map((fragancia, i) => (
                              <option key={i} value={fragancia}>
                                {fragancia}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : opcionesColores.length > 0 ? (
                        <div
                          data-product-control
                          className="grid grid-cols-[72px_1fr] items-center gap-2"
                        >
                          <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                            Color
                          </p>

                          <select
                            data-product-control
                            value={
                              coloresSeleccionados[keyBusqueda] ||
                              productoSeleccionado?.Color ||
                              ""
                            }
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setColoresSeleccionados({
                                ...coloresSeleccionados,
                                [keyBusqueda]: e.target.value,
                              })
                            }
                            className="w-full h-7 bg-white border border-gray-200 rounded-lg px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                          >
                            {opcionesColores.map((color, i) => (
                              <option key={i} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  data-product-control
                  onClick={(e) => {
                    e.stopPropagation();

                    agregarAlCarrito(
                      nombreTarjeta +
                        " " +
                        productoSeleccionado.Tamaño +
                        " " +
                        (productoSeleccionado.Fragancias ||
                          productoSeleccionado.Color ||
                          ""),
                      Number(
                        productoSeleccionado.Oferta?.trim().toLowerCase() === "si"
                          ? productoSeleccionado["Precio oferta"]
                          : productoSeleccionado.Precio
                      )
                    );
                  }}
                  className={`w-full h-10 bg-yellow-400 hover:bg-yellow-500 text-blue-950 text-[14px] font-extrabold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                    tieneOpciones ? "mt-4" : "mt-2"
                  }`}
                >
                  🛒 Agregar
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  </div>
)}


{/* Categorías */}
{vista === "categorias" && (
  <>
    {busqueda === "" && (
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
                    key={categoria}
                    onClick={() => {
                      setCategoria(categoria);

                      if (nombreCategoria.includes("pintura")) {
                        setVista("marcas");
                      } else {
                        setMarca("");
                        setVista("productos");
                      }
                    }}
                    className="group bg-white border border-gray-200 rounded-[16px] h-[112px] w-[118px] px-3 py-3 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex justify-center mb-2">
                      <img
                        src={`/iconos/categorias/${iconoCategoria}`}
                        alt={categoria}
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
    )}
  </>
)}

{/* Marcas */}

{vista === "marcas" && (
  <>
    <section className="-mt-4 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-[22px] font-bold text-blue-950 mb-5 -ml-2 mt-[4px]">
          Elegí una marca
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-0 -ml-2">

          {[
            ...new Set(
              productos
                .filter((p) => p.Categoría?.trim() === categoria)
                .map((p) => p.Marca?.trim())
            )
          ]
            .filter(Boolean)
            .map((marca) => {
              const nombreMarca = String(marca).toLowerCase();

              const iconoMarca =
                nombreMarca.includes("tersuave")
                  ? "tersuave.png"
                  : nombreMarca.includes("silver")
                  ? "silver.png"
                  : nombreMarca.includes("colorin") || nombreMarca.includes("colorín")
                  ? "colorin.png"
                  : "default.png";

              return (
                <button
                  key={marca}
                  onClick={() => {
                    setMarca(marca);
                    setVista("productos");
                  }}
                  className="group relative bg-white border border-gray-200 rounded-[22px] h-[170px] w-full flex items-center justify-center overflow-hidden shadow-[0_10px_28px_rgba(15,23,42,0.07)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.13)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Fondo */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50 opacity-95" />

                  {/* Sombra del logo */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-36 h-4 bg-slate-900/10 rounded-full blur-md group-hover:bg-slate-900/15 transition" />

                  <img
                    src={`/iconos/marcas/${iconoMarca}`}
                    alt={marca}
                    className={`relative z-10 object-contain drop-shadow-[0_12px_18px_rgba(15,23,42,0.18)] transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 ${
                      nombreMarca.includes("tersuave")
                        ? "max-w-[290px] max-h-[145px]"
                        : nombreMarca.includes("silver")
                        ? "max-w-[190px] max-h-[110px]"
                        : nombreMarca.includes("colorin") || nombreMarca.includes("colorín")
                        ? "max-w-[220px] max-h-[120px]"
                        : "max-w-[200px] max-h-[110px]"
                    }`}
                  />
                </button>
              );
            })}

        </div>

      </div>
    </section>
  </>
)}

{/* Productos */}
{vista === "productos" && (
  <>
    <section className="pb-10">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h3 className="text-[30px] font-extrabold text-blue-950 tracking-[-0.03em] leading-tight">
            Productos de {marca || categoria}
          </h3>

          <p className="text-[14px] text-slate-500 mt-1">
            Tocá un producto para ver opciones
          </p>
        </div>
      </div>

      <div className="columns-1 md:columns-2 gap-4">
        {productosAgrupados.map((grupo, index) => {
          const productoSeleccionado =
            grupo.items.find((item) => {
              if (grupo.items.some((i) => i.Color?.trim())) {
                return (
                  item.Tamaño ===
                    (tamanosSeleccionados[index] || grupo.items[0].Tamaño) &&
                  item.Color ===
                    (coloresSeleccionados[index] || grupo.items[0].Color)
                );
              }

              if (grupo.items.some((i) => i.Fragancias?.trim())) {
                return (
                  item.Tamaño ===
                    (tamanosSeleccionados[index] || grupo.items[0].Tamaño) &&
                  item.Fragancias ===
                    (fraganciasSeleccionadas[index] || grupo.items[0].Fragancias)
                );
              }

              return (
                item.Tamaño ===
                (tamanosSeleccionados[index] || grupo.items[0].Tamaño)
              );
            }) || grupo.items[0];

          const nombreTarjeta = grupo.nombre;
          const lineaTarjeta = grupo.linea;
          const placaTarjeta = grupo.nombre;
          const estaAbierto = productoAbierto === index;

          const tieneFragancias = grupo.items.some((i) => i.Fragancias?.trim());

          const opcionesTamanos = [
            ...new Set(grupo.items.map((item) => item.Tamaño)),
          ].filter(Boolean);

          const tamanioActual =
            tamanosSeleccionados[index] || grupo.items[0].Tamaño;

          const opcionesFragancias = [
            ...new Set(
              grupo.items
                .filter((item: any) => item.Tamaño === tamanioActual)
                .map((item: any) => item.Fragancias)
                .filter(Boolean)
            ),
          ];

          const opcionesColores = [
            ...new Set(
              grupo.items
                .filter((item: any) => item.Tamaño === tamanioActual)
                .map((item: any) => item.Color)
                .filter(Boolean)
            ),
          ];

          const tieneOpciones =
            opcionesTamanos.length > 0 ||
            opcionesFragancias.length > 0 ||
            opcionesColores.length > 0;

          return (
            <div
              key={index}
              className="group break-inside-avoid mb-4 w-full bg-white border border-gray-200 rounded-[22px] shadow-sm hover:shadow-[0_16px_38px_rgba(15,23,42,0.14)] transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 relative">

                <div
                  onClick={(e) => {
                    const target = e.target as HTMLElement;

                    if (target.closest("[data-product-control]")) {
                      return;
                    }

                    if (window.innerWidth < 768) {
                      setGrupoDetalle({
                        grupo,
                        index,
                        producto: productoSeleccionado,
                      });
                      setDetalleAbierto(true);
                    } else {
                      setProductoAbierto(estaAbierto ? null : index);
                    }
                  }}
                  className="relative z-10 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                >
                  <TarjetaProducto
                    nombre={nombreTarjeta}
                    linea={lineaTarjeta}
                    marca={placaTarjeta}
                    imagen={productoSeleccionado?.Imagen}
                    aromas={productoSeleccionado?.Aromas}
                    precio={productoSeleccionado?.Precio}
                    precioOferta={productoSeleccionado?.["Precio oferta"]}
                    oferta={productoSeleccionado?.Oferta}
                  />
                </div>

                <div
                  data-product-control
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`relative z-30 hidden md:block transition-all duration-500 ease-in-out ${
                    estaAbierto
                      ? tieneOpciones
                        ? "max-h-[260px] opacity-100 mt-3 overflow-visible"
                        : "max-h-[70px] opacity-100 mt-2 overflow-visible"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {tieneOpciones && (
                    <div
                      data-product-control
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="relative z-40 ml-[145px] pr-2 -mt-10"
                    >
                      {opcionesTamanos.length > 0 && (
                        <div
                          data-product-control
                          className="grid grid-cols-[72px_1fr] items-center gap-2"
                        >
                          <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                            Tamaño
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {opcionesTamanos.map((tam, i) => (
                              <button
                                key={i}
                                type="button"
                                data-product-control
                                onClick={(e) => {
                                  e.stopPropagation();

                                  const primerColorDisponible =
                                    grupo.items.find((item) => item.Tamaño === tam)?.Color;

                                  const primeraFraganciaDisponible =
                                    grupo.items.find((item) => item.Tamaño === tam)?.Fragancias;

                                  setTamanosSeleccionados({
                                    ...tamanosSeleccionados,
                                    [index]: tam,
                                  });

                                  setColoresSeleccionados({
                                    ...coloresSeleccionados,
                                    [index]: primerColorDisponible,
                                  });

                                  setFraganciasSeleccionadas({
                                    ...fraganciasSeleccionadas,
                                    [index]: primeraFraganciaDisponible,
                                  });
                                }}
                                className={
                                  tamanioActual === tam
                                    ? "h-6 px-2.5 rounded-lg bg-blue-950 text-white text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                                    : "h-6 px-2.5 rounded-lg bg-white border border-gray-200 text-blue-950 text-[11px] font-semibold hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                                }
                              >
                                {tam}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-1.5">
                        {tieneFragancias && opcionesFragancias.length > 0 ? (
                          <div
                            data-product-control
                            className="grid grid-cols-[72px_1fr] items-center gap-2"
                          >
                            <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                              Fragancia
                            </p>

                            <select
                              data-product-control
                              value={
                                fraganciasSeleccionadas[index] ||
                                productoSeleccionado?.Fragancias ||
                                ""
                              }
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setFraganciasSeleccionadas({
                                  ...fraganciasSeleccionadas,
                                  [index]: e.target.value,
                                })
                              }
                              className="w-full h-7 bg-white border border-gray-200 rounded-lg px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesFragancias.map((fragancia, i) => (
                                <option key={i} value={fragancia}>
                                  {fragancia}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : opcionesColores.length > 0 ? (
                          <div
                            data-product-control
                            className="grid grid-cols-[72px_1fr] items-center gap-2"
                          >
                            <p className="mt-1.5 text-[13px] font-extrabold text-blue-950">
                              Color
                            </p>

                            <select
                              data-product-control
                              value={
                                coloresSeleccionados[index] ||
                                productoSeleccionado?.Color ||
                                ""
                              }
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setColoresSeleccionados({
                                  ...coloresSeleccionados,
                                  [index]: e.target.value,
                                })
                              }
                              className="w-full h-7 bg-white border border-gray-200 rounded-lg px-2.5 text-[11px] font-semibold text-blue-950 outline-none focus:border-blue-800"
                            >
                              {opcionesColores.map((color, i) => (
                                <option key={i} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    data-product-control
                    onClick={(e) => {
                      e.stopPropagation();

                      agregarAlCarrito(
                        nombreTarjeta +
                          " " +
                          productoSeleccionado.Tamaño +
                          " " +
                          (productoSeleccionado.Fragancias ||
                            productoSeleccionado.Color ||
                            ""),
                        Number(
                          productoSeleccionado.Oferta?.trim().toLowerCase() === "si"
                            ? productoSeleccionado["Precio oferta"]
                            : productoSeleccionado.Precio
                        )
                      );
                    }}
                    className={`w-full h-10 bg-yellow-400 hover:bg-yellow-500 text-blue-950 text-[14px] font-extrabold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                      tieneOpciones ? "mt-4" : "mt-2"
                    }`}
                  >
                    🛒 Agregar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  </>
)}

{/* Ofertas destacadas */}
<section className="hidden md:block mt-8 pb-10">
  <div className="bg-white border border-gray-100 rounded-[26px] shadow-sm p-6">

    <div className="flex items-center gap-5 mb-5">
      <h2 className="text-[30px] font-bold text-blue-950 leading-none">
        Ofertas destacadas
      </h2>

      <button className="bg-orange-50 text-red-600 px-4 py-2 rounded-xl text-[14px] font-semibold hover:bg-orange-100 transition">
        🔥 Ver todas las ofertas
      </button>
    </div>

    <div className="grid grid-cols-[1fr_300px] gap-5">

      <div className="grid grid-cols-4 gap-4">
        {ofertasAgrupadas.slice(0, 4).map((grupo, index) => {
          const productoSeleccionado =
            grupo.items.find((item) => {
              if (grupo.items.some((i) => i.Color?.trim())) {
                return (
                  item.Tamaño ===
                    (tamanosSeleccionados["oferta" + index] ||
                      grupo.items[0].Tamaño) &&
                  item.Color ===
                    (coloresSeleccionados["oferta" + index] ||
                      grupo.items.find(
                        (i) =>
                          i.Tamaño ===
                          (tamanosSeleccionados["oferta" + index] ||
                            grupo.items[0].Tamaño)
                      )?.Color)
                );
              }

              if (grupo.items.some((i) => i.Fragancias?.trim())) {
                return (
                  item.Tamaño ===
                    (tamanosSeleccionados["oferta" + index] ||
                      grupo.items[0].Tamaño) &&
                  item.Fragancias ===
                    (fraganciasSeleccionadas["oferta" + index] ||
                      grupo.items[0].Fragancias)
                );
              }

              return (
                item.Tamaño ===
                (tamanosSeleccionados["oferta" + index] || grupo.items[0].Tamaño)
              );
            }) || grupo.items[0];

          return (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-[18px] p-3 shadow-sm hover:shadow-md transition"
            >
              {productoSeleccionado?.Oferta?.trim().toLowerCase() === "si" && (
                <>
                  <span className="absolute top-3 left-3 bg-yellow-400 text-blue-950 text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                    -
                    {Math.round(
                      (1 -
                        Number(productoSeleccionado["Precio oferta"]) /
                          Number(productoSeleccionado.Precio)) *
                        100
                    )}
                    %
                  </span>

                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                    OFERTA
                  </span>
                </>
              )}

              <div className="h-[120px] flex items-center justify-center mb-2 mt-4">
                {productoSeleccionado?.Imagen?.trim() && (
                  <img
                    src={productoSeleccionado.Imagen.trim()}
                    alt={grupo.nombre}
                    className="max-h-[115px] max-w-full object-contain"
                  />
                )}
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-blue-950 leading-tight">
                  {productoSeleccionado?.Marca || grupo.nombre}
                </h3>

                <p className="text-[13px] text-blue-950 leading-tight mt-0.5">
                  {grupo.nombre}
                </p>

                <p className="text-[13px] text-blue-950 leading-tight mt-0.5">
                  {productoSeleccionado?.Tamaño}
                </p>
              </div>

              <div className="mt-3">
                <p className="text-[13px] text-red-600 line-through leading-none">
                  $
                  {Number(productoSeleccionado.Precio).toLocaleString("es-AR")}
                </p>

                <p className="text-[23px] font-bold text-blue-950 leading-tight mt-1">
                  $
                  {Number(productoSeleccionado["Precio oferta"]).toLocaleString(
                    "es-AR"
                  )}
                </p>

                <p className="text-[13px] font-semibold text-green-600 leading-tight">
                  Ahorrás $
                  {(
                    Number(productoSeleccionado.Precio) -
                    Number(productoSeleccionado["Precio oferta"])
                  ).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="border-t border-gray-200 mt-3 pt-3">
                <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                  Tamaño
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(grupo.items.map((item) => item.Tamaño))]
                    .filter(Boolean)
                    .map((tam, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const primerColorDisponible = grupo.items.find(
                            (item) => item.Tamaño === tam
                          )?.Color;

                          const primeraFraganciaDisponible = grupo.items.find(
                            (item) => item.Tamaño === tam
                          )?.Fragancias;

                          setTamanosSeleccionados({
                            ...tamanosSeleccionados,
                            ["oferta" + index]: tam,
                          });

                          setColoresSeleccionados({
                            ...coloresSeleccionados,
                            ["oferta" + index]: primerColorDisponible,
                          });

                          setFraganciasSeleccionadas({
                            ...fraganciasSeleccionadas,
                            ["oferta" + index]: primeraFraganciaDisponible,
                          });
                        }}
                        className={
                          (tamanosSeleccionados["oferta" + index] ||
                            grupo.items[0].Tamaño) === tam
                            ? "h-7 px-2 rounded-md bg-blue-950 text-white text-[11px] font-semibold"
                            : "h-7 px-2 rounded-md bg-white border border-gray-200 text-blue-950 text-[11px] font-medium hover:border-blue-300"
                        }
                      >
                        {tam}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mt-3">
                {grupo.items.some((i) => i.Fragancias?.trim()) ? (
                  <>
                    <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                      Fragancia
                    </p>

                    <select
                      value={
                        fraganciasSeleccionadas["oferta" + index] ||
                        productoSeleccionado?.Fragancias ||
                        ""
                      }
                      onChange={(e) =>
                        setFraganciasSeleccionadas({
                          ...fraganciasSeleccionadas,
                          ["oferta" + index]: e.target.value,
                        })
                      }
                      className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-[12px] text-blue-950 outline-none focus:border-blue-800"
                    >
                      {[
                        ...new Set(
                          grupo.items
                            .filter(
                              (item: any) =>
                                item.Tamaño ===
                                (tamanosSeleccionados["oferta" + index] ||
                                  grupo.items[0].Tamaño)
                            )
                            .map((item: any) => item.Fragancias)
                            .filter(Boolean)
                        ),
                      ].map((fragancia, i) => (
                        <option key={i} value={fragancia}>
                          {fragancia}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-blue-950 mb-1.5">
                      Color
                    </p>

                    <select
                      value={
                        coloresSeleccionados["oferta" + index] ||
                        productoSeleccionado?.Color ||
                        ""
                      }
                      onChange={(e) =>
                        setColoresSeleccionados({
                          ...coloresSeleccionados,
                          ["oferta" + index]: e.target.value,
                        })
                      }
                      className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-[12px] text-blue-950 outline-none focus:border-blue-800"
                    >
                      {[
                        ...new Set(
                          grupo.items
                            .filter(
                              (item: any) =>
                                item.Tamaño ===
                                (tamanosSeleccionados["oferta" + index] ||
                                  grupo.items[0].Tamaño)
                            )
                            .map((item: any) => item.Color)
                            .filter(Boolean)
                        ),
                      ].map((color, i) => (
                        <option key={i} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <div className="grid grid-cols-[74px_1fr] gap-2 mt-4">
                <div className="h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-2 text-blue-950">
                  <button className="text-[15px] leading-none">−</button>
                  <span className="text-[12px] font-semibold">1</span>
                  <button className="text-[15px] leading-none">+</button>
                </div>

                <button
                  onClick={() =>
                    agregarAlCarrito(
                      grupo.nombre +
                        " " +
                        productoSeleccionado.Tamaño +
                        " " +
                        (productoSeleccionado.Fragancias ||
                          productoSeleccionado.Color ||
                          ""),
                      Number(
                        productoSeleccionado.Oferta?.trim().toLowerCase() ===
                          "si"
                          ? productoSeleccionado["Precio oferta"]
                          : productoSeleccionado.Precio
                      )
                    )
                  }
                  className="h-9 bg-yellow-400 hover:bg-yellow-500 text-blue-950 rounded-lg text-[12px] font-bold transition whitespace-nowrap"
                >
                  🛒 Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-950 rounded-[24px] p-8 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
        <div className="relative z-10">
          <h3 className="text-[26px] font-bold text-white leading-tight">
            ¿Tenés dudas?
          </h3>

          <p className="text-[17px] font-bold text-yellow-400 mt-3">
            Escribinos por WhatsApp
          </p>

          <p className="text-[15px] text-white/90 mt-6 leading-relaxed">
            Te respondemos al instante para consultar stock, precios o disponibilidad.
          </p>

          <a
            href="https://wa.me/5493786519078"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-[16px] font-bold transition mt-8 shadow-sm"
          >
            <FaWhatsapp size={21} />
            Ir a WhatsApp
          </a>
        </div>

        <div className="absolute right-8 bottom-10 text-[120px] opacity-10">
          💬
        </div>

        <div className="absolute left-0 right-0 bottom-0 h-20 bg-blue-900/50 rounded-t-[50%]" />
      </div>

    </div>
  </div>
</section>

          {/* ¿Por qué elegirnos? */}
<section className="mt-6 pb-3">
  <div className="bg-white border border-gray-100 rounded-[22px] shadow-sm overflow-hidden">
    <div className="grid grid-cols-4">

      <div className="relative flex items-center gap-4 px-8 py-5">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <CircleDashed size={28} className="text-blue-950" strokeWidth={2} />
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-blue-950 leading-tight">
            Sistema tintométrico
          </h3>
          <p className="text-[13px] text-slate-600 mt-1 leading-snug">
            +1500 colores computarizados
          </p>
        </div>

        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-px bg-gray-200" />
      </div>

      <div className="relative flex items-center gap-4 px-8 py-5">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <Truck size={28} className="text-blue-950" strokeWidth={2} />
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-blue-950">
            Envíos rápidos
          </h3>
          <p className="text-[13px] text-slate-600 mt-1 leading-snug">
            Entregas en Candelaria y zonas aledañas
          </p>
        </div>

        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-px bg-gray-200" />
      </div>

      <div className="relative flex items-center gap-4 px-8 py-5">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <CreditCard size={28} className="text-blue-950" strokeWidth={2} />
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-blue-950">
            Pagos seguros
          </h3>
          <p className="text-[13px] text-slate-600 mt-1 leading-snug">
            Efectivo, tarjetas y transferencias
          </p>
        </div>

        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-px bg-gray-200" />
      </div>

      <div className="flex items-center gap-4 px-8 py-5">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <PaintBucket size={28} className="text-blue-950" strokeWidth={2} />
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-blue-950">
            Gran variedad
          </h3>
          <p className="text-[13px] text-slate-600 mt-1 leading-snug">
            Pinturas, limpieza, hogar y más
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

</div>

</div>

      {/* Contacto / Footer */}
<footer className="bg-slate-50 pt-3 pb-10">
  <div className="bg-white border border-gray-100 rounded-[22px] shadow-sm overflow-hidden">

    <div className="grid grid-cols-[1.05fr_1.25fr_1fr]">

      {/* Logo */}
      <div className="flex items-center gap-4 px-8 py-7">

        <img
          src="/logo.png"
          alt="A Todo Trapo Online"
          className="w-44 object-contain"
        />

        <div className="leading-tight">
          <h2 className="text-[18px] font-extrabold text-teal-700 tracking-[-0.03em] leading-tight">
            A Todo Trapo Online
          </h2>

          <p className="text-[13px] font-medium text-slate-500 mt-1 leading-snug">
            Pinturería y artículos para el hogar
          </p>
        </div>

      </div>

      {/* Dirección */}
      <div className="border-l border-r border-gray-200 px-10 py-7 flex flex-col justify-center">

        <p className="flex items-center gap-3 text-[14px] font-medium text-slate-700 tracking-[-0.01em]">
          <span className="text-[15px]">📍</span>
          Anastacio Cabrera y San Martín, Candelaria, Misiones
        </p>

        <p className="flex items-center gap-3 text-[14px] font-medium text-slate-700 tracking-[-0.01em] mt-3">
          <span className="text-[15px]">🕘</span>
          Lunes a sábado de 8:00 a 12:00 y de 16:00 a 19:15
        </p>

        <p className="pl-[32px] text-[14px] font-medium text-slate-600 tracking-[-0.01em] mt-0">
          Domingo de 9:30 a 12:00
        </p>

      </div>

      {/* Redes */}
      <div className="px-10 py-7 flex flex-col justify-center items-start">

        <a
          href="https://www.instagram.com/atodo_trapo01"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 bg-blue-950 hover:bg-blue-900 text-white px-5 py-3 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <FaInstagram
            size={22}
            className="text-pink-400 group-hover:text-pink-300 transition"
          />

          <span className="text-[14px] font-bold tracking-[-0.01em]">
            Instagram @atodo_trapo01
          </span>
        </a>

        <p className="text-[13px] font-medium text-slate-400 tracking-[-0.01em] mt-6">
          © 2026 Todos los derechos reservados
        </p>

      </div>

    </div>

  </div>
</footer>


      <button
  onClick={() => {
  setMostrarBusqueda(!mostrarBusqueda);

  setTimeout(() => {
    inputBusquedaRef.current?.focus();
  }, 100);
}}
  className="fixed bottom-44 right-6 text-4xl z-50 hover:scale-110 transition"
>
  🔍
</button>
{mostrarBusqueda && (
  <div className="fixed bottom-56 right-4 z-50">
    <input
  ref={inputBusquedaRef}
  type="text"
  placeholder="🔍 Buscar producto..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  className="w-72 md:w-80 bg-white text-black border border-gray-300 px-4 py-3 rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
/>
  </div>
)}

{/* Modal detalle del producto */}

{detalleAbierto && grupoDetalle && (
  <div className="fixed inset-0 z-50 md:hidden">
    <div
      onClick={() => setDetalleAbierto(false)}
      className="absolute inset-0 bg-black/40"
    ></div>

    <div className="absolute bottom-0 left-0 right-0 z-[60]">

  <div className="absolute -top-8 right-5 z-[80]">
    
    {/* Carrito dentro del modal */}

      {mostrarCarrito && (
    <div className="absolute right-[72px] bottom-0 bg-white shadow-2xl rounded-2xl p-4 w-52 max-h-80 overflow-y-auto">
      <h3 className="font-bold text-lg text-black mb-2">
        🛒 Carrito
      </h3>

      <p className="text-sm text-gray-500 mb-3">
        {carrito.length} productos
      </p>

      <div className="text-black text-left">
        {carrito.map((producto, index) => (
          <div
            key={index}
            className="mb-2 border-b pb-2 flex justify-between items-center"
          >
            <div>
              <p className="text-[10px] text-black leading-tight">
                {producto.nombre}
              </p>

              <p className="text-green-700 font-bold text-sm">
                ${producto.precio.toLocaleString("es-AR")}
              </p>
            </div>

            <button
              onClick={() =>
                setCarrito(carrito.filter((_, i) => i !== index))
              }
              className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg"
            >
              ×
            </button>
          </div>
        ))}

        <p className="text-lg font-bold text-black mt-3">
          Total: $
          {carrito
            .reduce((total, producto) => total + producto.precio, 0)
            .toLocaleString("es-AR")}
        </p>

        <button
          onClick={() => setCarrito([])}
          className="mt-3 bg-red-500 text-white text-sm px-3 py-2 rounded-xl w-full"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  )}
  <button
    onClick={() => setMostrarCarrito(!mostrarCarrito)}
    className={`bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-center text-2xl transition-all duration-300 ${
      carritoAnimado ? "scale-125" : "scale-100"
    }`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.2}
      stroke="currentColor"
      className="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386a1.5 1.5 0 011.464 1.175L5.383 6m0 0h13.867l-1.313 6.126a1.5 1.5 0 01-1.466 1.174H7.189a1.5 1.5 0 01-1.466-1.174L5.383 6zm2.367 11.25a.75.75 0 100 1.5.75.75 0 000-1.5zm9 0a.75.75 0 100 1.5.75.75 0 000-1.5z"
      />
    </svg>

    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg">
      {carrito.length}
    </span>
  </button>
</div>

  <div
    ref={panelDetalleRef}
    className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
  >
  
      <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
      <button
        onClick={() => setDetalleAbierto(false)}
        className="absolute top-4 right-4 text-gray-500 text-2xl"
      >
        ×
      </button>

      <div className="flex gap-2 items-start">
        <div className="relative w-28 shrink-0 flex justify-center">

  {productoDetalle?.Oferta?.trim().toLowerCase() === "si" && (
    <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
      -{Math.round(
        (1 -
          Number(productoDetalle["Precio oferta"]) /
            Number(productoDetalle.Precio)) *
          100
      )}%
    </div>
  )}

  {grupoDetalle.producto?.Imagen?.trim() && (
    <img
      src={grupoDetalle.producto.Imagen.trim()}
      alt={grupoDetalle.grupo.nombre}
      className="w-28 h-28 object-contain"
    />
  )}

</div>

        <div className="flex-1 pl-4 pr-2">
          <h2 className="text-lg font-bold text-gray-800 leading-tight">
            {grupoDetalle.grupo.nombre}
          </h2>

          <p className="text-gray-500 text-sm mt-1 leading-tight">
            {grupoDetalle.grupo.linea}
          </p>
          <div className="mt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
  Tamaño
</p>

        <div className="flex flex-wrap gap-2">
          {[...new Set(grupoDetalle.grupo.items.map((item:any) => item.Tamaño))].map((tam:any, i:number) => (
            <button
              key={i}
              onClick={() =>
                setTamanosSeleccionados({
                  ...tamanosSeleccionados,
                  ["detalle"+grupoDetalle.index]: tam,
                })
              }
              className={
                (tamanosSeleccionados["detalle"+grupoDetalle.index] || grupoDetalle.grupo.items[0].Tamaño) === tam
                  ? "bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium"
: "bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-xs"
              }
            >
              {tam}
            </button>
          ))}
        </div>
        {grupoDetalle.grupo.items.some((item:any) => item.Color?.trim()) ? (
  <div className="mt-4">
    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
  Color
</p>

    <select
      className="border rounded-xl py-2 px-3 w-full text-black text-sm"
      value={coloresSeleccionados["detalle"+grupoDetalle.index] || grupoDetalle.grupo.items[0].Color}
      onChange={(e) =>
        setColoresSeleccionados({
          ...coloresSeleccionados,
          ["detalle"+grupoDetalle.index]: e.target.value,
        })
      }
    >
      {grupoDetalle.grupo.items
        .filter((item:any) =>
          item.Tamaño ===
          (tamanosSeleccionados["detalle"+grupoDetalle.index] || grupoDetalle.grupo.items[0].Tamaño)
        )
        .map((item:any, i:number) => (
          <option key={i} value={item.Color}>
            {item.Color}
          </option>
        ))}
    </select>
  </div>
) : grupoDetalle.grupo.items.some((item:any) => item.Fragancias?.trim()) ? (
  <div className="mt-4">
    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
      Fragancia
    </p>

    <select
      className="border rounded-xl py-2 px-3 w-full text-black text-sm"
      value={fraganciasSeleccionadas["detalle"+grupoDetalle.index] || grupoDetalle.grupo.items[0].Fragancias}
      onChange={(e) =>
        setFraganciasSeleccionadas({
          ...fraganciasSeleccionadas,
          ["detalle"+grupoDetalle.index]: e.target.value,
        })
      }
    >
      {grupoDetalle.grupo.items
        .filter((item:any) =>
          item.Tamaño ===
          (tamanosSeleccionados["detalle"+grupoDetalle.index] || grupoDetalle.grupo.items[0].Tamaño)
        )
        .map((item:any, i:number) => (
          <option key={i} value={item.Fragancias}>
            {item.Fragancias}
          </option>
        ))}
    </select>
  </div>
) : null}
        {productoDetalle && (
  <div className="mt-1">

    {productoDetalle?.Oferta?.trim().toLowerCase() === "si" ? (
      <>
    

        <p className="text-xl font-bold text-green-700 leading-none">
          $
          {Number(productoDetalle["Precio oferta"]).toLocaleString("es-AR")}
        </p>

        <div className="flex items-center gap-3 mt-1">
  <p className="text-sm text-gray-400 line-through">
    $
    {Number(productoDetalle.Precio).toLocaleString("es-AR")}
  </p>

  <p className="text-sm font-semibold text-green-600">
    Ahorrás $
    {(
      Number(productoDetalle.Precio) -
      Number(productoDetalle["Precio oferta"])
    ).toLocaleString("es-AR")}
  </p>
</div>
      </>
    ) : (
      <p className="text-xl font-bold text-green-700">
        $
        {Number(productoDetalle.Precio).toLocaleString("es-AR")}
      </p>
    )}

  </div>
)}


      </div>
        </div>
      </div>

      {productoDetalle && (
  <button
    onClick={() =>
      agregarAlCarrito(
        grupoDetalle.grupo.nombre +
          " " +
          productoDetalle.Tamaño +
          " " +
          (productoDetalle.Fragancias || productoDetalle.Color || ""),
        Number(
          productoDetalle.Oferta?.trim().toLowerCase() === "si"
            ? productoDetalle["Precio oferta"]
            : productoDetalle.Precio
        )
      )
    }
    className="mt-3 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base py-2.5 rounded-2xl"
  >
    🛒 Agregar
  </button>
)}

      
    </div>
  </div>
</div>

)}



      {/* Botón flotante carrito */}
<button
  onClick={() => setMostrarCarrito(!mostrarCarrito)}
  className={`fixed ${
  detalleAbierto ? "hidden" : "bottom-24"
} right-4 z-[60] bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-center text-2xl transition-all duration-300 ${
  carritoAnimado ? "scale-125" : "scale-100"
}`}
>
  <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  strokeWidth={2.2}
  stroke="currentColor"
  className="w-7 h-7"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 3h1.386a1.5 1.5 0 011.464 1.175L5.383 6m0 0h13.867l-1.313 6.126a1.5 1.5 0 01-1.466 1.174H7.189a1.5 1.5 0 01-1.466-1.174L5.383 6zm2.367 11.25a.75.75 0 100 1.5.75.75 0 000-1.5zm9 0a.75.75 0 100 1.5.75.75 0 000-1.5z"
  />
</svg>
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg">
  {carrito.length}
</span>
</button>

{mostrarCarrito && !detalleAbierto && (
  <div className="fixed bottom-44 right-6 bg-white shadow-2xl rounded-2xl p-4 w-52 z-[70] max-h-80 overflow-y-auto">
    <h3 className="font-bold text-lg text-black mb-2">
      🛒 Carrito
    </h3>

    <p className="text-sm text-gray-500 mb-3">
      {carrito.length} productos
    </p>

    <div className="text-black text-left">
      {carrito.map((producto, index) => (
        <div
          key={index}
          className="mb-2 border-b pb-2 flex justify-between items-center"
        >
          <div>
            <p className="text-[10px] text-black leading-tight">
              {producto.nombre}
            </p>

            <p className="text-green-700 font-bold text-sm">
              ${producto.precio.toLocaleString("es-AR")}
            </p>
          </div>

          <button
            onClick={() =>
              setCarrito(carrito.filter((_, i) => i !== index))
            }
            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg"
          >
            ×
          </button>
        </div>
      ))}

      <p className="text-lg font-bold text-black mt-3">
        Total: $
        {carrito
          .reduce((total, producto) => total + producto.precio, 0)
          .toLocaleString("es-AR")}
      </p>

      <button
        onClick={() => setCarrito([])}
        className="mt-3 bg-red-500 text-white text-sm px-3 py-2 rounded-xl w-full"
      >
        Vaciar carrito
      </button>
    </div>
  </div>
)}

{/* Botón volver flotante */}
{vista !== "categorias" && !detalleAbierto && (
  <button
    onClick={() => {
      if (vista === "productos") {
        if (categoria.toLowerCase().includes("pintura")) {
          setVista("marcas");

          setTimeout(() => {
            document
              .getElementById("seccion-marcas")
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        } else {
          setVista("categorias");
          setMarca("");

          setTimeout(() => {
            document
              .getElementById("seccion-categorias")
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      } else if (vista === "marcas") {
        setVista("categorias");
        setMarca("");

        setTimeout(() => {
          document
            .getElementById("seccion-categorias")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
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

      {/* Botón flotante WhatsApp */}
<a
  href={
    carrito.length === 0
      ? "https://wa.me/5493786519078?text=Hola,%20quiero%20hacer%20una%20consulta"
      : `https://wa.me/5493786519078?text=${encodeURIComponent(
          "Hola, quiero consultar stock de:\n\n" +
            carrito
              .map(
                (producto, index) =>
                  `${index + 1}. ${producto.nombre} - $${producto.precio.toLocaleString("es-AR")}`
              )
              .join("\n") +
            "\n\nTotal: $" +
            carrito
              .reduce((total, producto) => total + producto.precio, 0)
              .toLocaleString("es-AR")
        )}`
  }
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.30)] transition hover:scale-110"
>
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
    alt="WhatsApp"
    className="w-8 h-8"
  />
</a>



          {/* Últimas secciones de la página */}

      <BotonPaginaWeb />

    </main>
  );
}

