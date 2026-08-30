import DesktopHome from "@/src/components/desktop/DesktopHome";
import MobileHome from "@/src/components/mobile/MobileHome";

export default function Home() {
  return (
    <>
      {/* PC */}
      <div className="hidden lg:block">
        <DesktopHome />
      </div>

      {/* CELULAR */}
      <div className="block lg:hidden">
        <MobileHome />
      </div>
    </>
  );
}