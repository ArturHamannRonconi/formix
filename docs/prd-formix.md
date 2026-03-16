# PRD: Formix — Plataforma SaaS de Formulários Personalizados

## 1. Introdução / Overview

Formix é um **SaaS multi-tenant** que permite empresas criarem formulários personalizados (similar ao Google Forms), compartilharem links públicos de resposta, coletarem respostas de forma **anônima** e visualizarem dashboards com analytics agregados.

O projeto é um **monorepo** composto por:
- **formix-backend** — API REST com Node.js LTS + NestJS + MongoDB, seguindo DDD simplificado
- **formix-frontend** — Interface web com React + Next.js (App Router)
- **docs/** — Documentação técnica completa

**Problema que resolve:** Empresas precisam de uma ferramenta para criar pesquisas e formulários com garantia de anonimato das respostas, controle de duplicidade por email, restrições de domínio e analytics visuais — tudo dentro de um ambiente multi-tenant isolado por organização.

---

## 2. Goals

- Permitir que empresas criem formulários personalizados com 11 tipos de perguntas
- Garantir **anonimato total** das respostas (impossível vincular resposta a email)
- Suportar multi-tenancy com isolamento lógico por organização
- Prover analytics detalhados por formulário e por tipo de pergunta
- Implementar sistema completo de autenticação com JWT, refresh token rotation, confirmação de email e reset de senha
- Permitir gestão de membros via convites com expiração
- Oferecer configurações avançadas por formulário: expiração, limite de respostas, restrição de domínio, permissão de múltiplas respostas
- Seguir DDD simplificado no backend com separação clara domain/infra
- Seguir padrões de componentes reutilizáveis e acessíveis no frontend
- Desenvolvimento guiado por **TDD** — toda feature começa pelos testes, que definem se a implementação está correta

---

## 3. User Stories

### Épico 1: Infraestrutura e Setup do Projeto

---

### US-001: Setup do Backend (NestJS + MongoDB)
**Descrição:** Como desenvolvedor, eu preciso inicializar o projeto backend com NestJS, TypeScript e MongoDB para que a base de código esteja pronta para desenvolvimento.

**Acceptance Criteria:**
- [ ] Inicializar projeto NestJS com TypeScript strict
- [ ] Configurar MongoDB com Mongoose como ODM
- [ ] Criar estrutura de diretórios DDD: `src/modules/`, `src/core/database/`, `src/core/environment/`, `src/server/middlewares/`, `src/server/routes/`, `src/shared/`, `src/utils/`
- [ ] Configurar variáveis de ambiente (.env) com validação
- [ ] Configurar ESLint + Prettier
- [ ] Configurar scripts de desenvolvimento (`dev`, `build`, `start`, `test`)
- [ ] Configurar Jest como framework de testes
- [ ] Conexão com MongoDB funcionando
- [ ] Typecheck passa

---

### US-002: Setup do Frontend (Next.js + React)
**Descrição:** Como desenvolvedor, eu preciso inicializar o projeto frontend com Next.js (App Router), React e TypeScript para que a base de código esteja pronta para desenvolvimento.

**Acceptance Criteria:**
- [ ] Inicializar projeto Next.js com App Router e TypeScript strict
- [ ] Criar estrutura de diretórios: `src/app/`, `src/components/`, `src/modules/`, `src/hooks/`, `src/services/`, `src/styles/`, `src/types/`
- [ ] Configurar ESLint + Prettier
- [ ] Configurar estilos globais e tokens de design
- [ ] Configurar scripts de desenvolvimento (`dev`, `build`, `start`)
- [ ] Página de teste renderizando corretamente
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-003: Configurar comunicação Frontend → Backend
**Descrição:** Como desenvolvedor, eu preciso configurar um serviço HTTP base no frontend para comunicar com a API backend.

**Acceptance Criteria:**
- [ ] Criar client HTTP base em `src/services/` com interceptors para auth (JWT)
- [ ] Configurar baseURL via variável de ambiente
- [ ] Implementar interceptor que injeta access token no header Authorization
- [ ] Implementar interceptor de refresh automático quando access token expira (401)
- [ ] Tratamento de erros centralizado
- [ ] Tipagem de request/response
- [ ] Typecheck passa

---

### Épico 2: Autenticação (Auth Module)

---

### US-004: Signup — Criar conta + organização
**Descrição:** Como um novo usuário, eu quero criar uma conta para poder usar a plataforma, de modo que ao me registrar sejam criados automaticamente meu usuário, uma organização e minha membership como admin.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/signup` recebe `{ name, email, password, organizationName }`
- [ ] Valida que email é único no sistema
- [ ] Valida complexidade mínima de senha
- [ ] Cria documentos: User (emailConfirmed=false), Organization (slug gerado), Membership (role=admin)
- [ ] Envia email de confirmação com token temporário
- [ ] Retorna tokens (access + refresh) mas com acesso restrito até confirmar email
- [ ] Toda a lógica de negócio no usecase (domain layer), não no controller
- [ ] Typecheck passa

---

### US-005: Tela de Signup no Frontend
**Descrição:** Como um novo usuário, eu quero ver um formulário de registro claro e funcional para criar minha conta.

**Acceptance Criteria:**
- [ ] Página em `/signup` com campos: nome, email, senha, confirmação de senha, nome da organização
- [ ] Validação client-side dos campos (email válido, senha mínima, senhas iguais)
- [ ] Exibe erros de validação inline
- [ ] Exibe erro da API (ex: email já existe)
- [ ] Redireciona para tela de confirmação de email após sucesso
- [ ] Loading state no botão durante request
- [ ] Acessível: labels, aria attributes, navegação por teclado
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-006: Confirmação de Email
**Descrição:** Como um novo usuário, eu preciso confirmar meu email para poder acessar todas as funcionalidades da plataforma.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/confirm-email` recebe `{ token }`
- [ ] Valida que token existe e não expirou
- [ ] Atualiza `user.emailConfirmed = true`
- [ ] Retorna sucesso ou erro (token inválido/expirado)
- [ ] Token de confirmação expira em tempo configurável (env var)
- [ ] Endpoint `POST /auth/resend-confirmation` reenvia email de confirmação
- [ ] Typecheck passa

---

### US-007: Tela de Confirmação de Email
**Descrição:** Como um novo usuário, eu quero uma tela que me informe para verificar meu email e que processe a confirmação quando eu clicar no link.

**Acceptance Criteria:**
- [ ] Página `/confirm-email?token=xxx` que processa confirmação automaticamente
- [ ] Exibe estado: loading → sucesso (redireciona para login) ou erro (token inválido/expirado)
- [ ] Página `/check-email` exibida após signup com mensagem "Verifique seu email"
- [ ] Botão "Reenviar email" disponível na página `/check-email`
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-008: Login
**Descrição:** Como um usuário com conta confirmada, eu quero fazer login para acessar minha organização e formulários.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/login` recebe `{ email, password }`
- [ ] Valida credenciais (email + bcrypt compare)
- [ ] Verifica que email está confirmado, caso contrário retorna erro específico
- [ ] Retorna `{ accessToken, refreshToken, user: { id, name, email, role, organizationId } }`
- [ ] Access token JWT contém: userId, organizationId, role (curta duração, configurável)
- [ ] Refresh token com longa duração, armazenado de forma segura
- [ ] Typecheck passa

---

### US-009: Tela de Login
**Descrição:** Como um usuário registrado, eu quero uma tela de login para acessar minha conta.

**Acceptance Criteria:**
- [ ] Página `/login` com campos: email, senha
- [ ] Validação client-side (email válido, senha não vazia)
- [ ] Exibe erros inline (credenciais inválidas, email não confirmado)
- [ ] Link para `/signup` e `/forgot-password`
- [ ] Redireciona para dashboard após login bem-sucedido
- [ ] Armazena tokens de forma segura (httpOnly cookies ou secure storage)
- [ ] Loading state no botão
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-010: Refresh Token
**Descrição:** Como um usuário logado, eu quero que minha sessão se mantenha ativa sem precisar fazer login novamente, usando refresh token rotation.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/refresh` recebe `{ refreshToken }`
- [ ] Valida que refresh token é válido e não foi usado
- [ ] Gera novo par de tokens (access + refresh)
- [ ] Invalida refresh token anterior (rotation)
- [ ] Se refresh token já foi usado (possível roubo), invalida TODOS os refresh tokens do usuário
- [ ] Typecheck passa

---

### US-011: Reset de Senha — Solicitar
**Descrição:** Como um usuário que esqueceu a senha, eu quero solicitar um reset para recuperar o acesso à minha conta.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/forgot-password` recebe `{ email }`
- [ ] Gera token temporário com expiração configurável
- [ ] Envia email com link contendo token
- [ ] Não revela se email existe ou não (segurança)
- [ ] Typecheck passa

---

### US-012: Reset de Senha — Confirmar
**Descrição:** Como um usuário que solicitou reset, eu quero definir uma nova senha usando o link recebido por email.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/reset-password` recebe `{ token, newPassword }`
- [ ] Valida que token é válido e não expirou
- [ ] Atualiza senha (hash bcrypt)
- [ ] Invalida todos os refresh tokens do usuário (força re-login em todos os dispositivos)
- [ ] Token de reset não pode ser reutilizado
- [ ] Typecheck passa

---

### US-013: Telas de Reset de Senha
**Descrição:** Como um usuário, eu quero telas para solicitar e confirmar o reset de senha.

**Acceptance Criteria:**
- [ ] Página `/forgot-password` com campo de email e botão "Enviar link de recuperação"
- [ ] Exibe mensagem genérica após submit: "Se o email existir, você receberá um link"
- [ ] Página `/reset-password?token=xxx` com campos: nova senha, confirmação
- [ ] Validação de complexidade de senha
- [ ] Redireciona para login após sucesso
- [ ] Exibe erro se token inválido/expirado
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-014: Middleware de Autenticação
**Descrição:** Como desenvolvedor, eu preciso de um middleware que proteja rotas autenticadas validando o JWT access token.

**Acceptance Criteria:**
- [ ] Guard global do NestJS que valida JWT no header `Authorization: Bearer <token>`
- [ ] Extrai userId, organizationId, role do token e injeta no request
- [ ] Retorna 401 se token ausente, inválido ou expirado
- [ ] Decorador `@Public()` para marcar rotas que não requerem autenticação
- [ ] Decorador `@Roles('admin')` para restringir por role
- [ ] Typecheck passa

---

### US-015: Logout
**Descrição:** Como um usuário logado, eu quero fazer logout para encerrar minha sessão de forma segura.

**Acceptance Criteria:**
- [ ] Endpoint `POST /auth/logout` invalida o refresh token atual
- [ ] Frontend limpa tokens armazenados e redireciona para login
- [ ] Typecheck passa

---

### Épico 3: Gestão de Usuários e Organização

---

### US-016: Schemas MongoDB — Users, Organizations, Memberships
**Descrição:** Como desenvolvedor, eu preciso criar os schemas Mongoose para as coleções users, organizations e memberships conforme a modelagem documentada.

**Acceptance Criteria:**
- [ ] Schema `users`: _id, name, email, passwordHash, emailConfirmed, createdAt, updatedAt
- [ ] Índices users: `{ email: 1 }` unique, `{ createdAt: -1 }`
- [ ] Schema `organizations`: _id, name, slug, createdAt, updatedAt
- [ ] Índice organizations: `{ slug: 1 }` unique
- [ ] Schema `memberships`: _id, userId, organizationId, role (admin|member), createdAt
- [ ] Índices memberships: `{ userId: 1, organizationId: 1 }` unique, `{ organizationId: 1 }`
- [ ] Entities de domínio correspondentes (User, Organization, Membership) com métodos de domínio
- [ ] Value Objects: Email (validação), Password (hash/compare)
- [ ] Repository interfaces no domain layer
- [ ] Repository implementations no infra layer (Mongoose)
- [ ] Typecheck passa

---

### US-017: Perfil do Usuário — Backend
**Descrição:** Como um usuário logado, eu quero poder visualizar e editar meu perfil.

**Acceptance Criteria:**
- [ ] Endpoint `GET /users/me` retorna dados do usuário logado (sem passwordHash)
- [ ] Endpoint `PATCH /users/me` permite atualizar name e password
- [ ] Email não pode ser alterado (é identificador)
- [ ] Se alterar senha, valida complexidade mínima e hash bcrypt
- [ ] Filtrar por organizationId do token JWT
- [ ] Typecheck passa

---

### US-018: Perfil do Usuário — Frontend
**Descrição:** Como um usuário logado, eu quero uma página para ver e editar meu perfil.

**Acceptance Criteria:**
- [ ] Página `/settings/profile` com campos: nome (editável), email (read-only)
- [ ] Seção para alterar senha (senha atual + nova senha + confirmação)
- [ ] Feedback visual ao salvar (toast de sucesso/erro)
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-019: Listar Membros da Organização — Backend
**Descrição:** Como um admin, eu quero ver todos os membros da minha organização.

**Acceptance Criteria:**
- [ ] Endpoint `GET /organizations/:orgId/members` retorna lista de memberships com dados do user
- [ ] Filtra por `organizationId` do token (multi-tenancy)
- [ ] Retorna: userId, name, email, role, createdAt (da membership)
- [ ] Qualquer membro (admin ou member) pode listar
- [ ] Typecheck passa

---

### US-020: Listar Membros — Frontend
**Descrição:** Como um admin, eu quero ver uma lista de membros da minha organização com seus roles.

**Acceptance Criteria:**
- [ ] Página `/settings/members` com tabela/lista de membros
- [ ] Colunas: nome, email, role, data de entrada
- [ ] Badge visual para roles (admin, member)
- [ ] Botão "Convidar" visível apenas para admins
- [ ] Botão "Remover" por membro (apenas para admins, não pode remover a si mesmo se único admin)
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-021: Remover Membro — Backend
**Descrição:** Como um admin, eu quero poder remover membros da minha organização.

**Acceptance Criteria:**
- [ ] Endpoint `DELETE /organizations/:orgId/members/:userId`
- [ ] Apenas admin pode remover membros
- [ ] Admin não pode remover a si mesmo se for o único admin
- [ ] Remove a membership (não deleta o user — pode pertencer a outras orgs)
- [ ] Retorna erro apropriado com mensagem descritiva
- [ ] Typecheck passa

---

### US-022: Remover Membro — Frontend
**Descrição:** Como um admin, eu quero um dialog de confirmação antes de remover um membro.

**Acceptance Criteria:**
- [ ] Modal de confirmação ao clicar "Remover"
- [ ] Exibe nome do membro e mensagem clara
- [ ] Botão de confirmação com loading state
- [ ] Toast de sucesso/erro após ação
- [ ] Lista de membros atualizada após remoção
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### Épico 4: Sistema de Convites (Invitations Module)

---

### US-023: Schema MongoDB — Invitations
**Descrição:** Como desenvolvedor, eu preciso criar o schema Mongoose para a coleção invitations.

**Acceptance Criteria:**
- [ ] Schema `invitations`: _id, organizationId, email, token, role (member), status (pending|accepted|expired), expiresAt, createdAt
- [ ] Índices: `{ token: 1 }` unique, `{ organizationId: 1, email: 1 }` unique (para pendentes), `{ expiresAt: 1 }` TTL
- [ ] Entity de domínio Invitation com métodos: accept(), expire(), cancel()
- [ ] Repository interface IInvitationRepository no domain layer
- [ ] Repository implementation no infra layer
- [ ] Typecheck passa

---

### US-024: Criar Convite — Backend
**Descrição:** Como um admin, eu quero convidar novos membros para minha organização por email.

**Acceptance Criteria:**
- [ ] Endpoint `POST /invitations` recebe `{ email, role }` (role default: member)
- [ ] Apenas admin pode criar convites (validar role do token JWT)
- [ ] Não pode convidar email que já é membro da organização
- [ ] Não pode criar convite duplicado para mesmo email na mesma org se já existe pendente
- [ ] Gera token único (crypto random) com data de expiração configurável (env var)
- [ ] Envia email com link de convite contendo token
- [ ] Salva invitation com status `pending`
- [ ] Typecheck passa

---

### US-025: Aceitar Convite — Backend
**Descrição:** Como um convidado, eu quero aceitar um convite para entrar em uma organização.

**Acceptance Criteria:**
- [ ] Endpoint `POST /invitations/accept` recebe `{ token, name?, password? }`
- [ ] Valida que token existe, está pendente e não expirou
- [ ] Se convidado NÃO tem conta: cria User + Membership, requer name e password no body
- [ ] Se convidado JÁ tem conta: cria apenas Membership
- [ ] Atualiza status do convite para `accepted`
- [ ] Token não pode ser reutilizado
- [ ] Retorna tokens (access + refresh) para login automático
- [ ] Typecheck passa

---

### US-026: Listar, Reenviar e Cancelar Convites — Backend
**Descrição:** Como um admin, eu quero gerenciar os convites pendentes da minha organização.

**Acceptance Criteria:**
- [ ] Endpoint `GET /invitations` lista convites da organização (filtrar por organizationId)
- [ ] Endpoint `POST /invitations/:id/resend` reenvia convite (gera novo token, nova expiração)
- [ ] Endpoint `DELETE /invitations/:id` cancela convite pendente
- [ ] Apenas admin pode executar essas ações
- [ ] Typecheck passa

---

### US-027: Tela de Convites — Frontend
**Descrição:** Como um admin, eu quero gerenciar convites na interface.

**Acceptance Criteria:**
- [ ] Seção de convites na página `/settings/members` (ou tab separada)
- [ ] Lista de convites pendentes com: email, status, data de expiração
- [ ] Botão "Convidar" abre modal com campo de email
- [ ] Botão "Reenviar" por convite
- [ ] Botão "Cancelar" por convite com confirmação
- [ ] Toast de feedback para cada ação
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-028: Tela de Aceite de Convite — Frontend
**Descrição:** Como um convidado, eu quero uma tela para aceitar o convite e criar minha conta (se necessário).

**Acceptance Criteria:**
- [ ] Página `/invite?token=xxx`
- [ ] Se token válido e usuário NÃO tem conta: exibe formulário (nome, senha, confirmação)
- [ ] Se token válido e usuário JÁ tem conta: exibe botão "Aceitar convite"
- [ ] Se token inválido/expirado: exibe mensagem de erro
- [ ] Redireciona para dashboard da organização após aceite
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### Épico 5: Formulários (Forms Module)

---

### US-029: Schemas MongoDB — Forms e Questions
**Descrição:** Como desenvolvedor, eu preciso criar os schemas Mongoose para as coleções forms e questions.

**Acceptance Criteria:**
- [ ] Schema `forms`: _id, organizationId, createdBy, title, description, publicToken, settings (expiresAt, maxResponses, allowMultipleResponses, allowedEmailDomains), status (draft|active|expired|closed), createdAt, updatedAt
- [ ] Índices forms: `{ organizationId: 1 }`, `{ publicToken: 1 }` unique, `{ organizationId: 1, status: 1 }`
- [ ] Schema `questions`: _id, formId, organizationId, type (11 tipos), label, description, required, order, options, validation (min, max, pattern), createdAt
- [ ] Índices questions: `{ formId: 1, order: 1 }`, `{ organizationId: 1 }`
- [ ] Entity Form com métodos: publish(), close(), isExpired(), canAcceptResponses()
- [ ] Entity Question com validação por tipo
- [ ] Value Objects: FormStatus (enum), QuestionType (enum), PublicToken
- [ ] Repository interfaces: IFormRepository, IQuestionRepository
- [ ] Repository implementations (Mongoose)
- [ ] Typecheck passa

---

### US-030: CRUD de Formulários — Backend
**Descrição:** Como um membro da organização, eu quero criar, listar, visualizar, editar e excluir formulários.

**Acceptance Criteria:**
- [ ] Endpoint `POST /forms` cria formulário com status `draft`
- [ ] Endpoint `GET /forms` lista formulários da organização (filtra por organizationId)
- [ ] Endpoint `GET /forms/:id` retorna detalhes do formulário com perguntas
- [ ] Endpoint `PATCH /forms/:id` atualiza title, description, settings
- [ ] Endpoint `DELETE /forms/:id` exclui formulário + perguntas + respostas + response_emails associados
- [ ] Qualquer membro (admin ou member) pode executar CRUD
- [ ] Multi-tenancy: todas as queries filtram por organizationId
- [ ] Usecases separados: CreateForm, ListForms, GetForm, UpdateForm, DeleteForm
- [ ] Typecheck passa

---

### US-031: Gestão de Perguntas — Backend
**Descrição:** Como um membro, eu quero adicionar, editar, remover e reordenar perguntas de um formulário.

**Acceptance Criteria:**
- [ ] Endpoint `POST /forms/:formId/questions` adiciona pergunta
- [ ] Endpoint `PATCH /forms/:formId/questions/:questionId` edita pergunta
- [ ] Endpoint `DELETE /forms/:formId/questions/:questionId` remove pergunta
- [ ] Endpoint `PATCH /forms/:formId/questions/reorder` atualiza ordem das perguntas
- [ ] Valida campos obrigatórios por tipo (ex: radio/checkbox/dropdown requerem options)
- [ ] Suporte aos 11 tipos: text, textarea, checkbox, radio, toggle, dropdown, number, date, rating, file, email
- [ ] Cada pergunta possui: label, type, required, order, description (opcional), options (quando aplicável), validation (opcional: min, max, pattern)
- [ ] Multi-tenancy em todas as queries
- [ ] Typecheck passa

---

### US-032: Publicar Formulário — Backend
**Descrição:** Como um membro, eu quero publicar um formulário para que ele fique disponível via link público.

**Acceptance Criteria:**
- [ ] Endpoint `POST /forms/:id/publish`
- [ ] Valida que formulário está em status `draft`
- [ ] Valida que formulário possui pelo menos 1 pergunta
- [ ] Gera `publicToken` único (crypto random) — não muda se formulário for editado depois
- [ ] Atualiza status para `active`
- [ ] Retorna o link público: `/forms/{publicToken}`
- [ ] Typecheck passa

---

### US-033: Fechar Formulário — Backend
**Descrição:** Como um membro, eu quero fechar manualmente um formulário para parar de aceitar respostas.

**Acceptance Criteria:**
- [ ] Endpoint `POST /forms/:id/close`
- [ ] Valida que formulário está em status `active`
- [ ] Atualiza status para `closed`
- [ ] Formulário não aceita mais respostas
- [ ] Typecheck passa

---

### US-034: Lista de Formulários — Frontend
**Descrição:** Como um membro, eu quero ver todos os formulários da minha organização.

**Acceptance Criteria:**
- [ ] Página `/forms` com lista/grid de formulários
- [ ] Card por formulário: título, status (badge colorido), data de criação, total de respostas
- [ ] Filtro por status (todos, draft, active, expired, closed)
- [ ] Botão "Criar formulário"
- [ ] Link para editar formulário
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-035: FormBuilder — Criar/Editar Formulário (Frontend)
**Descrição:** Como um membro, eu quero uma interface visual para criar e editar formulários com suas perguntas.

**Acceptance Criteria:**
- [ ] Página `/forms/new` e `/forms/:id/edit`
- [ ] Campos do formulário: título, descrição
- [ ] Seção de configurações: expiresAt (date picker), maxResponses (number), allowMultipleResponses (toggle), allowedEmailDomains (input de tags)
- [ ] Lista de perguntas com drag-and-drop para reordenação
- [ ] Botão "Adicionar pergunta" abre seletor de tipo (11 tipos)
- [ ] Para cada pergunta: label, tipo, obrigatório (toggle), opções (quando aplicável), validações
- [ ] Preview de cada tipo de pergunta no editor
- [ ] Botão "Salvar rascunho" e "Publicar"
- [ ] Publicar exige pelo menos 1 pergunta
- [ ] Estado do formulário gerenciado pelo hook `useFormBuilder`
- [ ] Componentes: FormBuilder (container), QuestionList, QuestionEditor, QuestionTypeSelector, FormSettings
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-036: Layout Principal — Frontend
**Descrição:** Como um usuário logado, eu quero um layout consistente com sidebar, header e área de conteúdo.

**Acceptance Criteria:**
- [ ] Componente `AppShell` com sidebar + header + content area
- [ ] Sidebar com navegação: Formulários, Membros, Configurações
- [ ] Header com nome da organização, nome do usuário, botão de logout
- [ ] `PageContainer` com max-width e padding consistente
- [ ] Responsivo (sidebar colapsa em mobile)
- [ ] Acessível: navegação por teclado, skip links
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-037: Componentes de Input Reutilizáveis — Frontend
**Descrição:** Como desenvolvedor, eu preciso de componentes de input padronizados e acessíveis para usar em formulários e no FormBuilder.

**Acceptance Criteria:**
- [ ] Componentes em `src/components/inputs/`: TextInput, TextArea, Checkbox, RadioGroup, Toggle, Dropdown, NumberInput, DatePicker, RatingInput, FileUpload, EmailInput
- [ ] Interface base padronizada: value, onChange, error, label, required
- [ ] Todos controlados (estado gerenciado externamente)
- [ ] Acessíveis: labels associados, aria attributes, keyboard navigation
- [ ] Suporte a estados: default, focused, error, disabled
- [ ] Estilos e testes colocados junto ao componente
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### Épico 6: Respostas (Responses Module)

---

### US-038: Schemas MongoDB — Responses e Response_Emails
**Descrição:** Como desenvolvedor, eu preciso criar os schemas Mongoose para as coleções responses e response_emails.

**Acceptance Criteria:**
- [ ] Schema `responses`: _id, formId, organizationId, answers (array de { questionId, value }), submittedAt
- [ ] Índices responses: `{ formId: 1 }`, `{ formId: 1, submittedAt: -1 }`, `{ organizationId: 1 }`
- [ ] **responses NÃO contém email, hash de email, IP ou qualquer identificador do respondente**
- [ ] Schema `response_emails`: _id, formId, emailHash, respondedAt
- [ ] Índice response_emails: `{ formId: 1, emailHash: 1 }` unique
- [ ] **response_emails NÃO contém referência a responses (sem FK)**
- [ ] Entity Response (domain) sem identificador de respondente
- [ ] Repository interfaces: IResponseRepository, IResponseEmailRepository
- [ ] Typecheck passa

---

### US-039: Submeter Resposta — Backend
**Descrição:** Como um respondente, eu quero submeter minha resposta a um formulário via link público.

**Acceptance Criteria:**
- [ ] Endpoint `POST /responses/:publicToken` — rota pública (sem auth)
- [ ] Recebe `{ email, answers: [{ questionId, value }] }`
- [ ] **Fluxo completo de validação:**
  - [ ] 1. Busca formulário pelo publicToken
  - [ ] 2. Verifica que formulário está com status `active`
  - [ ] 3. Verifica `expiresAt` — se definido e no passado, rejeita (atualiza status para `expired`)
  - [ ] 4. Verifica `maxResponses` — se definido e count >= max, rejeita (atualiza status para `expired`)
  - [ ] 5. Verifica restrição de domínio (`allowedEmailDomains`): se lista não vazia, domínio do email deve estar na lista
  - [ ] 6. Calcula hash SHA-256 do email
  - [ ] 7. Verifica duplicidade: se `allowMultipleResponses = false` e hash já existe em `response_emails` para este form, rejeita
  - [ ] 8. Valida answers contra questions: todas as perguntas `required` respondidas, tipos compatíveis, validações respeitadas (min, max, pattern)
  - [ ] 9. Salva response em `responses` **sem email, sem hash, sem identificação**
  - [ ] 10. Salva hash em `response_emails` **sem referência à response**
  - [ ] 11. As duas inserções são independentes e sem vínculo
- [ ] Retorna 201 sucesso ou erro com mensagem descritiva
- [ ] Typecheck passa

---

### US-040: Página Pública de Resposta — Frontend
**Descrição:** Como um respondente, eu quero acessar um formulário via link público e submeter minha resposta.

**Acceptance Criteria:**
- [ ] Página `/forms/:publicToken` — rota pública (sem auth)
- [ ] Exibe título e descrição do formulário
- [ ] Campo de email do respondente (obrigatório)
- [ ] Renderiza todas as perguntas na ordem correta usando `QuestionRenderer`
- [ ] `QuestionRenderer` usa strategy pattern: delega para renderer específico por tipo
- [ ] Renderers: TextRenderer, TextareaRenderer, CheckboxRenderer, RadioRenderer, ToggleRenderer, DropdownRenderer, NumberRenderer, DateRenderer, RatingRenderer, FileRenderer, EmailRenderer
- [ ] Props padronizadas: value, onChange, question, error
- [ ] Validação client-side: campos obrigatórios, tipos, validações (min, max, pattern)
- [ ] Exibe erros inline por pergunta
- [ ] Botão "Enviar" com loading state
- [ ] Tela de sucesso após submissão ("Resposta enviada com sucesso")
- [ ] Tela de erro para formulários expirados/fechados/limite atingido
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### US-041: Visualizar Respostas de um Formulário — Backend
**Descrição:** Como um membro, eu quero ver as respostas individuais de um formulário.

**Acceptance Criteria:**
- [ ] Endpoint `GET /forms/:id/responses` retorna lista de respostas paginada
- [ ] Cada resposta: _id, answers (com questionId e value), submittedAt
- [ ] **Não retorna nenhum dado identificador do respondente**
- [ ] Filtra por organizationId (multi-tenancy)
- [ ] Suporte a paginação (offset + limit)
- [ ] Ordenação por submittedAt desc
- [ ] Typecheck passa

---

### US-042: Visualizar Respostas — Frontend
**Descrição:** Como um membro, eu quero ver as respostas individuais de um formulário em uma tabela.

**Acceptance Criteria:**
- [ ] Página `/forms/:id/responses`
- [ ] Tabela com respostas: uma linha por resposta, colunas por pergunta
- [ ] Data de submissão exibida
- [ ] Paginação
- [ ] **Nenhum dado identificador de respondente exibido**
- [ ] Link de volta para o formulário
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### Épico 7: Analytics (Analytics Module)

---

### US-043: Métricas por Formulário — Backend
**Descrição:** Como um membro, eu quero ver métricas agregadas de um formulário.

**Acceptance Criteria:**
- [ ] Endpoint `GET /forms/:id/analytics`
- [ ] Retorna métricas agregadas:
  - [ ] Total de respostas
  - [ ] Respostas ao longo do tempo (agrupadas por dia/semana/mês, configurável via query param)
  - [ ] Métricas por pergunta (dependem do tipo):
    - **text, textarea, email:** respostas recentes (amostra)
    - **checkbox:** contagem por opção selecionada, combinações mais comuns
    - **radio, dropdown:** distribuição percentual por opção
    - **toggle:** contagem sim/não
    - **number:** média, mediana, min, max, histograma
    - **date:** distribuição ao longo do tempo
    - **rating:** média, distribuição por nota
    - **file:** total de uploads
- [ ] Dados agregados sob demanda (não pré-computados)
- [ ] Respeita multi-tenancy (organizationId)
- [ ] **Não expõe informações que possam identificar respondentes**
- [ ] Typecheck passa

---

### US-044: Dashboard de Analytics — Frontend
**Descrição:** Como um membro, eu quero visualizar analytics de um formulário em um dashboard com gráficos.

**Acceptance Criteria:**
- [ ] Página `/forms/:id/analytics`
- [ ] `StatCard` com métricas principais: total de respostas, média de rating, etc.
- [ ] Gráfico de linha: respostas ao longo do tempo (LineChart)
- [ ] Para cada pergunta, gráfico adequado ao tipo:
  - **radio, dropdown:** PieChart com distribuição
  - **checkbox:** BarChart com contagem por opção
  - **toggle:** PieChart sim/não
  - **number:** BarChart histograma + StatCards (média, mediana, min, max)
  - **rating:** RatingChart com distribuição + média
  - **date:** LineChart com distribuição temporal
  - **text, textarea, email:** lista de respostas recentes
  - **file:** StatCard com total de uploads
- [ ] Hook `useAnalytics` busca e normaliza dados da API
- [ ] Componentes de gráfico recebem dados normalizados, não dados brutos
- [ ] Responsivo
- [ ] Acessível
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### Épico 8: Navegação e Experiência Completa

---

### US-045: Rotas e Navegação Completa — Frontend
**Descrição:** Como desenvolvedor, eu preciso que todas as rotas do aplicativo estejam configuradas e protegidas corretamente.

**Acceptance Criteria:**
- [ ] Rotas públicas (sem auth): `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/confirm-email`, `/check-email`, `/invite`, `/forms/:publicToken` (resposta)
- [ ] Rotas protegidas (requerem auth): `/forms`, `/forms/new`, `/forms/:id/edit`, `/forms/:id/responses`, `/forms/:id/analytics`, `/settings/profile`, `/settings/members`
- [ ] Redirect para `/login` se não autenticado em rota protegida
- [ ] Redirect para `/forms` se autenticado em rota pública de auth (login/signup)
- [ ] Hook `useAuth` gerencia estado de autenticação
- [ ] Typecheck passa

---

### US-046: Página 404
**Descrição:** Como um usuário, eu quero ver uma página amigável quando acesso uma URL inexistente.

**Acceptance Criteria:**
- [ ] Página 404 com mensagem clara e link para voltar à home
- [ ] Typecheck passa
- [ ] **Verify in browser using dev-browser skill**

---

### Épico 9: Serviço de Email

---

### US-047: Serviço de Email — Backend
**Descrição:** Como desenvolvedor, eu preciso de um serviço de email para enviar confirmações, convites e reset de senha.

**Acceptance Criteria:**
- [ ] Módulo/serviço de email em `src/shared/` ou `src/core/`
- [ ] Suporte a provider configurável via env var (ex: SMTP, SendGrid, etc.)
- [ ] Templates para: confirmação de email, convite, reset de senha
- [ ] Interface `IEmailService` com método `send(to, template, data)`
- [ ] Implementation concreta separada
- [ ] Em desenvolvimento, log de emails no console (mock provider)
- [ ] Typecheck passa

---

## 4. Requisitos Funcionais

### Autenticação e Contas
- **FR-01:** O sistema deve permitir signup com criação automática de User + Organization + Membership (admin)
- **FR-02:** O sistema deve enviar email de confirmação após signup e bloquear acesso até confirmação
- **FR-03:** O sistema deve autenticar via email + senha e retornar JWT (access token curto + refresh token longo)
- **FR-04:** O sistema deve implementar refresh token rotation, invalidando token anterior após uso
- **FR-05:** O sistema deve permitir reset de senha via token temporário enviado por email
- **FR-06:** O sistema deve invalidar todos os refresh tokens do usuário ao resetar senha
- **FR-07:** O sistema deve proteger rotas autenticadas com middleware JWT

### Gestão de Usuários
- **FR-08:** O sistema deve permitir atualização de nome e senha pelo usuário (email imutável)
- **FR-09:** O sistema deve listar membros da organização com nome, email, role e data
- **FR-10:** O sistema deve permitir que admin remova membros (exceto se for o único admin)
- **FR-11:** Remoção de membership não deleta o user (pode pertencer a outras orgs)

### Convites
- **FR-12:** O sistema deve permitir que admin crie convites por email com token e expiração
- **FR-13:** O sistema deve rejeitar convites duplicados (mesmo email, mesma org, status pendente)
- **FR-14:** O sistema deve rejeitar convites para emails que já são membros
- **FR-15:** Ao aceitar convite, o sistema deve criar User (se não existe) + Membership
- **FR-16:** O sistema deve permitir que admin reenvie (novo token) ou cancele convites pendentes
- **FR-17:** Convites devem expirar automaticamente (TTL ou verificação)

### Formulários
- **FR-18:** O sistema deve permitir CRUD de formulários por qualquer membro
- **FR-19:** Formulários devem suportar 11 tipos de perguntas: text, textarea, checkbox, radio, toggle, dropdown, number, date, rating, file, email
- **FR-20:** Cada pergunta deve ter: label, type, required, order, description (opcional), options (quando aplicável), validation (opcional)
- **FR-21:** O sistema deve suportar configurações: expiresAt, maxResponses, allowMultipleResponses, allowedEmailDomains
- **FR-22:** Publicação (draft → active) requer pelo menos 1 pergunta e gera publicToken único
- **FR-23:** O publicToken não muda se o formulário for editado após publicação
- **FR-24:** O sistema deve permitir fechar formulário manualmente (active → closed)
- **FR-25:** Exclusão de formulário deve remover perguntas, respostas e response_emails associados

### Respostas e Anonimato
- **FR-26:** O sistema deve aceitar respostas via link público sem autenticação
- **FR-27:** Email é obrigatório para submeter resposta
- **FR-28:** O sistema deve verificar: formulário ativo, não expirado, não no limite, domínio do email permitido
- **FR-29:** O sistema deve verificar duplicidade via hash SHA-256 do email na coleção response_emails
- **FR-30:** Se `allowMultipleResponses = false` e hash existe → rejeitar
- **FR-31:** **Respostas devem ser armazenadas SEM email, hash, IP ou qualquer identificador**
- **FR-32:** **Hash de email deve ser armazenado em response_emails SEM referência à resposta**
- **FR-33:** **Não deve existir nenhum vínculo (FK, timestamp correlacionável) entre responses e response_emails**
- **FR-34:** O sistema deve validar answers: perguntas required respondidas, tipos compatíveis, validações (min, max, pattern) respeitadas

### Analytics
- **FR-35:** O sistema deve agregar métricas por formulário: total de respostas, respostas ao longo do tempo
- **FR-36:** O sistema deve agregar métricas por pergunta de acordo com o tipo (conforme tabela na US-043)
- **FR-37:** Dados devem ser agregados sob demanda (não pré-computados)
- **FR-38:** Analytics não deve expor informações que identifiquem respondentes
- **FR-39:** Analytics deve respeitar multi-tenancy (organizationId)

### Multi-tenancy
- **FR-40:** Toda query no banco deve filtrar por `organizationId`
- **FR-41:** Isolamento é lógico (mesma instância MongoDB)
- **FR-42:** Um usuário pode pertencer a múltiplas organizações via memberships

### Frontend
- **FR-43:** Todos os componentes devem ser acessíveis (labels, ARIA, keyboard navigation)
- **FR-44:** Componentes de input devem seguir interface padronizada (value, onChange, error, label, required)
- **FR-45:** FormBuilder deve suportar drag-and-drop para reordenação de perguntas
- **FR-46:** QuestionRenderer deve usar strategy pattern (delegar para renderer específico por tipo)
- **FR-47:** Dashboard deve renderizar gráficos adequados ao tipo de cada pergunta
- **FR-48:** Layout responsivo com sidebar colapsável em mobile

---

## 5. Non-Goals (Fora do Escopo)

- **Não haverá** notificações push ou em tempo real (websockets)
- **Não haverá** lógica de preço/billing/planos
- **Não haverá** integração com serviços externos (Slack, Zapier, etc.)
- **Não haverá** editor de formulários com drag-and-drop de campos entre seções (apenas reordenação na lista)
- **Não haverá** multi-idioma (i18n) — interface em inglês inicialmente
- **Não haverá** temas customizáveis para formulários públicos
- **Não haverá** exportação de respostas (CSV/Excel)
- **Não haverá** soft delete — exclusões são físicas
- **Não haverá** analytics pré-computados ou cache — tudo sob demanda
- **Não haverá** upload real de arquivos (tipo `file` pode ser placeholder para MVP)
- **Não haverá** suporte a múltiplas organizações no frontend (seletor de org) — assumir organização fixa por sessão
- **Não haverá** rate limiting ou proteção contra bots nas rotas públicas (pode ser adicionado depois)
- **Não haverá** testes E2E — apenas unitários e integração no backend
- **Não haverá** testes no frontend neste momento

---

## 6. Considerações de Design (UI/UX)

- **Design system:** Componentes genéricos em `src/components/`, composições de domínio em `src/modules/`
- **Layout:** AppShell com sidebar fixa (desktop) / hamburger (mobile), header com info do usuário
- **FormBuilder:** Interface visual com lista de perguntas, cada uma expansível para edição. Seletor de tipo como dropdown ou grid de ícones
- **Página pública de resposta:** Design limpo e focado, sem sidebar/header do app. Apenas título, descrição e perguntas
- **Dashboard:** Grid de cards com métricas e gráficos. Responsivo, 2 colunas em desktop, 1 em mobile
- **Feedback:** Toast notifications para ações de sucesso/erro. Loading states em botões e skeletons em carregamentos de página
- **Cores de status:** Draft (cinza), Active (verde), Expired (amarelo), Closed (vermelho)
- **Acessibilidade:** Semantic HTML, ARIA labels, keyboard navigation, focus indicators, skip links

---

## 7. Considerações Técnicas

### Arquitetura Backend (DDD Simplificado)
- Cada módulo possui `domain/` (regras de negócio, entities, value objects, usecases, repository interfaces) e `infra/` (controllers, repository implementations, schemas)
- **Domain NUNCA importa infra**. Infra PODE importar domain
- **Entre módulos:** usecase pode depender de repository interface de outro módulo (via DI), nunca de implementations
- NestJS gerencia injeção de dependência

### Mapa de Dependências entre Módulos
```
auth → users, organizations, memberships
invitations → users, memberships
forms → independente
responses → forms
analytics → responses, forms
```

### Banco de Dados (MongoDB)
- 8 coleções: users, organizations, memberships, invitations, forms, questions, responses, response_emails
- Isolamento multi-tenant lógico via `organizationId` em todas as queries
- Questions em coleção separada (não embeddadas no form) para flexibilidade de analytics
- Answers embeddados na response (sempre lidos juntos)
- response_emails completamente isolada de responses (anonimato)

### Segurança
- Bcrypt para hash de senhas
- SHA-256 para hash de emails (deduplicação)
- JWT com access token (curta duração) + refresh token (longa duração) com rotation
- Tokens de convite e confirmação com expiração
- Validação de input em todas as boundaries (DTOs com class-validator)
- Sanitização de dados antes de persistir

### Testes e TDD
- O projeto é guiado por **TDD (Test-Driven Development)**: toda feature começa pelos testes — eles definem o comportamento esperado e determinam se a implementação está correta
- **Framework**: Jest (backend apenas; frontend não tem testes neste momento)
- **Cada arquivo de código tem seu arquivo de teste correspondente**
- **Testes unitários** (`.spec.ts`): usecases, entities, value objects — testam regras de negócio isoladamente, sem dependências externas (mocks para repositórios)
- **Testes de integração** (`.test.ts`): controllers, repositories — testam integração com NestJS e MongoDB
- Fluxo TDD: **Red** (escrever teste que falha) → **Green** (código mínimo para passar) → **Refactor** (melhorar mantendo testes passando)

| Tipo de arquivo | Extensão de teste | Tipo de teste |
|---|---|---|
| `*.usecase.ts` | `*.usecase.spec.ts` | Unitário |
| `*.entity.ts` | `*.entity.spec.ts` | Unitário |
| `*.vo.ts` | `*.vo.spec.ts` | Unitário |
| `*.controller.ts` | `*.controller.test.ts` | Integração |
| `*-*.repository.ts` | `*-*.repository.test.ts` | Integração |

### Frontend
- Next.js App Router com rotas baseadas em arquivos
- Componentes funcionais com TypeScript strict
- Custom hooks para lógica reutilizável (useAuth, useForm, useFormBuilder, useOrganization, useAnalytics)
- Serviços em `src/services/` com client HTTP centralizado e interceptors de auth
- Strategy pattern no QuestionRenderer

---

## 8. Métricas de Sucesso

- Usuário consegue se registrar, confirmar email e fazer login em menos de 2 minutos
- Membro consegue criar um formulário com 5 perguntas de tipos diferentes em menos de 5 minutos
- Respondente consegue responder um formulário de 10 perguntas em menos de 3 minutos
- Dashboard carrega analytics de um formulário com 1000 respostas em menos de 3 segundos
- Zero vazamentos de identidade: nenhuma rota ou query expõe vínculo entre email e resposta
- Todas as rotas autenticadas bloqueiam acesso sem JWT válido
- Multi-tenancy: nenhum dado de outra organização é acessível
- 100% dos componentes de input acessíveis por teclado

---

## 9. Open Questions

- **Q1:** Qual provedor de email será usado em produção (SendGrid, AWS SES, SMTP genérico)?
- **Q2:** O tipo de pergunta `file` terá upload real no MVP ou será placeholder? Se real, qual storage (S3, local)?
- **Q3:** A taxa de preenchimento (respostas / acessos ao link) será implementada? Requer tracking de acessos ao link público
- **Q4:** Haverá suporte a seletor de organização no frontend para usuários que pertencem a múltiplas orgs?
- **Q5:** Qual biblioteca de gráficos será usada no frontend (Recharts, Chart.js, Nivo)?
- **Q6:** A reordenação de perguntas usará qual biblioteca de drag-and-drop (dnd-kit, react-beautiful-dnd)?
- **Q7:** Haverá paginação ou infinite scroll na lista de formulários?
- **Q8:** O formulário público terá branding customizável (logo da empresa, cores)?
- **Q9:** Haverá rate limiting nas rotas públicas (submissão de resposta) para proteção contra bots?
- **Q10:** Qual estratégia de deploy será usada (Docker, Vercel + Railway, etc.)?

---

## 10. Ordem Sugerida de Implementação

A ordem recomendada respeita as dependências entre módulos:

### Fase 1: Fundação
1. **US-001** — Setup Backend
2. **US-002** — Setup Frontend
3. **US-003** — Comunicação Frontend → Backend
4. **US-016** — Schemas Users, Organizations, Memberships
5. **US-047** — Serviço de Email

### Fase 2: Autenticação
6. **US-014** — Middleware de Autenticação (JWT Guard)
7. **US-004** — Signup Backend
8. **US-006** — Confirmação de Email Backend
9. **US-008** — Login Backend
10. **US-010** — Refresh Token
11. **US-015** — Logout
12. **US-011** — Reset de Senha (Solicitar)
13. **US-012** — Reset de Senha (Confirmar)
14. **US-005** — Tela de Signup
15. **US-007** — Tela de Confirmação de Email
16. **US-009** — Tela de Login
17. **US-013** — Telas de Reset de Senha

### Fase 3: Layout e Navegação
18. **US-036** — Layout Principal (AppShell, Sidebar, Header)
19. **US-037** — Componentes de Input Reutilizáveis
20. **US-045** — Rotas e Navegação Completa
21. **US-046** — Página 404

### Fase 4: Gestão de Usuários
22. **US-017** — Perfil Backend
23. **US-018** — Perfil Frontend
24. **US-019** — Listar Membros Backend
25. **US-020** — Listar Membros Frontend
26. **US-021** — Remover Membro Backend
27. **US-022** — Remover Membro Frontend

### Fase 5: Convites
28. **US-023** — Schema Invitations
29. **US-024** — Criar Convite Backend
30. **US-025** — Aceitar Convite Backend
31. **US-026** — Listar/Reenviar/Cancelar Convites Backend
32. **US-027** — Tela de Convites Frontend
33. **US-028** — Tela de Aceite Frontend

### Fase 6: Formulários
34. **US-029** — Schemas Forms e Questions
35. **US-030** — CRUD Formulários Backend
36. **US-031** — Gestão de Perguntas Backend
37. **US-032** — Publicar Formulário Backend
38. **US-033** — Fechar Formulário Backend
39. **US-034** — Lista de Formulários Frontend
40. **US-035** — FormBuilder Frontend

### Fase 7: Respostas
41. **US-038** — Schemas Responses e Response_Emails
42. **US-039** — Submeter Resposta Backend
43. **US-040** — Página Pública de Resposta Frontend
44. **US-041** — Visualizar Respostas Backend
45. **US-042** — Visualizar Respostas Frontend

### Fase 8: Analytics
46. **US-043** — Métricas Backend
47. **US-044** — Dashboard Frontend
