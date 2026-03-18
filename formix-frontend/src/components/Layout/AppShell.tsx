'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
  orgName?: string;
  userName?: string;
  onLogout: () => void;
}

export function AppShell({ children, orgName, userName, onLogout }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Pular para conteúdo
      </a>
      <Header
        orgName={orgName}
        userName={userName}
        onMenuClick={() => setSidebarOpen(true)}
        onLogout={onLogout}
      />
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <main id="main-content" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
