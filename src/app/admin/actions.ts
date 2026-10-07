"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearSession, createSession, getAdminContext, getMissingConfig, verifyCredentials } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { allowAttempt } from "@/lib/rate-limit";
import { validateRsvp, type RsvpFieldErrors } from "@/lib/validation";

export type LoginState = { error: string | null; username?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().slice(0, 100);
  const password = String(formData.get("password") ?? "");
  const db = getDb();
  if (!db || getMissingConfig().length) return { error: "A área administrativa ainda não foi configurada.", username };
  if (!username || !password) return { error: "Informe login e senha.", username };
  if (password.length > 200) return { error: "Login ou senha inválidos.", username };

  try {
    if (!(await allowAttempt(db, await headers(), "login"))) {
      return { error: "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.", username };
    }
  } catch {
    return { error: "Não foi possível conectar ao banco. Tente novamente.", username };
  }

  if (!verifyCredentials(username, password)) return { error: "Login ou senha inválidos.", username };

  await createSession();
  redirect("/admin");
}

export async function signOut() {
  await clearSession();
  redirect("/admin/login");
}

export type MutationResult = { ok: true } | { ok: false; message: string; errors?: RsvpFieldErrors };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPIRED = "Sessão expirada. Entre novamente.";

export async function updateRsvp(id: string, name: string, companions: string[]): Promise<MutationResult> {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") return { ok: false, message: EXPIRED };
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false, message: "Registro inválido." };

  const v = validateRsvp(name, companions);
  if (!v.ok) return { ok: false, message: "Confira os nomes destacados.", errors: v.errors };

  try {
    const { rowCount } = await ctx.db.query(
      "update public.rsvps set primary_name = $2, companions = $3::text[] where id = $1::uuid",
      [id, v.data.name, v.data.companions],
    );
    if (!rowCount) return { ok: false, message: "Registro não encontrado (talvez já tenha sido excluído)." };
  } catch {
    return { ok: false, message: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteRsvp(id: string): Promise<MutationResult> {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") return { ok: false, message: EXPIRED };
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false, message: "Registro inválido." };

  try {
    const { rowCount } = await ctx.db.query("delete from public.rsvps where id = $1::uuid", [id]);
    if (!rowCount) return { ok: false, message: "Registro não encontrado (talvez já tenha sido excluído)." };
  } catch {
    return { ok: false, message: "Não foi possível excluir. Tente novamente." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
