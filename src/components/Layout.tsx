import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      {/* Padding top para não sobrepor o botão hamburger */}
      <div className="pt-14">
        {children}
      </div>
    </div>
  );
}
