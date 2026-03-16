# Regras de Domínio — Responses

## Submissão

Fluxo de submissão de resposta:

1. Respondente acessa link público do formulário
2. Sistema verifica se formulário está ativo (não expirado, não no limite)
3. Respondente informa email
4. Sistema verifica restrição de domínio (se configurada)
5. Sistema calcula hash do email (SHA-256)
6. Sistema verifica se hash já existe em `response_emails` para este form
7. Se `allowMultipleResponses = false` e hash já existe → rejeita
8. Respondente preenche e submete respostas
9. Sistema valida respostas contra as perguntas (tipo, obrigatoriedade)
10. Sistema salva resposta em `responses` (sem email, sem identificação)
11. Sistema salva hash do email em `response_emails` (sem referência à resposta)

## Anonimato

**Regra fundamental: é impossível vincular uma resposta a um email.**

- `responses` não contém email, hash de email, IP ou qualquer identificador
- `response_emails` não contém referência a `responses`
- As duas inserções são independentes — não há FK, não há timestamp correlacionável
- O email original nunca é armazenado, apenas seu hash

## Controle de duplicidade

- Hash SHA-256 do email é comparado na coleção `response_emails`
- Índice unique em `{ formId, emailHash }` garante atomicidade
- Se `allowMultipleResponses = true`, a verificação de duplicidade é ignorada

## Expiração

Antes de aceitar uma resposta, verificar:
- `form.settings.expiresAt` — se definido e no passado → rejeitar
- `form.settings.maxResponses` — se definido e count >= max → rejeitar
- Quando expirar, atualizar `form.status` para `expired`

## Validação

- Todas as perguntas `required` devem ter resposta
- Tipo da resposta deve ser compatível com tipo da pergunta
- Valores devem respeitar validações configuradas (min, max, pattern)
