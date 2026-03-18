# Skill: Sync Docs

## Descrição

Compara sistematicamente a documentação do projeto com o código implementado. Quando encontra uma incoerência, apresenta o conflito ao usuário e pergunta qual lado está errado. Aplica a correção no lado indicado — e se o código for o problema, corrige todos os arquivos similares. Ao final, executa `optimize-docs` em todos os documentos que foram modificados.

## Quando usar

- Após implementar uma US completa
- Após uma refatoração arquitetural
- Quando o usuário suspeitar que doc e código estão dessincronizados
- Periodicamente, como checagem de saúde do projeto

---

## Mapa de comparação: doc → código

Este mapa define quais arquivos de documentação verificar contra quais partes do código. **Sempre que um novo módulo ou doc for criado, atualizar este mapa.**

| Documento | Verifica contra |
|---|---|
| `docs/code-patterns/backend-patterns.md` | `src/modules/*/domain/aggregate/*.aggregate.ts` `src/modules/*/domain/aggregate/entities/*.entity.ts` `src/modules/*/domain/aggregate/value-objects/*.vo.ts` `src/modules/*/domain/usecases/*.usecase.ts` `src/modules/*/domain/repositories/*.repository.ts` `src/modules/*/infra/repositories/mongo-*.repository.ts` `src/modules/*/infra/controllers/*.controller.ts` |
| `docs/data-modeling/collections.md` | `src/modules/*/infra/schemas/*.schema.ts` |
| `docs/boundaries/module-boundaries.md` | `import` statements em `src/modules/*/domain/usecases/*.ts` |
| `docs/domain-rules/auth.md` | `src/modules/auth/domain/usecases/*.usecase.ts` `src/modules/users/domain/aggregate/user.aggregate.ts` |
| `docs/domain-rules/users.md` | `src/modules/users/domain/` |
| `docs/domain-rules/organizations.md` | `src/modules/organizations/domain/` |
| `docs/domain-rules/forms.md` | `src/modules/forms/domain/` |
| `docs/domain-rules/responses.md` | `src/modules/responses/domain/` |
| `docs/domain-rules/invitations.md` | `src/modules/invitations/domain/` |
| `docs/domain-rules/analytics.md` | `src/modules/analytics/domain/` |
| `docs/architecture/backend.md` | Estrutura de `src/` (diretórios e nomes de arquivo) |
| `docs/features/*/plans/**/*.md` (planos de US concluídas) | Existência dos arquivos listados em "Criar" e "Modificar" |

---

## Tipos de incoerência a detectar

| Tipo | Exemplo |
|---|---|
| **Arquivo ausente** | Doc lista `refresh-token.entity.ts` em "Criar" mas arquivo não existe |
| **Campo/propriedade divergente** | Doc diz `{ tokenHash, family }` mas schema tem `{ hash, sessionId }` |
| **Comportamento divergente** | Doc diz "retorna `Output.fail`" mas usecase lança exceção |
| **Regra de negócio violada** | Doc diz "último admin não pode ser removido" mas código não valida isso |
| **Padrão arquitetural violado** | Doc diz "domain não importa NestJS" mas usecase importa `@nestjs/common` |
| **Estrutura de módulo divergente** | Doc diz "auth não tem repositórios" mas existe `src/modules/auth/domain/repositories/` |
| **Mapeamento incorreto** | Schema tem campo `userId` como `ObjectId` mas doc diz `string (UUID)` |
| **Boundary violada** | Doc diz "Module A não importa Module B" mas código tem esse import |

---

## Processo de execução

### Passo 1 — Selecionar escopo

Se a skill foi chamada sem argumento: verificar **todos os pares** do mapa de comparação.
Se chamada com argumento (ex: `/sync-docs auth`): verificar apenas os pares relacionados ao argumento.

### Passo 2 — Ler doc e código correspondente

Para cada par do mapa:
1. Ler o documento com `Read`
2. Ler os arquivos de código correspondentes com `Read` ou buscar com `Grep`/`Glob`
3. Comparar sistematicamente

### Passo 3 — Registrar incoerências encontradas

Montar a lista completa de incoerências **antes** de começar a perguntar. Não interromper a leitura para perguntar — terminar a varredura primeiro.

### Passo 4 — Apresentar e resolver cada incoerência

Para cada incoerência encontrada, apresentar no formato abaixo e **aguardar a resposta do usuário** antes de continuar:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Incoerência #N: [título curto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Documentação diz  (docs/caminho/arquivo.md):
   "[citação exata ou resumo fiel]"

💻 Código faz  (src/caminho/arquivo.ts:linha):
   "[citação exata ou resumo fiel]"

Qual está errado?
  [1] Documentação — corrigir doc para refletir o código
  [2] Código — corrigir código e todos os arquivos similares
  [3] Ambos — explicarei como deveria ser
```

### Passo 5 — Aplicar a correção conforme resposta

#### Resposta [1] — Documentação errada

1. Atualizar o documento para refletir exatamente o que o código faz
2. Marcar o doc como modificado (para executar optimize-docs ao final)
3. Não alterar nenhum arquivo de código

#### Resposta [2] — Código errado

1. Corrigir o arquivo de código mostrado
2. Buscar **todos os arquivos similares** com o mesmo problema:
   - Usar `Grep` para encontrar o padrão incorreto em outros arquivos
   - Corrigir cada ocorrência encontrada
3. Reportar todos os arquivos corrigidos
4. Não alterar documentação

#### Resposta [3] — Ambos errados

1. Aguardar o usuário explicar como deveria ser (a forma correta)
2. Atualizar a documentação com a forma correta
3. Corrigir o código para implementar a forma correta
4. Buscar e corrigir todos os arquivos similares com o padrão errado
5. Marcar o doc como modificado

### Passo 6 — Executar optimize-docs nos docs modificados

Ao final de todas as incoerências resolvidas, se algum documento foi modificado:

```
📝 Documentos modificados: [lista]
Executando optimize-docs nesses arquivos...
```

Executar a skill `optimize-docs` em cada documento modificado para manter a compressão.

---

## Regras de julgamento

Ao comparar doc vs código, aplicar estas regras para decidir se é uma incoerência real:

**Não é incoerência:**
- Doc descreve comportamento futuro de uma US ainda pendente (verificar `Status: Pendente` no plano)
- Doc usa nome levemente diferente mas semanticamente idêntico (ex: `UserAggregate` vs `User`)
- Código tem lógica adicional não mencionada na doc mas que não contradiz nada documentado

**É incoerência:**
- Qualquer contradição direta: doc diz "A", código faz "B"
- Doc menciona arquivo/classe/método que não existe no código implementado (para USs concluídas)
- Código viola uma regra explícita da doc (imports proibidos, padrões obrigatórios, regras de negócio)
- Schema tem campos diferentes dos documentados em `collections.md`

---

## Relatório final

Ao terminar todas as incoerências, reportar:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Sync Docs — Relatório Final
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Incoerências encontradas:  N
  Documentação corrigida:  X
  Código corrigido:        Y
  Ambos corrigidos:        Z

Arquivos de doc modificados:
  - docs/...

Arquivos de código modificados:
  - src/...
```

Se nenhuma incoerência for encontrada:
```
✅ Nenhuma incoerência encontrada — doc e código estão sincronizados.
```
