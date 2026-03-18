# US-045: Rotas e Navegação Completa — Frontend

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 3: Layout e Navegação |
| **Status** | Pendente |
| **Depende de** | US-036 (AppShell — usado no layout protegido) |
| **Bloqueia** | US-018 (Perfil Frontend), US-020 (Membros Frontend), US-034 (Lista de Formulários), US-046 (404) |

## Contexto

Configura todas as rotas do aplicativo usando Next.js App Router com route groups: `(auth)` para páginas públicas de autenticação e `(app)` para páginas protegidas. Implementa o hook `useAuth` para gerenciar estado de autenticação no client. Adiciona `middleware.ts` para proteção de rotas no servidor (redirect para `/login` sem token, redirect para `/forms` se já logado). Reorganiza as páginas de auth já existentes para o route group correto.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/app/(auth)/layout.tsx` | Layout para rotas públicas de auth: sem sidebar, centralizado, redireciona para `/forms` se já logado |
| `formix-frontend/src/app/(app)/layout.tsx` | Layout para rotas protegidas: usa `AppShell`, redireciona para `/login` se não logado |
| `formix-frontend/src/app/(app)/forms/page.tsx` | Placeholder para lista de formulários (US-034) |
| `formix-frontend/src/app/(app)/settings/profile/page.tsx` | Placeholder para perfil (US-018) |
| `formix-frontend/src/app/(app)/settings/members/page.tsx` | Placeholder para membros (US-020) |
| `formix-frontend/src/middleware.ts` | Next.js middleware: verifica cookie `accessToken` para rotas protegidas e redireciona |
| `formix-frontend/src/hooks/useAuth.ts` | Hook: retorna `{ user, isLoading, isAuthenticated, logout }`. Lê token do storage, decodifica JWT para `user`, expõe `logout()` que limpa tokens e redireciona |
| `formix-frontend/src/types/auth.types.ts` | Types: `AuthUser { id, name, email, organizationId, role }`, `AuthState` |

### Modificar

| Arquivo | O que muda |
|---|---|
| `formix-frontend/src/app/login/page.tsx` | Mover para `(auth)/login/page.tsx` (reorganização de route group) |
| `formix-frontend/src/app/signup/page.tsx` | Mover para `(auth)/signup/page.tsx` |
| `formix-frontend/src/app/forgot-password/page.tsx` | Mover para `(auth)/forgot-password/page.tsx` |
| `formix-frontend/src/app/reset-password/page.tsx` | Mover para `(auth)/reset-password/page.tsx` |
| `formix-frontend/src/app/confirm-email/page.tsx` | Mover para `(auth)/confirm-email/page.tsx` |

## Rotas Configuradas

### Públicas `(auth)` — sem AppShell, redirect para `/forms` se logado

| Rota | Arquivo |
|---|---|
| `/login` | `(auth)/login/page.tsx` |
| `/signup` | `(auth)/signup/page.tsx` |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` |
| `/reset-password` | `(auth)/reset-password/page.tsx` |
| `/confirm-email` | `(auth)/confirm-email/page.tsx` |
| `/check-email` | `(auth)/check-email/page.tsx` |
| `/invite` | `(auth)/invite/page.tsx` (placeholder — US-028) |
| `/forms/:publicToken` | `(public)/forms/[publicToken]/page.tsx` (placeholder — US-040) |

### Protegidas `(app)` — com AppShell, redirect para `/login` se não logado

| Rota | Arquivo |
|---|---|
| `/forms` | `(app)/forms/page.tsx` |
| `/forms/new` | `(app)/forms/new/page.tsx` (placeholder — US-035) |
| `/forms/:id/edit` | `(app)/forms/[id]/edit/page.tsx` (placeholder — US-035) |
| `/forms/:id/responses` | `(app)/forms/[id]/responses/page.tsx` (placeholder — US-042) |
| `/forms/:id/analytics` | `(app)/forms/[id]/analytics/page.tsx` (placeholder — US-044) |
| `/settings/profile` | `(app)/settings/profile/page.tsx` |
| `/settings/members` | `(app)/settings/members/page.tsx` |

## Hook useAuth

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  // Lê accessToken de cookie ou localStorage
  // Decodifica JWT para extrair user info (sem verificação de assinatura no client)
  // Retorna { user: AuthUser | null, isLoading, isAuthenticated, logout }
  // logout: chama POST /auth/logout, limpa tokens, redireciona para /login
}
```

## Middleware

```typescript
// src/middleware.ts
const protectedRoutes = ['/forms', '/settings'];
const authRoutes = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/forms', request.url));
  }
  return NextResponse.next();
}
```

## Passos de Implementação

1. [impl] `src/types/auth.types.ts` — tipos de autenticação
2. [impl] `src/hooks/useAuth.ts` — hook de autenticação
3. [impl] `src/middleware.ts` — proteção de rotas
4. [impl] `(auth)/layout.tsx` — layout público
5. [impl] `(app)/layout.tsx` — layout protegido com AppShell
6. [impl] Mover páginas de auth existentes para route group `(auth)`
7. [impl] Criar placeholders de páginas protegidas
8. [impl] Route group `(public)` para formulário público (placeholder)

## Critérios de Aceitação

- [ ] Acessar `/forms` sem token → redireciona para `/login`
- [ ] Acessar `/login` com token válido → redireciona para `/forms`
- [ ] Layout `(app)` usa AppShell com sidebar e header
- [ ] Layout `(auth)` não exibe sidebar
- [ ] Hook `useAuth` retorna `user` decodificado do JWT
- [ ] `logout()` limpa tokens e redireciona para `/login`
- [ ] Todas as rotas mapeadas no PRD existem (mesmo que como placeholders)
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- **US-046** — Página 404
- **US-018** — Perfil Frontend (usa layout protegido)
- **US-020** — Membros Frontend (usa layout protegido)
