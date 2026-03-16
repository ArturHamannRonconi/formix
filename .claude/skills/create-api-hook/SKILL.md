# Skill: Create API Hook

## Descrição

Cria um custom hook para comunicação com a API backend do Formix.

## Quando usar

- Quando precisar buscar ou mutar dados da API
- Hooks que ficam em `formix-frontend/src/hooks/`

## Boas práticas

- Usar biblioteca de server state (React Query / SWR) para cache e revalidação
- Separar queries (leitura) de mutations (escrita)
- Tipar request e response
- Tratar loading, error e success states
- Chamadas à API devem passar por `services/`

## Padrão esperado

### Estrutura

```
hooks/
  use{Resource}.ts          # Hook de query (leitura)
  use{Action}{Resource}.ts  # Hook de mutation (escrita)
```

### Template de query hook

```typescript
import { formService } from '@/services/form.service';

export function useForms(organizationId: string) {
  // Usar React Query / SWR
  // Retornar: data, loading, error, refetch
}
```

### Template de mutation hook

```typescript
import { formService } from '@/services/form.service';

export function useCreateForm() {
  // Usar React Query mutation / SWR mutation
  // Retornar: mutate, loading, error
  // Invalidar cache relevante após sucesso
}
```

### Template de service

```typescript
// services/form.service.ts
export const formService = {
  list: (orgId: string): Promise<Form[]> => api.get(`/forms?orgId=${orgId}`),
  getById: (id: string): Promise<Form> => api.get(`/forms/${id}`),
  create: (data: CreateFormDto): Promise<Form> => api.post('/forms', data),
  update: (id: string, data: UpdateFormDto): Promise<Form> => api.put(`/forms/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/forms/${id}`),
};
```
