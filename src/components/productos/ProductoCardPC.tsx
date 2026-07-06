import TarjetaProducto from "@/src/components/productos/TarjetaProducto";

type ProductoCardPCProps = {
  nombre: string;
  linea: string;
  marca: string;
  imagen?: string;
  aromas?: string;
  precio?: string;
  precioOferta?: string;
  oferta?: string;
  abierto: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
};

export default function ProductoCardPC({
  nombre,
  linea,
  marca,
  imagen,
  aromas,
  precio,
  precioOferta,
  oferta,
  abierto,
  onClick,
  children,
}: ProductoCardPCProps) {
  return (
    <div className="group break-inside-avoid mb-4 w-full bg-white border border-gray-200 rounded-[22px] shadow-sm hover:shadow-[0_16px_38px_rgba(15,23,42,0.14)] transition-all duration-300 overflow-hidden">
      <div className="p-4 relative">
        <div
          onClick={onClick}
          className="relative z-10 cursor-pointer hover:-translate-y-1 transition-all duration-300"
        >
          <TarjetaProducto
            nombre={nombre}
            linea={linea}
            marca={marca}
            imagen={imagen}
            aromas={aromas}
            precio={precio}
            precioOferta={precioOferta}
            oferta={oferta}
          />
        </div>

        {children}
      </div>
    </div>
  );
}