// Cria/atualiza as tabelas no banco indicado por DATABASE_URL.
// Uso: npm run db:setup   (lê o .env.local)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("Defina DATABASE_URL no .env.local (copie da Vercel → Storage → Neon).");
  process.exit(1);
}

const sql = readFileSync(fileURLToPath(new URL("../db/schema.sql", import.meta.url)), "utf8");
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query("select count(*)::int as total from public.rsvps");
  console.log(`Banco pronto. Confirmações registradas: ${rows[0].total}.`);
} catch (err) {
  console.error("Falha ao configurar o banco:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
