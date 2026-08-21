import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las URLs de producto vienen desde Google Sheets y pueden estar
    // alojadas en distintos servicios externos.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],

    // Las tarjetas usan miniaturas chicas. Estos tamaños evitan generar
    // imágenes mucho más grandes de lo que realmente se muestra.
    imageSizes: [64, 96, 128, 160, 192, 256, 384],

    // Calidad suficiente para catálogo sin descargar archivos enormes.
    qualities: [60, 70, 75, 80],

    // Vercel/Next conserva la versión optimizada durante al menos 24 h.
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
