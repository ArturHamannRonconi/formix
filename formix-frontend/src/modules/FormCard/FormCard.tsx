'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { FormSummary } from '@/services/forms/forms.types';

interface FormCardProps {
  form: FormSummary;
  onDelete?: (id: string) => void;
}

export function FormCard({ form, onDelete }: FormCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createdDate = new Date(form.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete?.(form.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{form.title}</CardTitle>
          <StatusBadge status={form.status} />
        </div>
        {form.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{form.description}</p>
        )}
      </CardHeader>

      <CardContent>
        <p className="text-xs text-muted-foreground">Criado em {createdDate}</p>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        <Link href={`/forms/${form.id}/edit`}>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </Link>
        <Link href={`/forms/${form.id}/analytics`}>
          <Button variant="outline" size="sm">
            Analytics
          </Button>
        </Link>
        <Link href={`/forms/${form.id}/responses`}>
          <Button variant="outline" size="sm">
            Respostas
          </Button>
        </Link>

        {onDelete && (
          <div className="ml-auto flex gap-2">
            {confirmDelete ? (
              <>
                <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                  Confirmar exclusão
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDeleteClick}
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
