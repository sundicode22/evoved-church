import { resend } from "@/features/communications/resend"
import type { DemoInterestInput } from "./schemas"

const FROM = process.env.RESEND_FROM_EMAIL || "hello@evolvechms.org"
const OWNERS =
  process.env.OWNER_NOTIFY_EMAIL ||
  process.env.MARKETING_NOTIFY_EMAIL ||
  "owners@evolvechms.org"

const INTEREST_LABEL: Record<DemoInterestInput["interest"], string> = {
  demo: "Book a demo",
  subscribe: "Stay in the loop",
  pricing: "Pricing question",
  migration: "Migration help",
}

export const marketingService = {
  async submitInterest(input: DemoInterestInput) {
    const owners = OWNERS.split(",")
      .map((e) => e.trim())
      .filter(Boolean)

    const subject = `[Evolve] ${INTEREST_LABEL[input.interest]} — ${input.churchName}`
    const html = `
      <div style="font-family:Inter,ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:20px;">
          <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:#6495ed;color:#fff;text-align:center;line-height:32px;font-weight:600;font-size:14px;">E</span>
          <strong>Evolve ChMS</strong>
        </div>
        <h1 style="font-size:18px;font-weight:600;margin:0 0 12px;">New landing interest</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#71717a;width:140px;">Interest</td><td style="padding:8px 0;font-weight:500;">${INTEREST_LABEL[input.interest]}</td></tr>
          <tr><td style="padding:8px 0;color:#71717a;">Name</td><td style="padding:8px 0;">${escapeHtml(input.name)}</td></tr>
          <tr><td style="padding:8px 0;color:#71717a;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#71717a;">Church</td><td style="padding:8px 0;">${escapeHtml(input.churchName)}</td></tr>
          ${input.phone ? `<tr><td style="padding:8px 0;color:#71717a;">Phone</td><td style="padding:8px 0;">${escapeHtml(input.phone)}</td></tr>` : ""}
          ${input.locationsCount ? `<tr><td style="padding:8px 0;color:#71717a;">Locations</td><td style="padding:8px 0;">${escapeHtml(input.locationsCount)}</td></tr>` : ""}
        </table>
        ${
          input.message
            ? `<div style="margin-top:16px;padding:12px 14px;background:#f4f4f5;border-radius:10px;font-size:14px;line-height:1.55;color:#3f3f46;">${escapeHtml(input.message)}</div>`
            : ""
        }
      </div>
    `

    if (!process.env.RESEND_API_KEY) {
      console.info("[marketing] interest (dev mock)", { to: owners, input })
      return { id: "dev-mock", delivered: false as const }
    }

    const result = await resend.emails.send({
      from: `Evolve Landing <${FROM}>`,
      to: owners,
      replyTo: input.email,
      subject,
      html,
    })

    // Optional confirmation to the prospect
    await resend.emails
      .send({
        from: `Evolve <${FROM}>`,
        to: input.email,
        subject: "We received your Evolve request",
        html: `
          <div style="font-family:Inter,ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;">
            <h1 style="font-size:18px;font-weight:600;">Thanks, ${escapeHtml(input.name)}</h1>
            <p style="font-size:14px;line-height:1.6;color:#52525b;">
              We got your note about <strong>${escapeHtml(input.churchName)}</strong>
              (${INTEREST_LABEL[input.interest]}). An Evolve teammate will follow up shortly.
            </p>
          </div>
        `,
      })
      .catch(() => null)

    return { id: result.data?.id || "sent", delivered: true as const }
  },
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
