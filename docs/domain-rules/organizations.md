# Regras de Domínio — Organizations

- Criada automaticamente no signup; possui nome e slug único (usado em URLs)
- Toda operação filtrada por `organizationId` (multi-tenancy)
- Usuário pode pertencer a múltiplas organizações via Membership
- Membership embutida no `OrganizationAggregate` — roles: `admin`, `member`
- Toda organização precisa de pelo menos 1 admin
- Admin não pode remover a si mesmo se for o único admin
