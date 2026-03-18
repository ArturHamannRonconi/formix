# US-005: Tela de Signup

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 2: Autenticação |
| **Status** | Pendente |
| **Depende de** | US-004 (Signup backend), US-002 (Frontend setup), US-003 (HTTP client) |
| **Bloqueia** | — |

## Contexto

Implementa a página `/signup` no frontend Next.js. O usuário preenche nome, email, senha, confirmação de senha e nome da organização. Em caso de sucesso, é redirecionado para `/confirm-email` com instrução de verificar o email.

## Arquivos

### Criar

**Frontend — Pages** — `formix-frontend/src/app/signup/`

| Arquivo | Descrição |
|---|---|
| `page.tsx` | Página de signup com formulário. Gerencia estado com `useState`. Validação client-side: email válido, senha mínimo 8 chars + número + letra, senhas iguais, campos obrigatórios. Submit chama `POST /auth/signup` via http-client. Em sucesso, redireciona para `/confirm-email`. Em erro 409, exibe "Email já cadastrado". Em erro genérico, exibe "Erro ao criar conta. Tente novamente." |

**Frontend — Services** — `formix-frontend/src/services/auth/`

| Arquivo | Descrição |
|---|---|
| `auth.service.ts` | Funções: `signup(data: SignupData): Promise<SignupResponse>`. Usa o http-client configurado em US-003 |
| `auth.types.ts` | Types: `SignupData { name, email, password, organizationName }`, `SignupResponse { userId, organizationId, accessToken, emailConfirmationRequired }` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/services/auth-token.ts` | Nenhuma mudança — já existe; será usado para salvar accessToken após signup se necessário |

## Passos de Implementação

1. [impl] `auth.types.ts`
2. [impl] `auth.service.ts` com função `signup`
3. [impl] `page.tsx` com formulário, validação e integração

## Critérios de Aceitação

- [ ] Página `/signup` renderiza com campos: nome, email, senha, confirmar senha, nome da organização
- [ ] Validação client-side impede submit com campos inválidos
- [ ] Submit bem-sucedido redireciona para `/confirm-email`
- [ ] Erro 409 exibe "Email já cadastrado"
- [ ] Erro genérico exibe mensagem amigável
- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso

## Próximas USs

- **US-009** — Login page
