'use client';

import styles from './Header.module.css';

interface HeaderProps {
  orgName?: string;
  userName?: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ orgName, userName, onMenuClick, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          aria-expanded={false}
        >
          ☰
        </button>
        <span className={styles.orgName}>{orgName ?? 'Organização'}</span>
      </div>
      <div className={styles.right}>
        {userName && <span className={styles.userName}>{userName}</span>}
        <button
          className={styles.logoutButton}
          onClick={onLogout}
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
