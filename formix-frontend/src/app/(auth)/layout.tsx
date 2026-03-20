import { ThemeToggle } from '@/components/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
