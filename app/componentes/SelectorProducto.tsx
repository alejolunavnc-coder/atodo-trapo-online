type SelectorProductoProps = {
  tamanos: string[];
  tamanoSeleccionado: string;
  onCambiarTamano: (tamano: string) => void;

  colores?: string[];
  colorSeleccionado?: string;
  onCambiarColor?: (color: string) => void;
  fragancias?: string[];
fraganciaSeleccionada?: string;
onCambiarFragancia?: (fragancia: string) => void;
};

export default function SelectorProducto({
  tamanos,
  tamanoSeleccionado,
  onCambiarTamano,
  colores,
colorSeleccionado,
onCambiarColor,
fragancias,
fraganciaSeleccionada,
onCambiarFragancia,
}: SelectorProductoProps) {
  return (
    <>
      <p className="text-xs font-semibold text-gray-500 mt-4 mb-2 uppercase">
        Tamaño
      </p>

      <div className="flex flex-wrap gap-2">
        {tamanos.map((tam, i) => (
          <button
            key={i}
            onClick={() => onCambiarTamano(tam)}
            className={
              tamanoSeleccionado === tam
                ? "bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
            }
          >
            {tam}
          </button>
        ))}
      </div>
      {colores && colores.length > 0 && onCambiarColor && (
  <>
    <p className="text-gray-600 mb-2 mt-4">
      Color
    </p>

    <select
      className="border rounded-lg py-1 px-3 w-full text-black text-sm"
      value={colorSeleccionado}
      onChange={(e) => onCambiarColor(e.target.value)}
    >
      {colores.map((color, i) => (
        <option key={i} value={color}>
          {color}
        </option>
      ))}
    </select>
  </>
  
)}
{fragancias && fragancias.length > 0 && onCambiarFragancia && (
  <>
    <p className="text-gray-600 mb-2 mt-4">
      Fragancia
    </p>

    <select
      className="border rounded-lg py-1 px-3 w-full text-black text-sm"
      value={fraganciaSeleccionada}
      onChange={(e) => onCambiarFragancia(e.target.value)}
    >
      {fragancias.map((fragancia, i) => (
        <option key={i} value={fragancia}>
          {fragancia}
        </option>
      ))}
    </select>
  </>
)}
    </>
    
  );
}