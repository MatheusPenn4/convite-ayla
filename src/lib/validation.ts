import { eventConfig } from "@/config/event";

/**
 * Validação compartilhada entre navegador e servidor.
 *
 * Regras deliberadamente permissivas para não rejeitar nomes legítimos:
 * aceita acentos, nomes compostos, hífens, apóstrofos, partículas ("de", "da")
 * e qualquer alfabeto. Só exige ao menos uma letra e limita o tamanho.
 */

export const MAX_NAME_LENGTH = eventConfig.rsvp.maxNameLength;
export const MAX_COMPANIONS = eventConfig.rsvp.maxCompanions;
/** Tamanho máximo aceito para o corpo da requisição (bytes). */
export const MAX_BODY_BYTES = 8 * 1024;

// Caracteres de controle e de largura zero que não deveriam fazer parte de um nome.
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\u2060\uFEFF]/g;
const WHITESPACE = /[\s\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/g;
const HAS_LETTER = /\p{L}/u;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Normaliza Unicode, remove invisíveis e colapsa espaços excedentes. */
export function normalizeName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.normalize("NFC").replace(INVISIBLE, "").replace(WHITESPACE, " ").trim();
}

/** Retorna a mensagem de erro do nome, ou null quando válido. Recebe o nome já normalizado. */
export function nameError(name: string, kind: "primary" | "companion"): string | null {
  if (!name) {
    return kind === "primary" ? "Informe seu nome completo." : "Informe o nome deste familiar ou remova o campo.";
  }
  if ([...name].length > MAX_NAME_LENGTH) return `Use no máximo ${MAX_NAME_LENGTH} caracteres.`;
  if (!HAS_LETTER.test(name)) return "Digite um nome válido.";
  return null;
}

export function isSubmissionId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export type RsvpFieldErrors = {
  name?: string;
  companions?: (string | undefined)[];
  form?: string;
};

export type RsvpInput = { name: string; companions: string[] };

export type RsvpValidation =
  | { ok: true; data: RsvpInput }
  | { ok: false; errors: RsvpFieldErrors };

/** Valida e normaliza nome principal + familiares. */
export function validateRsvp(rawName: unknown, rawCompanions: unknown): RsvpValidation {
  const errors: RsvpFieldErrors = {};

  const name = normalizeName(rawName);
  const nErr = nameError(name, "primary");
  if (nErr) errors.name = nErr;

  if (rawCompanions != null && !Array.isArray(rawCompanions)) {
    return { ok: false, errors: { form: "Dados inválidos." } };
  }
  const list = (rawCompanions ?? []) as unknown[];
  if (list.length > MAX_COMPANIONS) {
    errors.form = `É possível incluir até ${MAX_COMPANIONS} familiares por confirmação.`;
  }

  const companions = list.slice(0, MAX_COMPANIONS).map(normalizeName);
  const companionErrors = companions.map((c) => nameError(c, "companion") ?? undefined);
  if (companionErrors.some(Boolean)) errors.companions = companionErrors;

  if (errors.name || errors.companions || errors.form) return { ok: false, errors };
  return { ok: true, data: { name, companions } };
}

/** Total calculado sempre a partir das pessoas informadas. */
export function countPeople(companions: readonly unknown[]): number {
  return 1 + companions.length;
}

export function peopleLabel(total: number): string {
  return total === 1 ? "1 pessoa" : `${total} pessoas`;
}
