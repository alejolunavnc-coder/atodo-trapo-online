import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://attonline.com.ar"),

  title: "A Todo Trapo Online",

  description:
    "Pinturería, piscina, artículos para el hogar, limpieza, herramientas y mucho más.",

  openGraph: {
    title: "A Todo Trapo Online",

    description:
      "Encontrá pinturas, productos para el hogar, limpieza, piscina y nuestras mejores ofertas.",

    url: "https://attonline.com.ar",

    siteName: "A Todo Trapo Online",

    locale: "es_AR",

    type: "website",

    images: [
      {
        url: "/og-image.png",
        width: 1700,
        height: 900,
        alt: "A Todo Trapo Online",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "A Todo Trapo Online",

    description:
      "Pinturería, artículos para el hogar, limpieza, piscina y ofertas.",

    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}

        <GoogleAnalytics gaId="G-718DNMPK5M" />
      </body>
    </html>
  );
}