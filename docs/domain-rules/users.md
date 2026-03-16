# Regras de Domínio — Users

## Criação

- Usuário é criado via signup (cria org) ou via aceite de convite (entra em org existente)
- Email deve ser único no sistema
- Senha deve atender requisitos mínimos de complexidade

## Perfil

- Usuário pode atualizar nome e senha
- Email não pode ser alterado (é identificador)

## Roles

- `admin` — pode convidar/remover membros, gerenciar organização, todas as ações de member
- `member` — pode criar/editar/excluir formulários, ver analytics

## Remoção

- Admin pode remover membros da organização (deleta membership)
- Admin não pode remover a si mesmo se for o único admin
- Remoção de membership não deleta o user (pode pertencer a outras orgs)
