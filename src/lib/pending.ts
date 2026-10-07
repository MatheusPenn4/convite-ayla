/**
 * Um campo está pendente quando está vazio ou ainda contém o marcador entre
 * colchetes (ex.: "[NOME DO LOCAL]"). Campos pendentes nunca são exibidos.
 */
export function isPending(value: string | null | undefined): value is null | undefined {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || /^\[.*\]$/.test(trimmed);
}

export function filled(value: string | null | undefined): string | null {
  return isPending(value) ? null : value!.trim();
}
