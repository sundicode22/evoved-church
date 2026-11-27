import { ImageResponse } from "next/og"

export const alt = "Evolve Church Management System"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(145deg, #fbfcfb 0%, #eef3fc 45%, #f0fdf4 100%)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#6495ed",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#09090b" }}>Evolve</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 650, color: "#09090b", letterSpacing: -1.5, lineHeight: 1.05 }}>
            Church management for multi-location teams
          </div>
          <div style={{ fontSize: 28, color: "#52525b", maxWidth: 820 }}>
            People, visitors, giving, calendar, and campaigns in one calm workspace.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, color: "#3f3f46", fontSize: 20 }}>
          <span>Members</span>
          <span>·</span>
          <span>Visitors</span>
          <span>·</span>
          <span>Giving</span>
          <span>·</span>
          <span>Calendar</span>
          <span>·</span>
          <span>Campaigns</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
