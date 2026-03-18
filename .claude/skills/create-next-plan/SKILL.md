---
name: create-next-plan
description: "Cria o próximo plano de fase com todos os .mds (phase plan + US plans individuais) baseando-se no caminho do PRD passado e no progress.md. Use quando o usuário pedir para criar o próximo plano, planejar a próxima fase, ou criar os planos de implementação."
user-invocable: true
---

# Skill: Create Next Plan

## Descrição

Lê o PRD informado como argumento e o `docs/features/progress.md` para identificar a próxima fase ainda não planejada. Gera todos os arquivos `.md` necessários: o plano de fase (`phase-X-nome.md`) e um plano individual por US (`us-XXX-nome.md`), dentro da subpasta correta em `plans/`.

---

## Input esperado

```
/create-next-plan <caminho-do-prd>
```

Exemplo:
```
/create-next-plan docs/features/start/prd-formix.md
```

O argumento é sempre o caminho para o arquivo PRD da feature.

---

## Processo obrigatório

### Passo 1 — Ler os arquivos de contexto

Execute as seguintes leituras **antes de qualquer criação**:

1. Ler o PRD no caminho informado
2. Ler `docs/features/progress.md` (use `tail -n 60` para as últimas entradas relevantes)
3. Listar o que já existe em `docs/features/<feature>/plans/` para não duplicar

> O `<feature>` é inferido do caminho do PRD: `docs/features/<feature>/prd-*.md`

### Passo 2 — Identificar a próxima fase

- Do PRD, extrair todas as fases e suas USs, com numeração e títulos
- Do `plans/`, identificar quais fases já têm subpasta criada
- Do `progress.md`, identificar o estado de cada US (Concluído / Pendente / Em andamento)
- **A próxima fase** é a primeira fase do PRD cuja subpasta `plans/phase-X-nome/` ainda **não existe**
- Se todas as fases já tiverem planos, avisar o usuário que o projeto está totalmente planejado

### Passo 3 — Criar a subpasta e o phase plan

**Localização:** `docs/features/<feature>/plans/<phase-X-nome>/`

Criar o arquivo `phase-X-nome.md` com a seguinte estrutura:

```markdown
# Plano: Fase X — [Título da Fase]

## Contexto

[2-4 frases: o que esta fase entrega, estado do projeto antes dela, quais USs cobre (ex: US-010 a US-015).
Sempre mencionar: "Ao final de cada US concluída, atualizar `docs/features/progress.md`."]

---

## Novos Pacotes a Instalar (se houver)

[Listar pacotes que serão necessários nesta fase. Omitir seção se não houver.]

## Variáveis de Ambiente (se houver)

[Listar variáveis novas que serão adicionadas. Omitir seção se não houver.]

---

## Ordem de Execução

[Diagrama ASCII mostrando dependências entre USs da fase:]

\`\`\`
US-XXX (Título curto) ──▶ US-YYY (Título curto)
US-XXX (Título curto) ──┬──▶ US-YYY (Título curto)
                         └──▶ US-ZZZ (Título curto)

(USs paralelas: US-XXX e US-YYY são independentes entre si)
\`\`\`

---

## Estrutura de Módulos/Arquivos (se relevante)

[Árvore de arquivos ou tabela mostrando o que será criado nesta fase.
Incluir checkmarks ✅ para o que já existe. Omitir seção se não acrescentar clareza.]

---

## Padrão de retorno / design pattern principal (se relevante)

[Descrever o padrão principal que será usado nesta fase (ex: Output<T>, token rotation, etc.)
Omitir se não houver padrão específico da fase.]

---

## Verificação da Fase Completa

- [ ] `npm run typecheck` passa no backend (se aplicável)
- [ ] Todos os `.spec.ts` passam
- [ ] Todos os `.test.ts` passam (se aplicável)
- [ ] [Critério funcional específico da fase]
- [ ] [Critério funcional específico da fase]
- [ ] `npm run typecheck` passa no frontend (se aplicável)
- [ ] `npm run build` sucesso no frontend (se aplicável)

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md`
- `docs/data-modeling/collections.md`
- `docs/boundaries/`
- `docs/features/<feature>/prd-<feature>.md`
[Adicionar outros docs relevantes para esta fase específica]
```

### Passo 4 — Criar os US plans individuais

Para **cada US da fase**, criar `us-XXX-nome-kebab-case.md` na mesma subpasta.

Cada arquivo segue este formato:

```markdown
# US-XXX: [Título completo]

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | [Nome da fase — ex: "Fase 3: Forms Core"] |
| **Status** | Pendente |
| **Depende de** | US-XXX — [título] / — |
| **Bloqueia** | US-XXX — [título], US-YYY — [título] / — |

## Contexto

[Descrição objetiva do que esta US entrega, por que existe e qual o estado do projeto antes dela.
Mencionar entidades/módulos afetados. 3-5 frases.]

## Arquivos

### Criar

[Listar apenas módulo/camada de alto nível ou arquivos específicos quando claramente definidos pelo PRD]

| Arquivo | Descrição |
|---|---|
| `path/to/file.ts` | Responsabilidade do arquivo |
| `path/to/file.spec.ts` | Testes unitários |

### Modificar

| Arquivo | O que muda |
|---|---|
| `path/to/file.ts` | Descrição da mudança |

> Omitir seção "Modificar" se não há arquivos a modificar.

## Passos de Implementação (TDD)

[Para USs de backend com lógica de domínio, intercalar [teste] e [impl]:]
1. [teste] `arquivo.spec.ts` — Red
2. [impl] `arquivo.ts` — Green
3. [impl] DTOs e controller handler
4. Atualizar module

[Para USs de frontend:]
1. [impl] Types e service
2. [impl] Page component com estados e validação

## Critérios de Aceitação

- [ ] [Critério verificável e específico]
- [ ] [Critério verificável e específico]
- [ ] Usecases retornam `Output<T>` — nenhum `throw` interno (backend)
- [ ] Todos os `.spec.ts` passam
- [ ] `npm run typecheck` passa
- [ ] Swagger documenta todos os endpoints (se US de backend com endpoints)
- [ ] `npm run build` sucesso (se US de frontend)

## Dependências de Pacotes

### Produção
- `pacote`

### Dev
- `pacote`

> Omitir seção inteira se não há dependências novas.

## Próximas USs

- **US-XXX** — [título] (desbloqueada por esta)
- **US-XXX** — [título] (pode rodar em paralelo)
```

### Passo 5 — Confirmar ao usuário

Listar todos os arquivos criados com seus caminhos relativos.

---

## Regras obrigatórias

### Sobre o conteúdo gerado

- **Não duplicar** — verificar `plans/` antes de criar qualquer arquivo
- **Não implementar** — apenas criar os `.md` de planejamento
- **Numeração das USs** — respeitar a numeração exata do PRD, nunca inventar
- **Dependências reais** — mapear corretamente o `Depende de` / `Bloqueia` de cada US (backend antes de frontend da mesma feature, domain antes de infra)
- **TDD sempre no backend** — para toda US com usecases ou entities, intercalar `[teste Red]` → `[impl Green]`
- **Swagger obrigatório** — toda US que criar endpoints deve ter critério de Swagger nos critérios de aceitação

### Sobre nomes e caminhos

- Subpasta da fase: `phase-X-nome-kebab-case/` (mesmo nome do arquivo `.md`)
- Arquivo de fase: `phase-X-nome-kebab-case.md`
- Arquivo de US: `us-XXX-nome-kebab-case.md`
- Inferir `<feature>` do path do PRD: `docs/features/<feature>/prd-*.md` → `<feature>`
- Exemplo correto: `docs/features/start/plans/phase-3-forms/us-016-create-form.md`

### Sobre o nível de detalhe

- **Phase plan**: visão geral da fase com diagrama de dependências e sumário por US. Não precisa ser tão detalhado quanto o US plan individual.
- **US plan individual**: detalhe máximo. Listar arquivos concretos, passos acionáveis, critérios verificáveis.
- Quando o PRD for vago em detalhes técnicos, inferir a partir da arquitetura existente (DDD, módulos, padrões do CLAUDE.md).

---

## Referências de formato

- Phase plan bem preenchido: `docs/features/start/plans/phase-2-authentication/phase-2-authentication.md`
- US plan bem preenchido: `docs/features/start/plans/phase-2-authentication/us-008-login.md`
