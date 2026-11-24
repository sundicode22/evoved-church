import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY || "re_mock_key_for_development"
export const resend = new Resend(resendApiKey)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "welcome@evolvechms.org"

export interface SendWelcomeEmailParams {
  to: string
  visitorName: string
  churchName: string
  pastorName: string
  nextSundayTime: string
}

export interface SendExpenseAlertParams {
  to: string
  approverName: string
  requisitionNumber: string
  amount: string
  department: string
  vendor: string
  tierLevel: number
}

export interface SendTaxStatementParams {
  to: string
  donorName: string
  taxYear: string
  totalDeductible: string
  pdfDownloadUrl: string
}

export const emailService = {
  /**
   * Automated Drip Email 1: Welcome message sent 2 hours after QR check-in
   */
  async sendWelcomeDrip({
    to,
    visitorName,
    churchName,
    pastorName,
    nextSundayTime,
  }: SendWelcomeEmailParams) {
    return resend.emails.send({
      from: `${churchName} <${FROM_EMAIL}>`,
      to,
      subject: `Welcome to ${churchName}, ${visitorName}!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #16a34a; color: white; padding: 8px 16px; border-radius: 9999px; font-weight: bold; font-size: 14px;">
              ${churchName}
            </div>
          </div>
          <h2 style="font-size: 22px; font-weight: 700; color: #111827;">We're so glad you joined us, ${visitorName}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
            Thank you for worshipping with us. Whether you are exploring faith, looking for a church home, or simply visiting, we are honored you were here.
          </p>
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-weight: 600; font-size: 14px; color: #111827;">Join us next Sunday at ${nextSundayTime}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Our pastoral team would love to connect with you over coffee.</p>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Warmly in Christ,<br><strong>${pastorName} & The Pastoral Team</strong></p>
        </div>
      `,
    })
  },

  /**
   * Dynamic Expense Approval Notification to Pastoral / Finance Committee
   */
  async sendExpenseApprovalAlert({
    to,
    approverName,
    requisitionNumber,
    amount,
    department,
    vendor,
    tierLevel,
  }: SendExpenseAlertParams) {
    return resend.emails.send({
      from: `Finance Office <${FROM_EMAIL}>`,
      to,
      subject: `[Action Required] Expense Approval (${amount}) - Requisition ${requisitionNumber}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
          <h2 style="font-size: 18px; font-weight: 700; color: #111827;">Expense Sign-off Requisition: ${requisitionNumber}</h2>
          <p style="font-size: 14px; color: #4b5563;">Hello ${approverName}, your authorization is requested for a Tier ${tierLevel} expenditure:</p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Amount:</strong> <span style="color: #16a34a; font-size: 16px; font-weight: bold;">${amount}</span></p>
            <p style="margin: 4px 0;"><strong>Department:</strong> ${department}</p>
            <p style="margin: 4px 0;"><strong>Vendor:</strong> ${vendor}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/accounting/requisitions/${requisitionNumber}" style="display: inline-block; background-color: #16a34a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">Review & Approve Requisition</a>
        </div>
      `,
    })
  },

  /**
   * Generic campaign HTML email (Resend only — SMS uses a separate provider).
   */
  async sendRawCampaign({
    to,
    subject,
    html,
  }: {
    to: string
    subject: string
    html: string
  }): Promise<{ id: string }> {
    const result = await resend.emails.send({
      from: `Evolve Church <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    if (result.error) throw new Error(result.error.message)
    return { id: result.data?.id || `email-${Date.now()}` }
  },

  /**
   * 501(c)(3) Annual Charitable Contribution Statement
   */
  async sendTaxContributionStatement({
    to,
    donorName,
    taxYear,
    totalDeductible,
    pdfDownloadUrl,
  }: SendTaxStatementParams) {
    return resend.emails.send({
      from: `Giving & Stewardship <${FROM_EMAIL}>`,
      to,
      subject: `Your ${taxYear} Charitable Contribution Statement`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
          <h2 style="font-size: 20px; font-weight: 700;">Annual Giving Tax Statement (${taxYear})</h2>
          <p style="font-size: 14px; color: #4b5563;">Dear ${donorName},</p>
          <p style="font-size: 14px; color: #4b5563;">Thank you for your generous stewardship and partnership in ministry throughout ${taxYear}.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534;">Total 501(c)(3) Tax-Deductible Giving:</p>
            <p style="margin: 4px 0 0; font-size: 24px; font-weight: 800; color: #15803d;">${totalDeductible}</p>
          </div>
          <a href="${pdfDownloadUrl}" style="display: inline-block; background-color: #15803d; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">Download Official Tax PDF</a>
        </div>
      `,
    })
  },
}
