import { negocioConfig } from "@/src/config/negocio";

type BannerPrincipalProps = {
  bannerActual: number;
  setBannerActual: React.Dispatch<React.SetStateAction<number>>;
};

export default function BannerPrincipal({
  bannerActual,
  setBannerActual,
}: BannerPrincipalProps) {
  return (
    <section className="bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-1 pb-6">
        <div className="relative h-[300px] rounded-[32px] overflow-hidden shadow-none">
          {negocioConfig.banners.map((banner, index) => (
            <img
              key={index}
              src={banner}
              alt={negocioConfig.nombre}
              className={`absolute -top-16 left-0 w-full h-[360px] object-cover object-center transition-opacity duration-500 ${
                bannerActual === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <button
            onClick={() =>
              setBannerActual((actual) =>
                actual === negocioConfig.banners.length - 1 ? 0 : actual + 1
              )
            }
            className="absolute left-[54px] bottom-[25px] inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-[14px] px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.03]"
          >
            Ver más

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
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