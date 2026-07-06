type DetalleProductoProps = {
  detalleAbierto: boolean;
  grupoDetalle: any;
  productoDetalle: any;

  setDetalleAbierto: any;
  panelDetalleRef: any;

  mostrarCarrito: boolean;
  setMostrarCarrito: any;
  carritoAnimado: boolean;

  carrito: any[];
  eliminarDelCarrito: (index: number) => void;
  vaciarCarrito: () => void;
  agregarAlCarrito: (producto: any) => void;

  tamanosSeleccionados: any;
  coloresSeleccionados: any;
  fraganciasSeleccionadas: any;
  setTamanosSeleccionados: any;
  setColoresSeleccionados: any;
  setFraganciasSeleccionadas: any;
};

export default function DetalleProducto({
  detalleAbierto,
  grupoDetalle,
  productoDetalle,
  setDetalleAbierto,
  panelDetalleRef,
  mostrarCarrito,
  setMostrarCarrito,
  carritoAnimado,
  carrito,
  eliminarDelCarrito,
  vaciarCarrito,
  agregarAlCarrito,
  tamanosSeleccionados,
  coloresSeleccionados,
  fraganciasSeleccionadas,
  setTamanosSeleccionados,
  setColoresSeleccionados,
  setFraganciasSeleccionadas,
}: DetalleProductoProps) {
  if (!detalleAbierto || !grupoDetalle) return null;

  return (
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
              onClick={() => eliminarDelCarrito(index)}
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
          onClick={vaciarCarrito}
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
    onClick={() => agregarAlCarrito(productoDetalle)}
    className="mt-3 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base py-2.5 rounded-2xl"
  >
    🛒 Agregar
  </button>
)}

      
    </div>
  </div>
</div>
  );
}
