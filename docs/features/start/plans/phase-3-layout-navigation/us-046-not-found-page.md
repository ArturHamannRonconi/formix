# US-046: Página 404

## Metadados

| Campo | Valor |
|---|---|
| **Feature** | Fase 3: Layout e Navegação |
| **Status** | Pendente |
| **Depende de** | US-045 (Rotas — route groups já configurados) |
| **Bloqueia** | — |

## Contexto

Cria a página 404 do Next.js App Router usando o arquivo especial `not-found.tsx`. Exibe mensagem amigável com link para voltar à home. É a última US da Fase 3 e pode ser implementada em minutos após as rotas estarem configuradas.

## Arquivos

### Criar

| Arquivo | Descrição |
|---|---|
| `formix-frontend/src/app/not-found.tsx` | Página 404 padrão do Next.js App Router. Exibe código "404", título, descrição e link para `/forms` |
| `formix-frontend/src/app/not-found.module.css` | Estilos da página 404 (centralizado, tipografia, link estilizado) |

## Passos de Implementação

1. [impl] `not-found.tsx` — página com mensagem e link para home
2. [impl] `not-found.module.css` — estilos

## Critérios de Aceitação

- [ ] Acessar URL inexistente (ex: `/rota-que-nao-existe`) exibe a página 404
- [ ] Página exibe código "404" e mensagem descritiva
- [ ] Link "Voltar para a home" aponta para `/forms`
- [ ] Página é acessível (heading semântico, link com texto descritivo)
- [ ] `npm run typecheck` passa
- [ ] `npm run build` sucesso

## Próximas USs

- Fase 4: US-017 (Perfil Backend), US-018 (Perfil Frontend)
