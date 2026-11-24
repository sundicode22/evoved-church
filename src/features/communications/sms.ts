/**
 * SMS provider — separate from Resend (email only).
 * Default adapter: Twilio. Swap providers by implementing SmsProvider.
 */

export type SmsSendResult = {
  providerId: string
  provider: "twilio" | "demo"
}

export interface SmsProvider {
  readonly name: string
  send(to: string, body: string): Promise<SmsSendResult>
}

class TwilioSmsProvider implements SmsProvider {
  readonly name = "twilio"

  async send(to: string, body: string): Promise<SmsSendResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_FROM_NUMBER

    if (!sid || !token || !from) {
      const providerId = `sms-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      console.info(`[sms:demo] provider=twilio-missing-env to=${to} id=${providerId}`)
      return { providerId, provider: "demo" }
    }

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: body.slice(0, 1600),
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Twilio SMS failed (${res.status}): ${text.slice(0, 200)}`)
    }

    const json = (await res.json()) as { sid: string }
    return { providerId: json.sid, provider: "twilio" }
  }
}

/** Active SMS provider — never Resend. Change this to swap vendors later. */
export const smsProvider: SmsProvider = new TwilioSmsProvider()

export const smsService = {
  async send(to: string, body: string): Promise<{ providerId: string }> {
    if (!to?.trim()) throw new Error("SMS recipient phone is required")
    if (!body?.trim()) throw new Error("SMS body is required")
    const result = await smsProvider.send(to.trim(), body.trim())
    return { providerId: result.providerId }
  },
}
