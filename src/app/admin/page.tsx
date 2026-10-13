import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { fetchRsvps, getAdminContext, type AdminRow } from "@/lib/admin-auth";
import { fetchGuests, type Guest } from "@/lib/guests";
import { AdminDashboard } from "./AdminDashboard";
import { GuestList, type UnlinkedName } from "./GuestList";
import { signOut } from "./actions";

/** Nomes confirmados no site que ainda não correspondem a ninguém da lista. */
function findUnlinked(rows: AdminRow[], guests: Guest[]): UnlinkedName[] {
  const out: UnlinkedName[] = [];
  for (const r of rows) {
    const linked = guests.filter((g) => g.rsvp_id === r.id).map((g) => g.confirmed_name ?? "");
    for (const name of [r.primary_name, ...r.companions]) {
      const i = linked.indexOf(name);
      if (i >= 0) linked.splice(i, 1);
      else out.push({ rsvpId: r.id, name, primary: r.primary_name });
    }
  }
  return out;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await connection();
  const ctx = await getAdminContext();

  if (ctx.status === "not_configured") {
    return (
      <main className="admin-shell admin-shell--narrow">
        <h1 className="admin-title">Lista de presença</h1>
        <p className="admin-alert" role="alert">
          A área administrativa ainda não foi configurada. Defina as variáveis de ambiente: {ctx.missing.join(", ")}{" "}
          (veja o README).
        </p>
      </main>
    );
  }
  if (ctx.status !== "ok") redirect("/admin/login");

  const { aba } = await searchParams;
  const tab = aba === "confirmacoes" ? "confirmacoes" : "convidados";

  let rows: AdminRow[] = [];
  let guests: Guest[] | null = [];
  let error = false;
  try {
    [rows, guests] = await Promise.all([fetchRsvps(ctx.db), fetchGuests(ctx.db)]);
  } catch {
    error = true;
  }
  // Totais calculados a partir dos registros salvos.
  const totals = {
    groups: rows.length,
    people: rows.reduce((sum, r) => sum + r.total_people, 0),
    companions: rows.reduce((sum, r) => sum + r.companions.length, 0),
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Ayla Sophia · 1 ano</p>
          <h1 className="admin-title">Lista de presença</h1>
        </div>
        <form action={signOut} className="admin-header__account">
          <button type="submit" className="admin-btn admin-btn--ghost">
            Sair
          </button>
        </form>
      </header>

      <nav className="admin-tabs" aria-label="Seções">
        <Link href="/admin" aria-current={tab === "convidados" ? "page" : undefined}>
          Convidados
        </Link>
        <Link href="/admin?aba=confirmacoes" aria-current={tab === "confirmacoes" ? "page" : undefined}>
          Confirmações ({totals.groups})
        </Link>
      </nav>

      {error ? (
        <p className="admin-alert" role="alert">
          Não foi possível carregar a lista agora. Atualize a página para tentar novamente.
        </p>
      ) : tab === "confirmacoes" ? (
        <AdminDashboard rows={rows} totals={totals} />
      ) : guests === null ? (
        <p className="admin-alert" role="alert">
          A lista de convidados ainda não foi criada no banco. Rode o arquivo de SQL da lista no Neon (veja o README).
        </p>
      ) : (
        <GuestList guests={guests} unlinked={findUnlinked(rows, guests)} />
      )}
    </main>
  );
}
