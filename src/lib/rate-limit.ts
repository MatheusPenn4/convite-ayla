import "server-only";
import { createHmac } from "node:crypto";
import type { Pool } from "pg";

/** IP do visitante informado pela Vercel (x-forwarded-for / x-real-ip). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

const LIMITS = {
  rsvp: { max: 10, windowSeconds: 10 * 60 },
  login: { max: 8, windowSeconds: 15 * 60 },
} as const;

/**
 * Limite persistente no banco (funciona entre instâncias serverless).
 * O IP é transformado em HMAC com segredo próprio; o IP real não é gravado.
 * Retorna true quando a tentativa pode prosseguir.
 */
export async function allowAttempt(db: Pool, headers: Headers, scope: keyof typeof LIMITS): Promise<boolean> {
  const { max, windowSeconds } = LIMITS[scope];
  const secret = process.env.AUTH_SECRET || process.env.DATABASE_URL || "";
  const bucket = `${scope}:` + createHmac("sha256", secret).update(clientIp(headers)).digest("hex").slice(0, 40);
  const { rows } = await db.query<{ ok: boolean }>("select public.rate_limit_hit($1, $2, $3) as ok", [
    bucket,
    max,
    windowSeconds,
  ]);
  return rows[0]?.ok === true;
}
