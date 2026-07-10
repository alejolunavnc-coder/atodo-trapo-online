import type { Producto } from "@/src/types/producto";

export default function useProductos({
  productos,
  categoria,
  subcategoria,
  busqueda,
  grupoDetalle,
  tamanosSeleccionados,
  coloresSeleccionados,
  fraganciasSeleccionadas,
}: any) {
  const precioNumero = (valor: any) =>
    Number(
      String(valor || "")
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;

  const tieneOferta = (producto: Producto) => {
    const ofertaTexto = producto.Oferta?.trim().toLowerCase();
    const precioOferta = precioNumero(producto["Precio oferta"]);

    return ofertaTexto === "si" || ofertaTexto === "sí" || precioOferta > 0;
  };

  const productosEnOferta = productos.filter((producto: Producto) =>
    tieneOferta(producto)
  );

  const categoriaActual = String(categoria || "")
    .trim()
    .toLowerCase();

  const esOfertas = categoriaActual === "ofertas";
  const esPinturas = categoriaActual.includes("pintura");

  const productosFiltrados = productos.filter((producto: Producto) => {
    /*
      La categoría Ofertas no depende de la columna Categoría.
      Muestra cualquier producto que tenga oferta.
    */
    if (esOfertas) {
      return tieneOferta(producto);
    }

    const mismaCategoria =
      producto.Categoría?.trim().toLowerCase() === categoriaActual;

    if (!mismaCategoria) return false;

    if (!esPinturas) return true;

    const subcategoriaActual = String(subcategoria || "")
      .trim()
      .toLowerCase();

    if (
      subcategoriaActual === "" ||
      subcategoriaActual === "todas"
    ) {
      return true;
    }

    return (
      String(producto.Subcategoría || "")
        .trim()
        .toLowerCase() === subcategoriaActual
    );
  });

  type GrupoProducto = {
    nombre: string;
    linea: string;
    marca: string;
    items: Producto[];
  };

  const agrupar = (lista: Producto[]): GrupoProducto[] =>
    Object.values(
      lista.reduce(
        (acc: Record<string, GrupoProducto>, producto: Producto) => {
          const nombre = producto.Nombre || "Producto sin nombre";
          const linea = producto.Linea || "";
          const marca = producto.Marca || "";

          const clave = `${linea}-${nombre}-${marca}`;

          if (!acc[clave]) {
            acc[clave] = {
              nombre,
              linea,
              marca,
              items: [],
            };
          }

          acc[clave].items.push(producto);

          return acc;
        },
        {}
      )
    );

  const productosBuscados = agrupar(
    productos.filter((producto: Producto) =>
      (
        (producto.Nombre || "") +
        " " +
        (producto.Marca || "") +
        " " +
        (producto.Linea || "") +
        " " +
        (producto.Subcategoría || "") +
        " " +
        (producto.Color || "") +
        " " +
        (producto.Fragancias || "") +
        " " +
        (producto.Aromas || "") +
        " " +
        (producto.Tamaño || "") +
        " " +
        (producto.Categoría || "")
      )
        .toLowerCase()
        .includes(String(busqueda || "").trim().toLowerCase())
    )
  );

  const productosAgrupados = agrupar(productosFiltrados);

  const ofertasAgrupadas = agrupar(productosEnOferta);

  const productoDetalle = grupoDetalle
    ? grupoDetalle.grupo.items.find((item: any) => {
        if (
          grupoDetalle.grupo.items.some((i: any) =>
            i.Color?.trim()
          )
        ) {
          return (
            item.Tamaño ===
              (tamanosSeleccionados[
                "detalle" + grupoDetalle.index
              ] || grupoDetalle.grupo.items[0].Tamaño) &&
            item.Color ===
              (coloresSeleccionados[
                "detalle" + grupoDetalle.index
              ] || grupoDetalle.grupo.items[0].Color)
          );
        }

        if (
          grupoDetalle.grupo.items.some((i: any) =>
            i.Fragancias?.trim()
          )
        ) {
          return (
            item.Tamaño ===
              (tamanosSeleccionados[
                "detalle" + grupoDetalle.index
              ] || grupoDetalle.grupo.items[0].Tamaño) &&
            item.Fragancias ===
              (fraganciasSeleccionadas[
                "detalle" + grupoDetalle.index
              ] || grupoDetalle.grupo.items[0].Fragancias)
          );
        }

        return (
          item.Tamaño ===
          (tamanosSeleccionados["detalle" + grupoDetalle.index] ||
            grupoDetalle.grupo.items[0].Tamaño)
        );
      })
    : null;

  return {
    productosEnOferta,
    productosFiltrados,
    productosBuscados,
    productosAgrupados,
    ofertasAgrupadas,
    productoDetalle,
  };
}