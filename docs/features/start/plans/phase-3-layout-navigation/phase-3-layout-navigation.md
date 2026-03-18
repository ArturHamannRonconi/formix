# Plano: Fase 3 — Layout e Navegação

## Contexto

A Fase 2 concluiu autenticação completa: signup, login, refresh token, reset de senha e logout. A Fase 3 implementa a **estrutura visual base do frontend**: layout principal com AppShell/Sidebar/Header, componentes de input reutilizáveis para todos os formulários futuros, sistema de rotas com proteção por autenticação e página 404.

Cobre US-036, US-037, US-045, US-046. Toda essa fase é exclusivamente frontend. Ao final de cada US concluída, atualizar `docs/features/progress.md`.

---

## Novos Pacotes a Instalar

```bash
# Frontend
npm install react-router-dom   # se não usar Next.js Router puro
# Nenhum pacote adicional obrigatório — usar Next.js App Router nativo
```

> Next.js App Router já instalado. Nenhum pacote adicional obrigatório nesta fase.

## Variáveis de Ambiente

Nenhuma nova variável de ambiente nesta fase.

---

## Ordem de Execução

```
US-036 (AppShell / Sidebar / Header) ──▶ US-045 (Rotas e Navegação)
                                      ──▶ US-046 (Página 404)

US-037 (Input Components) ─────────── independente (pode rodar em paralelo com US-036)

(US-036 e US-037 são independentes entre si e podem rodar em paralelo)
```

---

## Estrutura de Arquivos Criados Nesta Fase

```
formix-frontend/src/
  components/
    Layout/
      AppShell.tsx              ← US-036
      Sidebar.tsx               ← US-036
      Header.tsx                ← US-036
      PageContainer.tsx         ← US-036
      index.ts                  ← US-036
    inputs/
      TextInput/
        TextInput.tsx           ← US-037
        TextInput.module.css
        index.ts
      TextArea/                 ← US-037
      Checkbox/                 ← US-037
      RadioGroup/               ← US-037
      Toggle/                   ← US-037
      Dropdown/                 ← US-037
      NumberInput/              ← US-037
      DatePicker/               ← US-037
      RatingInput/              ← US-037
      FileUpload/               ← US-037
      EmailInput/               ← US-037
      index.ts                  ← US-037 (barrel)
  hooks/
    useAuth.ts                  ← US-045
  app/
    (auth)/                     ← US-045 (route group — rotas públicas de auth)
      layout.tsx
      login/page.tsx            (já existe — mover)
      signup/page.tsx           (já existe — mover)
      forgot-password/page.tsx  (já existe — mover)
      reset-password/page.tsx   (já existe — mover)
      confirm-email/page.tsx    (já existe — mover)
    (app)/                      ← US-045 (route group — rotas protegidas)
      layout.tsx                (usa AppShell + ProtectedRoute)
      forms/
        page.tsx                (placeholder)
      settings/
        profile/page.tsx        (placeholder)
        members/page.tsx        (placeholder)
    not-found.tsx               ← US-046
    middleware.ts               ← US-045 (Next.js middleware para proteção de rotas)
```

---

## Padrão Principal: Route Groups + Middleware

Next.js App Router usa **route groups** `(auth)` e `(app)` para separar layouts:
- `(auth)`: layout simples, sem sidebar, redireciona para `/forms` se já logado
- `(app)`: layout com AppShell (Sidebar + Header), redireciona para `/login` se não logado

O `middleware.ts` na raiz de `src/app/` intercepta requests e verifica token antes de renderizar.

```typescript
// src/app/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r));
  const isAuthRoute = authRoutes.some(r => request.nextUrl.pathname.startsWith(r));

  if (isProtected && !token) return NextResponse.redirect('/login');
  if (isAuthRoute && token) return NextResponse.redirect('/forms');
  return NextResponse.next();
}
```

O hook `useAuth` gerencia estado de autenticação no client (tokens, logout, user info).

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no frontend
- [ ] `npm run build` sucesso
- [ ] AppShell renderiza sidebar (desktop) e menu hamburger (mobile)
- [ ] Navegação por teclado funciona em toda a sidebar e header
- [ ] Todos os 11 componentes de input renderizam sem erro
- [ ] Todos os inputs têm label associado, aria-* e focus visible
- [ ] Rota protegida `/forms` sem cookie → redireciona para `/login`
- [ ] Rota `/login` com cookie válido → redireciona para `/forms`
- [ ] `/rota-inexistente` → exibe página 404 com link para home

---

## Arquivos Críticos de Referência

- `docs/code-patterns/frontend-components.md`
- `docs/features/start/prd-formix.md` (US-036, US-037, US-045, US-046)
- `formix-frontend/src/services/http-client.ts` (interceptors de auth já implementados)
- `formix-frontend/src/services/auth/` (auth service existente)
