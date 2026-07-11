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

  return (
    <section className="bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-1 pb-6">
        <div
          onClick={siguienteBanner}
          className="relative h-[300px] cursor-pointer overflow-hidden rounded-[32px] shadow-none"
        >
          {negocioConfig.banners.map((banner, index) => (
            <img
              key={index}
              src={banner}
              alt={negocioConfig.nombre}
              className={`absolute -top-16 left-0 h-[360px] w-full object-cover object-center transition-opacity duration-500 ${
                bannerActual === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="absolute bottom-[25px] left-[54px] inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-[14px] font-semibold text-slate-900 shadow-md transition-all duration-200 hover:scale-[1.03] hover:bg-yellow-500"
          >
            Ver más

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}