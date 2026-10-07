/**
 * CSV compatível com Excel em português (separador ";", UTF-8 com BOM para
 * preservar acentos) e protegido contra injeção de fórmulas em planilhas.
 */
export const CSV_SEPARATOR = ";";

const FORMULA_START = /^[=+\-@\t\r\uFF1D\uFF0B\uFF0D\uFF20]/;

export function csvCell(value: string | number): string {
  let text = String(value ?? "");
  // Nomes que começam com = + - @ seriam interpretados como fórmula.
  if (typeof value === "string" && FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Array<Array<string | number>>): string {
  return "\uFEFF" + rows.map((r) => r.map(csvCell).join(CSV_SEPARATOR)).join("\r\n") + "\r\n";
}
