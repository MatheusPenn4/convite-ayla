import { NextResponse } from "next/server";
import { eventConfig } from "@/config/event";
import { fetchRsvps, getAdminContext } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { fetchGuests } from "@/lib/guests";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: eventConfig.timeZone,
  dateStyle: "short",
  timeStyle: "short",
});

const SIDE = { mae: "Mãe", pai: "Pai" } as const;
const STATUS = { pendente: "Pendente", confirmado: "Confirmado", nao_vai: "Não vai" } as const;

function csvResponse(body: string, name: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: eventConfig.timeZone }).format(new Date());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-ayla-sophia-${today}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: Request) {
  const ctx = await getAdminContext();
  if (ctx.status !== "ok") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  // Lista de convidados (mãe/pai) com a situação de cada um.
  if (new URL(request.url).searchParams.get("lista") === "convidados") {
    const guests = await fetchGuests(ctx.db).catch(() => null);
    if (!guests) return NextResponse.json({ error: "Lista de convidados indisponível." }, { status: 500 });
    const heads = new Map<string, string>();
    for (const g of guests) if (g.household && !heads.has(g.household)) heads.set(g.household, g.name);
    const rows: Array<Array<string | number>> = [
      ["Lista", "Grupo", "Família de", "Nome", "Observação", "Criança", "Situação", "Confirmou como"],
      ...guests.map((g) => [
        SIDE[g.side],
        g.section,
        g.household ? heads.get(g.household) ?? "" : "",
        g.name,
        g.note ?? "",
        g.is_child ? "Sim" : "Não",
        STATUS[g.status],
        g.confirmed_name ?? "",
      ]),
    ];
    return csvResponse(toCsv(rows), "lista-convidados");
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

  return csvResponse(toCsv(rows), "lista-presenca");
}
