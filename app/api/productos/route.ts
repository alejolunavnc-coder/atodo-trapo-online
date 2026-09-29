import { NextResponse } from "next/server";
import Papa from "papaparse";
import { productId, variantId } from "@/src/lib/productIdentity";
import { deliveryUrl, readRegistry } from "@/src/lib/imageRegistry";

const SHEET_PRODUCTOS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=0&single=true&output=csv";

const SHEET_PINTURAS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=921992274&single=true&output=csv";

const SHEET_PISCINA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=731975557&single=true&output=csv";

type FilaProducto = Record<string, string>;

function limpiarFila(fila: FilaProducto): FilaProducto {
  const filaLimpia: FilaProducto = {};

  Object.entries(fila).forEach(([clave, valor]) => {
    const claveLimpia = clave
      .replace(/^\uFEFF/, "")
      .trim();

    filaLimpia[claveLimpia] =
      typeof valor === "string"
        ? valor.trim()
        : "";
  });

  return filaLimpia;
}

function parsearCSV(csv: string): FilaProducto[] {
  const resultado = Papa.parse<FilaProducto>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return resultado.data
    .map(limpiarFila)
    .filter(
      (fila) =>
        String(fila.Nombre || "").trim() !== ""
    );
}

function normalizarTexto(valor: unknown): string {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function esCategoriaPiscina(
  fila: FilaProducto
): boolean {
  const categoria = normalizarTexto(
    fila.Categoría
  );

  return (
    categoria === "piscina" ||
    categoria === "piscinas"
  );
}

function obtenerTodasLasColumnas(
  filas: FilaProducto[]
): string[] {
  const columnas = new Set<string>();

  filas.forEach((fila) => {
    Object.keys(fila).forEach((columna) => {
      columnas.add(columna);
    });
  });

  return Array.from(columnas);
}

function completarColumnas(
  filas: FilaProducto[],
  columnas: string[]
): FilaProducto[] {
  return filas.map((fila) => {
    const filaCompleta: FilaProducto = {};

    columnas.forEach((columna) => {
      filaCompleta[columna] =
        fila[columna] ?? "";
    });

    return filaCompleta;
  });
}


export async function GET() {
  try {
    const [
      respuestaProductos,
      respuestaPinturas,
      respuestaPiscina,
    ] = await Promise.all([
      fetch(SHEET_PRODUCTOS_URL, {
        cache: "no-store",
      }),

      fetch(SHEET_PINTURAS_URL, {
        cache: "no-store",
      }),

      fetch(SHEET_PISCINA_URL, {
        cache: "no-store",
      }),
    ]);

    if (!respuestaProductos.ok) {
      throw new Error(
        `No se pudo cargar Hoja 1: ${respuestaProductos.status}`
      );
    }

    if (!respuestaPinturas.ok) {
      throw new Error(
        `No se pudo cargar Pinturas: ${respuestaPinturas.status}`
      );
    }

    if (!respuestaPiscina.ok) {
      throw new Error(
        `No se pudo cargar Piscina: ${respuestaPiscina.status}`
      );
    }

    const [
      csvProductos,
      csvPinturas,
      csvPiscina,
    ] = await Promise.all([
      respuestaProductos.text(),
      respuestaPinturas.text(),
      respuestaPiscina.text(),
    ]);

    const productosGenerales =
      parsearCSV(csvProductos);

    const pinturas =
      parsearCSV(csvPinturas);

    const productosPiscina =
      parsearCSV(csvPiscina);

    /*
     * Evita duplicados:
     *
     * Los productos de Piscinas que todavía permanecen
     * en la hoja principal no se incorporan al catálogo.
     *
     * Para esa categoría se utiliza solamente la nueva
     * hoja Piscina.
     */
    const productosSinPiscina =
      productosGenerales.filter(
        (producto) =>
          !esCategoriaPiscina(producto)
      );

    const catalogoCompleto = [
      ...productosSinPiscina,
      ...pinturas,
      ...productosPiscina,
    ];

    const columnasCompletas =
      obtenerTodasLasColumnas(
        catalogoCompleto
      );

    const catalogoNormalizado =
      completarColumnas(
        catalogoCompleto,
        columnasCompletas
      );

    // Resolución central: específica > general > imagen histórica del Sheets.
    // Se agregan metadatos internos para que /admin pueda indicar el origen
    // sin romper los componentes públicos que siguen leyendo `Imagen`.
    const registry = await readRegistry();
    const columnasSalida = [...columnasCompletas, "_ImagenAnterior", "_ImagenOrigen", "_ProductId", "_VariantId"];
    catalogoNormalizado.forEach((fila) => {
      const anterior = String(fila.Imagen || "").trim();
      const pid = productId(fila);
      const vid = variantId(fila);
      const especifica = registry.variants[vid];
      const general = registry.products[pid];
      fila._ImagenAnterior = anterior;
      fila._ProductId = pid;
      fila._VariantId = vid;
      if (especifica) {
        fila.Imagen = deliveryUrl(especifica, "card");
        fila._ImagenOrigen = "especifica";
      } else if (general) {
        fila.Imagen = deliveryUrl(general, "card");
        fila._ImagenOrigen = "general";
      } else if (anterior) {
        fila._ImagenOrigen = "anterior";
      } else {
        fila._ImagenOrigen = "sin-imagen";
      }
    });

    const csvFinal = Papa.unparse(
      {
        fields: columnasSalida,
        data: catalogoNormalizado,
      },
      {
        quotes: false,
        delimiter: ",",
        newline: "\n",
      }
    );

    return new NextResponse(csvFinal, {
      status: 200,
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Cache-Control":
          "no-store, no-cache, must-revalidate",

        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error(
      "Error cargando productos:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudieron cargar los productos.",
      },
      {
        status: 500,
      }
    );
  }
}