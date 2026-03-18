# Regras de Domínio — Forms

## Criação e status

- Admin e members podem criar formulários
- Status inicial: `draft` → requer ≥1 pergunta para publicar → `active`
- Transições: `active` → `expired` (automático) ou `closed` (manual)

## Status

| Status | Significado |
|---|---|
| `draft` | Em edição, não publicado |
| `active` | Publicado, aceitando respostas |
| `expired` | Expirou por tempo ou limite de respostas |
| `closed` | Fechado manualmente |

## Tipos de pergunta

`text`, `textarea`, `checkbox`, `radio`, `toggle`, `dropdown`, `number`, `date`, `rating`, `file`, `email`

Cada pergunta: label, tipo, obrigatoriedade, ordem, opções (checkbox/radio/dropdown), validações opcionais (min, max, pattern).

## Configurações

| Campo | Comportamento |
|---|---|
| `expiresAt` | null = sem expiração |
| `maxResponses` | null = sem limite |
| `allowMultipleResponses` | false = 1 resposta por email |
| `allowedEmailDomains` | vazio = qualquer domínio |

## Link público

- `publicToken` gerado ao publicar (draft → active)
- Formato: `/forms/{publicToken}` — não muda com edições

## Edição e exclusão

- Editável a qualquer momento; editar form ativo não invalida respostas já recebidas
- Exclusão remove form, perguntas, respostas e response_emails associados
