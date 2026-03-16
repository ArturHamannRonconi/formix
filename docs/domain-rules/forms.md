# Regras de Domínio — Forms

## Criação

- Admin e members podem criar formulários
- Formulário pertence a uma organização
- Ao criar, status é `draft`
- Formulário precisa de pelo menos uma pergunta para ser publicado

## Perguntas

Tipos suportados:
- `text` — input de texto curto
- `textarea` — texto longo
- `checkbox` — múltipla escolha (várias opções)
- `radio` — escolha única
- `toggle` — boolean (sim/não)
- `dropdown` — seleção em lista
- `number` — input numérico
- `date` — seleção de data
- `rating` — escala (ex: 1-5)
- `file` — upload de arquivo
- `email` — input de email com validação

Cada pergunta possui: label, tipo, obrigatoriedade, ordem, opções (quando aplicável), validações opcionais.

## Configurações

- `expiresAt` — data/hora de expiração (null = sem expiração)
- `maxResponses` — limite de respostas (null = sem limite)
- `allowMultipleResponses` — permitir múltiplas respostas do mesmo email
- `allowedEmailDomains` — lista de domínios permitidos (vazia = qualquer domínio)

## Status

- `draft` — em edição, não publicado
- `active` — publicado, aceitando respostas
- `expired` — expirou por tempo ou limite
- `closed` — fechado manualmente pelo usuário

## Link público

- Ao publicar (draft → active), gera `publicToken` único
- Link no formato: `/forms/{publicToken}`
- Token não muda se formulário for editado

## Edição

- Formulário pode ser editado a qualquer momento
- Perguntas podem ser adicionadas, removidas ou reordenadas
- Editar formulário ativo não invalida respostas já recebidas

## Exclusão

- Formulário pode ser excluído por admin ou member
- Exclusão remove formulário, perguntas, respostas e response_emails associados
