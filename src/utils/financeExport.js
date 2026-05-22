export function exportToCsv(rows, filename = 'export.csv') {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Excel-compatible export (CSV with .xls extension) */
export function exportToExcel(rows, filename = 'export.xls') {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join('\t'), ...rows.map((row) => headers.map((h) => escape(row[h])).join('\t'))]
  const blob = new Blob([lines.join('\n')], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function printReport(title = 'Finance Report', contentHtml = '') {
  const win = window.open('', '_blank')
  if (!win) {
    window.print()
    return
  }
  win.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:Inter,sans-serif;padding:24px;} table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #e2e8f0;padding:8px;text-align:left;}</style></head>
    <body><h1>${title}</h1>${contentHtml}</body></html>
  `)
  win.document.close()
  win.focus()
  win.print()
}
