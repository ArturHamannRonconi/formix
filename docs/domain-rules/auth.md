# Regras de Domínio — Auth

## Tokens de autenticação

Todos os tokens são estado do `UserAggregate` — **sem coleções separadas**:

| Token | Campo no User | Finder no IUserRepository |
|---|---|---|
| `EmailConfirmationTokenEntity` | `emailConfirmationToken` (object\|null) | `findByEmailConfirmationTokenHash(hash)` |
| `RefreshTokenEntity[]` | `refreshTokens` (array) | `findByRefreshTokenHash(hash)` |
| `PasswordResetTokenEntity` | `passwordResetToken` (object\|null) | `findByPasswordResetTokenHash(hash)` |

## Signup

- Cria User + Organization (com Membership admin embutida) atomicamente
- Gera `EmailConfirmationToken` embutido no User
- Envia email de confirmação; usuário não acessa funcionalidades até confirmar

## Login

- Valida email + senha; exige `emailConfirmed = true`
- Retorna access token JWT (payload: userId, organizationId, role) + refresh token bruto
- Adiciona `RefreshTokenEntity` ao array `user.refreshTokens`

## Refresh token rotation

- Refresh token é invalidado após uso (rotation)
- Token reapresentado após uso → toda a família (sessão) é invalidada (theft detection)
- `family` UUID agrupa todos os tokens de uma mesma sessão

## Confirmação de email

- Token expira em tempo configurável (`EMAIL_CONFIRMATION_EXPIRES_IN`)
- `user.confirmEmail()` define `emailConfirmed = true` e limpa `emailConfirmationToken`

## Reset de senha

- Usuário solicita informando email — resposta é sempre 200 (não revela existência)
- Token expira em tempo configurável (`PASSWORD_RESET_EXPIRES_IN`)
- Ao confirmar: `user.updatePassword()` + `user.clearPasswordResetToken()` + `user.invalidateAllRefreshTokens()`

## Logout

- Invalida a família inteira do refresh token (encerra a sessão no dispositivo)
- Idempotente: token não encontrado → 200 silencioso
