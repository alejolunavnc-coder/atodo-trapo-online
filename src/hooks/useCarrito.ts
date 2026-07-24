export default function useCarrito(
  carrito: any[],
  setCarrito: any,
  setCarritoAnimado: any
) {
  const precioNumero = (valor: any) =>
    Number(
      String(valor || "")
        .replace(/\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;

  const textoLimpio = (valor: any) =>
    String(valor || "").trim();

  function agregarAlCarrito(producto: any) {
    const precioNormal = precioNumero(
      producto.Precio
    );

    const precioOferta = precioNumero(
      producto["Precio oferta"]
    );

    const tieneOferta =
      precioOferta > 0 &&
      precioNormal > 0 &&
      precioOferta < precioNormal;

    const nuevoProducto = {
      categoria: textoLimpio(producto.Categoría),
      marca: textoLimpio(producto.Marca),
      nombre: textoLimpio(producto.Nombre),
      linea: textoLimpio(producto.Linea),
      tamano: textoLimpio(producto.Tamaño),
      color: textoLimpio(producto.Color),
      fragancia: textoLimpio(producto.Fragancias),
      imagen: textoLimpio(producto.Imagen),
      cantidad: 1,

      precio: tieneOferta
        ? precioOferta
        : precioNormal,

      precioOriginal: tieneOferta
        ? precioNormal
        : null,
    };

    const productoExistente = carrito.find(
      (item) =>
        item.nombre === nuevoProducto.nombre &&
        item.marca === nuevoProducto.marca &&
        item.linea === nuevoProducto.linea &&
        item.tamano === nuevoProducto.tamano &&
        item.color === nuevoProducto.color &&
        item.fragancia === nuevoProducto.fragancia
    );

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.nombre === nuevoProducto.nombre &&
          item.marca === nuevoProducto.marca &&
          item.linea === nuevoProducto.linea &&
          item.tamano === nuevoProducto.tamano &&
          item.color === nuevoProducto.color &&
          item.fragancia === nuevoProducto.fragancia
            ? {
                ...item,
                cantidad:
                  (item.cantidad || 1) + 1,
              }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        nuevoProducto,
      ]);
    }

    setCarritoAnimado(true);

    setTimeout(() => {
      setCarritoAnimado(false);
    }, 300);
  }

  function eliminarDelCarrito(index: number) {
    setCarrito(
      carrito.filter(
        (_: any, i: number) => i !== index
      )
    );
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  const totalCarrito = carrito.reduce(
    (total: number, producto: any) =>
      total +
      producto.precio *
        (producto.cantidad || 1),
    0
  );

  const mensajeWhatsApp =
    "Hola!\n" +
    "Quiero realizar el siguiente pedido:\n\n" +
    carrito
      .map((producto: any, index: number) => {
        const cantidad =
          producto.cantidad || 1;

        const detalles = [
          textoLimpio(producto.linea),
          textoLimpio(producto.tamano),
          textoLimpio(producto.color),
          textoLimpio(producto.fragancia),
        ].filter(Boolean);

        const nombreProducto = [
          textoLimpio(producto.marca),
          textoLimpio(producto.nombre),
        ]
          .filter(Boolean)
          .join(" - ");

        const subtotal =
          producto.precio * cantidad;

        return (
          `${index + 1}. ${nombreProducto}` +
          `${cantidad > 1 ? ` x${cantidad}` : ""}` +
          `${
            detalles.length > 0
              ? `\n   ${detalles.join(" · ")}`
              : ""
          }` +
          `\n   $${subtotal.toLocaleString(
            "es-AR"
          )}`
        );
      })
      .join("\n\n") +
    "\n\nTotal: $" +
    totalCarrito.toLocaleString("es-AR") +
    "\n\nMi dirección es: ";

  return {
    agregarAlCarrito,
    vaciarCarrito,
    eliminarDelCarrito,
    totalCarrito,
    mensajeWhatsApp,
  };
}