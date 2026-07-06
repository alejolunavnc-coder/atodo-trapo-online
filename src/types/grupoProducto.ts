import type { Producto } from "./producto";

export type GrupoProducto = {
  nombre: string;
  linea: string;
  items: Producto[];
};