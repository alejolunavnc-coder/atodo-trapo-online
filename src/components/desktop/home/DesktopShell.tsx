type DesktopShellProps = {
  children: React.ReactNode;
};

export default function DesktopShell({ children }: DesktopShellProps) {
  return (
    <main className="min-h-screen bg-gray-100 overflow-x-clip max-w-full">
      {children}
    </main>
  );
}