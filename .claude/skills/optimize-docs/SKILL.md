# Skill: Optimize Docs

## Descrição

Lê toda a documentação do projeto e a reescreve de forma otimizada: elimina redundâncias, compacta prose verbosa em tabelas/listas, remove conteúdo que pode ser inferido do código, e mantém exatamente a mesma semântica, lógica e os mesmo fundamentos. O objetivo é somente reduzir o consumo de tokens em conversas diárias sem perder nenhuma informação essencial que existia anteriormente.

## Quando usar

- Quando uma documentação nova for criada ou uma existente for significativamente alterada
- Quando o usuário pedir para otimizar a documentação
- Após grandes refatorações arquiteturais que tornam parte da doc obsoleta

## Diretriz de atualização desta skill

**Sempre que um novo arquivo de documentação for adicionado ao projeto, inclua-o no mapa abaixo.** O mapa é a fonte de verdade de toda a documentação do projeto.

---

## Mapa de documentação do projeto

```
docs/
  features/
    progress.md                         ← tracker central de todas as USs
    start/
      prd-formix.md                     ← PRD geral do produto
      plans/
        phase-1-foundation/
          phase-1-foundation.md         ← plano da fase 1
          us-001-backend-setup.md
          us-002-frontend-setup.md
          us-003-http-client.md
          us-016-domain-entities.md
          us-047-email-service.md
        phase-2-authentication/
          phase-2-authentication.md     ← plano da fase 2
          us-004-signup.md
          us-005-signup-page.md
          us-006-confirm-email.md
          us-007-confirm-email-page.md
          us-008-login.md
          us-009-login-page.md
          us-010-refresh-token.md
          us-011-forgot-password.md
          us-012-reset-password.md
          us-013-password-pages.md
          us-014-jwt-guard.md
          us-015-logout.md
  architecture/
    overview.md                         ← visão geral da arquitetura
    backend.md                          ← arquitetura do backend
    frontend.md                         ← arquitetura do frontend
  domain-rules/
    auth.md                             ← regras de autenticação
    users.md                            ← regras do módulo users
    organizations.md                    ← regras do módulo organizations
    invitations.md                      ← regras de convites
    forms.md                            ← regras de formulários
    responses.md                        ← regras de respostas anônimas
    analytics.md                        ← regras de analytics
  data-modeling/
    collections.md                      ← schemas MongoDB de todas as coleções
  boundaries/
    module-boundaries.md                ← o que cada módulo pode importar
  code-patterns/
    backend-patterns.md                 ← padrões obrigatórios do backend (Aggregate, Output, IDValueObject…)
    frontend-components.md              ← padrões de componentes React/Next.js
```

---

## Processo de otimização

### 1. Ler o arquivo alvo

Use o `Read` tool para ler o arquivo original na íntegra.

### 2. Aplicar as regras de compressão

Aplique **todas** as regras abaixo. Cada regra tem um critério de aplicação claro:

| Regra | Quando aplicar | Como aplicar |
|---|---|---|
| **Remover prose introdutória** | Parágrafos que apenas contextualizam o óbvio | Deletar. O título do arquivo já contextualiza |
| **Tabela em vez de lista descritiva** | 3+ itens com nome + descrição em texto corrido | Converter para tabela `\| Item \| Descrição \|` |
| **Exemplos mínimos** | Blocos de código com boilerplate repetido | Manter só as linhas que demonstram o padrão; remover imports óbvios |
| **Remover redundância entre arquivos** | Conteúdo já detalhado em outro doc referenciado | Substituir pelo link: `Ver detalhes em \`docs/X.md\`` |
| **Compactar listas de critérios** | Critérios que são variações do mesmo tema | Agrupar em 1 item com sub-items ou range: "Inputs inválidos retornam 400 (email, password, name)" |
| **Remover comentários óbvios** | `// retorna true se válido` ao lado de `return isValid` | Deletar sem substituição |
| **Substituir parágrafos por bullets** | Parágrafos de 3+ frases descrevendo comportamento | Converter para lista com verb-first bullets |
| **Mesclar seções repetidas** | Seções com estrutura idêntica e conteúdo similar | Unificar numa única seção com coluna diferenciadora |

### 3. O que NUNCA remover

- Regras de negócio específicas do domínio (ex: "respostas são anônimas — email fica separado")
- Decisões arquiteturais e seus motivos
- Restrições de segurança
- Exemplos de código que demonstram um padrão não-óbvio
- Tabelas de mapeamento (Output → HTTP status, módulo → coleção, etc.)
- Critérios de aceitação verificáveis (comandos que passam/falham)

### 4. Verificar qualidade

Após reescrever, responda mentalmente:
- Toda decisão arquitetural ainda está documentada?
- Toda regra de negócio ainda está clara?
- Um dev novo ainda consegue implementar a partir deste doc?

Se qualquer resposta for "não", reverta a compressão daquela seção.

### 5. Salvar

Use o `Write` tool para sobrescrever o arquivo com a versão otimizada.

---

## Exemplo de otimização

### Antes (verboso):

```markdown
## Contexto

O módulo de autenticação é responsável por gerenciar o ciclo de vida completo
da autenticação dos usuários no sistema. Isso inclui o processo de registro,
onde novos usuários criam suas contas, o processo de login, onde usuários
existentes acessam o sistema, e também o processo de logout, onde os usuários
encerram suas sessões. Além disso, o módulo também gerencia a renovação
de tokens de acesso através do mecanismo de refresh token.

### Fluxo de autenticação

O fluxo de autenticação começa quando o usuário preenche o formulário de
cadastro com seus dados. Esses dados são enviados para o endpoint de signup...
```

### Depois (otimizado):

```markdown
## Contexto

Gerencia o ciclo de autenticação: signup, login, logout, refresh token.

### Fluxo
```

---

## Passos de execução da skill

1. Identificar o(s) arquivo(s) a otimizar (argumento da skill ou todos os docs modificados)
2. Para cada arquivo:
   a. Ler o conteúdo atual com `Read`
   b. Aplicar as regras de compressão
   c. Verificar qualidade (nenhuma informação essencial perdida)
   d. Sobrescrever com `Write`
3. Reportar: nome do arquivo, tamanho antes/depois (linhas), resumo do que foi removido
