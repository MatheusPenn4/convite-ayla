import "server-only";
import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Pool } from "pg";
import { getDb } from "./db";

/**
 * Login da família na área /admin.
 *
 *  • Usuário e hash da senha ficam em variáveis de ambiente (nunca no código).
 *  • A senha é conferida no servidor com scrypt e comparação em tempo constante.
 *  • A sessão é um cookie httpOnly assinado (HMAC) e com validade; toda página,
 *    ação e exportação do /admin confere essa assinatura no servidor.
 *  • Trocar a senha (novo hash) invalida automaticamente as sessões antigas.
 */

const COOKIE = "ayla_admin";
const COOKIE_PATH = "/admin";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const SCRYPT = { N: 16384, r: 8, p: 1 } as const;

type AuthConfig = { username: string; salt: Buffer; key: Buffer; hash: string; secret: string };

export function getMissingConfig(): string[] {
  const missing: string[] = [];
  if (!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) missing.push("DATABASE_URL");
  if (!process.env.ADMIN_USERNAME?.trim()) missing.push("ADMIN_USERNAME");
  if (!parseHash(process.env.ADMIN_PASSWORD_HASH)) missing.push("ADMIN_PASSWORD_HASH");
  if ((process.env.AUTH_SECRET ?? "").length < 32) missing.push("AUTH_SECRET");
  return missing;
}

function parseHash(raw: string | undefined) {
  const [scheme, salt, key] = (raw ?? "").trim().split(":");
  if (scheme !== "scrypt" || !salt || !key) return null;
  return { salt: Buffer.from(salt, "base64url"), key: Buffer.from(key, "base64url") };
}

function getAuthConfig(): AuthConfig | null {
  const username = process.env.ADMIN_USERNAME?.trim();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  const parsed = parseHash(hash);
  const secret = process.env.AUTH_SECRET ?? "";
  if (!username || !parsed || secret.length < 32) return null;
  return { username, hash, secret, ...parsed };
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export function verifyCredentials(username: string, password: string): boolean {
  const cfg = getAuthConfig();
  if (!cfg) return false;
  // Sempre calcula o scrypt, mesmo com usuário errado (evita revelar qual campo falhou).
  const derived = scryptSync(password.normalize("NFC"), cfg.salt, cfg.key.length, SCRYPT);
  const userOk = timingSafeEqual(
    digest(username.trim().toLocaleLowerCase("pt-BR")),
    digest(cfg.username.toLocaleLowerCase("pt-BR")),
  );
  const passOk = derived.length === cfg.key.length && timingSafeEqual(derived, cfg.key);
  return userOk && passOk;
}

function sign(cfg: AuthConfig, payload: string) {
  return createHmac("sha256", cfg.secret).update(payload).digest("base64url");
}

/** Versão da credencial: muda quando o hash da senha muda. */
function credentialVersion(cfg: AuthConfig) {
  return createHmac("sha256", cfg.secret).update(`v:${cfg.username}:${cfg.hash}`).digest("base64url").slice(0, 16);
}

export async function createSession() {
  const cfg = getAuthConfig();
  if (!cfg) throw new Error("auth_not_configured");
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS, v: credentialVersion(cfg) }),
  ).toString("base64url");
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(cfg, payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: COOKIE_PATH, maxAge: 0 });
}

async function hasValidSession(cfg: AuthConfig): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(cfg, payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number; v?: string };
    return typeof data.exp === "number" && data.exp > Date.now() / 1000 && data.v === credentialVersion(cfg);
  } catch {
    return false;
  }
}

export type AdminContext =
  | { status: "not_configured"; missing: string[] }
  | { status: "anonymous" }
  | { status: "ok"; db: Pool };

/** Confere no servidor se há sessão válida de responsável. */
export async function getAdminContext(): Promise<AdminContext> {
  const cfg = getAuthConfig();
  const db = getDb();
  if (!cfg || !db) return { status: "not_configured", missing: getMissingConfig() };
  if (!(await hasValidSession(cfg))) return { status: "anonymous" };
  return { status: "ok", db };
}

export type AdminRow = {
  id: string;
  primary_name: string;
  companions: string[];
  total_people: number;
  created_at: string;
  updated_at: string;
};

export async function fetchRsvps(db: Pool, ascending = false): Promise<AdminRow[]> {
  const { rows } = await db.query<{
    id: string;
    primary_name: string;
    companions: string[];
    total_people: number;
    created_at: Date;
    updated_at: Date;
  }>(
    `select id, primary_name, companions, total_people, created_at, updated_at
       from public.rsvps
      order by created_at ${ascending ? "asc" : "desc"}`,
  );
  return rows.map((r) => ({
    ...r,
    created_at: new Date(r.created_at).toISOString(),
    updated_at: new Date(r.updated_at).toISOString(),
  }));
}
