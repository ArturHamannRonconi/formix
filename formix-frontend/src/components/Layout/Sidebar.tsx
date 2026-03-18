'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/forms', label: 'Formulários' },
  { href: '/settings/members', label: 'Membros' },
  { href: '/settings/profile', label: 'Configurações' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        className={`${styles.sidebar}${isOpen ? ` ${styles.sidebarOpen}` : ''}`}
        aria-label="Navegação principal"
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar menu"
        >
          ✕ Fechar
        </button>
        <div className={styles.logo}>Formix</div>
        <ul className={styles.nav} role="list">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onClose}
                >
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
