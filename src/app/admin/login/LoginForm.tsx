"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "../actions";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="admin-panel admin-login">
      <p className="admin-muted">Acesso restrito à família.</p>
      <div className="admin-field">
        <label htmlFor="username">Login</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state.username ?? ""}
          key={state.username ?? ""}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error ? (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
