import { resend } from "@/features/communications/resend"

const FROM = process.env.RESEND_FROM_EMAIL || "auth@evolvechms.org"
const APP_NAME = "Evolve ChMS"

function wrap(title: string, bodyHtml: string) {
  return `
    <div style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;">
        <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:#16a34a;color:#fff;text-align:center;line-height:32px;font-weight:600;font-size:14px;">E</span>
        <strong style="font-size:15px;letter-spacing:-0.02em;">${APP_NAME}</strong>
      </div>
      <h1 style="font-size:20px;font-weight:600;letter-spacing:-0.02em;margin:0 0 12px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#a1a1aa;">If you didn’t request this, you can ignore this email.</p>
    </div>
  `
}

export async function sendAuthResetPasswordEmail(params: {
  to: string
  name?: string
  url: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[auth-email] reset password →", params.to, params.url)
    return { id: "dev-mock" }
  }
  return resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: params.to,
    subject: `Reset your ${APP_NAME} password`,
    html: wrap(
      "Reset your password",
      `<p style="font-size:14px;line-height:1.6;color:#52525b;">Hi${params.name ? ` ${params.name}` : ""}, click the button below to choose a new password. This link expires in one hour.</p>
       <p style="margin:28px 0;"><a href="${params.url}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;">Choose new password</a></p>
       <p style="font-size:12px;color:#71717a;word-break:break-all;">Or paste this link:<br/>${params.url}</p>`
    ),
  })
}

export async function sendAuthVerificationEmail(params: {
  to: string
  name?: string
  url: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[auth-email] verify email →", params.to, params.url)
    return { id: "dev-mock" }
  }
  return resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: params.to,
    subject: `Verify your email for ${APP_NAME}`,
    html: wrap(
      "Confirm your email",
      `<p style="font-size:14px;line-height:1.6;color:#52525b;">Hi${params.name ? ` ${params.name}` : ""}, confirm your email to finish setting up your church workspace.</p>
       <p style="margin:28px 0;"><a href="${params.url}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;">Verify email</a></p>
       <p style="font-size:12px;color:#71717a;word-break:break-all;">Or paste this link:<br/>${params.url}</p>`
    ),
  })
}
