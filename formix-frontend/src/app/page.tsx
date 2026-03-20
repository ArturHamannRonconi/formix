import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, BarChart3, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-50 via-background to-indigo-50 dark:from-slate-950 dark:via-background dark:to-slate-950 px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-block rounded-full bg-violet-100 dark:bg-violet-950 px-4 py-1 text-sm font-medium text-violet-700 dark:text-violet-300 mb-6">
            SaaS multi-tenant para formulários
          </div>
          <h1 className="text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            Crie formulários.{' '}
            <span className="text-violet-600 dark:text-violet-400">Colete respostas.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Formix permite sua equipe criar formulários personalizados, compartilhar links e visualizar analytics — tudo com privacidade garantida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500">
              <Link href="/signup">
                Começar grátis <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-background">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Tudo que você precisa
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-border hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all">
              <div className="inline-flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 p-3 mb-4">
                <FileText className="size-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Formulários customizáveis</h3>
              <p className="text-sm text-muted-foreground">Crie formulários com múltiplos tipos de pergunta adaptados ao seu negócio.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-border hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all">
              <div className="inline-flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 p-3 mb-4">
                <Shield className="size-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Respostas anônimas</h3>
              <p className="text-sm text-muted-foreground">Proteja a privacidade dos respondentes com total anonimato nas respostas.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-border hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all">
              <div className="inline-flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 p-3 mb-4">
                <BarChart3 className="size-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Analytics em tempo real</h3>
              <p className="text-sm text-muted-foreground">Dashboards detalhados para visualizar e analisar as respostas coletadas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-violet-600 dark:bg-violet-800 px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-violet-200 mb-8 max-w-md mx-auto">
          Junte-se à sua equipe e crie formulários profissionais em minutos.
        </p>
        <Button asChild size="lg" variant="secondary" className="font-semibold">
          <Link href="/signup">Criar conta grátis</Link>
        </Button>
      </section>
    </main>
  );
}
