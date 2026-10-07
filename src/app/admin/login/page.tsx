import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  await connection();
  const ctx = await getAdminContext();
  if (ctx.status === "ok") redirect("/admin");

  return (
    <main className="admin-shell admin-shell--narrow">
      <p className="admin-eyebrow">Ayla Sophia · 1 ano</p>
      <h1 className="admin-title">Área dos responsáveis</h1>

      {ctx.status === "not_configured" ? (
        <p className="admin-alert" role="alert">
          A área administrativa ainda não foi configurada. Defina as variáveis de ambiente: {ctx.missing.join(", ")}{" "}
          (veja o README).
        </p>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}
