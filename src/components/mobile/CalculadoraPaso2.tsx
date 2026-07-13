"use client";



import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {

  ArrowLeft,

  ArrowRight,


  Check,

  ClipboardList,

  PaintBucket,

  PaintRoller,

  SearchX,

  ChevronLeft,

  ChevronRight,

} from "lucide-react";



import type { Producto } from "@/src/types/producto";

import type { DatosPasoUno } from "./CalculadoraPintura";

import MobileHeaderCompartido from "./MobileHeaderCompartido";
import CalculadoraPaso3 from "./CalculadoraPaso3";



type PinturaAgrupada = {

  id: string;

  productoBase: Producto;

  variantes: Producto[];

  manosRecomendadas: number;

  poderCubritivo: number;

};



export type DatosPasoDos = {

  pintura: Producto;

  variantes: Producto[];

  manos: number;

  poderCubritivo: number;

};



type CalculadoraPasoDosProps = {

  datosPasoUno: DatosPasoUno;

  productos: Producto[];

  cantidadCarrito?: number;

  onVolverPaso: () => void;

  onContinuar: (datos: DatosPasoDos) => void;

  onAgregarAlCarrito: (
    items: Array<{
      producto: Producto;
      cantidad: number;
    }>
  ) => void;

  onFinalizado: () => void;

};



function normalizarTexto(valor: unknown) {

  return String(valor ?? "")

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .trim()

    .toLowerCase();

}



function convertirNumero(valor: unknown) {

  const limpio = String(valor ?? "")

    .replace(/\./g, "")

    .replace(",", ".")

    .replace(/[^\d.-]/g, "");



  const numero = Number(limpio);



  return Number.isFinite(numero) ? numero : 0;

}



function obtenerPalabrasClave(valor: unknown) {
  const palabrasIgnoradas = [
    "para",
    "con",
    "sin",
    "del",
    "las",
    "los",
    "una",
    "uno",
  ];

  return normalizarTexto(valor)
    .split(/[^a-z0-9]+/)
    .filter(
      (palabra) =>
        palabra.length >= 3 &&
        !palabrasIgnoradas.includes(palabra)
    );
}

function coincidePorPalabras(
  textoProducto: unknown,
  textoSeleccionado: unknown
) {
  const palabrasProducto = obtenerPalabrasClave(textoProducto);
  const palabrasSeleccionadas =
    obtenerPalabrasClave(textoSeleccionado);

  return palabrasSeleccionadas.some((palabra) =>
    palabrasProducto.includes(palabra)
  );
}



function productoTieneStock(producto: Producto) {

  return normalizarTexto(producto.Stock) !== "x";

}



function obtenerClaveProducto(producto: Producto) {

  return [

    normalizarTexto(producto.Marca),

    normalizarTexto(producto.Linea),

    normalizarTexto(producto.Nombre),

  ].join("|");

}



function formatearDecimal(valor: number) {

  return valor.toLocaleString("es-AR", {

    minimumFractionDigits: 0,

    maximumFractionDigits: 2,

  });

}

function obtenerPrecio(producto: Producto) {
  return convertirNumero(producto.Precio);
}

function obtenerPrecioOferta(producto: Producto) {
  return convertirNumero(producto["Precio oferta"]);
}

function productoEnOferta(producto: Producto) {
  const precio = obtenerPrecio(producto);
  const precioOferta = obtenerPrecioOferta(producto);

  const ofertaMarcada =
    normalizarTexto(producto.Oferta) === "si";

  return (
    precioOferta > 0 &&
    precioOferta < precio &&
    (ofertaMarcada || precioOferta > 0)
  );
}

function obtenerDescuento(producto: Producto) {
  const precio = obtenerPrecio(producto);
  const precioOferta = obtenerPrecioOferta(producto);

  if (precio <= 0 || precioOferta <= 0) {
    return 0;
  }

  return Math.round(
    ((precio - precioOferta) / precio) * 100
  );
}

function formatearPrecio(valor: number) {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}


export default function CalculadoraPaso2({

  datosPasoUno,

  productos,

  cantidadCarrito = 0,

  onVolverPaso,

  onContinuar,

  onAgregarAlCarrito,

  onFinalizado,

}: CalculadoraPasoDosProps) {

  const carruselRef = useRef<HTMLDivElement | null>(null);

  const [pinturaSeleccionadaId, setPinturaSeleccionadaId] =

    useState<string>("");



  const [cantidadManos, setCantidadManos] = useState<number>(0);

  const [datosPasoDos, setDatosPasoDos] =
    useState<DatosPasoDos | null>(null);



  const pinturasCompatibles = useMemo<PinturaAgrupada[]>(() => {

    const grupoBuscado = normalizarTexto(datosPasoUno.grupo);

    const aplicacionBuscada = normalizarTexto(

      datosPasoUno.aplicacion

    );



    const filasCompatibles = productos.filter((producto) => {

      if (!productoTieneStock(producto)) {

        return false;

      }



      const grupoProducto = normalizarTexto(

        producto["Grupo calculadora"]

      );



      const aplicacionProducto = normalizarTexto(
  producto["Aplicación calculadora"]
);

const manos = convertirNumero(producto.Manos);

const poderCubritivo = convertirNumero(
  producto["Poder cubritivo"]
);

const tieneDatosTecnicos =
  grupoProducto !== "" &&
  aplicacionProducto !== "" &&
  manos > 0 &&
  poderCubritivo > 0;

const coincideGrupo = coincidePorPalabras(
  grupoProducto,
  grupoBuscado
);

const coincideAplicacion = coincidePorPalabras(
  aplicacionProducto,
  aplicacionBuscada
);



      return (

        tieneDatosTecnicos &&

        coincideGrupo &&

        coincideAplicacion

      );

    });



    const mapa = new Map<string, Producto[]>();



    filasCompatibles.forEach((producto) => {

      const clave = obtenerClaveProducto(producto);

      const actuales = mapa.get(clave) ?? [];



      mapa.set(clave, [...actuales, producto]);

    });



    return Array.from(mapa.entries()).map(

      ([id, variantes]) => {

        const productoConDatos =

          variantes.find(

            (producto) =>

              convertirNumero(producto.Manos) > 0 &&

              convertirNumero(

                producto["Poder cubritivo"]

              ) > 0

          ) ?? variantes[0];



        return {

          id,

          productoBase: productoConDatos,

          variantes,

          manosRecomendadas:

            convertirNumero(productoConDatos.Manos) || 1,

          poderCubritivo:

            convertirNumero(

              productoConDatos["Poder cubritivo"]

            ) || 0,

        };

      }

    );

  }, [

    datosPasoUno.aplicacion,

    datosPasoUno.grupo,

    productos,

  ]);



  const pinturaSeleccionada =

    pinturasCompatibles.find(

      (pintura) => pintura.id === pinturaSeleccionadaId

    ) ?? null;



  useEffect(() => {

    if (!pinturaSeleccionada) {

      setCantidadManos(0);

      return;

    }



    setCantidadManos(

      pinturaSeleccionada.manosRecomendadas

    );

  }, [pinturaSeleccionada]);

function moverCarrusel(direccion: "izquierda" | "derecha") {
  const carrusel = carruselRef.current;

  if (!carrusel) {
    return;
  }

  const desplazamiento = 150;

  carrusel.scrollBy({
    left:
      direccion === "derecha"
        ? desplazamiento
        : -desplazamiento,
    behavior: "smooth",
  });
}

  function seleccionarPintura(pintura: PinturaAgrupada) {

    setPinturaSeleccionadaId(pintura.id);

  }



  function continuar() {

    if (

      !pinturaSeleccionada ||

      cantidadManos <= 0

    ) {

      return;

    }



    const datos: DatosPasoDos = {

      pintura: pinturaSeleccionada.productoBase,

      variantes: pinturaSeleccionada.variantes,

      manos: cantidadManos,

      poderCubritivo:

        pinturaSeleccionada.poderCubritivo,

    };



    setDatosPasoDos(datos);

    onContinuar(datos);

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  }



  const puedeContinuar =

    pinturaSeleccionada !== null &&

    cantidadManos > 0 &&

    pinturaSeleccionada.poderCubritivo > 0;



  if (datosPasoDos) {

    return (

      <CalculadoraPaso3

        datosPasoUno={datosPasoUno}

        datosPasoDos={datosPasoDos}

        cantidadCarrito={cantidadCarrito}

        onVolverPaso={() => {

          setDatosPasoDos(null);

          window.scrollTo({

            top: 0,

            behavior: "smooth",

          });

        }}

        onAgregarAlCarrito={onAgregarAlCarrito}

        onFinalizado={onFinalizado}

      />

    );

  }



  return (

    <main className="min-h-screen bg-[#F7F9FC] pb-44 text-[#081B43]">

      {/* [Header compartido] */}



      <MobileHeaderCompartido

        cantidadCarrito={cantidadCarrito}

        mostrarBeneficios={true}

      />



      {/* [Título calculadora] */}



      <section className="bg-white px-4 pb-3 pt-4">

        <div className="flex items-center gap-3">

          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#F8A400] shadow-[0_7px_18px_rgba(248,164,0,0.24)]">

            <PaintBucket

              size={28}

              strokeWidth={2.2}

              className="text-[#081B43]"

            />

          </div>



          <div className="min-w-0">

            <h1 className="text-[22px] font-black leading-tight tracking-[-0.04em] text-[#081B43]">

              Calculadora de pintura

            </h1>



            <p className="mt-0.5 text-[11px] font-medium text-gray-500">

              Calculá cuántos litros necesitás

            </p>

          </div>

        </div>

      </section>



      {/* [Progreso] */}



      <section className="bg-white px-6 pb-5 pt-2">

        <div className="flex items-start">

          <div className="flex w-[64px] shrink-0 flex-col items-center">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8A400] text-white">

              <Check size={17} strokeWidth={3} />

            </div>



            <span className="mt-1 text-[10px] font-black text-[#081B43]">

              Medidas

            </span>

          </div>



          <div className="mt-4 h-[2px] flex-1 bg-[#F8A400]" />



          <div className="flex w-[64px] shrink-0 flex-col items-center">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8A400] text-[13px] font-black text-[#081B43]">

              2

            </div>



            <span className="mt-1 text-[10px] font-black text-[#081B43]">

              Pintura

            </span>

          </div>



          <div className="mt-4 h-[2px] flex-1 bg-gray-200" />



          <div className="flex w-[64px] shrink-0 flex-col items-center">

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[13px] font-black text-gray-500">

              3

            </div>



            <span className="mt-1 text-[10px] font-bold text-gray-500">

              Resultado

            </span>

          </div>

        </div>

      </section>



      <div className="space-y-3 px-3 pt-3">

        {/* [Elegir pintura] */}



        <section className="rounded-[22px] border border-gray-100 bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)]">

          <div className="flex items-start gap-2">

            <PaintBucket

              size={20}

              strokeWidth={2.3}

              className="mt-0.5 shrink-0 text-[#F8A400]"

            />



            <div>

              <h2 className="text-[15px] font-black tracking-[-0.025em] text-[#081B43]">

                Elegí la pintura

              </h2>



              <p className="mt-0.5 text-[9px] font-medium leading-snug text-gray-500">

                Te mostramos pinturas compatibles con{" "}

                {datosPasoUno.grupo} —{" "}

                {datosPasoUno.aplicacion}

              </p>

            </div>

          </div>



          {pinturasCompatibles.length === 0 ? (

            <div className="mt-4 flex flex-col items-center rounded-[18px] border border-dashed border-gray-300 bg-[#F8FAFD] px-4 py-7 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">

                <SearchX size={24} strokeWidth={2.1} />

              </div>



              <p className="mt-3 text-[13px] font-black text-[#081B43]">

                Todavía no hay pinturas compatibles

              </p>

              <p className="mt-1 max-w-[250px] text-[9px] font-medium leading-relaxed text-gray-500">

                No encontramos pinturas disponibles para esta selección.

              </p>

            </div>

          ) : (

            <div className="relative -mx-3 mt-4">
  {/* Flecha izquierda */}

  <button
    type="button"
    onClick={() => moverCarrusel("izquierda")}
    className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#123A72]/95 text-white shadow-[0_7px_18px_rgba(0,0,0,0.22)] transition active:scale-90"
    aria-label="Ver pintura anterior"
  >
    <ChevronLeft size={21} strokeWidth={2.8} />
  </button>

  {/* Carrusel */}

  <div
    ref={carruselRef}
    className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-[42px] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {pinturasCompatibles.map((pintura) => {
      const activa =
        pinturaSeleccionadaId === pintura.id;

      const producto = pintura.productoBase;

      const precio = obtenerPrecio(producto);
      const precioOferta =
        obtenerPrecioOferta(producto);

      const tieneOferta =
        productoEnOferta(producto);

      const descuento =
        obtenerDescuento(producto);

      const precioFinal = tieneOferta
        ? precioOferta
        : precio;

      return (
        <button
          key={pintura.id}
          type="button"
          onClick={() => seleccionarPintura(pintura)}
          className={`relative w-[calc((100vw-80px)/2)] max-w-[142px] shrink-0 snap-start rounded-[15px] border-2 bg-white p-1.5 text-left shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition active:scale-[0.98] ${
            activa
              ? "border-[#123A72]"
              : "border-transparent"
          }`}
        >
          <div className="relative flex aspect-square items-end justify-center rounded-xl bg-gray-50 pt-5 pb-0.5">
            {producto.Marca && (
              <span className="absolute left-1 top-1 z-20 max-w-[56px] truncate rounded-full bg-white px-2 py-[2px] text-[7px] font-black text-gray-800 shadow">
                {producto.Marca}
              </span>
            )}

            {tieneOferta && descuento > 0 && (
              <span className="absolute right-1 top-1 z-20 rounded-full bg-red-600 px-2 py-[2px] text-[7px] font-black text-white shadow">
                -{descuento}%
              </span>
            )}

            {activa && (
              <span className="absolute right-1 bottom-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#123A72] text-white shadow">
                <Check size={12} strokeWidth={3} />
              </span>
            )}

            {producto.Imagen ? (
              <img
                src={producto.Imagen}
                alt={producto.Nombre}
                className="relative z-10 h-[76%] w-[76%] object-contain"
              />
            ) : (
              <PaintBucket
                size={38}
                className="relative z-10 mb-2 text-gray-300"
              />
            )}
          </div>

          <p className="mt-1 line-clamp-2 min-h-0 text-[9px] font-black leading-tight text-gray-900">
            {producto.Nombre}
          </p>

          {producto.Linea && (
            <p className="mt-0.5 truncate text-[7px] font-semibold text-gray-500">
              {producto.Linea}
            </p>
          )}

          <div className="mt-1 leading-none">
            {tieneOferta && precio > 0 && (
              <p className="text-[8px] font-bold leading-none text-red-500 line-through">
                {formatearPrecio(precio)}
              </p>
            )}

            <p className="mt-[2px] text-[10px] font-black leading-none text-[#123A72]">
              {precioFinal > 0
                ? formatearPrecio(precioFinal)
                : "Consultar"}
            </p>
          </div>
        </button>
      );
    })}
  </div>

  {/* Flecha derecha */}

  <button
    type="button"
    onClick={() => moverCarrusel("derecha")}
    className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#123A72]/95 text-white shadow-[0_7px_18px_rgba(0,0,0,0.22)] transition active:scale-90"
    aria-label="Ver pintura siguiente"
  >
    <ChevronRight size={21} strokeWidth={2.8} />
  </button>
</div>

          )}

        </section>



        {/* [Cantidad de manos] */}



        {pinturaSeleccionada && (

          <section className="rounded-[22px] border border-gray-100 bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)]">

            <div className="flex items-start gap-2">

              <PaintRoller

                size={20}

                strokeWidth={2.3}

                className="mt-0.5 shrink-0 text-[#F8A400]"

              />



              <div>

                <h2 className="text-[15px] font-black text-[#081B43]">

                  ¿Cuántas manos vas a aplicar?

                </h2>



                <p className="mt-1 text-[10px] font-semibold leading-snug text-gray-600">

                  Para esta pintura, la marca recomienda{" "}

                  <span className="font-black text-[#123A72]">

                    {pinturaSeleccionada.manosRecomendadas}{" "}

                    {pinturaSeleccionada.manosRecomendadas === 1

                      ? "mano"

                      : "manos"}

                  </span>

                  .

                </p>

              </div>

            </div>



            <div className="mt-3 grid grid-cols-4 gap-2">

              {[1, 2, 3, 4].map((cantidad) => {

                const activa =

                  cantidadManos === cantidad;



                return (

                  <button

                    key={cantidad}

                    type="button"

                    onClick={() =>

                      setCantidadManos(cantidad)

                    }

                    className={`flex h-11 items-center justify-center rounded-full border text-[13px] font-black transition active:scale-95 ${

                      activa

                        ? cantidad === pinturaSeleccionada.manosRecomendadas

                          ? "border-[#1F9D55] bg-[#1F9D55] text-white"

                          : "border-[#F8A400] bg-[#F8A400] text-[#081B43]"

                        : cantidad === pinturaSeleccionada.manosRecomendadas

                          ? "border-[#1F9D55] bg-[#EAF8EC] text-[#16813A]"

                          : "border-gray-200 bg-white text-[#081B43]"

                    }`}

                  >

                    {cantidad}

                  </button>

                );

              })}

            </div>



            <p className="mt-3 text-center text-[9px] font-medium leading-snug text-gray-500">

              Podés elegir la cantidad según el estado de la superficie.

            </p>



            {cantidadManos !==

              pinturaSeleccionada.manosRecomendadas && (

              <p className="mt-2 text-center text-[8px] font-semibold text-[#B36A00]">

                Modificaste la recomendación del

                fabricante.

              </p>

            )}

          </section>

        )}



        {/* [Resumen] */}



        <section className="rounded-[22px] border border-gray-100 bg-white p-3 shadow-[0_7px_20px_rgba(8,27,67,0.07)]">

          <div className="mb-3 flex items-center gap-2">

            <ClipboardList

              size={20}

              strokeWidth={2.3}

              className="text-[#F8A400]"

            />



            <h2 className="text-[15px] font-black text-[#081B43]">

              Resumen

            </h2>

          </div>



          <div className="overflow-hidden rounded-[15px] border border-gray-100">

            <FilaResumen

              etiqueta="Superficie neta"

              valor={`${formatearDecimal(

                datosPasoUno.superficieNeta

              )} m²`}

            />



            <FilaResumen

              etiqueta="Pintura elegida"

              valor={

                pinturaSeleccionada

                  ? pinturaSeleccionada.productoBase

                      .Nombre

                  : "Sin seleccionar"

              }

            />



            <FilaResumen

              etiqueta="Manos"

              valor={

                cantidadManos > 0

                  ? String(cantidadManos)

                  : "—"

              }

            />


          </div>

        </section>

      </div>



      {/* [Volver al Paso 1] */}



      <button

        type="button"

        onClick={onVolverPaso}

        className="fixed bottom-[96px] right-4 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#123A72]/90 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-sm transition active:scale-90"

        aria-label="Volver al Paso 1"

      >

        <ArrowLeft size={25} strokeWidth={2.7} />

      </button>



      {/* [Calcular resultado] */}



      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-gray-100 bg-white/95 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">

        <button

          type="button"

          onClick={continuar}

          disabled={!puedeContinuar}

          className={`flex h-[56px] w-full touch-manipulation select-none items-center justify-center gap-3 rounded-[18px] text-[15px] font-black transition active:scale-[0.98] ${

            puedeContinuar

              ? "bg-[#F8A400] text-[#081B43] shadow-[0_8px_22px_rgba(248,164,0,0.3)]"

              : "cursor-not-allowed bg-gray-200 text-gray-400"

          }`}

        >

          Calcular resultado

          <ArrowRight size={22} strokeWidth={2.5} />

        </button>

      </div>

    </main>

  );

}



function FilaResumen({

  etiqueta,

  valor,

}: {

  etiqueta: string;

  valor: string;

}) {

  return (

    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0">

      <span className="text-[9px] font-medium text-gray-500">

        {etiqueta}

      </span>



      <span className="max-w-[62%] text-right text-[9px] font-black text-[#081B43]">

        {valor}

      </span>

    </div>

  );

}