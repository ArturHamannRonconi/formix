# Regras de Domínio — Invitations

## Criação

- Apenas admin pode criar convites
- Convite é enviado para um email
- Gera token único com data de expiração
- Não pode convidar email que já é membro da organização
- Não pode criar convite duplicado para mesmo email na mesma org (se pendente)

## Aceite

- Destinatário acessa link com token
- Se não tem conta → cria user + membership
- Se já tem conta → cria apenas membership
- Status muda para `accepted`
- Token não pode ser reutilizado

## Expiração

- Convites pendentes expiram após tempo configurável
- Convites expirados não podem ser aceitos
- Admin pode reenviar convite (cria novo token)

## Cancelamento

- Admin pode cancelar convite pendente
