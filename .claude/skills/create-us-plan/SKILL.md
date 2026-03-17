# Skill: Create US Plan

## Descrição

Cria um arquivo de plano de implementação padronizado para uma User Story (US) dentro da subpasta da fase correspondente em `docs/features/<feature>/plans/<phase>/`.

## Quando usar

- Quando for iniciar a implementação de uma nova US
- Quando o usuário pedir para criar um plano detalhado de uma US
- Antes de implementar qualquer US que ainda não tenha plano individual

## Nome do arquivo e localização

O US plan fica dentro da **subpasta da fase** à qual pertence:

```
plans/
  phase-X-nome/
    phase-X-nome.md      ← plano da fase
    us-XXX-nome.md       ← plano desta US  ← aqui
```

Padrão do nome: `us-XXX-nome-kebab-case.md`

Exemplos:
- `plans/phase-1-foundation/us-001-backend-setup.md`
- `plans/phase-2-auth/us-010-register.md`

## Formato padrão

```markdown
# US-XXX: [Título]

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | [nome da feature/fase — ex: "Fase 1: Fundação"] |
| **Status** | Pendente |
| **Depende de** | US-XXX — [título] / — |
| **Bloqueia** | US-XXX — [título], US-XXX — [título] / — |

## Contexto

[Descrição objetiva do problema/necessidade e o que esta US entrega. Inclua estado atual do projeto se relevante.]

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `path/to/file.ts` | Breve descrição do conteúdo/responsabilidade |

### Modificar

| Arquivo | O que muda |
|---|---|
| `path/to/file.ts` | Descrição da mudança |

> Omitir seção "Modificar" se não há arquivos a modificar.

## Passos de Implementação

1. Passo 1
2. Passo 2
3. ...

> Para USs com TDD: intercalar passos de teste (Red) e implementação (Green).

## Critérios de Aceitação

- [ ] Critério verificável 1
- [ ] Critério verificável 2
- [ ] `npm run typecheck` passa sem erros
- [ ] `npm run build` sucesso (se aplicável)

## Dependências de Pacotes

### Produção

- `pacote`

### Dev

- `pacote`

> Omitir seção inteira se não há dependências novas a instalar.

## Próximas USs

- **US-XXX** — [título] (depende desta)
- **US-XXX** — [título] (paralela, não bloqueia)
```

## Regras de preenchimento

- **Metadados → Status**: sempre começa como `Pendente`. Atualizar para `Em andamento` quando iniciar, `Concluído` quando terminar.
- **Depende de / Bloqueia**: usar `—` quando não há dependências.
- **Arquivos**: listar todos os arquivos que serão tocados, mesmo os de teste. Caminho relativo à raiz do projeto ou do módulo.
- **Passos**: ordenados e acionáveis. Se TDD, intercalar `[teste]` e `[impl]`.
- **Critérios de Aceitação**: sempre incluir verificações executáveis (comandos que passam/falham).
- **Dependências de Pacotes**: incluir apenas pacotes novos que ainda não estão no `package.json`.
- **Próximas USs**: listar USs que dependem desta (são desbloqueadas) ou que podem rodar em paralelo.

## Exemplo preenchido

Veja `docs/features/start/plans/phase-1-foundation/us-002-frontend-setup.md` como referência de plano bem preenchido.
