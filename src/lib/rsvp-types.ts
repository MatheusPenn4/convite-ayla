import type { RsvpFieldErrors } from "./validation";

export type RsvpRequestBody = {
  submissionId: string;
  name: string;
  companions: string[];
  /** Campo-isca invisível: pessoas reais deixam vazio. */
  garden?: string;
};

export type SavedRsvp = { name: string; companions: string[]; total: number };

export type RsvpResponse =
  | { ok: true; rsvp: SavedRsvp; replayed: boolean }
  | {
      ok: false;
      code: "invalid" | "not_configured" | "rate_limited" | "forbidden" | "too_large" | "server_error";
      message: string;
      errors?: RsvpFieldErrors;
    };
