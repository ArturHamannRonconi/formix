# US-028: Tela de Aceite de Convite — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 5: Convites |
| **Status** | Pendente |
| **Depende de** | US-025 (Aceitar Convite Backend), US-045 (Rotas — rota `/invite` já configurada como placeholder) |
| **Bloqueia** | — |

## Contexto

Cria a página `/invite?token=xxx`. Ao carregar, verifica o token com a API. Se válido e usuário sem conta: exibe formulário de nome + senha. Se válido e usuário já tem conta: exibe botão "Aceitar convite". Se inválido/expirado: exibe mensagem de erro. Após aceite, salva tokens e redireciona para `/forms`.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/app/(auth)/invite/page.tsx` | Página de aceite de convite. Lê `token` da query string. Verifica token (GET `/invitations/verify?token=xxx` ou extrai info do token). Renderiza estado adequado |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/invitations/invitations.service.ts` | Adicionar `acceptInvitation(token, data?)`, `verifyInvitationToken(token)` |

## Estados da Página

```
loading → verificando token
  ↓
token inválido/expirado → mensagem de erro + link para /login

token válido + user SEM conta:
  → formulário: nome, senha, confirmar senha
  → botão "Criar conta e entrar"
  → após submit: salva tokens → redireciona para /forms

token válido + user JÁ tem conta:
  → mensagem de boas vindas à organização
  → botão "Aceitar convite"
  → após submit: salva tokens → redireciona para /forms
```

> Nota: `POST /invitations/accept` retorna informação sobre se o email já tem conta. Alternativamente, pode-se tentar o aceite direto e tratar os dois casos na resposta.

## Passos de Implementação

1. [impl] Adicionar `verifyInvitationToken` e `acceptInvitation` ao `invitations.service.ts`
2. [impl] `invite/page.tsx` com máquina de estados (loading / error / new-user / existing-user)

## Critérios de Aceitação

- [ ] Página `/invite?token=xxx` carrega e verifica token
- [ ] Token inválido/expirado: exibe mensagem de erro clara
- [ ] User sem conta: formulário com nome, senha, confirmar senha
- [ ] User com conta: botão "Aceitar convite"
- [ ] Validação de senha mínima e confirmação client-side
- [ ] Loading state durante verificação e submit
- [ ] Após aceite: tokens salvos, redireciona para `/forms`
- [ ] Página acessível (labels, aria, keyboard)
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- Fase 6: US-029 (Schema Forms e Questions)
