# Regras de Domínio — Auth

## Signup

- Ao criar conta, o sistema cria: User + Organization + Membership (role: admin)
- O primeiro usuário de uma organização é sempre admin
- Email de confirmação é enviado após signup
- Usuário não pode acessar funcionalidades até confirmar email

## Login

- Autenticação por email + senha
- Retorna access token (JWT, curta duração) + refresh token (longa duração)
- Access token contém: userId, organizationId, role

## Refresh token

- Usado para obter novo access token sem re-login
- Refresh token é invalidado após uso (rotation)

## Reset de senha

- Usuário solicita reset informando email
- Sistema envia email com link contendo token temporário
- Token expira em tempo configurável
- Ao confirmar, senha é atualizada e todos os refresh tokens são invalidados

## Confirmação de email

- Token único enviado por email
- Expira em tempo configurável
- Após confirmação, `emailConfirmed = true`
