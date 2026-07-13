type TarjetaProductoProps = {
  nombre: string;
  linea: string;
  marca?: string;
  imagen?: string;
  aromas?: string;
  precio?: string;
  precioOferta?: string;
};

function precioNumero(valor: unknown) {
  return (
    Number(
      String(valor ?? "")
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0
  );
}

export default function TarjetaProducto({
  nombre,
  linea,
  marca,
  imagen,
  aromas,
  precio,
  precioOferta,
}: TarjetaProductoProps) {
  const precioNormal = precioNumero(precio);
  const precioConOferta = precioNumero(precioOferta);

  const estaEnOferta =
    precioConOferta > 0 &&
    precioNormal > 0 &&
    precioConOferta < precioNormal;

  const precioFinal = estaEnOferta
    ? precioConOferta
    : precioNormal;

  const ahorro = estaEnOferta
    ? precioNormal - precioConOferta
    : 0;

  const porcentaje =
    estaEnOferta && precioNormal > 0
      ? Math.ceil(
          ((precioNormal - precioConOferta) /
            precioNormal) *
            100
        )
      : 0;

  return (
    <div className="relative flex min-h-[118px] items-start gap-0">
      {/* [Marca] */}

      {marca?.trim() && (
        <div className="absolute -top-2 left-0 z-20">
          <span className="inline-flex max-w-[100px] items-center truncate rounded-full bg-blue-950 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em] text-white shadow-sm">
            {marca}
          </span>
        </div>
      )}

      {/* [Porcentaje] */}

      {estaEnOferta && porcentaje > 0 && (
        <div className="absolute -top-2 left-[82px] z-20">
          <span className="inline-flex items-center rounded-full bg-yellow-400 px-2.5 py-0.5 text-[9px] font-black text-blue-950 shadow-sm">
            -{porcentaje}%
          </span>
        </div>
      )}

      {/* [Imagen] */}

      <div className="flex h-[112px] w-[145px] shrink-0 items-center justify-center pt-5">
        {imagen?.trim() ? (
          <img
            src={imagen.trim()}
            alt={marca || nombre}
            className="max-h-[104px] max-w-[125px] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-[82px] w-[105px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-[11px] text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      {/* [Información] */}

      <div className="min-w-0 flex-1 pr-10 pt-1">
        {nombre?.trim() && (
          <h3 className="line-clamp-2 text-[16px] font-extrabold leading-tight tracking-[-0.03em] text-blue-950">
            {nombre}
          </h3>
        )}

        {(linea?.trim() || estaEnOferta) && (
          <div className="mt-1 flex min-w-0 items-center gap-2">
            {linea?.trim() && (
              <p className="min-w-0 truncate text-[11px] font-medium leading-tight text-gray-500">
                {linea}
              </p>
            )}

            {estaEnOferta && (
              <p className="shrink-0 text-[11px] font-semibold leading-tight text-red-500 line-through">
                ${precioNormal.toLocaleString("es-AR")}
              </p>
            )}
          </div>
        )}

        {aromas?.trim() && (
          <div className="mt-1.5 inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
            🌸 {aromas}
          </div>
        )}

        {precioFinal > 0 && (
          <div className="mt-2">
            <p className="text-[24px] font-black leading-none tracking-[-0.05em] text-blue-950">
              ${precioFinal.toLocaleString("es-AR")}
            </p>

            {estaEnOferta && ahorro > 0 && (
              <p className="mt-1 text-[11px] font-extrabold leading-none text-green-600">
                Ahorrás ${ahorro.toLocaleString("es-AR")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* [Flecha] */}

      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[26px] font-light text-blue-950 transition-transform duration-300 group-hover:rotate-180">
        ⌄
      </div>
    </div>
  );
}