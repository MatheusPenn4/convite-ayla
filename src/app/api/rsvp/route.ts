import { NextResponse, type NextRequest } from "next/server";
import { getDb, isInvalidDataError } from "@/lib/db";
import { allowAttempt } from "@/lib/rate-limit";
import { MAX_BODY_BYTES, isSubmissionId, validateRsvp } from "@/lib/validation";
import type { RsvpResponse, SavedRsvp } from "@/lib/rsvp-types";

export const dynamic = "force-dynamic";

function reply(body: RsvpResponse, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const GENERIC_FAIL = "Não conseguimos concluir a confirmação. Seus dados continuam aqui. Tente novamente em instantes.";

export async function POST(request: NextRequest) {
  // 1. Apenas requisições do próprio site.
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && origin !== request.nextUrl.origin) || fetchSite === "cross-site") {
    return reply({ ok: false, code: "forbidden", message: "Origem não autorizada." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ ok: false, code: "invalid", message: "Formato inválido." }, 415);
  }

  // 2. Tamanho máximo do corpo.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return reply({ ok: false, code: "too_large", message: "Dados acima do tamanho permitido." }, 413);
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return reply({ ok: false, code: "too_large", message: "Dados acima do tamanho permitido." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply({ ok: false, code: "invalid", message: "Formato inválido." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply({ ok: false, code: "invalid", message: "Formato inválido." }, 400);
  }
  const { submissionId, name, companions, garden } = body as Record<string, unknown>;

  // 3. Campo-isca preenchido = envio automatizado. Nada é gravado.
  if (typeof garden === "string" && garden.trim() !== "") {
    return reply({ ok: false, code: "invalid", message: GENERIC_FAIL }, 400);
  }
  if (!isSubmissionId(submissionId)) {
    return reply({ ok: false, code: "invalid", message: "Identificador de envio inválido. Recarregue a página." }, 400);
  }

  // 4. Validação no servidor (mesmas regras do navegador).
  const result = validateRsvp(name, companions);
  if (!result.ok) {
    return reply(
      { ok: false, code: "invalid", message: "Confira os nomes destacados.", errors: result.errors },
      422,
    );
  }

  // 5. Banco configurado?
  const db = getDb();
  if (!db) {
    console.error("[rsvp] banco não configurado: defina DATABASE_URL.");
    return reply(
      {
        ok: false,
        code: "not_configured",
        message: "A confirmação on-line ainda não está ativa. Sua presença não foi registrada.",
      },
      503,
    );
  }

  try {
    // 6. Limite de envios persistente.
    if (!(await allowAttempt(db, request.headers, "rsvp"))) {
      return reply(
        {
          ok: false,
          code: "rate_limited",
          message: "Recebemos muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.",
        },
        429,
      );
    }

    // 7. Gravação atômica e idempotente.
    const { rows } = await db.query<{ result: unknown }>(
      "select public.submit_rsvp($1::uuid, $2::text, $3::text[]) as result",
      [submissionId, result.data.name, result.data.companions],
    );

    const saved = rows[0]?.result as { name?: unknown; companions?: unknown; total?: unknown; replayed?: unknown } | null;
    if (!saved || typeof saved.name !== "string" || !Array.isArray(saved.companions) || typeof saved.total !== "number") {
      console.error("[rsvp] resposta inesperada do banco");
      return reply({ ok: false, code: "server_error", message: GENERIC_FAIL }, 500);
    }

    const rsvp: SavedRsvp = {
      name: saved.name,
      companions: saved.companions.filter((c): c is string => typeof c === "string"),
      total: saved.total,
    };
    return reply({ ok: true, rsvp, replayed: saved.replayed === true }, 200);
  } catch (err) {
    // Registra apenas o código do erro, nunca os nomes.
    console.error("[rsvp] falha ao gravar", { code: (err as { code?: string } | null)?.code ?? "unknown" });
    if (isInvalidDataError(err)) return reply({ ok: false, code: "invalid", message: GENERIC_FAIL }, 422);
    return reply({ ok: false, code: "server_error", message: GENERIC_FAIL }, 500);
  }
}
