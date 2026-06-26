type TarjetaProductoProps = {
  nombre: string;
  linea: string;
  imagen?: string;
  aromas?: string;
  precio?: string;
  precioOferta?: string;
  oferta?: string;

  onAgregar?: () => void;
  textoBoton?: string;
};

export default function TarjetaProducto({
  nombre,
  linea,
  imagen,
  aromas,
  precio,
  precioOferta,
  oferta,
  onAgregar,
textoBoton,
}: TarjetaProductoProps) {
  return (
    <>
      {imagen?.trim() ? (
        <img
          src={imagen.trim()}
          alt={nombre}
          className="w-24 h-24 md:w-40 md:h-40 object-contain mx-auto"
        />
      ) : (
        <div className="w-24 h-24 md:w-40 md:h-40 mx-auto flex items-center justify-center text-gray-400 border rounded">
          Sin imagen
        </div>
      )}

      <h3 className="text-sm md:text-xl font-bold text-gray-800 mt-2 text-center">
        {nombre}
      </h3>

      <p className="text-gray-500 text-xs text-center mt-1">
        {linea}
      </p>

      {aromas?.trim() && (
        <div className="mt-2 inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full">
          🌸 {aromas}
        </div>
      )}
      {precio && (
  <div className="mt-4">
    {oferta?.trim().toLowerCase() === "si" ? (
      <>
        <p className="text-red-500 line-through text-xl">
          ${Number(precio).toLocaleString("es-AR")}
        </p>

        <p className="text-xl md:text-2xl font-bold text-green-600">
          ${Number(precioOferta).toLocaleString("es-AR")}
        </p>

        <p className="text-green-700 font-semibold text-lg mt-2">
          Ahorrás $
          {(Number(precio) - Number(precioOferta)).toLocaleString("es-AR")}
        </p>
      </>
    ) : (
      <p className="text-xl md:text-3xl font-bold text-green-700">
        ${Number(precio).toLocaleString("es-AR")}
      </p>
    )}
  </div>
)}
{onAgregar && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onAgregar();
    }}
    className="mt-4 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 rounded-xl"
  >
    🛒 {textoBoton || "Agregar"}
  </button>
)}
    </>
  );
}

