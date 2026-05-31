import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../lib/auth';

const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/COLE_O_LINK_AQUI';

const navItems = [
  { label: 'Início',          icon: '🏠', path: '/' },
  { label: 'Devocional',      icon: '📖', path: '/weeks' },
  { label: 'Treino',          icon: '💪', path: '/workout' },
  { label: 'Aulas',           icon: '🎓', path: '/aulas' },
  { label: 'Lives Gravadas',  icon: '🎥', path: '/lives' },
];

const externalItems = [
  { label: 'Grupo WhatsApp',  icon: '💬', href: WHATSAPP_GROUP_LINK },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Botão hamburger fixo no canto superior esquerdo */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 bg-bg-card border border-border rounded p-2 hover:bg-bg-elevated transition-colors"
        aria-label="Abrir menu"
      >
        <div className="w-5 h-0.5 bg-text-primary mb-1" />
        <div className="w-5 h-0.5 bg-text-primary mb-1" />
        <div className="w-5 h-0.5 bg-text-primary" />
      </button>

      {/* Overlay escuro */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Painel lateral */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-bg-card border-r border-border z-50 flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header do menu */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <div className="text-accent text-xs font-bold uppercase tracking-widest">O Código da</div>
            <div className="text-text-primary font-bold text-lg">Masculinidade</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-text-secondary hover:text-text-primary text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Itens de navegação */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-colors ${
                  isActive
                    ? 'bg-accent text-black font-semibold'
                    : 'text-text-primary hover:bg-bg-elevated'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Divisor */}
          <div className="border-t border-border my-4" />

          {/* Links externos */}
          {externalItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded text-left text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              <span className="ml-auto text-text-secondary text-xs">↗</span>
            </a>
          ))}
        </nav>

        {/* Footer — logout */}
        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-left text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
