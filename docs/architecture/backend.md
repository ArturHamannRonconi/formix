# Arquitetura do Backend

## Estrutura geral do src

```
src/
  modules/          # Módulos de domínio (DDD)
  core/
    database/       # Configuração e conexão com MongoDB
    environment/    # Variáveis de ambiente e configuração
  server/
    middlewares/    # Middlewares globais (auth, logging, etc.)
    routes/        # Definição de rotas
  shared/           # Código compartilhado entre módulos
  utils/            # Utilitários genéricos
```

## DDD Simplificado

Cada módulo em `src/modules/` segue uma estrutura de duas camadas com separação clara de responsabilidades.

### Domain Layer

```
module/domain/
  aggregate/        # Raiz de agregado
    entities/       # Entidades com identidade própria
    value-objects/  # Objetos imutáveis sem identidade (Email, DateRange, etc.)
  usecases/         # Casos de uso — orquestram regras de negócio
  repositories/     # Interfaces (ports) de acesso a dados
```

**Regras da domain layer:**
- Contém APENAS regras de negócio
- NÃO importa nada de infra (controllers, mongoose, schemas, NestJS decorators)
- NÃO tem dependência de framework
- Repositórios são interfaces (ports), não implementações
- Entities e aggregates possuem métodos de domínio (não são anêmicos)

### Infra Layer

```
module/infra/
  controllers/    # Endpoints REST, validação de input
  repositories/   # Implementação concreta dos repositórios
  schemas/        # Schemas do Mongoose
```

**Regras da infra layer:**
- PODE importar domain
- Controllers recebem requests HTTP e delegam para usecases
- Repositórios implementam as interfaces do domain
- Schemas definem a estrutura dos documentos no MongoDB
- Configuração de banco de dados fica em `src/core/database/`, não dentro do módulo

## Módulos

### auth
- Login, logout, refresh token
- JWT com access token + refresh token
- Reset de senha com token por email
- Confirmação de email

### users
- Criação de usuário (via signup ou convite)
- Atualização de perfil
- Consulta de usuários da organização

### organizations
- Criação de organização (automática no signup)
- Atualização de dados da organização
- Gestão de memberships (roles: admin, member)

### invitations
- Criação de convite por email
- Validação de token de convite
- Aceite de convite (cria user + membership)
- Expiração automática

### forms
- CRUD de formulários
- Gestão de perguntas (múltiplos tipos)
- Configurações: expiração, limite de respostas, restrição de domínio
- Geração de link público

### responses
- Recebimento de respostas via link público
- Verificação de duplicidade por email (hash)
- Armazenamento anônimo
- Verificação de expiração/limite

### analytics
- Agregação de respostas por formulário
- Contagem total de respostas
- Estatísticas por tipo de pergunta
- Dados para gráficos do dashboard

## Injeção de dependência

O NestJS gerencia a DI. Cada módulo registra:
- Usecases como providers
- Repositórios concretos como providers vinculados às interfaces do domain
- Controllers com decorators do NestJS

```
// Exemplo conceitual de module registration
providers: [
  CreateFormUseCase,
  { provide: IFormRepository, useClass: MongoFormRepository },
]
```
