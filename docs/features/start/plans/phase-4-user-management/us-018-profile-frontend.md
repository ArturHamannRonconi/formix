# US-018: Perfil do Usuário — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 4: Gestão de Usuários |
| **Status** | Pendente |
| **Depende de** | US-017 (Perfil Backend), US-036 (AppShell), US-045 (Rotas protegidas) |
| **Bloqueia** | — |

## Contexto

Cria a página `/settings/profile` onde o usuário pode ver seus dados (nome, email read-only) e alterar nome ou senha. Usa os endpoints `GET /users/me` e `PATCH /users/me`. Exibe feedback visual (toast) para sucesso e erro. Usa componentes de input da US-037.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/services/users/users.service.ts` | `getProfile(): Promise<UserProfile>` e `updateProfile(data): Promise<void>`. Usa `httpClient` |
| `formix-frontend/src/services/users/users.types.ts` | `UserProfile { id, name, email, emailConfirmed }`, `UpdateProfileInput { name?, currentPassword?, newPassword? }` |
| `formix-frontend/src/app/(app)/settings/profile/page.tsx` | Página de perfil: seção de dados pessoais (nome editável, email read-only) + seção de alterar senha. Submit com loading state e toast de feedback |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/app/(app)/settings/profile/page.tsx` | Substituir placeholder pelo componente real |

## Estrutura da Página

```
/settings/profile
├── PageContainer
│   ├── Seção: Dados Pessoais
│   │   ├── TextInput: Nome (editável, pré-preenchido)
│   │   ├── TextInput: Email (read-only, desabilitado)
│   │   └── Button: Salvar (loading state)
│   └── Seção: Alterar Senha
│       ├── TextInput type=password: Senha atual
│       ├── TextInput type=password: Nova senha
│       ├── TextInput type=password: Confirmar nova senha
│       └── Button: Alterar senha (loading state)
```

## Passos de Implementação

1. [impl] `users.types.ts` — tipos
2. [impl] `users.service.ts` — calls para API
3. [impl] `profile/page.tsx` — formulários com validação e toast

## Critérios de Aceitação

- [ ] Página `/settings/profile` carrega dados do usuário ao montar
- [ ] Nome é editável e pré-preenchido com valor atual
- [ ] Email é exibido como read-only (campo desabilitado)
- [ ] Salvar nome exibe toast de sucesso ou erro
- [ ] Seção de senha: validar `newPassword === confirmPassword` client-side antes de enviar
- [ ] Erro da API (senha atual incorreta) exibido inline ou como toast
- [ ] Loading state no botão durante request
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-019** — Listar Membros Backend
