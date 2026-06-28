type TarjetaProductoProps = {
  nombre: string;
  linea: string;
  marca?: string;
  imagen?: string;
  aromas?: string;
  precio?: string;
  precioOferta?: string;
  oferta?: string;
};

export default function TarjetaProducto({
  nombre,
  linea,
  marca,
  imagen,
  aromas,
  precio,
  precioOferta,
  oferta,
}: TarjetaProductoProps) {
  const estaEnOferta = oferta?.trim().toLowerCase() === "si";

  const precioNormal = Number(precio);
  const precioConOferta = Number(precioOferta);

  const precioFinal =
    estaEnOferta && precioOferta ? precioOferta : precio;

  const ahorro =
    estaEnOferta && precioNormal && precioConOferta
      ? precioNormal - precioConOferta
      : 0;

  const porcentaje =
    estaEnOferta && precioNormal && precioConOferta
      ? Math.round(((precioNormal - precioConOferta) / precioNormal) * 100)
      : 0;

  return (
    <div className="relative">

      {/* Chapita superior: columna Nombre */}
      {marca?.trim() && (
        <div className="absolute top-0 left-0 z-10">
          <span className="inline-flex items-center bg-blue-950 text-white text-[9px] font-extrabold uppercase tracking-[0.12em] px-3 py-1 rounded-full shadow-sm">
            {marca}
          </span>
        </div>
      )}

      {/* Descuento */}
      {estaEnOferta && porcentaje > 0 && (
        <div className="absolute top-0 right-0 z-10">
          <span className="inline-flex items-center bg-yellow-400 text-blue-950 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
            -{porcentaje}%
          </span>
        </div>
      )}

      {/* Imagen */}
      <div className="h-[150px] flex items-center justify-center pt-6">
        {imagen?.trim() ? (
          <img
            src={imagen.trim()}
            alt={marca || nombre}
            className="max-h-[130px] max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03] drop-shadow-[0_12px_12px_rgba(0,0,0,0.18)]"
          />
        ) : (
          <div className="w-full h-[120px] flex items-center justify-center text-[12px] text-gray-400 border border-dashed border-gray-200 rounded-xl">
            Sin imagen
          </div>
        )}
      </div>

      {/* Información: solo columna Linea */}
      <div className="mt-3">

        {linea?.trim() && (
          <h3 className="text-[17px] font-extrabold text-blue-950 leading-tight tracking-[-0.03em]">
            {linea}
          </h3>
        )}

        {aromas?.trim() && (
          <div className="mt-2 inline-flex items-center bg-violet-50 text-violet-700 text-[11px] font-bold px-3 py-1 rounded-full">
            🌸 {aromas}
          </div>
        )}

      </div>

      {/* Precio */}
      {precioFinal && (
        <div className="mt-4">

          {estaEnOferta && precio && precioOferta ? (
            <>
              <p className="text-[13px] text-red-500 line-through font-semibold">
                ${precioNormal.toLocaleString("es-AR")}
              </p>

              <p className="text-[28px] font-black text-blue-950 tracking-[-0.05em] leading-tight">
                ${precioConOferta.toLocaleString("es-AR")}
              </p>

              {ahorro > 0 && (
                <p className="text-[13px] font-extrabold text-green-600 mt-1">
                  Ahorrás ${ahorro.toLocaleString("es-AR")}
                </p>
              )}
            </>
          ) : (
            <p className="text-[28px] font-black text-blue-950 tracking-[-0.05em] leading-tight">
              ${Number(precioFinal).toLocaleString("es-AR")}
            </p>
          )}

        </div>
      )}

    </div>
  );
}