function safeCell(value: unknown) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "\uFEFFNo records\r\n";
  const headers = Object.keys(rows[0]);
  return `\uFEFF${headers.map(safeCell).join(",")}\r\n${rows.map(row => headers.map(header => safeCell(row[header])).join(",")).join("\r\n")}\r\n`;
}
