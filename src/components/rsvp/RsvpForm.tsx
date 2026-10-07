"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MAX_COMPANIONS, MAX_NAME_LENGTH, peopleLabel, validateRsvp, type RsvpFieldErrors } from "@/lib/validation";
import type { RsvpResponse, SavedRsvp } from "@/lib/rsvp-types";
import { CloseIcon, LeafShieldIcon, PeopleIcon, PlusIcon } from "@/components/invite/icons";
import { clearPendingSubmissionId, getPendingSubmissionId, saveConfirmed } from "./storage";

type Companion = { key: number; name: string };
type FocusTarget = { kind: "companion"; key: number } | { kind: "add" } | { kind: "name" } | null;

const REQUEST_TIMEOUT_MS = 20_000;
const OFFLINE_MESSAGE =
  "Não foi possível conectar. Verifique sua internet e tente novamente. Seus dados continuam preenchidos.";

export function RsvpForm({ onSuccess }: { onSuccess: (rsvp: SavedRsvp, replayed: boolean) => void }) {
  const uid = useId();
  const [name, setName] = useState("");
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [errors, setErrors] = useState<RsvpFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const nextKey = useRef(1);
  const inFlight = useRef(false); // trava síncrona contra cliques repetidos
  const nameRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const companionRefs = useRef(new Map<number, HTMLInputElement>());
  const focusNext = useRef<FocusTarget>({ kind: "name" });

  const total = 1 + companions.length;
  const atLimit = companions.length >= MAX_COMPANIONS;

  // Move o foco depois que a lista muda (adicionar/remover familiar).
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (!target) return;
    if (target.kind === "name") nameRef.current?.focus();
    if (target.kind === "add") addRef.current?.focus();
    if (target.kind === "companion") companionRefs.current.get(target.key)?.focus();
  }, [companions]);

  function revalidate(nextName: string, nextCompanions: Companion[]) {
    if (!submitted) return;
    const v = validateRsvp(nextName, nextCompanions.map((c) => c.name));
    setErrors(v.ok ? {} : v.errors);
  }

  function addCompanion() {
    if (atLimit) return;
    const key = nextKey.current++;
    const next = [...companions, { key, name: "" }];
    focusNext.current = { kind: "companion", key };
    setCompanions(next);
  }

  function removeCompanion(key: number) {
    const index = companions.findIndex((c) => c.key === key);
    const next = companions.filter((c) => c.key !== key);
    const previous = next[index - 1] ?? next[index];
    focusNext.current = previous ? { kind: "companion", key: previous.key } : { kind: "add" };
    setCompanions(next);
    revalidate(name, next);
  }

  function updateCompanion(key: number, value: string) {
    const next = companions.map((c) => (c.key === key ? { ...c, name: value } : c));
    setCompanions(next);
    revalidate(name, next);
  }

  function focusFirstError(errs: RsvpFieldErrors) {
    if (errs.name) return nameRef.current?.focus();
    const idx = errs.companions?.findIndex(Boolean) ?? -1;
    if (idx >= 0) companionRefs.current.get(companions[idx]?.key)?.focus();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    setSubmitted(true);
    setFailure(null);

    const v = validateRsvp(name, companions.map((c) => c.name));
    if (!v.ok) {
      setErrors(v.errors);
      focusFirstError(v.errors);
      return;
    }
    setErrors({});
    inFlight.current = true;
    setSubmitting(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          submissionId: getPendingSubmissionId(),
          name: v.data.name,
          companions: v.data.companions,
          garden: honeypotRef.current?.value ?? "",
        }),
      });
      let data: RsvpResponse | null = null;
      try {
        data = (await response.json()) as RsvpResponse;
      } catch {
        data = null;
      }

      // Sucesso SOMENTE quando o servidor confirma a gravação no banco.
      if (response.ok && data?.ok) {
        clearPendingSubmissionId();
        saveConfirmed(data.rsvp);
        onSuccess(data.rsvp, data.replayed);
        return;
      }

      if (data && !data.ok) {
        if (data.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
        }
        showFailure(data.message);
      } else {
        showFailure("O servidor não respondeu como esperado. Tente novamente em instantes.");
      }
    } catch {
      showFailure(OFFLINE_MESSAGE);
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function showFailure(message: string) {
    setFailure(message);
    requestAnimationFrame(() => failureRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  const nameErrorId = `${uid}-nome-erro`;
  const helpId = `${uid}-ajuda`;

  return (
    <form className="rsvp-form" onSubmit={handleSubmit} noValidate aria-describedby={helpId}>
      <div className="field">
        <label className="field__label" htmlFor={`${uid}-nome`}>
          Seu nome completo
        </label>
        <input
          ref={nameRef}
          id={`${uid}-nome`}
          className="field__input"
          type="text"
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={MAX_NAME_LENGTH + 20}
          value={name}
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrorId : undefined}
          onChange={(e) => {
            setName(e.target.value);
            revalidate(e.target.value, companions);
          }}
        />
        {errors.name ? (
          <p className="field__error" id={nameErrorId}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <fieldset className="companions">
        <legend className="companions__legend">Quem vai com você?</legend>
        <p className="companions__help" id={helpId}>
          Coloque seu nome e o de cada familiar que estará com você nesse dia especial.
        </p>

        <ol className="companions__list">
          {companions.map((c, i) => {
            const inputId = `${uid}-familiar-${c.key}`;
            const errorId = `${inputId}-erro`;
            const error = errors.companions?.[i];
            return (
              <li className="companion" key={c.key}>
                <label className="field__label field__label--small" htmlFor={inputId}>
                  Nome completo do familiar {i + 1}
                </label>
                <div className="companion__row">
                  <input
                    ref={(el) => {
                      if (el) companionRefs.current.set(c.key, el);
                      else companionRefs.current.delete(c.key);
                    }}
                    id={inputId}
                    className="field__input"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    enterKeyHint="done"
                    maxLength={MAX_NAME_LENGTH + 20}
                    value={c.name}
                    aria-required="true"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(e) => updateCompanion(c.key, e.target.value)}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeCompanion(c.key)}
                    aria-label={`Remover familiar ${i + 1}${c.name.trim() ? ` (${c.name.trim()})` : ""}`}
                  >
                    <CloseIcon />
                  </button>
                </div>
                {error ? (
                  <p className="field__error" id={errorId}>
                    {error}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>

        <button ref={addRef} type="button" className="btn btn--add" onClick={addCompanion} disabled={atLimit}>
          <PlusIcon />
          Adicionar familiar
        </button>
        {atLimit ? (
          <p className="companions__limit">
            Limite de {MAX_COMPANIONS} familiares por confirmação. Para mais pessoas, faça outra confirmação.
          </p>
        ) : null}
      </fieldset>

      <p className="rsvp-total" aria-live="polite">
        <PeopleIcon />
        <span>
          Total: <strong>{peopleLabel(total)}</strong>
        </span>
      </p>

      {/* Campo-isca para robôs: invisível e fora da navegação. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${uid}-jardim`}>Não preencha este campo</label>
        <input ref={honeypotRef} id={`${uid}-jardim`} type="text" name="jardim_secreto" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {errors.form ? <p className="field__error">{errors.form}</p> : null}

      {failure ? (
        <div className="rsvp-failure" role="alert" ref={failureRef}>
          <p className="rsvp-failure__title">A confirmação não foi concluída.</p>
          <p>{failure}</p>
          <p className="rsvp-failure__retry">Quando quiser, toque em “Confirmar nossa presença” para tentar de novo.</p>
        </div>
      ) : null}

      <button type="submit" className="btn btn--primary btn--block" disabled={submitting} aria-disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Confirmando...
          </>
        ) : (
          "Confirmar nossa presença"
        )}
      </button>

      <p className="privacy-note">
        <LeafShieldIcon />
        Os nomes serão usados apenas para organizar a lista de presença da festa.
      </p>
    </form>
  );
}
