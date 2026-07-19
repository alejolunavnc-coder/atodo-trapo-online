type DesktopShellProps = {
  children: React.ReactNode;
};

export default function DesktopShell({
  children,
}: DesktopShellProps) {
  return (
    <main className="min-h-screen max-w-full overflow-x-clip bg-gray-100">
      {children}
    </main>
  );
}