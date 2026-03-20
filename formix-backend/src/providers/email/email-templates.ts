import { EmailTemplate } from './email.provider';

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
`;

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${BASE_STYLES}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#6366f1; border-radius:12px; padding: 10px 20px;">
                    <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">Formix</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff; border-radius:16px; padding:40px 40px 32px; box-shadow:0 1px 3px rgba(0,0,0,0.07);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="color:#94a3b8; font-size:12px; line-height:1.6;">
                Este email foi enviado automaticamente pelo Formix.<br/>
                Por favor, não responda a este email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function ctaButton(label: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin: 32px auto 0;">
      <tr>
        <td align="center" style="background:#6366f1; border-radius:8px;">
          <a href="${url}" target="_blank"
            style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; letter-spacing:0.1px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function fallbackLink(url: string): string {
  return `
    <p style="margin-top:24px; font-size:12px; color:#94a3b8; text-align:center; word-break:break-all;">
      Se o botão não funcionar, copie e cole este link no navegador:<br/>
      <a href="${url}" style="color:#6366f1;">${url}</a>
    </p>
  `;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function emailConfirmationHtml(data: Record<string, unknown>): string {
  const url = String(data.confirmationUrl ?? '#');
  const firstName = data.name ? String(data.name).split(' ')[0] : null;
  const greeting = firstName ? `Olá, <strong style="color:#0f172a;">${firstName}</strong>!` : 'Olá!';
  return layout(`
    <!-- Icon -->
    <div style="text-align:center; margin-bottom:24px;">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:#ede9fe; border-radius:50%;">
        <span style="font-size:28px;">✉️</span>
      </div>
    </div>

    <!-- Title -->
    <h1 style="text-align:center; color:#0f172a; font-size:22px; font-weight:700; margin-bottom:12px;">
      Confirme seu e-mail
    </h1>

    <!-- Body -->
    <p style="text-align:center; color:#64748b; font-size:15px; line-height:1.7; margin-bottom:8px;">
      ${greeting} Bem-vindo ao <strong style="color:#6366f1;">Formix</strong>!
    </p>
    <p style="text-align:center; color:#64748b; font-size:15px; line-height:1.7;">
      Sua conta foi criada com sucesso. Clique no botão abaixo para confirmar seu e-mail e ativar sua conta.
    </p>

    ${ctaButton('Confirmar e-mail', url)}

    <!-- Expiration note -->
    <p style="margin-top:20px; text-align:center; font-size:13px; color:#94a3b8;">
      Este link expira em <strong>24 horas</strong>.
    </p>

    ${fallbackLink(url)}

    <!-- Divider -->
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0;" />

    <p style="font-size:12px; color:#94a3b8; text-align:center;">
      Se você não criou esta conta, pode ignorar este e-mail com segurança.
    </p>
  `);
}

function invitationHtml(data: Record<string, unknown>): string {
  const url = String(data.inviteUrl ?? data.inviteLink ?? '#');
  const inviterName = String(data.inviterName ?? data.inviteeName ?? 'Um membro da equipe');
  const organizationName = String(data.organizationName ?? 'uma organização');
  return layout(`
    <!-- Icon -->
    <div style="text-align:center; margin-bottom:24px;">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:#ede9fe; border-radius:50%;">
        <span style="font-size:28px;">🎉</span>
      </div>
    </div>

    <!-- Title -->
    <h1 style="text-align:center; color:#0f172a; font-size:22px; font-weight:700; margin-bottom:12px;">
      Você foi convidado!
    </h1>

    <!-- Body -->
    <p style="text-align:center; color:#64748b; font-size:15px; line-height:1.7; margin-bottom:8px;">
      <strong style="color:#0f172a;">${inviterName}</strong> convidou você para fazer parte de
    </p>

    <!-- Organization highlight -->
    <div style="text-align:center; margin:16px 0 8px;">
      <div style="display:inline-block; background:#f5f3ff; border:1px solid #ddd6fe; border-radius:10px; padding:10px 24px;">
        <span style="color:#6366f1; font-size:17px; font-weight:700;">${organizationName}</span>
      </div>
    </div>

    <p style="text-align:center; color:#64748b; font-size:15px; line-height:1.7; margin-top:12px;">
      Aceite o convite e comece a colaborar na criação de formulários e análise de respostas.
    </p>

    ${ctaButton('Aceitar convite', url)}

    <!-- Expiration note -->
    <p style="margin-top:20px; text-align:center; font-size:13px; color:#94a3b8;">
      Este convite expira em <strong>7 dias</strong>.
    </p>

    ${fallbackLink(url)}

    <!-- Divider -->
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0;" />

    <p style="font-size:12px; color:#94a3b8; text-align:center;">
      Se você não esperava este convite, pode ignorar este e-mail com segurança.
    </p>
  `);
}

function passwordResetHtml(data: Record<string, unknown>): string {
  const url = String(data.resetUrl ?? '#');
  return layout(`
    <!-- Icon -->
    <div style="text-align:center; margin-bottom:24px;">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:#ede9fe; border-radius:50%;">
        <span style="font-size:28px;">🔑</span>
      </div>
    </div>

    <!-- Title -->
    <h1 style="text-align:center; color:#0f172a; font-size:22px; font-weight:700; margin-bottom:12px;">
      Redefinição de senha
    </h1>

    <!-- Body -->
    <p style="text-align:center; color:#64748b; font-size:15px; line-height:1.7; margin-bottom:8px;">
      Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color:#6366f1;">Formix</strong>.
    </p>
    <p style="text-align:center; color:#64748b; font-size:15px; line-height:1.7;">
      Clique no botão abaixo para criar uma nova senha.
    </p>

    ${ctaButton('Redefinir senha', url)}

    <!-- Expiration note -->
    <p style="margin-top:20px; text-align:center; font-size:13px; color:#94a3b8;">
      Este link expira em <strong>1 hora</strong>.
    </p>

    ${fallbackLink(url)}

    <!-- Divider -->
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0;" />

    <!-- Security warning -->
    <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:14px 18px;">
      <p style="font-size:13px; color:#92400e; line-height:1.6;">
        ⚠️ <strong>Não solicitou isso?</strong> Ignore este e-mail. Sua senha não será alterada.
        Se isso parecer suspeito, entre em contato com o suporte.
      </p>
    </div>
  `);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const EMAIL_HTML_TEMPLATES: Record<
  EmailTemplate,
  { subject: string; buildHtml: (data: Record<string, unknown>) => string; buildText: (data: Record<string, unknown>) => string }
> = {
  [EmailTemplate.EMAIL_CONFIRMATION]: {
    subject: 'Confirme seu e-mail — Formix',
    buildHtml: emailConfirmationHtml,
    buildText: (data) => `Confirme seu e-mail no Formix:\n${data.confirmationUrl}`,
  },
  [EmailTemplate.INVITATION]: {
    subject: 'Você foi convidado para o Formix',
    buildHtml: invitationHtml,
    buildText: (data) => `Você foi convidado para ${data.organizationName}.\nAceite o convite: ${data.inviteLink ?? data.inviteUrl}`,
  },
  [EmailTemplate.PASSWORD_RESET]: {
    subject: 'Redefinição de senha — Formix',
    buildHtml: passwordResetHtml,
    buildText: (data) => `Redefina sua senha no Formix:\n${data.resetUrl}`,
  },
};
