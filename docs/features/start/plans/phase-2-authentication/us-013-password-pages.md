# US-013: Telas de Reset de Senha

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-011 (Forgot password backend), US-012 (Reset password backend) |
| **Bloqueia** | — |

## Contexto

Implementa duas páginas:
- `/forgot-password` — usuário informa o email para receber o link de reset
- `/reset-password?token=xxx` — usuário define a nova senha usando o token do link

## Arquivos

### Criar

**Frontend — Pages** — `formix-frontend/src/app/forgot-password/`

| Arquivo | Descrição |
|---|---|
| `page.tsx` | Formulário com campo email. Submit chama `POST /auth/forgot-password`. Exibe sempre a mensagem genérica: "Se o email existir, você receberá um link em breve." (não revela se email é válido). Botão desabilitado durante loading. |

**Frontend — Pages** — `formix-frontend/src/app/reset-password/`

| Arquivo | Descrição |
|---|---|
| `page.tsx` | Lê `?token` via `useSearchParams()`. Sem token: redireciona para `/forgot-password`. Com token: formulário com "Nova senha" e "Confirmar nova senha". Validação client-side: senha mínimo 8 chars + número + letra, senhas iguais. Submit chama `POST /auth/reset-password`. Sucesso: exibe mensagem + redireciona para `/login` após 3s. Erro 404/410: "Link inválido ou expirado" + link para `/forgot-password`. |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/auth/auth.service.ts` | Adicionar funções: `forgotPassword(email: string)`, `resetPassword(token: string, newPassword: string)` |
| `formix-frontend/src/services/auth/auth.types.ts` | Adicionar types correspondentes |

## Passos de Implementação

1. [impl] Adicionar `forgotPassword` e `resetPassword` em `auth.service.ts`
2. [impl] `forgot-password/page.tsx`
3. [impl] `reset-password/page.tsx`

## Critérios de Aceitação

- [ ] `/forgot-password` exibe campo email e botão de envio
- [ ] Submit exibe mensagem genérica independente do email existir
- [ ] `/reset-password?token=xxx` exibe campos nova senha e confirmação
- [ ] Sem token: redireciona para `/forgot-password`
- [ ] Validação client-side: senhas iguais e complexidade mínima
- [ ] Reset bem-sucedido redireciona para `/login`
- [ ] Token inválido/expirado exibe mensagem com link para novo reset
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso
