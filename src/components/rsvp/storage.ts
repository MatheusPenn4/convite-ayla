import type { SavedRsvp } from "@/lib/rsvp-types";

/**
 * Conveniência local apenas: lembra, neste aparelho, que houve uma confirmação.
 * O registro oficial fica no banco de dados.
 */
const CONFIRMED_KEY = "ayla:rsvp:confirmed";
const PENDING_KEY = "ayla:rsvp:pending-id";

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function readConfirmed(): SavedRsvp | null {
  return safe(() => {
    const raw = localStorage.getItem(CONFIRMED_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as SavedRsvp;
    if (typeof v?.name !== "string" || !Array.isArray(v.companions) || typeof v.total !== "number") return null;
    return v;
  }, null);
}

export function saveConfirmed(rsvp: SavedRsvp) {
  safe(() => localStorage.setItem(CONFIRMED_KEY, JSON.stringify(rsvp)), undefined);
}

export function clearConfirmed() {
  safe(() => localStorage.removeItem(CONFIRMED_KEY), undefined);
}

/** Identificador da tentativa em andamento: reaproveitado em novas tentativas para não duplicar. */
export function getPendingSubmissionId(): string {
  const existing = safe(() => localStorage.getItem(PENDING_KEY), null);
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  const id = newUuid();
  safe(() => localStorage.setItem(PENDING_KEY, id), undefined);
  return id;
}

export function clearPendingSubmissionId() {
  safe(() => localStorage.removeItem(PENDING_KEY), undefined);
}

function newUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
