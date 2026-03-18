---
name: implement-phase
description: "Lê o plano de fase mais recente (ou o passado como argumento), implementa todas as USs em ordem, faz commits atômicos por US e abre o PR com fechamento de issues. Use quando o usuário pedir para implementar a fase, executar o plano, 'implementa isso', 'executa o plano'."
user-invocable: true
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git checkout:*), Bash(git branch:*), Bash(git push:*), Bash(git rev-parse:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh issue list:*), Bash(npm run *:*), Bash(npm install:*), Bash(npx jest:*), Bash(find:*), Bash(ls:*)
---

# Skill: Implement Phase

## Descrição

Lê o plano de fase e todos os US plans associados, implementa cada US em ordem respeitando dependências, valida após cada US, faz commits atômicos e abre o PR com fechamento de issues ao final.

---

## Input esperado

```
/implement-phase [caminho-opcional-para-o-phase-plan]
```

Exemplos:
```
/implement-phase
/implement-phase docs/features/start/plans/phase-3-forms/phase-3-forms.md
```

Sem argumento: detecta automaticamente o plano mais recente (ver Passo 1).

---

## Processo obrigatório

### Passo 1 — Localizar o plano de fase

**Se argumento fornecido:** usar o caminho passado diretamente.

**Se sem argumento:** encontrar o plano mais recente:
```bash
find docs/features -name "phase-*.md" -not -path "*/us-*" | xargs ls -t | head -1
```
Confirmar o arquivo encontrado para o usuário antes de prosseguir.

### Passo 2 — Ler todo o contexto do plano

Executar as seguintes leituras **antes de qualquer implementação**:

1. Ler o `phase-X-nome.md` encontrado — extrair:
   - Lista de USs e ordem de execução
   - Pacotes a instalar
   - Variáveis de ambiente novas
2. Ler **cada `us-XXX-nome.md`** da mesma subpasta — para cada US extrair:
   - Arquivos a criar e modificar
   - Passos de implementação
   - Critérios de aceitação
3. Ler `docs/features/progress.md` — identificar quais USs já estão Concluídas (para pular)
4. Ler os CLAUDE.md relevantes (`formix-backend/CLAUDE.md`, `formix-frontend/CLAUDE.md`) para confirmar padrões obrigatórios

### Passo 3 — Preparar o ambiente

**Verificar branch atual:**
```bash
git branch --show-current
git status
```

Se houver mudanças não commitadas que não pertencem a esta fase, avisar o usuário e parar.

**Instalar pacotes se o plano indicar:**
```bash
cd formix-backend && npm install <pacotes-listados-no-plano>
```

**Adicionar variáveis de ambiente** ao `.env` e `.env.example` se indicadas no plano.

### Passo 4 — Implementar cada US em ordem

Para **cada US** na ordem de execução do plano (respeitando dependências):

#### 4.1 — Verificar se já está concluída

Checar no `progress.md`. Se `Status: Concluído`, **pular para a próxima**.

#### 4.2 — Implementar a US

Seguir os **Passos de Implementação** exatamente como descritos no `us-XXX-nome.md`.

**Regras obrigatórias de implementação:**

**Backend — Domain layer:**
- Sem imports de `@nestjs/*` ou `mongoose` em arquivos dentro de `domain/`
- Usecases retornam `Output<T>` — **nunca lançam exceções**
- Entities e aggregates podem lançar no `create()` para dados inválidos
- TDD: escrever `.spec.ts` antes do arquivo de implementação

**Backend — Infra layer:**
- Controllers convertem `Output.fail()` em exceções HTTP (NotFoundException, UnauthorizedException, etc.)
- Todo endpoint novo deve ter Swagger completo: `@ApiTags`, `@ApiOperation`, `@ApiBody`, `@ApiResponse`, `@ApiBearerAuth` (quando autenticado)
- DTOs de request e response com `@ApiProperty`

**Multi-tenancy:**
- Toda query MongoDB deve filtrar por `organizationId`

**Tokens:**
- Nunca persistir tokens em plaintext — sempre SHA-256 hash
- Tokens embutidos no aggregate do user (sem coleções separadas)

**Frontend:**
- `'use client'` em páginas com hooks
- `Suspense` wrapper ao usar `useSearchParams()`
- Validação client-side antes de chamar API
- Tratar erros por status code (401, 403, 409, 404, 410...)

#### 4.3 — Validar a US

Após implementar a US, rodar as validações indicadas nos **Critérios de Aceitação**:

```bash
# Backend — typecheck
cd formix-backend && npm run typecheck

# Backend — testes unitários da US
npx jest --testPathPatterns="spec" --passWithNoTests

# Backend — testes de integração da US
npx jest --testPathPatterns="test" --passWithNoTests

# Frontend — typecheck (se US de frontend)
cd formix-frontend && npm run typecheck

# Frontend — build (se US de frontend)
cd formix-frontend && npm run build
```

Se qualquer validação falhar: **corrigir antes de continuar**. Não prosseguir para commit com falhas.

#### 4.4 — Commit da US

Após validação verde, commitar os arquivos desta US:

```bash
git status
```

Agrupar os arquivos por camada e fazer commits na ordem abaixo (adaptar conforme o que a US criou):

| Ordem | Grupo | Tipo de commit |
|---|---|---|
| 1 | Config, env, pacotes | `chore(<escopo>): ...` |
| 2 | Shared / core | `feat(shared): ...` |
| 3 | Domain — value objects, entities, aggregate | `feat(<modulo>): add <entidade> domain entity/vo` |
| 4 | Domain — usecase + spec | `feat(<modulo>): implement <usecase> use case` |
| 5 | Domain — interface de repositório | `feat(<modulo>): define <repo> repository interface` |
| 6 | Infra — schema | `feat(<modulo>): add <schema> mongoose schema` |
| 7 | Infra — repositório + test | `feat(<modulo>): implement mongo <repo> repository` |
| 8 | Infra — DTOs + controller + test | `feat(<modulo>): add <endpoint> endpoint` |
| 9 | Frontend — types + service | `feat(frontend): add <feature> service` |
| 10 | Frontend — page | `feat(frontend): add <page> page` |
| 11 | Docs — progress.md | `docs: mark US-XXX as completed in progress` |

**Regras de commit:**
- **Nunca `git add .` ou `git add -A`** — adicionar arquivos específicos por nome
- Mensagem no formato: `<tipo>(<escopo>): <descrição imperativa em inglês>`
- Máximo 72 caracteres no título
- Se a US for simples (poucos arquivos), pode usar **1 commit por US** com escopo agregado
- Se a US for grande (domain + infra + frontend), usar **commits por camada**
- Validar antes de commitar: `git diff --cached --stat`

**Exemplo de mensagem:**
```
feat(auth): implement confirm-email use case and endpoint
```

#### 4.5 — Atualizar progress.md

Após o commit da US, atualizar `docs/features/progress.md`:

```markdown
### features/<feature> US-XXX: [Título]
- **Status:** Concluído
- **Data:** YYYY-MM-DD
- **Arquivos criados:**
  - [lista dos principais arquivos criados]
- **Arquivos modificados:**
  - [lista dos arquivos modificados]
- **Verificação:** typecheck OK, testes OK
```

Commitar separado:
```bash
git add docs/features/progress.md
git commit -m "docs: mark US-XXX as completed in progress"
```

### Passo 5 — Verificação final da fase

Após implementar todas as USs, rodar os checks do **"Verificação da Fase Completa"** listados no `phase-X-nome.md`:

```bash
cd formix-backend && npm run typecheck
npx jest --passWithNoTests
cd formix-frontend && npm run typecheck && npm run build
```

Se algo falhar: corrigir e criar novo commit de fix antes de abrir o PR.

### Passo 6 — Abrir o PR

#### 6.1 — Identificar issues fechadas

```bash
gh issue list --state open
git log main...HEAD --oneline
```

Analisar os commits e a branch para identificar quais issues este PR fecha:
- Se os commits implementam USs específicas (ex: US-014, US-006), procurar issues com títulos correspondentes
- Incluir `Closes #N` apenas para issues confirmadas — **nunca inventar**
- Se nenhuma issue se aplica, omitir a seção

#### 6.2 — Analisar commits do PR

Para cada commit no range `main...HEAD`:
```bash
git show <hash> --stat
```

#### 6.3 — Push e criar PR

```bash
git push -u origin <branch-atual>

gh pr create \
  --title "feat(<escopo>): implement phase X — <título da fase>" \
  --body "$(cat <<'EOF'
## Descrição

<2-4 frases sobre o que a fase entrega: quais endpoints, páginas, fluxos. Por que existe. Qual problema resolve.>

---

## USs implementadas

| US | Título | Tipo |
|---|---|---|
| US-XXX | [Título] | Backend |
| US-XXX | [Título] | Frontend |

---

## Closes

Closes #N
<!-- Repetir uma linha por issue fechada. Remover seção se nenhuma issue se aplica. -->

---

## Commits

### `<hash>` — <mensagem>

<Descrição detalhada: quais arquivos criados/modificados, responsabilidade de cada um, decisões de design relevantes.>

---

[repetir para cada commit]

---

## Checklist

- [ ] Todos os testes passando (`npm run test` no backend)
- [ ] `npm run typecheck` passa no backend e frontend
- [ ] `npm run build` passa no frontend
- [ ] Sem arquivos sensíveis (.env, secrets)
- [ ] Import rules do DDD respeitadas (domain não importa infra)
- [ ] Swagger documentado em todos os endpoints novos
- [ ] `progress.md` atualizado com todas as USs da fase
- [ ] Multi-tenancy: queries filtram por organizationId (se aplicável)
EOF
)"
```

Após criar, exibir a URL do PR.

---

## Regras gerais

- **Não pular validações** — nunca commitar código que falha em typecheck ou testes
- **Não misturar USs em um mesmo commit** — cada US tem seus commits próprios
- **Não inventar código** que não está no plano — se o plano for ambíguo, implementar o mínimo e seguir os critérios de aceitação
- **Consultar docs** antes de criar código novo: `docs/code-patterns/backend-patterns.md`, `docs/data-modeling/`, `docs/boundaries/`
- **Se uma US depende de outra** que ainda não existe, implementar a dependência primeiro (respeitando a ordem de execução do plano)
- **Em caso de erro de compilação** após instalar pacotes: verificar tsconfig paths e module resolution antes de assumir que o plano está errado

---

## Referências de implementação

- Padrões de código obrigatórios: `formix-backend/CLAUDE.md`
- Padrões de frontend: `formix-frontend/CLAUDE.md`
- Padrões de arquitetura: `docs/code-patterns/backend-patterns.md`
- Exemplo de fase completa implementada: `docs/features/start/plans/phase-2-authentication/`
