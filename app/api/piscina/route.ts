import { NextResponse } from "next/server";
import Papa from "papaparse";

const SHEET_PISCINA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=731975557&single=true&output=csv";

type FilaPiscina = Record<string, string>;

function limpiarFila(fila: FilaPiscina): FilaPiscina {
  const filaLimpia: FilaPiscina = {};

  Object.entries(fila).forEach(([clave, valor]) => {
    const claveLimpia = clave.replace(/^\uFEFF/, "").trim();

    filaLimpia[claveLimpia] =
      typeof valor === "string" ? valor.trim() : "";
  });

  return filaLimpia;
}

export async function GET() {
  try {
    const respuesta = await fetch(SHEET_PISCINA_URL, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error(
        `No se pudo cargar la hoja Piscina: ${respuesta.status}`
      );
    }

    const csv = await respuesta.text();

    const resultado = Papa.parse<FilaPiscina>(csv, {
      header: true,
      skipEmptyLines: true,
    });

    const filas = resultado.data
      .map(limpiarFila)
      .filter((fila) => String(fila.Nombre || "").trim() !== "");

    const columnas = Array.from(
      new Set(filas.flatMap((fila) => Object.keys(fila)))
    );

    const csvNormalizado = Papa.unparse(
      {
        fields: columnas,
        data: filas.map((fila) =>
          Object.fromEntries(
            columnas.map((columna) => [
              columna,
              fila[columna] ?? "",
            ])
          )
        ),
      },
      {
        quotes: false,
        delimiter: ",",
        newline: "\n",
      }
    );

    return new NextResponse(csvNormalizado, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error cargando la hoja Piscina:", error);

    return NextResponse.json(
      {
        error: "No se pudieron cargar los productos de piscina.",
      },
      {
        status: 500,
      }
    );
  }
}