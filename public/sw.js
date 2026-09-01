const CACHE_APP = "atodo-trapo-app-v2";
const CACHE_IMAGENES = "atodo-trapo-imagenes-v1";
const MAX_IMAGENES_CACHE = 700;

const ARCHIVOS_INICIALES = ["/", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_APP).then(async (cache) => {
      await Promise.allSettled(
        ARCHIVOS_INICIALES.map((archivo) => cache.add(archivo)),
      );
    }),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter(
            (nombre) =>
              nombre.startsWith("atodo-trapo-") &&
              nombre !== CACHE_APP &&
              nombre !== CACHE_IMAGENES,
          )
          .map((nombre) => caches.delete(nombre)),
      ),
    ),
  );

  self.clients.claim();
});

async function limitarCacheImagenes(cache) {
  const claves = await cache.keys();
  const sobrantes = claves.length - MAX_IMAGENES_CACHE;

  if (sobrantes <= 0) return;

  await Promise.all(
    claves.slice(0, sobrantes).map((request) => cache.delete(request)),
  );
}

async function imagenDesdeCache(request) {
  const cache = await caches.open(CACHE_IMAGENES);
  const guardada = await cache.match(request);

  if (guardada) {
    return guardada;
  }

  const respuesta = await fetch(request);

  if (respuesta.ok || respuesta.type === "opaque") {
    try {
      await cache.put(request, respuesta.clone());
      limitarCacheImagenes(cache).catch(() => {});
    } catch {
      // Si el navegador no permite guardar una respuesta puntual, la imagen
      // sigue funcionando normalmente desde la red.
    }
  }

  return respuesta;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Las imágenes, incluidas las optimizadas por Next (/\_next/image), quedan
  // guardadas en el teléfono después de la primera carga.
  if (event.request.destination === "image") {
    event.respondWith(imagenDesdeCache(event.request));
    return;
  }

  // Conservamos el comportamiento anterior para la propia aplicación.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      return (await caches.match(event.request)) || caches.match("/");
    }),
  );
});
