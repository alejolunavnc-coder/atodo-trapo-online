import DesktopHome from "@/src/components/desktop/DesktopHome";
import MobileHome from "@/src/components/mobile/MobileHome";

export default function Home() {
  return (
    <>
      {/* PC */}
      <div className="hidden md:block">
        <DesktopHome />
      </div>

      {/* CELULAR */}
      <div className="block md:hidden">
        <MobileHome />
      </div>
    </>
  );
}