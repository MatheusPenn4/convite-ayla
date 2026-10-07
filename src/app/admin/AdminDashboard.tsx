"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminRow } from "@/lib/admin-auth";
import { MAX_COMPANIONS, peopleLabel, validateRsvp, type RsvpFieldErrors } from "@/lib/validation";
import { deleteRsvp, updateRsvp } from "./actions";

type Totals = { groups: number; people: number; companions: number };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Busca sem diferenciar maiúsculas, acentos, apóstrofos ou hífens. */
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[-_]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function AdminDashboard({ rows, totals }: { rows: AdminRow[]; totals: Totals }) {
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<AdminRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const terms = fold(query).split(" ").filter(Boolean);
    if (!terms.length) return rows;
    return rows.filter((r) =>
      [r.primary_name, ...r.companions].some((n) => {
        const name = fold(n);
        return terms.every((t) => name.includes(t));
      }),
    );
  }, [rows, query]);

  return (
    <>
      <section className="admin-stats" aria-label="Resumo">
        <div className="admin-stat">
          <span className="admin-stat__value">{totals.groups}</span>
          <span className="admin-stat__label">{totals.groups === 1 ? "confirmação" : "confirmações"}</span>
        </div>
        <div className="admin-stat admin-stat--accent">
          <span className="admin-stat__value">{totals.people}</span>
          <span className="admin-stat__label">{totals.people === 1 ? "pessoa" : "pessoas"} no total</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__value">{totals.companions}</span>
          <span className="admin-stat__label">{totals.companions === 1 ? "familiar" : "familiares"}</span>
        </div>
      </section>

      <div className="admin-toolbar">
        <div className="admin-field admin-search">
          <label htmlFor="busca">Buscar por nome</label>
          <input
            id="busca"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um nome"
            autoComplete="off"
          />
        </div>
        <a className="admin-btn admin-btn--primary" href="/admin/export" download>
          Exportar CSV
        </a>
      </div>

      <p className="admin-status" role="status" aria-live="polite">
        {notice ??
          (query.trim()
            ? `${filtered.length} ${filtered.length === 1 ? "grupo encontrado" : "grupos encontrados"}`
            : "")}
      </p>

      {rows.length === 0 ? (
        <p className="admin-empty">Nenhuma confirmação recebida ainda.</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">Nenhum nome encontrado para “{query.trim()}”.</p>
      ) : (
        <ol className="admin-list">
          {filtered.map((row) => (
            <GroupCard key={`${row.id}-${row.updated_at}`} row={row} onDelete={() => setToDelete(row)} onSaved={() => setNotice("Alterações salvas.")} />
          ))}
        </ol>
      )}

      <DeleteDialog
        row={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={(name) => {
          setToDelete(null);
          setNotice(`Confirmação de ${name} excluída.`);
        }}
      />
    </>
  );
}

function GroupCard({ row, onDelete, onSaved }: { row: AdminRow; onDelete: () => void; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const edited = row.updated_at !== row.created_at && new Date(row.updated_at).getTime() - new Date(row.created_at).getTime() > 1000;

  return (
    <li className="admin-card">
      {editing ? (
        <EditForm
          row={row}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onSaved();
          }}
        />
      ) : (
        <>
          <div className="admin-card__head">
            <h2 className="admin-card__name">{row.primary_name}</h2>
            <span className="admin-chip">{peopleLabel(row.total_people)}</span>
          </div>
          {row.companions.length ? (
            <ul className="admin-card__companions" aria-label={`Familiares de ${row.primary_name}`}>
              {row.companions.map((c, i) => (
                <li key={`${i}-${c}`}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="admin-muted">Sem familiares.</p>
          )}
          <p className="admin-card__meta">
            Confirmado em {dateFmt.format(new Date(row.created_at))}
            {edited ? ` · editado em ${dateFmt.format(new Date(row.updated_at))}` : ""}
          </p>
          <div className="admin-card__actions">
            <button type="button" className="admin-btn" onClick={() => setEditing(true)}>
              Editar
            </button>
            <button type="button" className="admin-btn admin-btn--danger-ghost" onClick={onDelete}>
              Excluir
            </button>
          </div>
        </>
      )}
    </li>
  );
}

function EditForm({ row, onCancel, onSaved }: { row: AdminRow; onCancel: () => void; onSaved: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(row.primary_name);
  const [companions, setCompanions] = useState(row.companions.map((c, i) => ({ key: i, name: c })));
  const [errors, setErrors] = useState<RsvpFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nextKey = useRef(row.companions.length);

  function save() {
    const list = companions.map((c) => c.name);
    const v = validateRsvp(name, list);
    if (!v.ok) {
      setErrors(v.errors);
      setMessage("Confira os nomes destacados.");
      return;
    }
    setErrors({});
    setMessage(null);
    startTransition(async () => {
      const result = await updateRsvp(row.id, v.data.name, v.data.companions);
      if (result.ok) {
        router.refresh();
        onSaved();
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message);
      }
    });
  }

  const idBase = `edit-${row.id}`;
  return (
    <form
      className="admin-edit"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
    >
      <div className="admin-field">
        <label htmlFor={`${idBase}-name`}>Convidado principal</label>
        <input
          id={`${idBase}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${idBase}-name-err` : undefined}
          autoFocus
        />
        {errors.name ? (
          <p className="admin-error" id={`${idBase}-name-err`}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <fieldset className="admin-fieldset">
        <legend>Familiares</legend>
        {companions.map((c, i) => {
          const id = `${idBase}-c${c.key}`;
          const err = errors.companions?.[i];
          return (
            <div className="admin-field" key={c.key}>
              <label htmlFor={id}>Familiar {i + 1}</label>
              <div className="admin-row">
                <input
                  id={id}
                  value={c.name}
                  onChange={(e) => setCompanions(companions.map((x) => (x.key === c.key ? { ...x, name: e.target.value } : x)))}
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? `${id}-err` : undefined}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setCompanions(companions.filter((x) => x.key !== c.key))}
                  aria-label={`Remover familiar ${i + 1}`}
                >
                  Remover
                </button>
              </div>
              {err ? (
                <p className="admin-error" id={`${id}-err`}>
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={companions.length >= MAX_COMPANIONS}
          onClick={() => setCompanions([...companions, { key: nextKey.current++, name: "" }])}
        >
          + Adicionar familiar
        </button>
      </fieldset>

      <p className="admin-muted">Total após salvar: {peopleLabel(1 + companions.length)}</p>
      {message ? (
        <p className="admin-error" role="alert">
          {message}
        </p>
      ) : null}
      <div className="admin-card__actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="admin-btn" onClick={onCancel} disabled={pending}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function DeleteDialog({ row, onClose, onDeleted }: { row: AdminRow | null; onClose: () => void; onDeleted: (name: string) => void }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Abre/fecha o <dialog> nativo (foco preso e Esc acessíveis).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (row && !dialog.open) dialog.showModal();
    if (!row && dialog.open) dialog.close();
  }, [row]);

  return (
    <dialog
      ref={ref}
      className="admin-dialog"
      aria-labelledby="excluir-titulo"
      onClose={() => {
        setError(null);
        onClose();
      }}
    >
      {row ? (
        <div>
          <h2 id="excluir-titulo">Excluir confirmação?</h2>
          <p>
            A confirmação de <strong>{row.primary_name}</strong> ({peopleLabel(row.total_people)}) será removida da lista.
            Esta ação não pode ser desfeita.
          </p>
          {error ? (
            <p className="admin-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="admin-card__actions">
            <button type="button" className="admin-btn" onClick={() => ref.current?.close()} disabled={pending} autoFocus>
              Cancelar
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteRsvp(row.id);
                  if (result.ok) {
                    const name = row.primary_name;
                    ref.current?.close();
                    router.refresh();
                    onDeleted(name);
                  } else {
                    setError(result.message);
                  }
                })
              }
            >
              {pending ? "Excluindo..." : "Excluir definitivamente"}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
