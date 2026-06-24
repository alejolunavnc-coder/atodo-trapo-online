
"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";

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


export default function Home() {

  const [mostrarMas, setMostrarMas] = useState(false);
const [vista, setVista] = useState("categorias");
const [marca, setMarca] = useState("");
const [categoria, setCategoria] = useState("");
const [carrito, setCarrito] = useState<{ nombre: string; precio: number }[]>([]);
const [mostrarCarrito, setMostrarCarrito] = useState(false);
const [productos, setProductos] = useState<Producto[]>([]);
const [seleccionados, setSeleccionados] = useState<any>({});
const [coloresSeleccionados, setColoresSeleccionados] = useState<any>({});
const [fraganciasSeleccionadas, setFraganciasSeleccionadas] = useState<any>({});
const [tamanosSeleccionados, setTamanosSeleccionados] = useState<any>({});
const [busqueda, setBusqueda] = useState("");
useEffect(() => {
  Papa.parse(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=0&single=true&output=csv",
    {
      download: true,
      header: true,
      complete: (resultado: Papa.ParseResult<Producto>) => {

  console.log("PRIMER PRODUCTO:");
  console.log(resultado.data[0]);

  console.log("PRODUCTO 10:");
  console.log(resultado.data[10]);
  
  console.log("IMAGEN:");
console.log(resultado.data[10].Imagen);

  console.log("IMAGEN PRODUCTO 10:");
  console.log(resultado.data[10]["Imagen"]);

  console.log("NOMBRES DE LAS COLUMNAS:");
  console.log(Object.keys(resultado.data[10]));

  console.log(
  resultado.data.find(
    p => p.Nombre?.toLowerCase().includes("tersinol")
  )
);

  setProductos(resultado.data);

},
    }
  );
}, []);

console.log(productos);
console.log(productos[0]);
useEffect(() => {
  if (productos.length > 0) {
    console.log("PRIMER PRODUCTO:");
    console.log(productos[0]);
    console.log("IMAGEN:", productos[0].Imagen);
  }
}, [productos]);

function agregarAlCarrito(nombre: string, precio: number) {
  setCarrito([
    ...carrito,
    {
      nombre,
      precio
    }
  ]);
}

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
  producto.Nombre +
  " " +
  producto.Marca +
  " " +
  producto.Linea +
  " " +
  producto.Color +
  " " +
  producto.Tamaño +
  " " +
  producto.Categoría
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

console.log(productosBuscados);
console.log(productos[0]);
console.log(busqueda);

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
  productosEnOferta.reduce((
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
  return (
    <main className="min-h-screen bg-gray-100">

      {/* Barra superior */}
      <nav className="bg-white shadow-md px-4 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-teal-700">
  Pinturería
</h1>

        <div className="flex items-center gap-6">

  

  <a href="#" className="text-gray-700 font-medium">
    Inicio
  </a>

  <a href="#" className="text-gray-700 font-medium">
    Productos
  </a>

  <a href="#" className="text-gray-700 font-medium">
    Ofertas
  </a>

  <a href="#" className="text-gray-700 font-medium">
    Contacto
  </a>

  

</div>
      </nav>

      

      {/* Banner principal */}
      <section className="bg-gradient-to-r from-teal-700 to-teal-500 text-white py-20 px-10 text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white">
  A Todo Trapo Online
</h1>

<h2 className="text-lg md:text-3xl text-white mt-5 font-light">
  Pinturas, limpieza y artículos para el hogar
</h2>

<p className="text-lg md:text-2xl text-white/90 mt-8">
  Todo lo que necesitás, en un solo lugar
</p>
      </section>
<section className="bg-white shadow-sm py-8">

  <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

    <div>
      <div className="text-4xl">🚚</div>
      <p className="font-semibold text-gray-800 mt-2">
        Envíos rápidos
      </p>
    </div>

    <div>
      <div className="text-4xl">💳</div>
      <p className="font-semibold text-gray-800 mt-2">
        Todos los medios de pago
      </p>
    </div>

    <div>
      <div className="text-4xl">🎨</div>
      <p className="font-semibold text-gray-800 mt-2">
        Gran variedad
      </p>
    </div>

    <div>
      <div className="text-4xl">🏠</div>
      <p className="font-semibold text-gray-800 mt-2">
        Todo para tu hogar
      </p>
    </div>

  </div>

</section>
      <div className="flex items-center justify-center p-6">

        <div className="bg-white p-4 md:p-10 rounded-3xl shadow-2xl max-w-7xl w-full">

          <div className="flex justify-between items-center mb-10">

  <div>
    <div className="grid grid-cols-12 gap-8"></div>

    <h2 className="text-4xl font-bold text-gray-800">
      Categorías
    </h2>

    <p className="text-gray-500 mt-2">
      Encontrá todo lo que necesitás para tu hogar
    </p>

  </div>

  <input
    type="text"
    placeholder="🔍 Buscar producto..."
    value={busqueda}
    onChange={(e)=>setBusqueda(e.target.value)}
    className="border rounded-xl px-4 py-3 w-full md:w-96 text-black"
  />

</div>
<div className="col-span-3"></div>
{/* Categorías */}
{vista === "categorias" && (
<>
  {busqueda === "" && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">

    {[...new Set(productos.map((p) => p.Categoría?.trim()))]
      .filter(Boolean)
      .map((categoria) => (

        <div
          key={categoria}
          onClick={() => {
            setCategoria(categoria);
            setVista("marcas");
          }}
          className="bg-gray-100 p-5 rounded-xl shadow text-gray-800 cursor-pointer hover:bg-gray-200"
        >

          <div className="text-4xl">
            {
              productos.find(
                (p) => p.Categoría?.trim() === categoria
              )?.Emoji
            }
          </div>

          <p className="mt-2 font-medium">
            {categoria}
          </p>

        </div>

      ))}

  </div>
  )}

  

  {vista === "categorias" && busqueda !== "" && (

<div className="bg-white p-6 mt-8 rounded-2xl shadow max-h-[800px] overflow-y-auto">

  <h2 className="text-2xl font-bold text-black mb-2">
    Resultados de búsqueda
  </h2>

  <p className="text-gray-500 mb-6">
    {productosBuscados.length} productos encontrados
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {productosBuscados.map((grupo, index) => {

      const productoSeleccionado =
        grupo.items.find(
          item =>
            item.Tamaño ===
              (tamanosSeleccionados["busqueda"+index] || grupo.items[0].Tamaño)
            &&
            item.Color ===
              (coloresSeleccionados["busqueda"+index] || grupo.items[0].Color)
        ) || grupo.items[0];

      return (

        <div
          key={index}
          className="bg-gray-50 p-6 rounded-2xl shadow-lg"
        >

<img
  src={productoSeleccionado?.Imagen?.trim()}
  alt={grupo.nombre}
  className="w-40 h-40 object-contain mx-auto bg-white p-2"
/>

          <h3 className="text-xl font-bold text-gray-800 mt-4">
            {grupo.nombre}
          </h3>

          <p className="text-gray-600 text-sm">
            Línea: {grupo.linea}
          </p>

          {
productoSeleccionado?.Oferta?.trim().toLowerCase() === "si"
? (
  <>
    <p className="text-red-500 line-through text-xl">
      $
      {Number(productoSeleccionado.Precio)
        .toLocaleString("es-AR")}
    </p>

    <p className="text-xl md:text-2xl font-bold text-green-600">
      $
      {Number(productoSeleccionado["Precio oferta"])
        .toLocaleString("es-AR")}
    </p>

    <p className="text-green-700 font-semibold text-lg mt-2">
      Ahorrás $
      {(
        Number(productoSeleccionado.Precio) -
        Number(productoSeleccionado["Precio oferta"])
      ).toLocaleString("es-AR")}
    </p>

    <div className="inline-block mt-3 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl">
      🔥 OFERTA
    </div>
  </>
)
: (
  <p className="text-xl md:text-3xl font-bold text-green-700 mt-4">
    $
    {Number(productoSeleccionado.Precio)
      .toLocaleString("es-AR")}
  </p>
)
}
          <button
  onClick={() =>
    agregarAlCarrito(
      grupo.nombre +
      " " +
      productoSeleccionado.Tamaño +
      " " +
      productoSeleccionado.Color,

      Number(
        productoSeleccionado.Oferta?.trim().toLowerCase() === "si"
          ? productoSeleccionado["Precio oferta"]
          : productoSeleccionado.Precio
      )
    )
  }
  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-xl w-full"
>
  🛒 Agregar al carrito
</button>

        </div>

      );

    })}

  </div>

</div>

)}

</>
)}


{/* Marcas */}
{vista === "marcas" && (
  <>


    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

     {[
  ...new Set(
    productos
      .filter(
        (p) => p.Categoría?.trim() === categoria
      )
      .map((p) => p.Marca?.trim())
  )
]
.filter(Boolean)
.map((marca) => (
          <div
            key={marca}
            onClick={() => {
              setMarca(marca);
              setVista("productos");
            }}
            className="bg-gray-100 p-5 rounded-xl shadow text-gray-800 font-semibold cursor-pointer hover:bg-gray-200"
          >
            {marca}
          </div>
        ))}

    </div>

    <div className="mt-8">
      <button
        onClick={() => setVista("categorias")}
        className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl"
      >
        ← Volver a categorías
      </button>
    </div>
  </>
)}

{/* Productos */}
{vista === "productos" && (
<>
  <h3 className="text-3xl font-bold text-gray-800 mb-10">
    Productos de {marca}
  </h3>

  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">

    {productosAgrupados.map((grupo, index) => {
      const productoSeleccionado =
  grupo.items.find((item) => {
    if (
      grupo.items.some((i) => i.Color?.trim())
    ) {
      return (
        item.Tamaño ===
          (tamanosSeleccionados[index] || grupo.items[0].Tamaño)
        &&
        item.Color ===
          (coloresSeleccionados[index] || grupo.items[0].Color)
      );
    }

    if (
      grupo.items.some((i) => i.Fragancias?.trim())
    ) {
      return (
        item.Tamaño ===
          (tamanosSeleccionados[index] || grupo.items[0].Tamaño)
        &&
        item.Fragancias ===
          (fraganciasSeleccionadas[index] || grupo.items[0].Fragancias)
      );
    }

    return item.Tamaño ===
      (tamanosSeleccionados[index] || grupo.items[0].Tamaño);
  }) || grupo.items[0];

      console.log(grupo.items);

      return (

        <div
          key={index}
          className="bg-gray-50 p-2 md:p-6 rounded-2xl shadow-lg"
        >

          <img
  src={productoSeleccionado?.Imagen?.trim()}
  alt={grupo.nombre}
  className="w-24 h-24 md:w-40 md:h-40 object-contain mx-auto"
/>

          <h3 className="text-sm md:text-xl font-bold text-gray-800 mt-2">
            {grupo.nombre}
          </h3>

          <p className="text-gray-600 text-sm">
  Línea: {grupo.linea}
</p>

{productoSeleccionado?.Aromas?.trim() && (
  <div className="mt-2 inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full">
    🌸 {productoSeleccionado.Aromas}
  </div>
)}

          <div className="mt-4">

            <p className="text-xs font-semibold text-gray-500 mt-4 mb-2 uppercase">
  Tamaño
</p>

<div className="flex flex-wrap gap-2">
  {[...new Set(grupo.items.map(item => item.Tamaño))].map((tam, i) => (

    <button
      key={i}
      onClick={() => {

  const primerColorDisponible =
    grupo.items.find(item => item.Tamaño === tam)?.Color;

  setTamanosSeleccionados({
    ...tamanosSeleccionados,
    [index]: tam,
  });

  setColoresSeleccionados({
    ...coloresSeleccionados,
    [index]: primerColorDisponible,
  });

}}
      className={
  (tamanosSeleccionados[index] || grupo.items[0].Tamaño) === tam
    ? "bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium"
    : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
}
    >
      {tam}
    </button>

  ))}
</div>

            {grupo.items.some(
  (item:any) => item.Color?.trim()
) ? (
  <>
    <p className="text-gray-600 mb-2 mt-4">
      Color
    </p>

    <select
      className="border rounded-lg py-1 px-3 w-full text-black text-sm"
      value={coloresSeleccionados[index] || grupo.items[0].Color}
      onChange={(e) =>
        setColoresSeleccionados({
          ...coloresSeleccionados,
          [index]: e.target.value,
        })
      }
    >
      {grupo.items
        .filter(
          (item:any) =>
            item.Tamaño ===
            (tamanosSeleccionados[index] || grupo.items[0].Tamaño)
        )
        .map((item:any, i:number) => (
          <option key={i} value={item.Color}>
            {item.Color}
          </option>
        ))}
    </select>
  </>
) : grupo.items.some(
  (item:any) => item.Fragancias?.trim()
) ? (
  <>
    <p className="text-gray-600 mb-2 mt-4">
      Fragancia
    </p>

    <select
      className="border rounded-lg py-1 px-3 w-full text-black text-sm"
      value={fraganciasSeleccionadas[index] || grupo.items[0].Fragancias}
      onChange={(e) =>
        setFraganciasSeleccionadas({
          ...fraganciasSeleccionadas,
          [index]: e.target.value,
        })
      }
    >
      {grupo.items
        .filter(
          (item:any) =>
            item.Tamaño ===
            (tamanosSeleccionados[index] || grupo.items[0].Tamaño)
        )
        .map((item:any, i:number) => (
          <option key={i} value={item.Fragancias}>
            {item.Fragancias}
          </option>
        ))}
    </select>
  </>
) : null}

            {productoSeleccionado?.Oferta === "si" ? (
  <>
    <p className="text-red-500 line-through text-xl">
  $
  {Number(productoSeleccionado?.["Precio oferta"])
    .toLocaleString("es-AR")}
</p>

<p className="text-xl md:text-2xl font-bold text-green-600">
  $
  {Number(productoSeleccionado?.["Precio oferta"])
    .toLocaleString("es-AR")}
</p>

<p className="text-green-700 font-semibold text-xl">
  Ahorrás $
  {(
    Number(productoSeleccionado?.Precio) -
    Number(productoSeleccionado?.["Precio oferta"])
  ).toLocaleString("es-AR")}
</p>

    <div className="inline-block mt-3 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl shadow">
      🔥 OFERTA
    </div>
  </>
) : (
  <p className="text-xl md:text-3xl font-bold text-green-700 mt-4">
    $
    {Number(productoSeleccionado?.Precio)
      .toLocaleString("es-AR")}
  </p>
  

  
  
  
)}

          </div>

          <button
            onClick={() =>
              agregarAlCarrito(
                grupo.nombre +
                " " +
                productoSeleccionado?.Tamaño +
                " " +
                productoSeleccionado?.Color,

                Number(
  productoSeleccionado.Oferta?.trim().toLowerCase() === "si"
    ? productoSeleccionado["Precio oferta"]
    : productoSeleccionado.Precio
)
              )
            }
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-xl w-full"
          >
            🛒 Agregar al carrito
          </button>

        </div>

      );

    })}

  </div>

  <div className="mt-8 text-center">
    <button
      onClick={() => setVista("marcas")}
      className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl"
    >
      ← Volver a marcas
    </button>
  </div>

</>
)}
<section className="mt-20">

  <h2 className="text-3xl font-bold text-gray-800 mb-8">
    🔥 Ofertas destacadas
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

   {ofertasAgrupadas.map((grupo, index) => {

  const productoSeleccionado =
  grupo.items.find(
    (item) =>
      item.Tamaño ===
        (tamanosSeleccionados["oferta"+index] || grupo.items[0].Tamaño)
      &&
      item.Color ===
        (
          coloresSeleccionados["oferta"+index] ||
          grupo.items.find(
            i =>
              i.Tamaño ===
              (tamanosSeleccionados["oferta"+index] || grupo.items[0].Tamaño)
          )?.Color
        )
  ) || grupo.items[0];

return (

        <div
          key={index}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >

          {productoSeleccionado?.Imagen?.trim() ? (
  <img
    src={productoSeleccionado.Imagen.trim()}
    alt={grupo.nombre}
    className="w-40 h-40 object-contain mx-auto bg-white p-2"
  />
) : (
  <div className="w-40 h-40 mx-auto flex items-center justify-center text-gray-400 border rounded">
    Sin imagen
  </div>
)}



<h3 className="text-sm md:text-xl font-bold text-gray-800 mt-2">
  {grupo.nombre}
</h3>

<p className="text-gray-600 text-sm">
  Línea: {grupo.linea}
</p>

<p className="text-red-500 line-through text-lg mt-4">
$
{Number(productoSeleccionado?.Precio).toLocaleString("es-AR")}
</p>

<p className="text-2xl font-bold text-green-600">
$
{Number(productoSeleccionado?.["Precio oferta"]).toLocaleString("es-AR")}
</p>

<p className="text-green-700 font-semibold text-sm mb-4">
  Ahorrás $
  {(
    Number(productoSeleccionado?.Precio) -
    Number(productoSeleccionado?.["Precio oferta"])
  ).toLocaleString("es-AR")}
</p>

<p className="text-xs font-semibold text-gray-500 mt-4 mb-2 uppercase">
  Tamaño
</p>

<div className="flex flex-wrap gap-2">
  {[...new Set(grupo.items.map(item => item.Tamaño))].map((tam, i) => (

    <button
      key={i}
      onClick={() =>
        setTamanosSeleccionados({
          ...tamanosSeleccionados,
          ["oferta"+index]: tam,
        })
      }
      className={
        (tamanosSeleccionados["oferta"+index] || grupo.items[0].Tamaño) === tam
          ? "bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium"
          : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
      }
    >
      {tam}
    </button>

  ))}
</div>

<p className="text-gray-600 mt-4 mb-2">
  Color
</p>

<select
  className="border rounded-lg py-1 px-3 w-full text-black text-sm"
>
  {[
  ...new Set(
    grupo.items
      .filter(
        (item:any)=>
          item.Tamaño ===
          (tamanosSeleccionados["oferta"+index] || grupo.items[0].Tamaño)
      )
      .map((item:any)=>item.Color)
  )
].map((color:any,i:number)=>(
  <option key={i} value={color}>
    {color}
  </option>
))}
</select>
          

<div className="inline-block mt-3 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl">
  🔥 OFERTA
</div>
<button
  onClick={() =>
    agregarAlCarrito(
      grupo.nombre +
      " " +
      productoSeleccionado?.Tamaño +
      " " +
      productoSeleccionado?.Color,
      Number(productoSeleccionado?.["Precio oferta"])
    )
  }
  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-xl w-full"
>
  🛒 Agregar al carrito
</button>

        </div>

      );
    })}
  </div>

</section>
          {/* ¿Por qué elegirnos? */}
<section className="mt-20">

  <h2 className="text-3xl font-bold text-gray-800 mb-8">
    ¿Por qué elegirnos?
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

    <div className="bg-gray-50 p-6 rounded-2xl shadow">
      <div className="text-5xl">🚚</div>

      <h3 className="font-bold mt-4 text-gray-800">
        Envíos rápidos
      </h3>

      <p className="text-gray-600 mt-2">
        Entregas rápidas en toda la zona.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-2xl shadow">
      <div className="text-5xl">💳</div>

      <h3 className="font-bold mt-4 text-gray-800">
        Pagos seguros
      </h3>

      <p className="text-gray-600 mt-2">
        Transferencias, débito y crédito.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-2xl shadow">
      <div className="text-5xl">🎨</div>

      <h3 className="font-bold mt-4 text-gray-800">
        Gran variedad
      </h3>

      <p className="text-gray-600 mt-2">
        Pinturas, limpieza y hogar.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-2xl shadow">
      <div className="text-5xl">🏠</div>

      <h3 className="font-bold mt-4 text-gray-800">
        Todo para tu hogar
      </h3>

      <p className="text-gray-600 mt-2">
        Soluciones para cada ambiente.
      </p>
    </div>

  </div>

</section>

</div>

</div>

      {/* Footer */}
      <footer className="bg-white mt-10 border-t p-10 text-center">

        <h2 className="text-3xl font-bold text-teal-700">
          A Todo Trapo Online
        </h2>

        <p className="text-gray-600 mt-4">
          📍 Anastacio Cabrera y San Martín, Candelaria, Misiones
        </p>

        <p className="text-gray-600 mt-2">
          🕘 Lunes a sábado de 8:00 a 12:00 y de 16:00 a 19:15
        </p>

        <p className="text-gray-600 mt-2">
          Domingo de 9:30 a 12:00
        </p>

        <p className="text-gray-600 mt-2">
          📷 Instagram: @atodo_trapo01
        </p>

        <p className="text-gray-400 mt-6">
          © 2026 Todos los derechos reservados
        </p>

      </footer>
      {/* Botón flotante carrito */}
<button
  onClick={() => setMostrarCarrito(!mostrarCarrito)}
  className="fixed bottom-24 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-2xl text-2xl"
>
  🛒
  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
    {carrito.length}
  </span>
</button>

{mostrarCarrito && (
  <div className="fixed bottom-48 right-6 bg-white shadow-2xl rounded-2xl p-6 w-60 z-50 max-h-96 overflow-y-auto">

    <h3 className="font-bold text-xl text-black mb-4">
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

      <p className="text-xl font-bold text-black mt-4">
  Total: $
  {carrito
    .reduce(
      (total, producto) => total + producto.precio,
      0
    )
    .toLocaleString("es-AR")}
</p>

      <button
        onClick={() => setCarrito([])}
        className="mt-4 bg-red-500 text-white text-sm px-3 py-2 rounded-xl w-full"
      >
        Vaciar carrito
      </button>

    </div>

  </div>
)}
      {/* Botón flotante WhatsApp */}
<a
  href="https://wa.me/5493786519078?text=Hola,%20quiero%20hacer%20una%20consulta"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-2xl transition hover:scale-110"
>
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
    alt="WhatsApp"
    className="w-8 h-8"
  />
</a>


    </main>
  );
}

