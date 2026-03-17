# US-003: Comunicação Frontend → Backend (HTTP Client)

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 1: Fundação |
| **Status** | Concluído |
| **Depende de** | US-002 — Setup do Frontend |
| **Bloqueia** | Todas as features de produto do frontend que consomem a API |

## Contexto

O frontend está operacional (US-002 concluída) mas sem nenhuma camada de comunicação com a API. Esta US cria o cliente HTTP centralizado com axios, gerenciamento de tokens JWT em localStorage e os tipos base para respostas da API — a fundação que todos os hooks e services de produto utilizarão.

## Arquivos

### Criar

`formix-frontend/src/types/`

| Arquivo | Descrição |
|---|---|
| `api.ts` | Tipos genéricos: `ApiResponse<T>` (data, message) e `PaginatedResponse<T>` (data[], total, page, limit) |
| `api-error.ts` | Classe `ApiError extends Error` com `statusCode: number`, `message: string`, `errors: string[]`; factory estático `fromAxiosError()` |

`formix-frontend/src/services/`

| Arquivo | Descrição |
|---|---|
| `auth-token.ts` | Funções: `getAccessToken()`, `setAccessToken(token)`, `getRefreshToken()`, `setRefreshToken(token)`, `clearTokens()` — usa `localStorage` (guarded para SSR) |
| `http-client.ts` | Instância axios com `baseURL = process.env.NEXT_PUBLIC_API_URL`. Request interceptor: injeta `Authorization: Bearer <token>` se houver token. Response interceptor: em 401, enfileira requests pendentes, tenta refresh em `/auth/refresh`, retenta request original com novo token; se refresh falhar, chama `clearTokens()` e rejeita a fila |

## Passos de Implementação

1. `npm install axios` em `formix-frontend/`
2. Criar `src/types/api.ts`
3. Criar `src/types/api-error.ts`
4. Criar `src/services/auth-token.ts` (com guard `typeof window !== 'undefined'` para SSR)
5. Criar `src/services/http-client.ts` com interceptors
6. Verificar: typecheck + build

## Critérios de Aceitação

- [x] `npm run typecheck` passa sem erros
- [x] `npm run build` sucesso
- [x] `http-client.ts` usa `NEXT_PUBLIC_API_URL` do env
- [x] Request interceptor injeta token quando presente
- [x] Response interceptor 401 usa fila para evitar múltiplos refreshes simultâneos
- [x] `auth-token.ts` não quebra em SSR (Next.js)

## Dependências de Pacotes

### Produção

- `axios`

## Próximas USs

- **US-004** — Auth: Signup + Login (primeiro consumidor do http-client no frontend)
