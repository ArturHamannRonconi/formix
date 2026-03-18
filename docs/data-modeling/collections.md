# Modelagem de Dados — MongoDB

## Coleções

### users

```json
{
  "_id": "string (UUID)",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "emailConfirmed": "boolean",
  "emailConfirmationToken": {
    "_id": "string", "tokenHash": "string", "expiresAt": "Date", "createdAt": "Date"
  } | null,
  "refreshTokens": [{
    "_id": "string", "tokenHash": "string", "family": "string",
    "usedAt": "Date | null", "expiresAt": "Date", "createdAt": "Date"
  }],
  "passwordResetToken": {
    "_id": "string", "tokenHash": "string",
    "usedAt": "Date | null", "expiresAt": "Date", "createdAt": "Date"
  } | null,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**
- `{ email: 1 }` — unique
- `{ 'emailConfirmationToken.tokenHash': 1 }` — sparse
- `{ 'refreshTokens.tokenHash': 1 }` — sparse
- `{ 'passwordResetToken.tokenHash': 1 }` — sparse

**Notas:** Tokens de autenticação são embutidos — sem coleções separadas. Token bruto nunca persistido, apenas o hash SHA-256.

---

### organizations

```json
{
  "_id": "string (UUID)",
  "name": "string",
  "slug": "string",
  "members": [{
    "_id": "string", "userId": "string", "role": "admin | member", "joinedAt": "Date"
  }],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**
- `{ slug: 1 }` — unique
- `{ 'members.userId': 1 }`

**Notas:** Memberships embutidas — sem coleção `memberships` separada. Todo org tem pelo menos 1 membro admin.

---

### invitations

```json
{
  "_id": "string (UUID)",
  "organizationId": "string",
  "email": "string",
  "tokenHash": "string",
  "role": "member",
  "status": "pending | accepted | expired",
  "expiresAt": "Date",
  "createdAt": "Date"
}
```

**Índices:**
- `{ tokenHash: 1 }` — unique
- `{ organizationId: 1, email: 1 }` — unique (um convite ativo por email por org)
- `{ expiresAt: 1 }` — TTL / query de expiração

---

### forms

```json
{
  "_id": "string (UUID)",
  "organizationId": "string",
  "createdBy": "string (userId)",
  "title": "string",
  "description": "string",
  "publicToken": "string",
  "settings": {
    "expiresAt": "Date | null",
    "maxResponses": "number | null",
    "allowMultipleResponses": "boolean",
    "allowedEmailDomains": ["string"]
  },
  "status": "draft | active | expired | closed",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices:**
- `{ organizationId: 1 }`
- `{ publicToken: 1 }` — unique
- `{ organizationId: 1, status: 1 }`

---

### questions

```json
{
  "_id": "string (UUID)",
  "formId": "string",
  "organizationId": "string",
  "type": "text | textarea | checkbox | radio | toggle | dropdown | number | date | rating | file | email",
  "label": "string",
  "description": "string | null",
  "required": "boolean",
  "order": "number",
  "options": ["string"],
  "validation": { "min": "number | null", "max": "number | null", "pattern": "string | null" },
  "createdAt": "Date"
}
```

**Índices:**
- `{ formId: 1, order: 1 }`
- `{ organizationId: 1 }` — multi-tenant

**Notas:** `options` usado em checkbox, radio, dropdown. `validation` opcional por tipo.

---

### responses

Respostas anônimas. **Não contém email, hash de email ou qualquer identificador do respondente.**

```json
{
  "_id": "string (UUID)",
  "formId": "string",
  "organizationId": "string",
  "answers": [{ "questionId": "string", "value": "string | number | boolean | string[] | Date" }],
  "submittedAt": "Date"
}
```

**Índices:**
- `{ formId: 1 }`
- `{ formId: 1, submittedAt: -1 }`
- `{ organizationId: 1 }`

---

### response_emails

Controle de duplicidade. **Sem referência à resposta correspondente.**

```json
{
  "_id": "string (UUID)",
  "formId": "string",
  "emailHash": "string (SHA-256)",
  "respondedAt": "Date"
}
```

**Índices:**
- `{ formId: 1, emailHash: 1 }` — unique

**Estratégia de anonimização:**
- Hash SHA-256 do email inserido em `response_emails` e resposta em `responses` — sem FK entre si
- Impossível reconstruir qual email submeteu qual resposta

---

## Relacionamentos

```
users ──────────────────────────────────────────▶ organizations
  (members[] embutido em organizations)              │
                                                1:N  │  1:N
                                                     ▼
                                          invitations   forms
                                                          │
                                                     1:N  │  1:N
                                                          ▼
                                                questions   responses

response_emails (isolada, sem FK para responses)
```

## Estratégia geral

- **Embedding:** memberships em organizations, tokens em users (sempre lidos com o aggregate)
- **Reference:** questions separadas de forms (queries de analytics por pergunta), responses separadas (volume alto)
- **Soft delete:** não utilizado — exclusão física
- **Timestamps:** `createdAt` em todas; `updatedAt` em coleções editáveis
