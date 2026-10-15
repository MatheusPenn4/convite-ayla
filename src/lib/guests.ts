import "server-only";
import type { Pool, PoolClient } from "pg";

/**
 * Lista de convidados (quem foi convidado) e vínculo automático com as
 * confirmações recebidas pelo site.
 */

export type GuestSide = "mae" | "pai";
export type GuestStatus = "pendente" | "confirmado" | "nao_vai";

export type Guest = {
  id: string;
  side: GuestSide;
  section: string;
  household: string | null;
  name: string;
  note: string | null;
  is_child: boolean;
  /** Menos de 5 anos: fica na lista, mas não conta como convidado nos totais. */
  is_baby: boolean;
  is_placeholder: boolean;
  status: GuestStatus;
  confirmed_by: "site" | "manual" | null;
  confirmed_name: string | null;
  rsvp_id: string | null;
  position: number;
};

/** Tabela ainda não criada (antes de rodar o SQL novo): a lista fica vazia, sem erro. */
export function isMissingTable(err: unknown) {
  return (err as { code?: string } | null)?.code === "42P01";
}

const GUEST_COLUMNS = `id, side, section, household, name, note, is_child, is_placeholder, status,
                       confirmed_by, confirmed_name, rsvp_id, position`;

export async function fetchGuests(db: Pool): Promise<Guest[] | null> {
  const run = (extra: string) =>
    db.query<Guest>(`select ${GUEST_COLUMNS}${extra} from public.guests order by side, position, created_at`);
  try {
    return (await run(", is_baby")).rows;
  } catch (err) {
    if (isMissingTable(err)) return null;
    // Coluna "is_baby" ainda não criada (SQL novo não rodado): a lista funciona, sem a marcação.
    if ((err as { code?: string } | null)?.code === "42703") {
      return (await run(", false as is_baby")).rows;
    }
    throw err;
  }
}

/* ------------------------------------------------------------ comparação */

// Palavras que não ajudam a identificar a pessoa.
const IGNORED = new Set(["de", "da", "do", "das", "dos", "e", "pastor", "pastora", "tio", "tia"]);

export function nameTokens(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t && !IGNORED.has(t));
}

type Candidate = Pick<Guest, "id" | "household" | "is_placeholder" | "position"> & { tokens: string[] };
type Person = { index: number; name: string; tokens: string[] };

/**
 * Decide qual convidado da lista corresponde a cada nome confirmado.
 * Regras conservadoras: só vincula quando não há dúvida.
 *  1. Primeiro nome único na lista → vincula.
 *  2. Vários com o mesmo primeiro nome → vincula se o nome completo da lista
 *     (com sobrenome/apelido) aparece inteiro no nome digitado.
 *  3. Ainda empatado → desempata pela família de quem já foi vinculado no mesmo envio.
 *  4. Nomes que sobraram ocupam vagas sem nome da mesma família (ex.: "bebê do Gustavo").
 * O resto fica para os responsáveis vincularem no /admin.
 */
export function planMatches(names: string[], pending: Candidate[]): Map<number, string> {
  const people: Person[] = names.map((name, index) => ({ index, name, tokens: nameTokens(name) }));
  const named = pending.filter((g) => !g.is_placeholder && g.tokens.length);
  const result = new Map<number, string>();
  const used = new Set<string>();
  const households = () =>
    new Set(
      [...result.values()]
        .map((id) => pending.find((g) => g.id === id)?.household)
        .filter((h): h is string => Boolean(h)),
    );
  const sameFirst = (p: Person) => named.filter((g) => !used.has(g.id) && g.tokens[0] === p.tokens[0]);
  const assign = (p: Person, g: Candidate) => {
    result.set(p.index, g.id);
    used.add(g.id);
  };

  // 1 e 2
  for (const p of people) {
    if (!p.tokens.length) continue;
    const cands = sameFirst(p);
    if (cands.length === 1) {
      assign(p, cands[0]);
      continue;
    }
    const full = cands.filter((g) => g.tokens.length > 1 && g.tokens.every((t) => p.tokens.includes(t)));
    if (full.length === 1) assign(p, full[0]);
  }

  // 3: desempate pela família, repetindo enquanto houver progresso
  let changed = true;
  while (changed) {
    changed = false;
    const fam = households();
    for (const p of people) {
      if (result.has(p.index) || !p.tokens.length) continue;
      const cands = sameFirst(p).filter((g) => g.household && fam.has(g.household));
      if (cands.length === 1) {
        assign(p, cands[0]);
        changed = true;
      }
    }
  }

  // 4: vagas sem nome da mesma família
  const fam = households();
  const slots = pending
    .filter((g) => g.is_placeholder && g.household && fam.has(g.household) && !used.has(g.id))
    .sort((a, b) => a.position - b.position);
  for (const p of people) {
    if (result.has(p.index)) continue;
    const slot = slots.shift();
    if (!slot) break;
    assign(p, slot);
  }
  return result;
}

/** Vincula uma confirmação recebida aos convidados da lista. Nunca lança erro para o convidado. */
export async function linkRsvpToGuests(db: Pool, rsvpId: string, names: string[]) {
  const client = await db.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<Guest>(
      `select id, household, is_placeholder, position, name
         from public.guests where status = 'pendente'
        order by position for update`,
    );
    const pending = rows.map((g) => ({ ...g, tokens: nameTokens(g.name) }));
    const plan = planMatches(names, pending);
    for (const [index, guestId] of plan) {
      await client.query(
        `update public.guests
            set status = 'confirmado', confirmed_by = 'site', rsvp_id = $2, confirmed_name = $3
          where id = $1 and status = 'pendente'`,
        [guestId, rsvpId, names[index]],
      );
    }
    await client.query("commit");
    return plan.size;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    if (isMissingTable(err)) return 0;
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Desfaz vínculos de uma confirmação. Ao editar, só os automáticos (os feitos
 * à mão no admin continuam); ao excluir a confirmação, todos.
 */
export async function unlinkRsvp(db: Pool | PoolClient, rsvpId: string, scope: "automatic" | "all" = "automatic") {
  try {
    await db.query(
      `update public.guests
          set status = 'pendente', confirmed_by = null, rsvp_id = null, confirmed_name = null
        where rsvp_id = $1 and ($2 = 'all' or confirmed_by = 'site')`,
      [rsvpId, scope],
    );
  } catch (err) {
    if (!isMissingTable(err)) throw err;
  }
}
