"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearSession, createSession, getAdminContext, getMissingConfig, verifyCredentials } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { allowAttempt } from "@/lib/rate-limit";
import { linkRsvpToGuests, unlinkRsvp } from "@/lib/guests";
import { nameError, normalizeName, validateRsvp, type RsvpFieldErrors } from "@/lib/validation";

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
    // Refaz os vínculos com a lista de convidados a partir dos nomes corrigidos.
    await unlinkRsvp(ctx.db, id);
    await linkRsvpToGuests(ctx.db, id, [v.data.name, ...v.data.companions]);
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
    // Quem estava confirmado por esta confirmação volta a ficar pendente na lista.
    await unlinkRsvp(ctx.db, id, "all");
    const { rowCount } = await ctx.db.query("delete from public.rsvps where id = $1::uuid", [id]);
    if (!rowCount) return { ok: false, message: "Registro não encontrado (talvez já tenha sido excluído)." };
  } catch {
    return { ok: false, message: "Não foi possível excluir. Tente novamente." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

/* ------------------------------------------------------------------ lista de convidados */

const SIDES = new Set(["mae", "pai"]);
const STATUSES = new Set(["pendente", "confirmado", "nao_vai"]);
const clip = (v: unknown, max: number) => (typeof v === "string" ? normalizeName(v).slice(0, max) : "");

export async function setGuestStatus(id: string, status: string): Promise<MutationResult> {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") return { ok: false, message: EXPIRED };
  if (!UUID.test(id) || !STATUSES.has(status)) return { ok: false, message: "Dados inválidos." };
  try {
    if (status === "confirmado") {
      await ctx.db.query(
        `update public.guests set status = 'confirmado', confirmed_by = coalesce(confirmed_by, 'manual') where id = $1::uuid`,
        [id],
      );
    } else {
      await ctx.db.query(
        `update public.guests set status = $2, confirmed_by = null, rsvp_id = null, confirmed_name = null where id = $1::uuid`,
        [id, status],
      );
    }
  } catch {
    return { ok: false, message: "Não foi possível atualizar. Tente novamente." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export type GuestInput = {
  side: string;
  section: string;
  household: string | null;
  name: string;
  note: string;
  isChild: boolean;
};

export async function saveGuest(id: string | null, input: GuestInput): Promise<MutationResult> {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") return { ok: false, message: EXPIRED };
  if (id !== null && !UUID.test(id)) return { ok: false, message: "Registro inválido." };
  if (!SIDES.has(input.side)) return { ok: false, message: "Escolha a lista (mãe ou pai)." };
  const name = normalizeName(input.name);
  const err = nameError(name, "primary");
  if (err) return { ok: false, message: err === "Informe seu nome completo." ? "Informe o nome do convidado." : err };
  const note = clip(input.note, 120) || null;
  const section = clip(input.section, 60);
  const household = input.household ? clip(input.household, 60) || null : null;

  try {
    if (id) {
      const { rowCount } = await ctx.db.query(
        `update public.guests set name = $2, note = $3, is_child = $4, is_placeholder = false where id = $1::uuid`,
        [id, name, note, input.isChild === true],
      );
      if (!rowCount) return { ok: false, message: "Convidado não encontrado." };
    } else {
      await ctx.db.query(
        `insert into public.guests (side, section, household, name, note, is_child, position)
         values ($1, $2, $3, $4, $5, $6,
                 coalesce((select max(position) + 1 from public.guests where side = $1), 0))`,
        [input.side, section, household, name, note, input.isChild === true],
      );
    }
  } catch {
    return { ok: false, message: "Não foi possível salvar. Tente novamente." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteGuest(id: string): Promise<MutationResult> {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") return { ok: false, message: EXPIRED };
  if (!UUID.test(id)) return { ok: false, message: "Registro inválido." };
  try {
    await ctx.db.query("delete from public.guests where id = $1::uuid", [id]);
  } catch {
    return { ok: false, message: "Não foi possível remover. Tente novamente." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

/** Vincula um nome confirmado no site a um convidado da lista (ou cria o convidado). */
export async function linkConfirmedName(
  rsvpId: string,
  confirmedName: string,
  target: { guestId: string } | { side: string },
): Promise<MutationResult> {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") return { ok: false, message: EXPIRED };
  if (!UUID.test(rsvpId)) return { ok: false, message: "Registro inválido." };
  const name = normalizeName(confirmedName).slice(0, 120);
  if (!name) return { ok: false, message: "Nome inválido." };
  try {
    if ("guestId" in target) {
      if (!UUID.test(target.guestId)) return { ok: false, message: "Escolha um convidado." };
      const { rowCount } = await ctx.db.query(
        `update public.guests
            set status = 'confirmado', confirmed_by = 'manual', rsvp_id = $2::uuid, confirmed_name = $3
          where id = $1::uuid`,
        [target.guestId, rsvpId, name],
      );
      if (!rowCount) return { ok: false, message: "Convidado não encontrado." };
    } else {
      if (!SIDES.has(target.side)) return { ok: false, message: "Escolha a lista (mãe ou pai)." };
      await ctx.db.query(
        `insert into public.guests (side, section, name, note, status, confirmed_by, rsvp_id, confirmed_name, position)
         values ($1, 'Incluídos depois', $2, null, 'confirmado', 'manual', $3::uuid, $2,
                 coalesce((select max(position) + 1 from public.guests where side = $1), 0))`,
        [target.side, name, rsvpId],
      );
    }
  } catch {
    return { ok: false, message: "Não foi possível vincular. Tente novamente." };
  }
  revalidatePath("/admin");
  return { ok: true };
}
