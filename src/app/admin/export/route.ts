import { NextResponse } from "next/server";
import { eventConfig } from "@/config/event";
import { fetchRsvps, getAdminContext } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: eventConfig.timeZone,
  dateStyle: "short",
  timeStyle: "short",
});

export async function GET() {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  let data;
  try {
    data = await fetchRsvps(ctx.db, true);
  } catch {
    return NextResponse.json({ error: "Falha ao gerar a lista." }, { status: 500 });
  }

  const rows: Array<Array<string | number>> = [
    ["Grupo", "Tipo", "Nome", "Convidado principal", "Pessoas no grupo", "Confirmado em", "Atualizado em"],
  ];
  data.forEach((r, i) => {
    const group = i + 1;
    const created = fmt.format(new Date(r.created_at));
    const updated = fmt.format(new Date(r.updated_at));
    rows.push([group, "Principal", r.primary_name, r.primary_name, r.total_people, created, updated]);
    for (const c of r.companions) rows.push([group, "Familiar", c, r.primary_name, r.total_people, created, updated]);
  });

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: eventConfig.timeZone }).format(new Date());
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lista-presenca-ayla-sophia-${today}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
