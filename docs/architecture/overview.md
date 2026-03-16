# Arquitetura do Sistema — Visão Geral

## Componentes

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│    MongoDB      │
│  Next.js/React  │     │    NestJS       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: Next.js com App Router, comunica-se com o backend via REST API
- **Backend**: NestJS com DDD simplificado, 7 módulos de domínio
- **Banco**: MongoDB com Mongoose como ODM

## Multi-tenancy

O Formix é multi-tenant por **organização**. Cada organização é um tenant isolado.

- Toda entidade pertence a uma organização (exceto a entidade `User` que pode pertencer a múltiplas via `Membership`)
- Toda query no banco filtra por `organizationId`
- Não há banco separado por tenant — isolamento é lógico, na mesma instância MongoDB

## Fluxos principais

### 1. Criação de conta
```
Usuário → Signup → Cria User + Organization + Membership(admin) → Email de confirmação
```

### 2. Convite de membro
```
Admin → Cria Invitation → Email enviado → Membro aceita → Cria User + Membership(member)
```

### 3. Criação e compartilhamento de formulário
```
Usuário → Cria Form + Questions → Gera link público → Compartilha
```

### 4. Resposta a formulário
```
Respondente → Acessa link → Informa email → Verifica duplicidade → Salva resposta (anônima) + email (separado)
```

### 5. Analytics
```
Usuário → Seleciona formulário → Backend agrega respostas → Frontend renderiza dashboards
```

## Segurança

- Autenticação via JWT
- Tokens de convite com expiração
- Links de formulário com expiração configurável
- Emails hashados para controle de duplicidade
- Respostas desvinculadas de identidade
