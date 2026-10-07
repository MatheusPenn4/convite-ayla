import "server-only";
import { Pool } from "pg";

/**
 * Conexão com o Postgres (Neon). A DATABASE_URL fica só no servidor e é
 * criada automaticamente pela Vercel ao ligar o Neon em Storage.
 * Retorna null enquanto o banco não estiver configurado.
 */
const cache = globalThis as unknown as { __aylaPool?: Pool };

export function getDb(): Pool | null {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  if (!cache.__aylaPool) {
    const pool = new Pool({
      connectionString: url,
      max: Number(process.env.DATABASE_POOL_MAX) || 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
    // Conexões ociosas derrubadas pelo Neon não devem derrubar a função.
    pool.on("error", (err) => console.error("[db] conexão ociosa encerrada", (err as { code?: string }).code ?? ""));
    cache.__aylaPool = pool;
  }
  return cache.__aylaPool;
}

/** Códigos do Postgres para dados recusados pelas regras do banco. */
export function isInvalidDataError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === "23514" || code === "22P02" || code === "23502";
}
