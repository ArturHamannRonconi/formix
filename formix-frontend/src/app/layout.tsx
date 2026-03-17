import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Formix',
  description: 'Crie formulários personalizados e colete respostas anônimas.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
