'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutList, Users, Settings, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/forms', label: 'Formulários', icon: LayoutList },
  { href: '/settings/members', label: 'Membros', icon: Users },
  { href: '/settings/profile', label: 'Configurações', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-secondary-foreground flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:flex md:min-h-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-xl font-bold text-foreground tracking-tight">Formix</span>
          <button
            className="md:hidden p-1 rounded hover:bg-accent transition-colors"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="flex-1 px-3 py-4 space-y-1" role="list">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onClose}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
