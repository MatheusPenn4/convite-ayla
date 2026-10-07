import { redirect } from "next/navigation";
import { connection } from "next/server";
import { fetchRsvps, getAdminContext, type AdminRow } from "@/lib/admin-auth";
import { AdminDashboard } from "./AdminDashboard";
import { signOut } from "./actions";

export default async function AdminPage() {
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

  let rows: AdminRow[] = [];
  let error = false;
  try {
    rows = await fetchRsvps(ctx.db);
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

      {error ? (
        <p className="admin-alert" role="alert">
          Não foi possível carregar a lista agora. Atualize a página para tentar novamente.
        </p>
      ) : (
        <AdminDashboard rows={rows} totals={totals} />
      )}
    </main>
  );
}
