# Regras de Domínio — Organizations

## Criação

- Organização é criada automaticamente no signup do primeiro usuário
- Possui nome e slug (único, usado em URLs)

## Multi-tenancy

- Toda operação é isolada por `organizationId`
- Usuário só acessa dados da organização à qual pertence
- Um usuário pode pertencer a múltiplas organizações (via memberships)

## Memberships

- Relação entre user e organization
- Roles: `admin`, `member`
- Toda organização precisa de pelo menos um admin
