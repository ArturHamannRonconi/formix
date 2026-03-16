# Modelagem de Dados — MongoDB

## Coleções

### users

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "emailConfirmed": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**
- `{ email: 1 }` — unique
- `{ createdAt: -1 }`

**Notas:** User é independente de organização. A relação user-organização é feita via `memberships`.

---

### organizations

```json
{
  "_id": "ObjectId",
  "name": "string",
  "slug": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**
- `{ slug: 1 }` — unique

---

### memberships

Relaciona users com organizations e define o role.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "organizationId": "ObjectId",
  "role": "string (admin | member)",
  "createdAt": "Date"
}
```

**Índices:**
- `{ userId: 1, organizationId: 1 }` — unique (um user por org)
- `{ organizationId: 1 }` — listar membros de uma org

---

### invitations

```json
{
  "_id": "ObjectId",
  "organizationId": "ObjectId",
  "email": "string",
  "token": "string",
  "role": "string (member)",
  "status": "string (pending | accepted | expired)",
  "expiresAt": "Date",
  "createdAt": "Date"
}
```

**Índices:**
- `{ token: 1 }` — unique
- `{ organizationId: 1, email: 1 }` — unique (um convite ativo por email por org)
- `{ expiresAt: 1 }` — TTL index ou query de expiração

---

### forms

```json
{
  "_id": "ObjectId",
  "organizationId": "ObjectId",
  "createdBy": "ObjectId (userId)",
  "title": "string",
  "description": "string",
  "publicToken": "string",
  "settings": {
    "expiresAt": "Date | null",
    "maxResponses": "number | null",
    "allowMultipleResponses": "boolean",
    "allowedEmailDomains": ["string"]
  },
  "status": "string (draft | active | expired | closed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**
- `{ organizationId: 1 }` — listar forms de uma org
- `{ publicToken: 1 }` — unique, acesso público
- `{ organizationId: 1, status: 1 }` — filtrar por status

---

### questions

Perguntas de um formulário. Coleção separada para flexibilidade.

```json
{
  "_id": "ObjectId",
  "formId": "ObjectId",
  "organizationId": "ObjectId",
  "type": "string (text | textarea | checkbox | radio | toggle | dropdown | number | date | rating | file | email)",
  "label": "string",
  "description": "string | null",
  "required": "boolean",
  "order": "number",
  "options": ["string"],
  "validation": {
    "min": "number | null",
    "max": "number | null",
    "pattern": "string | null"
  },
  "createdAt": "Date"
}
```

**Índices:**
- `{ formId: 1, order: 1 }` — listar perguntas ordenadas
- `{ organizationId: 1 }` — isolamento multi-tenant

**Notas:** `options` é usado para checkbox, radio e dropdown. `validation` é opcional e depende do tipo.

---

### responses

Respostas anônimas a formulários. **Não contém email nem identificação do respondente.**

```json
{
  "_id": "ObjectId",
  "formId": "ObjectId",
  "organizationId": "ObjectId",
  "answers": [
    {
      "questionId": "ObjectId",
      "value": "any (string | number | boolean | [string] | Date)"
    }
  ],
  "submittedAt": "Date"
}
```

**Índices:**
- `{ formId: 1 }` — listar respostas de um form
- `{ formId: 1, submittedAt: -1 }` — respostas ordenadas por data
- `{ organizationId: 1 }` — isolamento multi-tenant

---

### response_emails

Controle de duplicidade. **Não contém referência à resposta.**

```json
{
  "_id": "ObjectId",
  "formId": "ObjectId",
  "emailHash": "string",
  "respondedAt": "Date"
}
```

**Índices:**
- `{ formId: 1, emailHash: 1 }` — unique (garante um email por formulário)

**Estratégia de anonimização:**
- Quando um respondente submete uma resposta:
  1. Hash do email (SHA-256) é verificado na coleção `response_emails`
  2. Se já existe → rejeita (duplicidade)
  3. Se não existe → insere o hash em `response_emails` E a resposta em `responses`
  4. As duas inserções não possuem vínculo entre si
- O email original nunca é armazenado — apenas o hash
- Não existe FK entre `response_emails` e `responses`
- É impossível reconstruir qual email submeteu qual resposta

---

## Relacionamentos

```
users ──1:N──▶ memberships ◀──N:1── organizations
                                         │
                                    1:N   │   1:N
                                         ▼
                              invitations   forms
                                              │
                                         1:N  │  1:N
                                              ▼
                                    questions   responses

                              response_emails (isolada, sem FK para responses)
```

## Estratégia geral

- **Embedding vs Reference**: perguntas são referenciadas (coleção separada) para facilitar queries de analytics. Respostas contêm answers embeddados pois são sempre lidas juntas.
- **Soft delete**: não utilizado inicialmente — exclusão é física.
- **Timestamps**: todas as coleções possuem `createdAt`; coleções editáveis possuem `updatedAt`.
