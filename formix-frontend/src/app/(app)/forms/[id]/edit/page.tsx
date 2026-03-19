'use client';

import { useParams } from 'next/navigation';
import { FormBuilder } from '@/modules/FormBuilder/FormBuilder';
import { PageContainer } from '@/components/Layout';

export default function EditFormPage() {
  const params = useParams<{ id: string }>();
  return (
    <PageContainer>
      <FormBuilder formId={params.id} />
    </PageContainer>
  );
}
