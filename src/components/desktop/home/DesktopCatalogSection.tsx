type DesktopCatalogSectionProps = {
  children: React.ReactNode;
};

export default function DesktopCatalogSection({
  children,
}: DesktopCatalogSectionProps) {
  return (
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {children}
      </div>
    </div>
  );
}