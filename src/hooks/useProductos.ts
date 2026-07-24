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

  const estaSinStock = (producto: Producto) => {
    const stock = String(producto.Stock || "")
      .trim()
      .toLowerCase();

    return stock === "x";
  };

  const productosDisponibles = productos.filter(
    (producto: Producto) => !estaSinStock(producto)
  );

  const tieneOferta = (producto: Producto) => {
    const precio = precioNumero(producto.Precio);
    const precioOferta = precioNumero(
      producto["Precio oferta"]
    );

    return (
      precioOferta > 0 &&
      precio > 0 &&
      precioOferta < precio
    );
  };

  const productosEnOferta = productosDisponibles.filter(
    (producto: Producto) => tieneOferta(producto)
  );

  const categoriaActual = String(categoria || "")
    .trim()
    .toLowerCase();

  const esOfertas = categoriaActual === "ofertas";
  const esPinturas = categoriaActual.includes("pintura");

  const productosFiltrados = productosDisponibles.filter(
    (producto: Producto) => {
      if (esOfertas) {
        return tieneOferta(producto);
      }

      const mismaCategoria =
        producto.Categoría?.trim().toLowerCase() ===
        categoriaActual;

      if (!mismaCategoria) return false;

      if (!esPinturas) return true;

      const subcategoriaActual = String(
        subcategoria || ""
      )
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
    }
  );

  type GrupoProducto = {
    nombre: string;
    linea: string;
    marca: string;
    items: Producto[];
  };

  const agrupar = (
    lista: Producto[]
  ): GrupoProducto[] =>
    Object.values(
      lista.reduce(
        (
          acc: Record<string, GrupoProducto>,
          producto: Producto
        ) => {
          const nombre =
            producto.Nombre || "Producto sin nombre";

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

  /*
   * Normaliza las palabras del buscador:
   * - ignora mayúsculas y minúsculas;
   * - elimina acentos;
   * - elimina signos innecesarios;
   * - compara singular y plural.
   */
  const normalizarTextoBusqueda = (valor: any) =>
    String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9ñ\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const singularizarPalabra = (palabra: string) => {
    if (palabra.length <= 3) {
      return palabra;
    }

    /*
     * Ejemplos:
     * luces → luz
     * barnices → barniz
     */
    if (
      palabra.endsWith("ces") &&
      palabra.length > 4
    ) {
      return `${palabra.slice(0, -3)}z`;
    }

    /*
     * Ejemplos:
     * paredes → pared
     * colores → color
     * interiores → interior
     */
    if (
      palabra.endsWith("es") &&
      palabra.length > 4
    ) {
      return palabra.slice(0, -2);
    }

    /*
     * Ejemplos:
     * pinturas → pintura
     * rodillos → rodillo
     * brochas → brocha
     */
    if (
      palabra.endsWith("s") &&
      palabra.length > 3
    ) {
      const letraAnterior =
        palabra[palabra.length - 2];

      if ("aeiou".includes(letraAnterior)) {
        return palabra.slice(0, -1);
      }
    }

    return palabra;
  };

  const obtenerPalabrasBusqueda = (valor: any) =>
    normalizarTextoBusqueda(valor)
      .split(" ")
      .filter(Boolean)
      .map(singularizarPalabra);

  const coincideConBusqueda = (
    textoProducto: string,
    textoBuscado: string
  ) => {
    const palabrasBuscadas =
      obtenerPalabrasBusqueda(textoBuscado);

    if (palabrasBuscadas.length === 0) {
      return true;
    }

    const palabrasProducto =
      obtenerPalabrasBusqueda(textoProducto);

    return palabrasBuscadas.every(
      (palabraBuscada) =>
        palabrasProducto.some(
          (palabraProducto) =>
            palabraProducto.includes(
              palabraBuscada
            )
        )
    );
  };

  const productosBuscados = agrupar(
    productosDisponibles.filter(
      (producto: Producto) => {
        const textoProducto =
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
          (producto.Categoría || "");

        return coincideConBusqueda(
          textoProducto,
          busqueda
        );
      }
    )
  );

  const productosAgrupados = agrupar(
    productosFiltrados
  );

  const ofertasAgrupadas = agrupar(
    productosEnOferta
  );

  const productoDetalle = grupoDetalle
    ? grupoDetalle.grupo.items.find((item: any) => {
        if (
          grupoDetalle.grupo.items.some(
            (i: any) => i.Color?.trim()
          )
        ) {
          return (
            item.Tamaño ===
              (tamanosSeleccionados[
                "detalle" + grupoDetalle.index
              ] ||
                grupoDetalle.grupo.items[0]
                  .Tamaño) &&
            item.Color ===
              (coloresSeleccionados[
                "detalle" + grupoDetalle.index
              ] ||
                grupoDetalle.grupo.items[0].Color)
          );
        }

        if (
          grupoDetalle.grupo.items.some(
            (i: any) => i.Fragancias?.trim()
          )
        ) {
          return (
            item.Tamaño ===
              (tamanosSeleccionados[
                "detalle" + grupoDetalle.index
              ] ||
                grupoDetalle.grupo.items[0]
                  .Tamaño) &&
            item.Fragancias ===
              (fraganciasSeleccionadas[
                "detalle" + grupoDetalle.index
              ] ||
                grupoDetalle.grupo.items[0]
                  .Fragancias)
          );
        }

        return (
          item.Tamaño ===
          (tamanosSeleccionados[
            "detalle" + grupoDetalle.index
          ] ||
            grupoDetalle.grupo.items[0].Tamaño)
        );
      })
    : null;

  return {
    productosDisponibles,
    productosEnOferta,
    productosFiltrados,
    productosBuscados,
    productosAgrupados,
    ofertasAgrupadas,
    productoDetalle,
  };
}