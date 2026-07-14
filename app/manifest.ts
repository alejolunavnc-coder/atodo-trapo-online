import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A Todo Trapo Online",
    short_name: "A Todo Trapo",
    description: "Pinturería y artículos para el hogar",
    start_url: "/",
    display: "standalone",
    background_color: "#071426",
    theme_color: "#071426",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}