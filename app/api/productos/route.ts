import { NextResponse } from "next/server";
import Papa from "papaparse";

const SHEET_PRODUCTOS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=0&single=true&output=csv";

const SHEET_PINTURAS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=921992274&single=true&output=csv";

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

  return resultado.data.map(limpiarFila);
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
      filaCompleta[columna] = fila[columna] ?? "";
    });

    return filaCompleta;
  });
}

export async function GET() {
  try {
    const [respuestaProductos, respuestaPinturas] =
      await Promise.all([
        fetch(SHEET_PRODUCTOS_URL, {
          cache: "no-store",
        }),

        fetch(SHEET_PINTURAS_URL, {
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

    const [csvProductos, csvPinturas] =
      await Promise.all([
        respuestaProductos.text(),
        respuestaPinturas.text(),
      ]);

    const productos = parsearCSV(csvProductos);
    const pinturas = parsearCSV(csvPinturas);

    const catalogoCompleto = [
      ...productos,
      ...pinturas,
    ];

    const columnasCompletas =
      obtenerTodasLasColumnas(catalogoCompleto);

    const catalogoNormalizado =
      completarColumnas(
        catalogoCompleto,
        columnasCompletas
      );

    const csvFinal = Papa.unparse(
      {
        fields: columnasCompletas,
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