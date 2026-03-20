'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu } from 'lucide-react';

interface HeaderProps {
  orgName?: string;
  userName?: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function Header({ orgName, userName, onMenuClick, onLogout }: HeaderProps) {
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm">
      <button
        className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
        onClick={onMenuClick}
        aria-label="Abrir menu de navegação"
        aria-expanded={false}
      >
        <Menu className="size-5" />
      </button>

      <span className="font-semibold text-foreground hidden md:block">
        {orgName ?? 'Organização'}
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {userName && (
          <>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-semibold dark:bg-violet-900 dark:text-violet-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
          </>
        )}
        <Button variant="ghost" size="sm" onClick={onLogout} type="button">
          Sair
        </Button>
      </div>
    </header>
  );
}
