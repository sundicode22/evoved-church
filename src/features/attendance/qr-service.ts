import QRCode from "qrcode"

export interface GenerateQRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

export const qrService = {
  /**
   * Generates a Data URL QR Code for digital connection cards, check-in kiosks, or giving
   */
  async generateDataUrl(
    payload: string,
    options: GenerateQRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions = {
      width: options.width || 320,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || "#6495ed", // Leaf emerald green default
        light: options.color?.light || "#ffffff",
      },
    }

    return QRCode.toDataURL(payload, defaultOptions)
  },

  /**
   * Generates a digital connection card URL for new guests
   */
  getConnectionCardUrl(campusSlug: string, baseUrl?: string): string {
    const host = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://evolvechms.org"
    return `${host}/welcome/${campusSlug}`
  },

  /**
   * Generates a fast Sunday check-in token URL
   */
  getCheckinUrl(sessionId: string, baseUrl?: string): string {
    const host = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://evolvechms.org"
    return `${host}/checkin/${sessionId}`
  },

  /**
   * Generates a 4-character alphanumeric security pickup code for child check-in
   */
  generateChildSecurityCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excludes ambiguous characters (0/O, 1/I)
    let code = ""
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  },
}
