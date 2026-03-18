# Regras de Domínio — Responses

## Fluxo de submissão

1. Verificar form ativo (não expirado, não no limite)
2. Verificar restrição de domínio (se configurada)
3. Calcular SHA-256 do email
4. Se `allowMultipleResponses = false`: verificar se hash já existe em `response_emails` → rejeitar se sim
5. Validar respostas (tipo, obrigatoriedade, validações)
6. Salvar resposta em `responses` (sem email)
7. Salvar hash em `response_emails` (sem referência à resposta)

## Anonimato — regra fundamental

**É impossível vincular uma resposta a um email.**

- `responses` não contém email, hash de email, IP ou qualquer identificador
- `response_emails` não contém referência a `responses`
- Sem FK, sem timestamp correlacionável — as inserções são independentes

## Expiração

Rejeitar resposta se:
- `form.settings.expiresAt` definido e no passado
- `form.settings.maxResponses` definido e count >= max

Ao expirar, atualizar `form.status = 'expired'`.

## Validação de respostas

- Todas as perguntas `required` devem ter resposta
- Tipo da resposta compatível com tipo da pergunta
- Valores respeitam validações configuradas (min, max, pattern)
