import { PageContainer } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function FormsPage() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Formulários</h1>
        <Button disabled className="bg-violet-600 hover:bg-violet-700">
          Criar formulário
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-violet-100 p-5 mb-4">
          <FileText className="size-10 text-violet-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Nenhum formulário ainda</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Crie seu primeiro formulário e comece a coletar respostas da sua equipe.
        </p>
        <Button disabled className="bg-violet-600 hover:bg-violet-700">
          Criar formulário
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Em breve (US-034)</p>
      </div>
    </PageContainer>
  );
}
