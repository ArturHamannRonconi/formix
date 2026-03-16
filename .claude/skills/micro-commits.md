---
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(git stash:*), Bash(git restore:*)
description: Agrupa arquivos por feature e cria micro commits atômicos sem quebrar o projeto
---

# Skill: Micro Commits por Feature

## Descrição

Analisa os arquivos modificados/não-rastreados, agrupa por feature/contexto e cria commits micro atômicos — cada commit deixa o projeto em estado funcional.

## Quando usar

- Quando há vários arquivos alterados de features diferentes misturados
- Antes de abrir um PR para organizar o histórico
- Quando o `git status` mostra muita coisa e você quer commits limpos
- Quando o usuário pede "separa os commits" ou "organiza os commits"

## Processo obrigatório

### Passo 1 — Snapshot do estado atual

```bash
git status
git diff --stat
```

Entenda o que mudou antes de qualquer coisa.

### Passo 2 — Identifique os grupos de feature

Agrupe os arquivos por contexto semântico. Exemplos de critérios:

| Critério | Exemplos de grupo |
|---|---|
| Módulo de domínio | `users/`, `forms/`, `responses/` |
| Camada técnica dentro de um módulo | `domain/`, `infra/` |
| Tipo de artefato | schemas, controllers, use cases, testes |
| Infraestrutura compartilhada | `core/`, `shared/`, configs |

**Regra:** um commit deve ser coerente — alguém revisando o diff deve entender o propósito sem contexto extra.

### Passo 3 — Ordene os commits por dependência

Commits devem seguir ordem topológica: dependências primeiro.

Ordem sugerida:
1. Infraestrutura e configs (`.env`, `docker-compose`, packages)
2. Core / shared (database, middlewares, shared utils)
3. Domain layer de cada módulo (entities, value objects, use cases, interfaces de repositório)
4. Infra layer de cada módulo (schemas, controllers, repositories concretos)
5. Testes unitários
6. Testes de integração
7. Frontend (em ordem similar: tipos → hooks → componentes → páginas)
8. Docs / README

### Passo 4 — Para cada grupo, execute o ciclo

```bash
# 1. Stage apenas os arquivos do grupo
git add <arquivo1> <arquivo2> ...

# 2. Verifique o que vai no commit
git diff --cached --stat

# 3. Rode os testes/build do escopo afetado (ver abaixo)
# 4. Só então commite
git commit -m "<tipo>(<escopo>): <descrição imperativa em inglês>"
```

**Nunca use `git add .` ou `git add -A`** — isso mistura contextos.

### Passo 5 — Validação antes de cada commit

Dependendo do escopo do grupo, rode:

| Escopo | Comando de validação |
|---|---|
| Backend (qualquer módulo) | `cd formix-backend && npm run build --passWithNoTests` |
| Testes de um módulo | `cd formix-backend && npm test -- --testPathPattern=<modulo>` |
| Frontend | `cd formix-frontend && npm run build` |
| Tipos compartilhados | TypeScript check: `npx tsc --noEmit` |

Se a validação falhar, **não commite**. Ajuste o agrupamento ou corrija o código antes de continuar.

## Formato de mensagem de commit

```
<tipo>(<escopo>): <descrição imperativa, presente, inglês>

[corpo opcional — contexto de negócio, decisão técnica]
[breaking change, se houver]
```

### Tipos permitidos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Mudança sem novo comportamento |
| `test` | Adiciona ou corrige testes |
| `chore` | Config, build, deps, CI |
| `docs` | Documentação |
| `style` | Formatação sem mudança lógica |

### Escopos comuns do Formix

`users`, `forms`, `responses`, `auth`, `organizations`, `invitations`, `analytics`, `core`, `shared`, `frontend`, `config`

### Exemplos de mensagens boas

```
feat(forms): add question ordering value object
feat(responses): store email separately from response for anonymity
fix(auth): validate token expiration before allowing form access
test(forms): add unit tests for CreateForm use case
chore(config): add MongoDB URI to environment schema
```

## Checklist final

Antes de declarar os commits prontos:

- [ ] Cada commit tem propósito único e claro
- [ ] Nenhum commit quebra build ou testes
- [ ] Ordem dos commits respeita dependências
- [ ] Sem `git add .` ou arquivos acidentais (`.env`, binários)
- [ ] Mensagens no padrão `tipo(escopo): descrição`
- [ ] Import rules do DDD respeitadas em cada commit isolado (domain não importa infra)

## Armadilhas comuns

- **Arquivo compartilhado em dois features**: commite-o no grupo de menor dependência (geralmente o primeiro grupo que o usa)
- **Testes junto com implementação ou separados?**: prefira separados se o teste testa uma única unidade; junto se o teste foi escrito simultaneamente como parte do desenvolvimento
- **Refactor + feat no mesmo diff**: separe sempre — um commit de refactor, depois um commit de feat
- **Schema + use case no mesmo módulo**: separe por camada (domain antes de infra)
