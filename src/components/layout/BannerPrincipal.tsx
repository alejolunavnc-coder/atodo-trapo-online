"use client";

import { useEffect } from "react";
import { negocioConfig } from "@/src/config/negocio";

type BannerPrincipalProps = {
  bannerActual: number;
  setBannerActual: React.Dispatch<React.SetStateAction<number>>;
};

export default function BannerPrincipal({
  bannerActual,
  setBannerActual,
}: BannerPrincipalProps) {
  const siguienteBanner = () => {
    setBannerActual((actual) =>
      actual === negocioConfig.banners.length - 1 ? 0 : actual + 1
    );
  };

  useEffect(() => {
    if (negocioConfig.banners.length <= 1) return;

    const intervalo = window.setInterval(() => {
      setBannerActual((actual) =>
        actual === negocioConfig.banners.length - 1 ? 0 : actual + 1
      );
    }, 4000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [setBannerActual]);

  return (
    <section className="overflow-hidden bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-1">
        <div
          onClick={siguienteBanner}
          className="relative aspect-[3.4/1] w-full cursor-pointer overflow-hidden rounded-[32px] bg-white"
        >
          {negocioConfig.banners.map((banner, index) => (
            <img
              key={banner}
              src={banner}
              alt={`${negocioConfig.nombre} - Banner ${index + 1}`}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
                bannerActual === index
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}