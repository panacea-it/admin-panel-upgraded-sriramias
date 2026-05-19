/** Client-side export helpers for finance reports */

function escapeCsv(val) {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportToCsv(filename, columns, rows) {
  const header = columns.map((c) => escapeCsv(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(c.export ? c.export(row) : row[c.key])).join(','))
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToExcel(filename, columns, rows) {
  const header = columns.map((c) => `<th>${c.label}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${c.export ? c.export(row) : row[c.key] ?? ''}</td>`).join('')}</tr>`,
    )
    .join('')
  const html = `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

export function printReport(title, columns, rows) {
  const w = window.open('', '_blank')
  if (!w) return
  const header = columns.map((c) => `<th style="padding:8px;border:1px solid #ccc">${c.label}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td style="padding:6px;border:1px solid #eee">${c.export ? c.export(row) : row[c.key] ?? ''}</td>`).join('')}</tr>`,
    )
    .join('')
  w.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:Poppins,sans-serif;padding:24px}h1{color:#246392}</style></head>
    <body><h1>${title}</h1><table style="width:100%;border-collapse:collapse">${header}${body}</table></body></html>
  `)
  w.document.close()
  w.print()
}

export function exportToPdfPlaceholder(filename) {
  window.print()
  return filename
}
