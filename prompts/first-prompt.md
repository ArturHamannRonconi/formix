# Prompt para inicialização do projeto Formix

Você é um engenheiro de software sênior especializado em arquitetura de sistemas SaaS multi-tenant, monorepos modernos e documentação técnica para desenvolvimento assistido por IA.

Sua tarefa é **inicializar a estrutura de um novo projeto chamado Formix**, criando **apenas estrutura de diretórios e documentação**.

⚠️ **IMPORTANTE**

NÃO crie código de aplicação neste momento.

Isso significa:

* NÃO criar controllers
* NÃO criar services
* NÃO criar schemas
* NÃO criar componentes React
* NÃO criar APIs
* NÃO criar entidades ou usecases

Neste momento você deve **apenas criar:**

* Estrutura inicial do monorepo
* Arquivos README.md
* Arquivos CLAUDE.md
* Estrutura de agents
* Estrutura de skills
* Documentação de arquitetura
* Documentação de modelagem de dados
* Documentação de regras de domínio
* Documentação de padrões de código
* Documentação de boundaries entre módulos

Este passo existe apenas para **ensinar o contexto completo do projeto para o Claude Code** antes do desenvolvimento começar.

---

# Nome da plataforma

Formix

---

# Objetivo

Permitir que empresas criem formulários personalizados similares ao Google Forms.

---

# Descrição

Formix é um **SaaS multi-tenant** que permite que empresas:

* criem formulários personalizados
* compartilhem links de resposta
* recebam respostas anônimas
* visualizem dashboards com analytics das respostas

Cada empresa possui sua própria organização e usuários.

---

# Requisitos funcionais

Implemente a documentação baseada nos seguintes requisitos.

## Conta e organização

* Um usuário pode criar uma conta
* O primeiro usuário será automaticamente **Admin**
* Ao criar uma conta também será criada uma **Organization**
* O admin recebe **email de confirmação**

## Gestão de usuários

Admin pode:

* convidar usuários
* remover usuários
* realizar todas as ações de members

Members:

* recebem convite por email
* devem confirmar email
* podem recuperar senha via "esqueci minha senha"

## Formulários

Usuários admin e members podem:

* criar formulários
* editar formulários
* excluir formulários

Formulários possuem:

* múltiplas perguntas
* múltiplos tipos de respostas

Tipos de perguntas devem incluir pelo menos:

* input text
* textarea
* checkbox
* radio button
* toggle switch
* dropdown
* number input
* date input
* rating
* file upload
* email input

## Configurações do formulário

Usuários podem definir:

* tempo de expiração do link
* limite máximo de respostas
* permitir múltiplas respostas por usuário ou não
* restringir emails por domínio empresarial

Exemplo:

somente emails:

```
@empresa.com
```

## Compartilhamento

Após criar um formulário:

* um link público será gerado

Para responder:

* é obrigatório informar um email

Regra importante:

* **cada email só pode responder uma vez**

## Anonimato

Emails **NÃO podem ser associados às respostas**.

O email deve ser utilizado **apenas para controle de duplicidade**.

Ou seja:

* respostas devem ser armazenadas de forma **anônima**
* emails devem ser armazenados separadamente apenas para verificação de duplicidade

## Expiração de formulários

Um formulário pode expirar quando:

* atingir número máximo de respostas
* ultrapassar tempo de validade

---

# Painel de analytics

Após selecionar um formulário o usuário verá dashboards com:

* total de respostas
* respostas por pergunta
* gráficos agregados
* estatísticas por tipo de pergunta

---

# Arquitetura geral

O projeto deve ser criado em **MonoRepo**.

Estrutura principal:

```
formix/
 ├ formix-frontend
 ├ formix-backend
 ├ docs
 ├ .claude
```

---

# Requisitos técnicos

## Linguagens e frameworks

Frontend:

* React
* Next.js
* versão LTS

Backend:

* Node.js LTS
* NestJS
* MongoDB

---

# Backend Architecture

A arquitetura do backend deve seguir **DDD simplificado**.

Cada módulo deve possuir:

```
module/
 ├ domain
 │  ├ aggregates
 │  ├ entities
 │  ├ value-objects
 │  ├ usecases
 │  └ repositories (interfaces)
 │
 └ infra
    ├ controllers
    ├ repositories
    ├ database
    └ schemas
```

Regras importantes:

## Domain Layer

Pode conter apenas:

* regras de negócio
* aggregates
* entities
* value objects
* usecases
* interfaces de repositório

Domain **NÃO pode importar infra**.

## Infra Layer

Pode conter:

* controllers
* implementações de repositório
* acesso ao banco
* schemas

Infra pode importar Domain.

---

# Módulos iniciais do backend

Documente os seguintes módulos:

```
users
organizations
forms
responses
invitations
auth
analytics
```

---

# Documentação de import rules

Criar documentação explicando claramente:

Quais camadas podem importar quais.

Exemplo:

Permitido:

```
infra -> domain
```

Proibido:

```
domain -> infra
```

---

# Banco de dados

O banco será **MongoDB**.

Criar documentação detalhada de modelagem incluindo:

Coleções:

* users
* organizations
* memberships
* forms
* questions
* responses
* response_emails
* invitations

Explique:

* estrutura dos documentos
* índices necessários
* chaves de relacionamento
* estratégia para anonimização das respostas

---

# Frontend

Criar documentação para frontend baseado em:

Next.js + React.

Definir estrutura recomendada:

```
app
components
modules
hooks
services
styles
types
```

---

# Reutilização de componentes

Criar documentação de **component architecture** explicando padrões para:

* FormBuilder
* QuestionRenderer
* Dashboard charts
* Layout components
* Input components

---

# Skills para Claude

Criar dentro de:

```
.claude/skills
```

Skills como:

```
create-react-component
create-form-component
create-dashboard-widget
create-api-hook
```

Cada skill deve conter:

* descrição
* quando usar
* boas práticas
* padrões esperados

---

# Agents

Criar dentro de:

```
.claude/agents
```

Agents:

### backend-engineer.md

Descrevendo conhecimento esperado de um engenheiro backend sênior:

* NestJS
* DDD
* MongoDB modeling
* multi-tenant SaaS
* security
* email flows
* token systems
* link expiration
* anti-duplication strategies

### frontend-engineer.md

Descrevendo conhecimento esperado de um engenheiro frontend sênior:

* React
* Next.js
* design systems
* form builders
* state management
* accessibility
* dashboard visualization
* reusable components

---

# CLAUDE.md

Criar CLAUDE.md na raiz explicando:

* contexto do projeto
* objetivo do sistema
* arquitetura
* padrões obrigatórios
* guidelines de desenvolvimento
* como Claude deve ajudar no desenvolvimento

Criar também CLAUDE.md específicos para:

```
formix-backend
formix-frontend
```

---

# README.md

Criar README.md para:

* raiz
* backend
* frontend

Incluindo:

* visão geral
* arquitetura
* objetivos do projeto

---

# Resultado esperado

Após executar este prompt você deve gerar:

* Estrutura completa de diretórios
* Documentação detalhada
* Agents
* Skills
* CLAUDE.md
* READMEs
* Documentação de arquitetura
* Documentação de modelagem de dados

⚠️ Lembre-se novamente:

**NÃO criar código neste momento.**
