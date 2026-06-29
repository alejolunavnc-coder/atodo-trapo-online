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

  const precioFinal = estaEnOferta && precioOferta ? precioOferta : precio;

  const ahorro =
    estaEnOferta && precioNormal && precioConOferta
      ? precioNormal - precioConOferta
      : 0;

  const porcentaje =
    estaEnOferta && precioNormal && precioConOferta
      ? Math.ceil(((precioNormal - precioConOferta) / precioNormal) * 100)
      : 0;

  return (
    <div className="relative flex items-center gap-4 min-h-[104px]">

      {marca?.trim() && (
        <div className="absolute -top-2 left-0 z-10">
          <span className="inline-flex items-center bg-blue-950 text-white text-[8px] font-extrabold uppercase tracking-[0.10em] px-2.5 py-0.5 rounded-full shadow-sm">
            {marca}
          </span>
        </div>
      )}

      {estaEnOferta && porcentaje > 0 && (
        <div className="absolute -top-2 right-0 z-10">
          <span className="inline-flex items-center bg-yellow-400 text-blue-950 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
            -{porcentaje}%
          </span>
        </div>
      )}

      <div className="w-[125px] h-[104px] flex items-center justify-center shrink-0 pt-4 pr-4 border-r border-gray-200/70">
  {imagen?.trim() ? (
    <img
      src={imagen.trim()}
      alt={marca || nombre}
      className="max-h-[100px] max-w-[112px] object-contain transition-transform duration-300 group-hover:scale-[1.04] drop-shadow-[0_10px_10px_rgba(0,0,0,0.14)]"
    />
  ) : (
    <div className="w-[100px] h-[82px] flex items-center justify-center text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-xl">
      Sin imagen
    </div>
  )}
</div>

<div className="flex-1 pr-8 -mt-8">

  {linea?.trim() && (
    <h3 className="text-[15px] font-extrabold text-blue-950 leading-tight tracking-[-0.03em]">
      {linea}
    </h3>
  )}

  {aromas?.trim() && (
    <div className="mt-1 inline-flex items-center bg-violet-50 text-violet-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
      🌸 {aromas}
    </div>
  )}

  {precioFinal && (
    <div className="mt-1">
      {estaEnOferta && precio && precioOferta ? (
        <>
          <p className="text-[11px] text-red-500 line-through font-semibold">
            ${precioNormal.toLocaleString("es-AR")}
          </p>

          <p className="text-[23px] font-black text-blue-950 tracking-[-0.05em] leading-tight">
            ${precioConOferta.toLocaleString("es-AR")}
          </p>

          {ahorro > 0 && (
            <p className="text-[11px] font-extrabold text-green-600 mt-0.5">
              Ahorrás ${ahorro.toLocaleString("es-AR")}
            </p>
          )}
        </>
      ) : (
        <p className="text-[24px] font-black text-blue-950 tracking-[-0.05em] leading-tight">
          ${Number(precioFinal).toLocaleString("es-AR")}
        </p>
      )}
    </div>
  )}

</div>

<div className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-950 text-[26px] font-light transition-transform duration-300 group-hover:rotate-180">
  ⌄
</div>

    </div>
  );
}