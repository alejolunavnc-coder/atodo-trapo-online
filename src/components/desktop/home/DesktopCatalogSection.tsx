type DesktopCatalogSectionProps = {
  children: React.ReactNode;
};

export default function DesktopCatalogSection({
  children,
}: DesktopCatalogSectionProps) {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-6">
        {children}
      </div>
    </div>
  );
}