export default function useCarrito(
  carrito: any[],
  setCarrito: any,
  setCarritoAnimado: any
) {
  function agregarAlCarrito(producto: any) {
    const nuevoProducto = {
      categoria: producto.Categoría || "",
      marca: producto.Marca || "",
      nombre: producto.Nombre || "",
      linea: producto.Linea || "",
      tamano: producto.Tamaño || "",
      color: producto.Color || "",
      fragancia: producto.Fragancias || "",
      imagen: producto.Imagen || "",
      cantidad: 1,

      precio: Number(
        producto.Oferta?.trim().toLowerCase() === "si"
          ? producto["Precio oferta"]
          : producto.Precio
      ),

      precioOriginal:
        producto.Oferta?.trim().toLowerCase() === "si"
          ? Number(producto.Precio)
          : null,
    };

    const productoExistente = carrito.find(
      (item) =>
        item.nombre === nuevoProducto.nombre &&
        item.marca === nuevoProducto.marca &&
        item.tamano === nuevoProducto.tamano &&
        item.color === nuevoProducto.color &&
        item.fragancia === nuevoProducto.fragancia
    );

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.nombre === nuevoProducto.nombre &&
          item.marca === nuevoProducto.marca &&
          item.tamano === nuevoProducto.tamano &&
          item.color === nuevoProducto.color &&
          item.fragancia === nuevoProducto.fragancia
            ? { ...item, cantidad: (item.cantidad || 1) + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, nuevoProducto]);
    }

    setCarritoAnimado(true);

    setTimeout(() => {
      setCarritoAnimado(false);
    }, 300);
  }

  function eliminarDelCarrito(index: number) {
    setCarrito(carrito.filter((_: any, i: number) => i !== index));
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  const totalCarrito = carrito.reduce(
    (total: number, producto: any) =>
      total + producto.precio * (producto.cantidad || 1),
    0
  );

  const mensajeWhatsApp =
    "Hola!\n" +
    "Quiero realizar el siguiente pedido:\n\n" +
    carrito
      .map(
        (producto: any, index: number) =>
          `${index + 1}. ${producto.marca ? producto.marca + " - " : ""}${
            producto.nombre
          }${producto.cantidad > 1 ? ` x${producto.cantidad}` : ""}\n` +
          `   ${[producto.tamano, producto.fragancia || producto.color]
            .filter(Boolean)
            .join(" · ")}\n` +
          `   $${(
            producto.precio * (producto.cantidad || 1)
          ).toLocaleString("es-AR")}`
      )
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