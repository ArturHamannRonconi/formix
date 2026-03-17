# Skill: Create Phase Plan

## Descrição

Cria um arquivo de plano de fase (`phase-X-nome.md`) dentro de `docs/features/<feature>/plans/`, descrevendo todas as USs que compõem aquela fase com contexto, ordem de execução, detalhes de implementação por US e critérios de verificação.

## Quando usar

- Quando o usuário pedir para criar o plano de uma fase (ex: "cria o plano da fase 2")
- Antes de iniciar a implementação de um conjunto de USs agrupadas em fase
- Quando um PRD novo for criado e precisar ser decomposto em fases planejadas

## Nome da pasta e do arquivo

O plano de fase fica dentro de uma **subpasta** com o mesmo nome do arquivo:

```
plans/
  phase-X-nome-kebab-case/         ← subpasta da fase
    phase-X-nome-kebab-case.md     ← plano geral da fase
    us-XXX-nome.md                 ← planos das USs desta fase
    us-YYY-nome.md
```

Padrão do nome: `phase-X-nome-kebab-case`

Exemplos:
- `plans/phase-1-foundation/phase-1-foundation.md`
- `plans/phase-2-auth/phase-2-auth.md`
- `plans/phase-3-forms-core/phase-3-forms-core.md`

## Localização

`docs/features/<feature>/plans/<phase-X-nome>/phase-X-nome.md`

Onde `<feature>` é o identificador da feature/épico (ex: `start`, `auth`, `forms`).

> Ao criar o plano da fase, criar também a subpasta. Os arquivos de US individuais da fase serão adicionados nessa mesma subpasta via skill `create-us-plan`.

## Formato padrão

```markdown
# Plano: Fase X — [Título da Fase]

## Contexto

[Descreva em 2-4 frases: o que esta fase entrega, qual o estado do projeto antes dela e por que ela existe. Mencione as USs cobertas (ex: US-010, US-011, US-012).]

Ao final de cada US concluída, registrar em `docs/features/progress.md`.

---

## Ordem de Execução

```
US-XXX (Título curto) ──▶ US-YYY (Título curto)
US-XXX (Título curto) ──┬──▶ US-YYY (Título curto)
                         └──▶ US-ZZZ (Título curto)

(USs paralelas: US-XXX e US-YYY são independentes)
```

---

## 1. US-XXX: [Título completo]

### Contexto

[Uma frase sobre o propósito desta US e o que ela entrega.]

### Arquivos

**Criar:**

| Arquivo | Descrição |
|---|---|
| `path/to/file.ts` | Breve descrição do conteúdo/responsabilidade |
| `path/to/file.spec.ts` | Testes unitários |

**Modificar:**

| Arquivo | O que muda |
|---|---|
| `path/to/file.ts` | Descrição da mudança |

> Omitir "Modificar" se não há arquivos a modificar.

### Passos de Implementação

1. [Passo concreto e acionável]
2. [Passo concreto e acionável]
3. ...

> Para USs com TDD: intercalar `[teste Red]` e `[impl Green]`.

### Verificação

- `npm run typecheck` passa
- `npm run test` passa (ou `npm run test:unit` / `npm run test:integration`)
- [Outro critério específico desta US]

---

## 2. US-YYY: [Título completo]

[Repetir estrutura acima para cada US da fase]

---

## Tracking de Progresso

### Ao completar cada US:
1. Atualizar status em `docs/features/progress.md`
2. Marcar critérios de aceitação no plano individual da US (se existir)

---

## Arquivos Críticos de Referência

- `docs/code-patterns/backend-patterns.md` — padrões de código do backend
- `docs/data-modeling/collections.md` — schemas MongoDB
- `docs/boundaries/module-boundaries.md` — dependências entre módulos
- `docs/features/<feature>/prd-<feature>.md` — PRD desta feature
```

## Regras de preenchimento

- **Contexto da fase**: mencione explicitamente quais USs são cobertas e o estado do projeto antes desta fase.
- **Ordem de Execução**: use diagrama ASCII simples com `──▶` e `──┬──▶ / └──▶` para paralelas. Sempre adicionar nota explicando quais são independentes.
- **Cada US**: deve ter contexto, lista de arquivos (criar/modificar), passos numerados e verificação executável.
- **Passos TDD**: intercalar `[teste Red]` → `[impl Green]` → `[refactor]` quando a US envolver lógica de domínio ou usecases.
- **Verificação**: sempre incluir comandos que o dev pode rodar (`npm run typecheck`, `npm run test`). Evitar critérios vagos.
- **Arquivos Críticos de Referência**: ajustar para os docs relevantes da fase. Remover links que não existem.

## Exemplo preenchido

Veja `docs/features/start/plans/phase-1-foundation/phase-1-foundation.md` como referência de plano bem preenchido.
