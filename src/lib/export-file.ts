/** Client-side file downloads for reports. */

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const body = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n")
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Opens a print-ready HTML document so the user can Save as PDF. */
export function downloadPdfDocument(title: string, headers: string[], rows: (string | number)[][]) {
  const escapeHtml = (v: string | number) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

  const thead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("")

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; color: #18181b; margin: 32px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    p { color: #71717a; font-size: 12px; margin: 0 0 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #e4e4e7; padding: 8px 10px; text-align: left; }
    th { background: #f4f4f5; font-weight: 600; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>Generated ${new Date().toLocaleString()} · Evolve ChMS</p>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody || `<tr><td colspan="${headers.length}">No rows</td></tr>`}</tbody>
  </table>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
}

/** Simple Word-compatible HTML document (.doc). */
export function downloadDoc(filename: string, title: string, headers: string[], rows: (string | number)[][]) {
  const escapeHtml = (v: string | number) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

  const thead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("")

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>Generated ${new Date().toLocaleString()}</p>
  <table border="1" cellspacing="0" cellpadding="4">
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
</body></html>`

  const blob = new Blob([html], { type: "application/msword" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".doc") ? filename : `${filename}.doc`
  a.click()
  URL.revokeObjectURL(url)
}
