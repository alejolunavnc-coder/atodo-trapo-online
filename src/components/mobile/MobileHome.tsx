"use client";

// [Imports]

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Papa from "papaparse";
import { FaInstagram } from "react-icons/fa";
import {
  BadgeCheck,
  Bug,
  CreditCard,
  Droplets,
  Flame,
  Grid2X2,
  Handshake,
  Home,
  MapPin,
  Menu,
  PaintBucket,
  Palette,
  Search,
  ShoppingCart,
  Mic,
  SprayCan,
  Truck,
  Wrench,
  Clock,
  Paintbrush,
ShieldCheck,
Waves,
Brush,
Package,
FlaskConical,
} from "lucide-react";
import type { Producto } from "@/src/types/producto";

// [Constantes]

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=0&single=true&output=csv";

// [Funciones auxiliares]

function precioNumero(valor: any) {
  if (!valor) return 0;

  return (
    Number(
      String(valor)
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0
  );
}

function formatoPrecio(valor: number) {
  return valor.toLocaleString("es-AR");
}

// [Componente principal]

export default function MobileHome() {

// [Estados]

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Inicio");
  const [subcategoriaActiva, setSubcategoriaActiva] = useState("Todas");
  const [bannerActual, setBannerActual] = useState(0);
  const [tamanosSeleccionados, setTamanosSeleccionados] = useState<any>({});
  const [coloresSeleccionados, setColoresSeleccionados] = useState<any>({});
  const [fraganciasSeleccionadas, setFraganciasSeleccionadas] = useState<any>({});
  const [productoAbierto, setProductoAbierto] = useState<any>(null);
  const [cantidadDetalle, setCantidadDetalle] = useState(1);
  const [busquedaMobile, setBusquedaMobile] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [productoAgregado, setProductoAgregado] = useState(false);
  const [mostrarConfirmacionCarrito, setMostrarConfirmacionCarrito] =
  useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [ubicacionAbierta, setUbicacionAbierta] = useState(false);

// [Paleta dinámica]


const esInicio = categoriaActiva === "Inicio";

const colores = esInicio
  ? {
      principal: "#123A72",
      fondo: "#FFFFFF",
      texto: "#123A72",
      suave: "#F5F7FB",
      acento: "#F8A400",
    }
  : {
      principal: "#081B43",
      fondo: "#F7FAFF",
      texto: "#081B43",
      suave: "#EAF2FF",
      acento: "#F8A400",
    };
    
// [Carga de productos]

  useEffect(() => {
    const normalizarProductos = (filas: Record<string, string>[]) => {
      const productosNormalizados = filas.map((fila) => {
        const producto: Record<string, string> = {};

        Object.entries(fila).forEach(([clave, valor]) => {
          const claveLimpia = clave.replace(/^\uFEFF/, "").trim();
          producto[claveLimpia] = valor;
        });

        return producto as Producto;
      });

      setProductos(productosNormalizados);
    };

    const cargarProductos = async () => {
      try {
        const respuesta = await fetch("/api/productos", { cache: "no-store" });
        if (!respuesta.ok) throw new Error("No se pudo cargar /api/productos");

        const csv = await respuesta.text();

        Papa.parse<Record<string, string>>(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (resultado) => normalizarProductos(resultado.data),
          error: () => {
            throw new Error("No se pudo leer el CSV interno");
          },
        });
      } catch {
        Papa.parse(SHEET_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (resultado: Papa.ParseResult<Record<string, string>>) => {
            normalizarProductos(resultado.data);
          },
        });
      }
    };

    cargarProductos();
  }, []);

// [Categorías]

  const categoriasReales = Array.from(
  new Set(
    productos
      .map((producto) => producto.Categoría?.trim())
      .filter((categoria): categoria is string => Boolean(categoria))
  )
);

const categorias = ["Inicio", "Ofertas", ...categoriasReales];

const categoriasMobile = categorias.map((nombre) => {
  const iconosImagen: any = {
    Inicio: "inicio",
    Ofertas: "ofertas",
    Pinturas: "pinturas",
    Aromatizantes: "aromatizantes",
    Limpieza: "limpieza",
    Piscina: "piscina",
    Piscinas: "piscina",
    Herramientas: "herramientas",
    Plagas: "controlplagas",
    "Control Plagas": "controlplagas",
    "Control de Plagas": "controlplagas",
    Jardinería: "jardineria",
    Jardineria: "jardineria",
    Electricidad: "electricidad",
    Accesorios: "accesorios",
    Plasticos: "plasticos",
    Plásticos: "plasticos",
    Auto: "auto",
  };

  return {
    nombre,
    iconoImagen: iconosImagen[nombre] || "inicio",
  };
});

const categoriasCarrusel = categoriasMobile;

const esCategoriaProductos =
  categoriaActiva !== "Inicio" && categoriaActiva !== "Ofertas";

const esPinturas = categoriaActiva.toLowerCase().includes("pintura");
// [Subcategorías]

  const subcategoriasPinturas = [
    "Todas",
    ...Array.from(
      new Set(
        productos
          .filter(
            (producto) =>
              producto.Categoría?.trim().toLowerCase() ===
              categoriaActiva.trim().toLowerCase()
          )
          .map((producto) => producto.Subcategoría?.trim())
          .filter((subcategoria): subcategoria is string => Boolean(subcategoria))
      )
    ),
  ];

// [Funciones]

  const normalizarTexto = (valor: any) =>
    String(valor || "")
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase();

  const tieneOferta = (producto: Producto) => {
    const precioOferta = precioNumero(producto["Precio oferta"]);
    const ofertaTexto = normalizarTexto(producto.Oferta);

    return precioOferta > 0 || ofertaTexto === "si" || ofertaTexto === "sí";
  };

  const agruparProductosMobile = (lista: Producto[]) =>
    Object.values(
      lista.reduce((acc: Record<string, any>, producto) => {
        const nombre = producto.Nombre || "Producto sin nombre";
        const linea = (producto as any).Linea || "";
        const marca = producto.Marca || "";
        const clave = `${linea}-${nombre}`;

        if (!acc[clave]) {
          acc[clave] = {
            nombre,
            linea,
            marca,
            items: [],
          };
        }

        acc[clave].items.push(producto);
        return acc;
      }, {})
    );

    const iniciarBusquedaPorVoz = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no permite búsqueda por voz.");
    return;
  }

  const reconocimiento = new SpeechRecognition();

  reconocimiento.lang = "es-AR";
  reconocimiento.continuous = false;
  reconocimiento.interimResults = false;
  reconocimiento.maxAlternatives = 1;

  setEscuchando(true);

  reconocimiento.start();

  reconocimiento.onresult = (event: any) => {
    const texto = event.results[0][0].transcript;

    setBusquedaMobile(texto);
    setEscuchando(false);
  };

  reconocimiento.onerror = (event: any) => {
  console.log(event.error);
  alert(event.error);
  setEscuchando(false);
};

  reconocimiento.onend = () => {
    setEscuchando(false);
  };
};

// [Productos]

  const productosConOferta = productos.filter(tieneOferta);

  const productosFiltradosMobile = productos.filter((producto) => {
    if (categoriaActiva === "Inicio") {
      return productosConOferta.length > 0 ? tieneOferta(producto) : true;
    }

    if (categoriaActiva === "Ofertas") return tieneOferta(producto);

    const mismaCategoria =
      normalizarTexto(producto.Categoría) === normalizarTexto(categoriaActiva);

    if (!mismaCategoria) return false;

    if (!esPinturas) return true;

    const subcategoriaActual = normalizarTexto(subcategoriaActiva);

    if (!subcategoriaActual || subcategoriaActual === "todas") return true;

    return normalizarTexto(producto.Subcategoría) === subcategoriaActual;
  });

  const hayBusquedaMobile = busquedaMobile.trim() !== "";
  const productosBuscadosMobile = busquedaMobile.trim()
  ? productos.filter((producto) => {
      const textoBusqueda = normalizarTexto(busquedaMobile);

      return (
        normalizarTexto(producto.Nombre).includes(textoBusqueda) ||
        normalizarTexto(producto.Marca).includes(textoBusqueda) ||
        normalizarTexto((producto as any).Linea).includes(textoBusqueda) ||
        normalizarTexto(producto.Categoría).includes(textoBusqueda) ||
        normalizarTexto(producto.Subcategoría).includes(textoBusqueda)
      );
    })
  : productosFiltradosMobile;

const gruposMobile = agruparProductosMobile(productosBuscadosMobile);
  const cantidadCarrito = carrito.reduce(
  (total, item) => total + item.cantidad,
  0
);  
  const tituloSeccion =
    categoriaActiva === "Inicio"
      ? "Ofertas destacadas"
      : categoriaActiva === "Ofertas"
      ? "Ofertas"
      : categoriaActiva;


// [Render]

return (
  <main className="min-h-screen bg-white text-gray-900">
    
{/* [Header] */}

    <section
      className="relative overflow-hidden px-4 pt-3 pb-7"
      style={{
          backgroundImage: "url('/header.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative flex items-center justify-between">
          <button
  onClick={() => setMenuAbierto(true)}
  className="flex h-11 w-11 items-center justify-center text-white transition active:scale-95"
>
  <Menu
    size={31}
    strokeWidth={2.6}
    className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
  />
</button>

          <div className="absolute left-1/2 -top-5 -translate-x-1/2">
            <div className="relative h-[88px] w-[210px]">
              <Image
                src="/logo.png"
                alt="A Todo Trapo Online"
                fill
                priority
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>

          <button
  onClick={() => setCarritoAbierto(true)}
  className="relative flex h-11 w-11 items-center justify-center text-white transition active:scale-95"
>
            <ShoppingCart
              size={31}
              strokeWidth={2.5}
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            />

            {cantidadCarrito > 0 && (
  <span
    key={cantidadCarrito}
    className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-[reboteCarrito_0.35s_ease-out] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-lg"
  >
    {cantidadCarrito}
  </span>
)}
          </button>
        </div>
      </section>

  {/* [Barra de beneficios] */}

      {categoriaActiva === "Inicio" && !hayBusquedaMobile && (
        <section className="relative z-20 -mt-4 px-4">
          <div className="grid grid-cols-4 rounded-[24px] bg-white px-2 py-2 shadow-[0_8px_22px_rgba(0,0,0,0.14)] ring-1 ring-gray-100">
          <div className="flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 text-center">
            <Palette size={17} strokeWidth={2.2} className="text-[#123A72]" />
            <p className="text-[7px] font-black leading-tight text-gray-800">
              Tintométrico
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 text-center">
            <Truck size={17} strokeWidth={2.2} className="text-[#123A72]" />
            <p className="text-[7px] font-black leading-tight text-gray-800">
              Envíos
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 text-center">
            <CreditCard size={17} strokeWidth={2.2} className="text-[#123A72]" />
            <p className="text-[7px] font-black leading-tight text-gray-800">
              Pagos
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
            <Handshake size={17} strokeWidth={2.2} className="text-[#123A72]" />
            <p className="text-[7px] font-black leading-tight text-gray-800">
              Confianza
            </p>
          </div>
          </div>
        </section>
      )}

  {/* [Buscador] */}

<section
  className={`${
    categoriaActiva === "Inicio" && !hayBusquedaMobile
      ? "px-4 pt-3 pb-1"
      : "relative z-20 -mt-4 px-4 pb-1"
  }`}
>
  <div className="flex items-center gap-2">
    <div className="flex h-11 flex-1 items-center gap-3 rounded-full bg-white px-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-gray-100">
      <Search size={19} strokeWidth={2.3} className="shrink-0 text-gray-400" />

      <input
        type="text"
        value={busquedaMobile}
        onChange={(e) => setBusquedaMobile(e.target.value)}
        placeholder="Buscar productos..."
        className="flex-1 bg-transparent text-[12px] font-medium text-gray-800 placeholder:text-gray-400 outline-none"
      />

      {busquedaMobile && (
        <button onClick={() => setBusquedaMobile("")} className="text-[16px] font-bold text-gray-400">
          ×
        </button>
      )}
    </div>

    <button
      onClick={iniciarBusquedaPorVoz}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_4px_12px_rgba(18,58,114,0.22)] transition-all duration-300 active:scale-95 ${
        escuchando ? "bg-red-500 animate-pulse" : "bg-[#123A72]"
      }`}
    >
      <Mic size={18} strokeWidth={2.5} />
    </button>
  </div>
</section>

{/* [Categorías + Banner] */}

{!hayBusquedaMobile && !esPinturas && (
  <>
    <section className="relative px-4 pt-2">
      <div className="overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pr-6">
          {categoriasCarrusel.map(({ nombre, iconoImagen }) => {
            const activa = categoriaActiva === nombre;

            return (
              <button
                key={nombre}
                onClick={() => {
                  setCategoriaActiva(nombre);
                  setSubcategoriaActiva("Todas");
                }}
                className="flex w-[62px] shrink-0 flex-col items-center gap-1.5 text-center transition-all duration-150 active:scale-90"
              >
                <div
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border transition-all duration-150 ${
                    activa
                      ? "scale-105 border-[#F8A400] bg-[#F8A400] shadow-[0_10px_20px_rgba(248,164,0,0.28)]"
                      : "border-gray-100 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.07)]"
                  }`}
                >
                  <Image
                    src={`/iconoscel/${iconoImagen}.png`}
                    alt={nombre}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>

                <span
                  className={`line-clamp-2 text-[9px] font-black leading-tight ${
                    activa ? "text-[#F8A400]" : "text-gray-800"
                  }`}
                >
                  {nombre}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>

    {categoriaActiva === "Inicio" && (
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-[28px] shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          {["/bannercel/banner1.png", "/bannercel/banner2.png", "/bannercel/banner3.png"].map(
            (banner, index) => (
              <img
                key={index}
                src={banner}
                alt="Banner"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  bannerActual === index ? "opacity-100" : "opacity-0"
                }`}
              />
            )
          )}

          <div className="aspect-[16/7]" />

          <button
            onClick={() => setBannerActual((actual) => (actual === 2 ? 0 : actual + 1))}
            className="absolute bottom-3 left-5 rounded-full bg-white px-4 py-2 text-[10px] font-black text-[#123A72] shadow-lg transition active:scale-95"
          >
            Ver más
          </button>

          <div className="absolute bottom-4 right-5 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  bannerActual === i ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    )}
  </>
)}
  {/* [Subcategorías] */}

{esCategoriaProductos && (
  <section className="px-4 pt-2">
    <div className="mb-3 flex items-center gap-3">
      <button
        onClick={() => {
          setCategoriaActiva("Inicio");
          setSubcategoriaActiva("Todas");
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#123A72] shadow-sm ring-1 ring-blue-50 active:scale-95"
      >
        ←
      </button>

      <div>
        <h2 className="text-[21px] font-black leading-none tracking-[-0.05em] text-[#123A72]">
          {categoriaActiva}
        </h2>

        <p className="mt-1 text-[10px] font-semibold text-gray-500">
          Elegí una subcategoría
        </p>
      </div>
    </div>

    {esPinturas && (
      <div className="mt-2 overflow-x-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pr-4">
          {subcategoriasPinturas.map((subcategoria) => {
            const activa = subcategoriaActiva === subcategoria;

            const iconosSubcategorias: any = {
              Todas: PaintBucket,
              Latex: Droplets,
              Látex: Droplets,
              Esmaltes: Paintbrush,
              Impermeabilizante: ShieldCheck,
              Impermeabilizantes: ShieldCheck,
              Piscinas: Waves,
              "P/ Piscinas": Waves,
              Accesorios: Wrench,
              Rodillos: Brush,
              Pinceles: Brush,
              Adhesivos: Package,
              Diluyentes: FlaskConical,
              Texturado: PaintBucket,
            };

            const nombresCortos: any = {
              Impermeabilizante: "Impermea.",
              Impermeabilizantes: "Impermea.",
              "P/ Piscinas": "Piscinas",
            };

            const Icono = iconosSubcategorias[subcategoria] || PaintBucket;
            const nombreVisible = nombresCortos[subcategoria] || subcategoria;

            return (
              <button
                key={subcategoria}
                onClick={() => setSubcategoriaActiva(subcategoria)}
                className="flex w-[66px] shrink-0 flex-col items-center gap-1.5 text-center transition active:scale-95"
              >
                <div
                  className={`flex h-[58px] w-[58px] items-center justify-center rounded-full border transition-all duration-200 ${
                    activa
                      ? "border-[#F8A400] bg-[#F8A400] text-white shadow-[0_8px_18px_rgba(248,164,0,0.24)]"
                      : "border-gray-100 bg-white text-[#123A72] shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <Icono size={24} strokeWidth={2.1} />
                </div>

                <span
                  className={`line-clamp-2 text-[9.5px] font-black leading-tight ${
                    activa ? "text-[#F8A400]" : "text-gray-800"
                  }`}
                >
                  {nombreVisible}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    )}
  </section>
)}

  {/* [Título sección] */}

      {!esCategoriaProductos && !hayBusquedaMobile && (
        <section className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-[20px] font-black tracking-[-0.05em] text-gray-950">
            {tituloSeccion}
          </h2>

          {categoriaActiva !== "Ofertas" && (
  <button
    onClick={() => {
      setCategoriaActiva("Ofertas");
      setSubcategoriaActiva("Todas");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
    className="flex items-center gap-1 text-[10px] font-black text-[#123A72]"
  >
    Ver todas
    <span className="text-lg leading-none">›</span>
  </button>
)}
        </section>
      )}

  {/* [Productos] */}

      <section className="bg-white px-2 pt-2 pb-6">
  <div className="grid grid-cols-3 gap-2">
    {gruposMobile.map((grupo: any, index: number) => {
      const producto = grupo.items[0];
      const precio = precioNumero(producto.Precio);
const precioOferta = precioNumero(producto["Precio oferta"]);
const precioFinal = precioOferta > 0 ? precioOferta : precio;

      const descuento =
        precio > 0 && precioOferta > 0
          ? Math.round(((precio - precioOferta) / precio) * 100)
          : 0;

      return (
        <button
          key={`${grupo.linea}-${grupo.nombre}-${index}`}
          onClick={() => {
            setProductoAbierto(grupo);
            setCantidadDetalle(1);
          }}
          className="min-w-0 rounded-2xl border border-gray-100 bg-white p-1.5 text-left shadow-[0_5px_15px_rgba(0,0,0,0.08)] active:scale-[0.98]"
        >
          <div className="relative flex aspect-square items-end justify-center rounded-xl bg-gray-50 pt-5 pb-0.5">
            {grupo.marca && (
              <span className="absolute left-1 top-1 z-20 max-w-[56px] truncate rounded-full bg-white px-2 py-[2px] text-[7px] font-black text-gray-800 shadow">
                {grupo.marca}
              </span>
            )}

            {descuento > 0 && (
              <span className="absolute right-1 top-1 z-20 rounded-full bg-red-600 px-2 py-[2px] text-[7px] font-black text-white shadow">
                -{descuento}%
              </span>
            )}


            {producto.Imagen && (
  <img
  src={producto.Imagen}
  alt={producto.nombre}
  className="relative z-10 h-[81%] w-[81%] object-contain"
/>
)}

          </div>

          

          <p className="mt-1 line-clamp-2 min-h-0 text-[10px] font-black leading-tight text-gray-900">
            {grupo.nombre}
          </p>

          {grupo.linea && (
            <p className="mt-0.5 truncate text-[8px] font-semibold text-gray-500">
              {grupo.linea}
            </p>
          )}

          <div className="mt-1 leading-none">
            {precioOferta > 0 && precio > 0 && (
              <p className="text-[8px] font-bold leading-none text-red-500 line-through">
                ${formatoPrecio(precio)}
              </p>
            )}

            <p className="mt-[2px] text-[11px] font-black leading-none text-[#123A72]">
              ${formatoPrecio(precioFinal)}
            </p>
          </div>
        </button>
      );
    })}
  </div>
</section>

  {/* [Detalle del producto] */}

{productoAbierto && (() => {
  const claveDetalle = `${productoAbierto.linea}-${productoAbierto.nombre}`;

  const tamanos: string[] = Array.from(
    new Set(
      productoAbierto.items
        .map((item: Producto) => item.Tamaño?.trim())
        .filter((valor: any): valor is string => Boolean(valor))
    )
  );

  const fragancias: string[] = Array.from(
    new Set(
      productoAbierto.items
        .map((item: any) => item.Fragancias?.trim())
        .filter((valor: any): valor is string => Boolean(valor))
    )
  );

  const colores: string[] = Array.from(
    new Set(
      productoAbierto.items
        .map((item: Producto) => item.Color?.trim())
        .filter((valor: any): valor is string => Boolean(valor))
    )
  );

  const tieneFragancias = fragancias.length > 0;
  const variantes = tieneFragancias ? fragancias : colores;

  const tamanoSeleccionado =
    tamanosSeleccionados[claveDetalle] || tamanos[0] || "";

  const varianteSeleccionada = tieneFragancias
    ? fraganciasSeleccionadas[claveDetalle] || fragancias[0] || ""
    : coloresSeleccionados[claveDetalle] || colores[0] || "";

  const producto =
    productoAbierto.items.find((item: any) => {
      const mismoTamano =
        !tamanoSeleccionado || item.Tamaño?.trim() === tamanoSeleccionado;

      const mismaVariante = tieneFragancias
        ? !varianteSeleccionada ||
          item.Fragancias?.trim() === varianteSeleccionada
        : !varianteSeleccionada || item.Color?.trim() === varianteSeleccionada;

      return mismoTamano && mismaVariante;
    }) || productoAbierto.items[0];

  const precio = precioNumero(producto.Precio);
  const precioOferta = precioNumero(producto["Precio oferta"]);
  const precioFinal = precioOferta > 0 ? precioOferta : precio;

  const descuento =
    precio > 0 && precioOferta > 0
      ? Math.round(((precio - precioOferta) / precio) * 100)
      : 0;

  const ahorro = precio > 0 && precioOferta > 0 ? precio - precioOferta : 0;
  const textoAromas =
  (producto as any)["Aromas"]?.trim() ||
  (producto as any)["Aroma"]?.trim() ||
  (producto as any)["aromas"]?.trim() ||
  "";

const mostrarChapitaAromas = !tieneFragancias && textoAromas;

  return (
    <div
  onClick={() => setProductoAbierto(null)}
  className="fixed inset-0 z-[100] flex items-end bg-black/45 backdrop-blur-[2px]"
>
      <div
  onClick={(e) => e.stopPropagation()}
  className="relative mt-auto w-full rounded-t-[28px] bg-white px-4 pt-3 pb-5 shadow-[0_-18px_45px_rgba(0,0,0,0.22)]"
>
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-gray-300" />

        <button
          onClick={() => setProductoAbierto(null)}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl font-light text-[#173F2A] shadow"
        >
          ×
        </button>

        <div className="grid grid-cols-[38%_62%] gap-3">
          <div className="relative flex min-h-[150px] items-end justify-center overflow-hidden rounded-[22px] bg-[#F4F1EA] pt-6 pb-2">
            {productoAbierto.marca && (
              <span className="absolute left-2 top-2 z-20 max-w-[74px] truncate rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-[#173F2A] shadow">
                {productoAbierto.marca}
              </span>
            )}

            {descuento > 0 && (
              <span className="absolute right-2 top-2 z-20 rounded-full bg-[#EF3B46] px-2 py-1 text-[9px] font-black text-white shadow">
                -{descuento}%
              </span>
            )}

            {producto.Imagen && (
  <img
  src={producto.Imagen}
  alt={producto.nombre}
  className="relative z-10 h-[81%] w-[81%] object-contain"
/>
)}

{mostrarChapitaAromas && (
  <div className="absolute bottom-2 left-2 z-20 rounded-full bg-[#FFEAF4] px-2 py-[2px] shadow-sm ring-1 ring-pink-200">
  <div className="flex items-center gap-1">
    <span className="text-[8px]">🌸</span>

    <span className="text-[7px] font-black leading-none text-[#D63384]">
      {textoAromas}
    </span>
  </div>
</div>
)}
          </div>

          <div className="pt-3">
            <h3 className="pr-8 text-[17px] font-black leading-[0.98] tracking-[-0.05em] text-[#173F2A]">
              {productoAbierto.nombre}
            </h3>

            {productoAbierto.linea && (
              <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-600">
                {productoAbierto.linea}
              </p>
            )}

            <div className="mt-2">
              <p className="text-[21px] font-black leading-none text-[#173F2A]">
                ${formatoPrecio(precioFinal)}
              </p>

              {(precioOferta > 0 && precio > 0) || ahorro > 0 ? (
                <div className="mt-1 flex items-center gap-2">
                  {precioOferta > 0 && precio > 0 && (
                    <p className="text-[10px] font-bold leading-none text-gray-400 line-through">
                      ${formatoPrecio(precio)}
                    </p>
                  )}

                  {ahorro > 0 && (
                    <p className="text-[9px] font-black leading-none text-[#55724D]">
                      Ahorrás ${formatoPrecio(ahorro)}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-2 h-1 w-10 rounded-full bg-[#E5BFA7]" />

            {tamanos.length > 0 && (
              <div className="mt-2.5">
                <p className="mb-1 text-[9px] font-black text-gray-500">
                  Tamaño
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {tamanos.map((tamano) => {
                    const activo = tamanoSeleccionado === tamano;

                    return (
                      <button
                        key={tamano}
                        onClick={() =>
                          setTamanosSeleccionados((actual: any) => ({
                            ...actual,
                            [claveDetalle]: tamano,
                          }))
                        }
                        className={`rounded-full px-2 py-1 text-[9px] font-black shadow-sm transition active:scale-95 ${
                          activo
                            ? "bg-[#173F2A] text-white"
                            : "bg-white text-[#173F2A] ring-1 ring-gray-100"
                        }`}
                      >
                        {tamano}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            {variantes.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[9px] font-black text-gray-500">
                  {tieneFragancias ? "Fragancia" : "Color"}
                </p>

                <select
                  value={varianteSeleccionada}
                  onChange={(evento) => {
                    const valor = evento.target.value;

                    if (tieneFragancias) {
                      setFraganciasSeleccionadas((actual: any) => ({
                        ...actual,
                        [claveDetalle]: valor,
                      }));
                    } else {
                      setColoresSeleccionados((actual: any) => ({
                        ...actual,
                        [claveDetalle]: valor,
                      }));
                    }
                  }}
                  className="h-7 w-full rounded-full border border-gray-100 bg-white px-3 text-[9px] font-black text-[#173F2A] shadow-sm outline-none"
                >
                  {variantes.map((variante) => (
                    <option key={variante} value={variante}>
                      {variante}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-2 flex h-7 items-center justify-between rounded-full border border-gray-100 bg-white px-3 shadow-sm">
              <span className="text-[9px] font-black text-gray-600">
                Cantidad
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCantidadDetalle((cantidad) =>
                      cantidad > 1 ? cantidad - 1 : 1
                    )
                  }
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#EEF1EA] text-xs font-black text-[#173F2A]"
                >
                  -
                </button>

                <span className="text-[12px] font-black text-[#173F2A]">
                  {cantidadDetalle}
                </span>

                <button
                  onClick={() => setCantidadDetalle((cantidad) => cantidad + 1)}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#173F2A] text-xs font-black text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
  onClick={() => {
  const itemCarrito = {
    clave: `${productoAbierto.nombre}-${tamanoSeleccionado}-${varianteSeleccionada}`,
    nombre: productoAbierto.nombre,
    linea: productoAbierto.linea,
    marca: productoAbierto.marca,
    imagen: producto.Imagen,
    tamano: tamanoSeleccionado,
    variante: varianteSeleccionada,
    tipoVariante: tieneFragancias ? "Fragancia" : "Color",
    precio: precioFinal,
    precioOriginal: precio,
    precioOferta: precioOferta,
    ahorro: ahorro,
    cantidad: cantidadDetalle,
  };

  setCarrito((actual) => {
    const existe = actual.find((item) => item.clave === itemCarrito.clave);

    if (existe) {
      return actual.map((item) =>
        item.clave === itemCarrito.clave
          ? {
              ...item,
              cantidad: item.cantidad + cantidadDetalle,
              precio: precioFinal,
              precioOriginal: precio,
              precioOferta: precioOferta,
              ahorro: ahorro,
            }
          : item
      );
    }

    return [...actual, itemCarrito];
  });

  setProductoAgregado(true);
  setMostrarConfirmacionCarrito(true);

  setTimeout(() => {
    setProductoAgregado(false);
  }, 700);

  setTimeout(() => {
    setMostrarConfirmacionCarrito(false);
  }, 900);
}}
className={`relative mt-3 flex h-11 w-full items-center overflow-hidden rounded-full text-white shadow-[0_12px_26px_rgba(23,63,42,0.28)] transition-all duration-300 active:scale-[0.98] ${
  productoAgregado ? "bg-green-600" : "bg-[#173F2A]"
}`}
>
  <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF1EA] text-[#173F2A]">
    {productoAgregado ? (
      <span className="text-[18px] font-black">✓</span>
    ) : (
      <ShoppingCart size={20} strokeWidth={2.4} />
    )}
  </div>

  <span className="ml-3 flex-1 text-left text-[13px] font-black">
    {productoAgregado ? "Agregado" : "Agregar al carrito"}
  </span>

  <span className="relative flex h-full min-w-[118px] items-center justify-center bg-[#F3E3D3] px-5 text-[13px] font-black text-[#173F2A] before:absolute before:left-[-21px] before:top-0 before:h-full before:w-10 before:skew-x-[-18deg] before:bg-[#F3E3D3] before:content-['']">
    <span className="relative z-10">
      ${formatoPrecio(precioFinal * cantidadDetalle)}
    </span>
  </span>
</button>

        <div className="mt-3 flex items-center justify-center gap-5 text-[#173F2A]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <Truck size={15} strokeWidth={2.2} />
            <span>Envíos rápidos</span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <CreditCard size={15} strokeWidth={2.2} />
            <span>Todos los métodos de pago</span>
          </div>
        </div>
      </div>
    </div>
  );
})()}

  {/* [Beneficio inferior] */}

      {!esCategoriaProductos && !hayBusquedaMobile && (
        <section className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-3 rounded-3xl bg-gray-50 px-4 py-3 shadow-sm ring-1 ring-gray-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#123A72] text-white">
              <BadgeCheck size={22} />
            </div>

            <div>
              <p className="text-[12px] font-black text-gray-900">
                Elegí calidad, elegí A Todo Trapo
              </p>

              <p className="mt-0.5 text-[10px] font-semibold leading-tight text-gray-500">
                Más de 1000 productos para tu hogar, tu obra y tu piscina.
              </p>
            </div>
          </div>
        </section>
      )}

  {/* [Footer] */}

      <footer className="bg-[#0D2F5E] px-5 pt-8 pb-10 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <MapPin size={24} className="mx-auto mb-2 text-white/90" />

            <h3 className="text-[11px] font-black">Ubicación</h3>

            <p className="mt-2 text-[10px] leading-relaxed text-white/75">
              Candelaria
              <br />
              Misiones
            </p>
          </div>

          <div className="border-x border-white/15 px-2">
            <Clock size={24} className="mx-auto mb-2 text-white/90" />

            <h3 className="text-[11px] font-black">Horarios</h3>

            <p className="mt-2 text-[10px] leading-relaxed text-white/75">
              Lun a Sáb
              <br />
              8:00 - 12:00
              <br />
              16:00 - 19:15
              <br />
              Dom 9:30 - 12:00
            </p>
          </div>

          <div>
            <FaInstagram size={24} className="mx-auto mb-2 text-white/90" />

            <h3 className="text-[11px] font-black">Instagram</h3>

            <p className="mt-2 text-[10px] leading-relaxed text-white/75">
              @atodo_trapo01
<br />
Instagram
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-white/15" />

        <div className="text-center">
          <p className="text-[11px] font-black">Medios de pago</p>

          <p className="mt-2 text-[10px] text-white/70">
            Efectivo · Tarjetas · Transferencia · Mercado Pago
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[9px] text-white/45">
            © 2026 A Todo Trapo Online. Todos los derechos reservados.
          </p>
        </div>
      </footer>

  {/* [Botón volver] */}

{esCategoriaProductos && (
  <button
    onClick={() => {
      setCategoriaActiva("Inicio");
      setSubcategoriaActiva("Todas");

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);
    }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
         flex items-center gap-2
         bg-white/95 backdrop-blur-md
         border border-gray-200
         rounded-full
         px-2.5 py-1.5
         shadow-[0_12px_35px_rgba(0,0,0,0.18)]
         hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]
         hover:-translate-y-1
         transition-all duration-300"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-950 text-white shadow-sm">
      <span className="relative -top-[2px] text-[16px] font-bold leading-none">
  ←
</span>
    </div>

    <span className="pr-2 text-[13px] font-extrabold tracking-[-0.02em] text-blue-950">
      Volver
    </span>
  </button>
)}

  {/* [WhatsApp] */}

<a
  href="https://wa.me/5491123193387"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-5 right-4 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_25px_rgba(37,211,102,0.38)] transition active:scale-95"
>
  <FaWhatsapp size={31} />
</a>

{mostrarConfirmacionCarrito && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
    <div className="flex flex-col items-center justify-center rounded-[28px] bg-white/95 px-7 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md animate-[confirmacionCarrito_0.9s_ease-out]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#173F2A] text-white shadow-[0_10px_25px_rgba(23,63,42,0.35)]">
        <span className="text-[34px] font-black leading-none">✓</span>
      </div>

      <p className="mt-3 text-[14px] font-black text-[#173F2A]">
        Producto agregado
      </p>
    </div>
  </div>
)}

{/* [Carrito] */}

{carritoAbierto && (
  <div
  onClick={() => setCarritoAbierto(false)}
  className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-[2px]"
>
    <div
  onClick={(e) => e.stopPropagation()}
  className="absolute right-0 top-0 flex h-full w-[92%] max-w-[390px] flex-col rounded-l-[30px] bg-white shadow-[0_0_45px_rgba(0,0,0,0.28)]"
>
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
            Tu pedido
          </p>

          <h2 className="mt-0.5 text-[22px] font-black tracking-[-0.05em] text-[#173F2A]">
            Carrito
          </h2>

          <p className="mt-0.5 text-[10px] font-bold text-gray-500">
            {carrito.length} producto{carrito.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          onClick={() => setCarritoAbierto(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF1EA] text-xl font-light text-[#173F2A]"
        >
          ×
        </button>
      </div>

      <div className="mx-4 h-px bg-gray-100" />

      {carrito.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF1EA] text-[#173F2A]">
            <ShoppingCart size={30} strokeWidth={2.2} />
          </div>

          <h3 className="mt-4 text-[18px] font-black tracking-[-0.04em] text-[#173F2A]">
            Tu carrito está vacío
          </h3>

          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-gray-500">
            Agregá productos al pedido y después lo enviás por WhatsApp.
          </p>

          <button
            onClick={() => setCarritoAbierto(false)}
            className="mt-5 rounded-full bg-[#173F2A] px-5 py-2.5 text-[11px] font-black text-white shadow-[0_10px_24px_rgba(23,63,42,0.25)] active:scale-95"
          >
            Seguir comprando
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-2.5">
              {carrito.map((item) => (
                <div
                  key={item.clave}
                  className="relative rounded-[18px] bg-white p-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.07)] ring-1 ring-gray-100"
                >
                  <button
                    onClick={() =>
                      setCarrito((actual) =>
                        actual.filter((producto) => producto.clave !== item.clave)
                      )
                    }
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-lg font-light text-gray-500"
                  >
                    ×
                  </button>

                  <div className="grid grid-cols-[30%_70%] gap-2.5">
                    <div className="relative flex aspect-square items-end justify-center rounded-2xl bg-[#F4F1EA] p-1.5">
                      {item.marca && (
                        <span className="absolute left-1.5 top-1.5 max-w-[54px] truncate rounded-full bg-white px-1.5 py-[2px] text-[7px] font-black text-[#173F2A] shadow">
                          {item.marca}
                        </span>
                      )}

                      {item.imagen && (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="h-[82%] w-[82%] object-contain"
                        />
                      )}
                    </div>

                    <div className="pr-7">
                      <h3 className="line-clamp-2 text-[12px] font-black leading-tight text-[#173F2A]">
                        {item.nombre}
                      </h3>

                      {item.linea && (
                        <p className="mt-0.5 truncate text-[9px] font-bold text-gray-500">
                          {item.linea}
                        </p>
                      )}

                      <div className="mt-1.5 space-y-0.5">
                        {item.tamano && (
                          <p className="text-[9px] font-bold text-gray-500">
                            Tamaño:{" "}
                            <span className="text-[#173F2A]">{item.tamano}</span>
                          </p>
                        )}

                        {item.variante && (
                          <p className="text-[9px] font-bold text-gray-500">
                            {item.tipoVariante}:{" "}
                            <span className="text-[#173F2A]">
                              {item.variante}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-[14px] font-black text-[#173F2A]">
                          ${formatoPrecio(item.precio * item.cantidad)}
                        </p>

                        <div className="flex h-7 items-center gap-2 rounded-full bg-white px-2.5 shadow ring-1 ring-gray-100">
                          <button
                            onClick={() =>
                              setCarrito((actual) =>
                                actual.map((producto) =>
                                  producto.clave === item.clave
                                    ? {
                                        ...producto,
                                        cantidad: Math.max(
                                          1,
                                          producto.cantidad - 1
                                        ),
                                      }
                                    : producto
                                )
                              )
                            }
                            className="text-[14px] font-black text-[#173F2A]"
                          >
                            -
                          </button>

                          <span className="text-[11px] font-black text-[#173F2A]">
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() =>
                              setCarrito((actual) =>
                                actual.map((producto) =>
                                  producto.clave === item.clave
                                    ? {
                                        ...producto,
                                        cantidad: producto.cantidad + 1,
                                      }
                                    : producto
                                )
                              )
                            }
                            className="text-[14px] font-black text-[#173F2A]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[18px] bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.07)] ring-1 ring-gray-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>Subtotal</span>
                <span>
                  $
                  {formatoPrecio(
                    carrito.reduce(
                      (total, item) => total + item.precio * item.cantidad,
                      0
                    )
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>Envío</span>
                <span className="text-[#173F2A]">A coordinar</span>
              </div>

              {carrito.reduce(
                (total, item) => total + (item.ahorro || 0) * item.cantidad,
                0
              ) > 0 && (
                <>
                  <div className="my-3 border-t border-dashed border-gray-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-green-700">
                      🏷 Ahorrás en este pedido
                    </span>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-green-700">
                      -$
                      {formatoPrecio(
                        carrito.reduce(
                          (total, item) =>
                            total + (item.ahorro || 0) * item.cantidad,
                          0
                        )
                      )}
                    </span>
                  </div>
                </>
              )}

              <div className="my-3 h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-black text-[#173F2A]">
                  Total
                </span>

                <span className="text-[18px] font-black text-[#173F2A]">
                  $
                  {formatoPrecio(
                    carrito.reduce(
                      (total, item) => total + item.precio * item.cantidad,
                      0
                    )
                  )}
                </span>
              </div>

              {carrito.reduce(
                (total, item) => total + (item.ahorro || 0) * item.cantidad,
                0
              ) > 0 && (
                <p className="mt-2 text-[9px] font-semibold text-gray-500">
                  ✓ Precios de oferta aplicados
                </p>
              )}
            </div>
          </div>

          <div className="px-3 pb-3">
            <a
              href={`https://wa.me/5491123193387?text=${encodeURIComponent(
  `Hola! Quiero hacer este pedido:\n\n${carrito
    .map(
      (item, index) =>
        `${index + 1}) ${item.nombre}${
          item.linea ? `\n   Línea: ${item.linea}` : ""
        }\n   Marca: ${item.marca || "-"}\n   Tamaño: ${
          item.tamano || "-"
        }\n   ${item.tipoVariante}: ${
          item.variante || "-"
        }\n   Cantidad: ${item.cantidad}\n   Precio unitario: $${formatoPrecio(
          item.precio
        )}\n   Subtotal: $${formatoPrecio(item.precio * item.cantidad)}`
    )
    .join("\n\n")}\n\nTotal del pedido: $${formatoPrecio(
    carrito.reduce((total, item) => total + item.precio * item.cantidad, 0)
  )}\n\nMi direccion es:`
)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-[18px] bg-[#128C3A] p-3 text-white shadow-[0_10px_22px_rgba(18,140,58,0.25)] active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/18">
                <FaWhatsapp size={22} />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-black">
                  Finalizar por WhatsApp
                </p>

                <p className="mt-0.5 text-[9px] font-semibold text-white/80">
                  Confirmar pedido y coordinar.
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[17px] font-black text-[#128C3A]">
                →
              </div>
            </a>
          </div>
        </>
      )}

      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-[18px] bg-[#F4F1EA] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#173F2A] shadow-sm">
              <Truck size={18} strokeWidth={2.3} />
            </div>

            <div>
              <p className="text-[10px] font-black leading-tight text-[#173F2A]">
                Envíos rápidos
              </p>

              <p className="mt-0.5 text-[8px] font-semibold leading-tight text-gray-500">
                Hasta tu domicilio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[18px] bg-[#F4F1EA] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#173F2A] shadow-sm">
              <CreditCard size={18} strokeWidth={2.3} />
            </div>

            <div>
              <p className="text-[10px] font-black leading-tight text-[#173F2A]">
                Medios de pago
              </p>

              <p className="mt-0.5 text-[8px] font-semibold leading-tight text-gray-500">
                Efectivo y tarjetas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* [Escuchando] */}

{escuchando && (
  <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
    <div className="flex flex-col items-center rounded-[26px] bg-white px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">

      <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
        <Mic size={34} strokeWidth={2.4} />
      </div>

      <h3 className="mt-5 text-[18px] font-black text-[#123A72]">
        Escuchando...
      </h3>

      <p className="mt-2 text-center text-[11px] font-semibold text-gray-500">
        Hablá normalmente.
      </p>

      <button
        onClick={() => setEscuchando(false)}
        className="mt-6 rounded-full bg-[#123A72] px-6 py-2.5 text-[11px] font-black text-white"
      >
        Cancelar
      </button>

    </div>
  </div>
)}

{/* [Menú lateral] */}

{menuAbierto && (
  <div
  onClick={() => setMenuAbierto(false)}
  className="fixed inset-0 z-[140] bg-black/45 backdrop-blur-[2px]"
>
    <div
  onClick={(e) => e.stopPropagation()}
  className="absolute left-0 top-0 flex h-full w-[82%] max-w-[335px] flex-col overflow-hidden rounded-r-[28px] bg-[#F7FAFF] shadow-[0_0_40px_rgba(0,0,0,0.28)]"
>
      <div className="relative overflow-hidden rounded-br-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <img
          src="/banners/menu.png"
          alt="A Todo Trapo"
          className="h-[178px] w-full object-cover"
        />

        <button
          onClick={() => setMenuAbierto(false)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[28px] font-light text-[#123A72] shadow-lg backdrop-blur-md transition active:scale-95"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2.5">
          <button
            onClick={() => {
              setCategoriaActiva("Inicio");
              setSubcategoriaActiva("Todas");
              setMenuAbierto(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex w-full items-center gap-3 rounded-[18px] bg-white px-3 py-3 text-left shadow-sm ring-1 ring-blue-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#123A72]">
              <Home size={21} />
            </div>

            <div className="flex-1">
              <p className="text-[13px] font-black text-[#123A72]">Inicio</p>
              <p className="text-[10px] font-semibold text-gray-500">
                Volver al inicio
              </p>
            </div>

            <span className="text-xl text-[#123A72]/45">›</span>
          </button>

          <button
            onClick={() => {
              setCarritoAbierto(true);
              setMenuAbierto(false);
            }}
            className="flex w-full items-center gap-3 rounded-[18px] bg-white px-3 py-3 text-left shadow-sm ring-1 ring-blue-50"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#123A72]">
              <ShoppingCart size={21} />

              {cantidadCarrito > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF3B46] px-1 text-[8px] font-black text-white">
                  {cantidadCarrito}
                </span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-[13px] font-black text-[#123A72]">
                Mi pedido
              </p>
              <p className="text-[10px] font-semibold text-gray-500">
                Revisá tu carrito
              </p>
            </div>

            <span className="text-xl text-[#123A72]/45">›</span>
          </button>

          <a
  href="https://www.instagram.com/atodo_trapo01/?hl=es"
  target="_blank"
  rel="noopener noreferrer"
  className="flex w-full items-center gap-3 rounded-[18px] bg-white px-3 py-3 text-left shadow-sm ring-1 ring-blue-50 transition active:scale-[0.98]"
>
  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EDFF] text-[#8A3AB9]">
    <FaInstagram size={22} />
  </div>

  <div className="flex-1">
    <p className="text-[13px] font-black text-[#123A72]">
      Instagram
    </p>
  </div>

  <span className="text-xl text-[#123A72]/45">›</span>
</a>

          <button
  onClick={() => {
    setMenuAbierto(false);
    setUbicacionAbierta(true);
  }}
  className="flex w-full items-center gap-3 rounded-[18px] bg-white px-3 py-3 text-left shadow-sm ring-1 ring-blue-50 transition active:scale-[0.98]"
>
  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#123A72]">
    <MapPin size={21} />
  </div>

  <div className="flex-1">
    <p className="text-[13px] font-black text-[#123A72]">
      Horarios y ubicación
    </p>

    <p className="text-[10px] font-semibold text-gray-500">
      Candelaria, Misiones
    </p>
  </div>

  <span className="text-xl text-[#123A72]/45">
    ›
  </span>
</button>
        </div>

        <div className="mt-5 rounded-[24px] bg-[#081B43] p-5 text-white shadow-[0_18px_40px_rgba(8,27,67,0.35)]">
  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F8A400]">
    PARA NEGOCIOS
  </p>

  <h3 className="mt-3 text-[24px] font-black leading-tight tracking-[-0.04em]">
    ¿Te gustó esta página?
  </h3>

  <p className="mt-3 text-[12px] leading-relaxed text-white/75">
    Diseñamos páginas web modernas para negocios, comercios y empresas.
  </p>

  <a
    href="https://wa.me/5491123193387?text=Hola!%20Quiero%20consultar%20por%20una%20p%C3%A1gina%20web%20para%20mi%20negocio."
    target="_blank"
    rel="noopener noreferrer"
    className="mt-5 inline-flex h-11 items-center gap-3 rounded-full bg-[#F8A400] px-6 text-[12px] font-black text-[#081B43] shadow-[0_10px_24px_rgba(248,164,0,0.28)] transition active:scale-95"
  >
    Solicitar información

    <span className="text-lg">→</span>
  </a>
</div>
</div>

<div className="px-4 pb-4">
  <div className="rounded-[20px] bg-white px-4 py-3 text-center shadow-sm ring-1 ring-blue-50">
    <p className="text-[12px] font-black text-[#123A72]">
      Gracias por elegirnos 💙
    </p>
  </div>
</div>
    </div>
  </div>
)}

{/* [Horarios y ubicación] */}

{ubicacionAbierta && (
  <div
  onClick={() => setUbicacionAbierta(false)}
  className="fixed inset-0 z-[150] flex items-end bg-black/45 backdrop-blur-[2px]"
>
    <div
  onClick={(e) => e.stopPropagation()}
  className="w-full rounded-t-[28px] bg-[#F7FAFF] px-4 pt-3 pb-4 shadow-[0_-10px_35px_rgba(0,0,0,0.20)]"
>
      <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-gray-300" />

      <button
        onClick={() => setUbicacionAbierta(false)}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl font-light text-[#123A72] shadow"
      >
        ×
      </button>

      <div className="flex items-center gap-3 pr-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#123A72]">
          <MapPin size={23} />
        </div>

        <div>
          <h2 className="text-[18px] font-black leading-tight text-[#123A72]">
            Horarios y ubicación
          </h2>
          <p className="text-[10px] font-semibold text-gray-500">
            Candelaria, Misiones
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-blue-50">
          <p className="text-[11px] font-black text-[#123A72]">
            Lun a Sáb
          </p>
          <p className="mt-1 text-[10px] font-semibold text-gray-500">
            8:00 - 12:00
          </p>
          <p className="text-[10px] font-semibold text-gray-500">
            16:00 - 19:15
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-blue-50">
          <p className="text-[11px] font-black text-[#123A72]">
            Domingo
          </p>
          <p className="mt-1 text-[10px] font-semibold text-gray-500">
            9:30 - 12:00
          </p>
          <p className="text-[10px] font-semibold text-gray-400">
            Feriados consultar
          </p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-blue-50">
        <div className="grid grid-cols-[52%_48%]">
          <div className="p-4">
            <p className="text-[13px] font-black text-[#123A72]">
              A Todo Trapo
            </p>

            <p className="mt-1 text-[10px] font-semibold leading-tight text-gray-500">
              Anastacio Cabrera y San Martín
<br />
Candelaria, Misiones
            </p>

            <a
              href="https://maps.google.com/?q=Anastacio+Cabrera+y+San+Martin,+Candelaria,+Misiones,+Argentina+3308"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 text-[10px] font-black text-[#123A72]"
            >
              <MapPin size={14} />
              Cómo llegar
            </a>
          </div>

          <iframe
            src="https://www.google.com/maps?q=Anastacio+Cabrera+y+San+Martin,+Candelaria,+Misiones,+Argentina+3308&output=embed"
            className="h-[135px] w-full border-0"
            loading="lazy"
          />
        </div>
      </div>

      <a
  href="https://wa.me/5491123193387"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 flex items-center gap-4 rounded-[20px] bg-[#081B43] px-5 py-4 text-white shadow-[0_10px_24px_rgba(8,27,67,0.22)]"
>
  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8A400] text-[#081B43]">
    <FaWhatsapp size={22} />
  </div>

  <div>
    <p className="text-[13px] font-black">
      ¿Tenés alguna consulta?
    </p>

    <p className="text-[10px] font-semibold text-white/70">
      Escribinos por WhatsApp
    </p>
  </div>
</a>
    </div>
  </div>
)}

</main>
  );
}