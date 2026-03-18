# US-009: Tela de Login

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-008 (Login backend), US-010 (Refresh token — http-client já configurado) |
| **Bloqueia** | — |

## Contexto

Implementa a página `/login`. Em sucesso, salva `accessToken` e `refreshToken` no localStorage (via `auth-token.ts`) e redireciona para `/dashboard`. Também inclui link para recuperação de senha e exibe mensagem de erro em credenciais inválidas.

## Arquivos

### Criar

**Frontend — Pages** — `formix-frontend/src/app/login/`

| Arquivo | Descrição |
|---|---|
| `page.tsx` | Formulário com email e senha. Validação client-side: email válido, senha não vazia. Submit chama `POST /auth/login`. Em sucesso: salva tokens via `setAccessToken` e `setRefreshToken`, redireciona para `/dashboard`. Erro 401: "Email ou senha incorretos". Erro 403: "Confirme seu email antes de fazer login". Erro genérico: mensagem amigável. Link "Esqueci a senha" → `/forgot-password` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/auth/auth.service.ts` | Adicionar função: `login(email: string, password: string): Promise<LoginResponse>` |
| `formix-frontend/src/services/auth/auth.types.ts` | Adicionar `LoginResponse { accessToken, refreshToken, userId, organizationId, role }` |

## Passos de Implementação

1. [impl] Adicionar `login` em `auth.service.ts`
2. [impl] `page.tsx` com formulário, validação, tratamento de erros e redirecionamento

## Critérios de Aceitação

- [ ] Página `/login` renderiza com campos email e senha
- [ ] Login bem-sucedido salva tokens e redireciona para `/dashboard`
- [ ] Credenciais inválidas exibem "Email ou senha incorretos"
- [ ] Email não confirmado exibe mensagem específica
- [ ] Link "Esqueci a senha" navega para `/forgot-password`
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-013** — Password pages (forgot + reset)
