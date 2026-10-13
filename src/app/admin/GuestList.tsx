"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Guest, GuestSide, GuestStatus } from "@/lib/guests";
import { deleteGuest, linkConfirmedName, saveGuest, setGuestStatus } from "./actions";

export type UnlinkedName = { rsvpId: string; name: string; primary: string };

const SIDE_LABEL: Record<GuestSide, string> = { mae: "Lista da mãe", pai: "Lista do pai" };
const STATUS_LABEL: Record<GuestStatus, string> = { pendente: "Pendente", confirmado: "Confirmado", nao_vai: "Não vai" };

function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function counts(list: Guest[]) {
  const c = { total: list.length, confirmado: 0, pendente: 0, nao_vai: 0, criancas: 0 };
  for (const g of list) {
    c[g.status] += 1;
    if (g.is_child) c.criancas += 1;
  }
  return c;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function GuestList({ guests, unlinked }: { guests: Guest[]; unlinked: UnlinkedName[] }) {
  const [side, setSide] = useState<"todos" | GuestSide>("todos");
  const [status, setStatus] = useState<"todos" | GuestStatus>("todos");
  const [query, setQuery] = useState("");

  const all = counts(guests);
  const bySide = { mae: counts(guests.filter((g) => g.side === "mae")), pai: counts(guests.filter((g) => g.side === "pai")) };

  const visible = useMemo(() => {
    const terms = fold(query).split(" ").filter(Boolean);
    return guests.filter((g) => {
      if (side !== "todos" && g.side !== side) return false;
      if (status !== "todos" && g.status !== status) return false;
      if (!terms.length) return true;
      const hay = fold(`${g.name} ${g.note ?? ""} ${g.confirmed_name ?? ""}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [guests, side, status, query]);

  return (
    <>
      <section className="admin-stats admin-stats--guests" aria-label="Resumo da lista">
        <div className="admin-stat">
          <span className="admin-stat__value">{all.total}</span>
          <span className="admin-stat__label">convidados no total</span>
          <span className="admin-stat__sub">
            {plural(all.total - all.criancas, "adulto", "adultos")} · {plural(all.criancas, "criança", "crianças")}
          </span>
        </div>
        {(["mae", "pai"] as const).map((s) => (
          <div className="admin-stat" key={s}>
            <span className="admin-stat__value">{bySide[s].total}</span>
            <span className="admin-stat__label">{SIDE_LABEL[s].toLowerCase()}</span>
            <span className="admin-stat__sub">
              {bySide[s].confirmado} confirmados · {bySide[s].pendente} pendentes
            </span>
            <span className="admin-progress" aria-hidden="true">
              <span style={{ width: `${bySide[s].total ? (bySide[s].confirmado / bySide[s].total) * 100 : 0}%` }} />
            </span>
          </div>
        ))}
        <div className="admin-stat admin-stat--accent">
          <span className="admin-stat__value">{all.confirmado}</span>
          <span className="admin-stat__label">{all.confirmado === 1 ? "confirmado" : "confirmados"}</span>
          <span className="admin-stat__sub">
            {all.pendente} pendentes · {all.nao_vai} não vão
          </span>
        </div>
      </section>

      {unlinked.length ? <UnlinkedPanel unlinked={unlinked} guests={guests} /> : null}

      <div className="admin-toolbar admin-toolbar--guests">
        <div className="admin-segment" role="group" aria-label="Filtrar por lista">
          {(["todos", "mae", "pai"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)}>
              {s === "todos" ? "Todos" : s === "mae" ? "Mãe" : "Pai"}
            </button>
          ))}
        </div>
        <div className="admin-segment" role="group" aria-label="Filtrar por situação">
          {(["todos", "confirmado", "pendente", "nao_vai"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === "todos" ? "Todas" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="admin-field admin-search">
          <label htmlFor="busca-convidado">Buscar convidado</label>
          <input
            id="busca-convidado"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um nome"
            autoComplete="off"
          />
        </div>
        <a className="admin-btn" href="/admin/export?lista=convidados" download>
          Exportar lista (CSV)
        </a>
      </div>

      {(["mae", "pai"] as const)
        .filter((s) => side === "todos" || side === s)
        .map((s) => (
          <SideBlock key={s} side={s} all={guests.filter((g) => g.side === s)} visible={visible.filter((g) => g.side === s)} />
        ))}
    </>
  );
}

/* ----------------------------------------------------------------- por lado */

function SideBlock({ side, all, visible }: { side: GuestSide; all: Guest[]; visible: Guest[] }) {
  const c = counts(all);
  // Seções na ordem em que aparecem; famílias agrupadas pela chave "household".
  const sections: Array<{ name: string; groups: Guest[][] }> = [];
  for (const g of visible) {
    let sec = sections.find((x) => x.name === g.section);
    if (!sec) sections.push((sec = { name: g.section, groups: [] }));
    const group = g.household ? sec.groups.find((grp) => grp[0].household === g.household) : undefined;
    if (group) group.push(g);
    else sec.groups.push([g]);
  }
  const heads = new Map<string, string>();
  for (const g of all) if (g.household && !heads.has(g.household)) heads.set(g.household, g.name);

  return (
    <section className="guest-side" aria-labelledby={`lado-${side}`}>
      <h2 className="guest-side__title" id={`lado-${side}`}>
        {SIDE_LABEL[side]}
        <span className="admin-chip">
          {c.confirmado}/{c.total} confirmados
        </span>
      </h2>

      {sections.length === 0 ? <p className="admin-empty">Nenhum convidado com esses filtros.</p> : null}

      {sections.map((sec) => (
        <div className="guest-section" key={sec.name || "_"}>
          {sec.name ? <h3 className="guest-section__title">{sec.name}</h3> : null}
          <ul className="guest-groups">
            {sec.groups.map((grp) => (
              <li className={`guest-group${grp.length > 1 || grp[0].household ? " guest-group--family" : ""}`} key={grp[0].id}>
                {grp[0].household && grp.length > 0 ? (
                  <p className="guest-group__label">Família de {heads.get(grp[0].household) ?? grp[0].name}</p>
                ) : null}
                <ul className="guest-members">
                  {grp.map((g) => (
                    <GuestRow key={`${g.id}-${g.status}-${g.name}`} guest={g} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <AddGuest side={side} all={all} />
    </section>
  );
}

/* --------------------------------------------------------------- convidado */

function GuestRow({ guest }: { guest: Guest }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changeStatus = (next: string) =>
    start(async () => {
      const r = await setGuestStatus(guest.id, next);
      if (!r.ok) setError(r.message);
      else router.refresh();
    });

  if (editing) return <EditGuest guest={guest} onDone={() => setEditing(false)} />;

  return (
    <li className={`guest-row guest-row--${guest.status}${guest.is_placeholder ? " guest-row--placeholder" : ""}`}>
      <select
        className="guest-status"
        value={guest.status}
        onChange={(e) => changeStatus(e.target.value)}
        disabled={pending}
        aria-label={`Situação de ${guest.name}`}
      >
        <option value="pendente">Pendente</option>
        <option value="confirmado">Confirmado</option>
        <option value="nao_vai">Não vai</option>
      </select>
      <div className="guest-row__info">
        <span className="guest-row__name">{guest.name}</span>
        {guest.note ? <span className="guest-row__note">{guest.note}</span> : null}
        {guest.is_child ? <span className="admin-chip admin-chip--soft">criança</span> : null}
        {guest.status === "confirmado" && guest.confirmed_name ? (
          <span className="guest-row__via">
            {guest.confirmed_by === "site" ? "confirmou pelo site" : "vinculado"} como “{guest.confirmed_name}”
          </span>
        ) : guest.status === "confirmado" && guest.confirmed_by === "manual" ? (
          <span className="guest-row__via">marcado à mão</span>
        ) : null}
        {error ? <span className="admin-error">{error}</span> : null}
      </div>
      <button type="button" className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => setEditing(true)}>
        Editar
      </button>
    </li>
  );
}

function EditGuest({ guest, onDone }: { guest: Guest; onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(guest.name);
  const [note, setNote] = useState(guest.note ?? "");
  const [isChild, setIsChild] = useState(guest.is_child);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const id = `edit-guest-${guest.id}`;

  const save = () =>
    start(async () => {
      const r = await saveGuest(guest.id, {
        side: guest.side,
        section: guest.section,
        household: guest.household,
        name,
        note,
        isChild,
      });
      if (!r.ok) return setError(r.message);
      router.refresh();
      onDone();
    });

  const remove = () => {
    if (!window.confirm(`Remover "${guest.name}" da ${SIDE_LABEL[guest.side].toLowerCase()}? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      const r = await deleteGuest(guest.id);
      if (!r.ok) return setError(r.message);
      router.refresh();
      onDone();
    });
  };

  return (
    <li className="guest-row guest-row--editing">
      <form
        className="guest-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="admin-field">
          <label htmlFor={`${id}-name`}>Nome</label>
          <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="admin-field">
          <label htmlFor={`${id}-note`}>Observação</label>
          <input id={`${id}-note`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex.: irmão, 5 anos" />
        </div>
        <label className="admin-check">
          <input type="checkbox" checked={isChild} onChange={(e) => setIsChild(e.target.checked)} /> Criança
        </label>
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-card__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" className="admin-btn" onClick={onDone} disabled={pending}>
            Cancelar
          </button>
          <button type="button" className="admin-btn admin-btn--danger-ghost" onClick={remove} disabled={pending}>
            Remover
          </button>
        </div>
      </form>
    </li>
  );
}

function AddGuest({ side, all }: { side: GuestSide; all: Guest[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [section, setSection] = useState("");
  const [household, setHousehold] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sections = [...new Set(all.map((g) => g.section))];
  const families = new Map<string, string>();
  for (const g of all) if (g.household && !families.has(g.household)) families.set(g.household, g.name);
  const idBase = `novo-${side}`;

  if (!open) {
    return (
      <button type="button" className="admin-btn admin-btn--ghost guest-add" onClick={() => setOpen(true)}>
        + Adicionar convidado na {SIDE_LABEL[side].toLowerCase()}
      </button>
    );
  }

  const submit = () =>
    start(async () => {
      const famSection = household ? all.find((g) => g.household === household)?.section ?? section : section;
      const r = await saveGuest(null, { side, section: famSection, household: household || null, name, note, isChild });
      if (!r.ok) return setError(r.message);
      setName("");
      setNote("");
      setIsChild(false);
      setError(null);
      router.refresh();
    });

  return (
    <form
      className="guest-edit guest-edit--new"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="guest-section__title">Novo convidado na {SIDE_LABEL[side].toLowerCase()}</p>
      <div className="admin-field">
        <label htmlFor={`${idBase}-name`}>Nome</label>
        <input id={`${idBase}-name`} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="admin-field">
        <label htmlFor={`${idBase}-note`}>Observação (opcional)</label>
        <input id={`${idBase}-note`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex.: prima, 3 anos" />
      </div>
      <div className="admin-field">
        <label htmlFor={`${idBase}-fam`}>Faz parte da família de</label>
        <select id={`${idBase}-fam`} value={household} onChange={(e) => setHousehold(e.target.value)}>
          <option value="">Ninguém (convidado avulso)</option>
          {[...families].map(([key, head]) => (
            <option key={key} value={key}>
              {head}
            </option>
          ))}
        </select>
      </div>
      {!household ? (
        <div className="admin-field">
          <label htmlFor={`${idBase}-sec`}>Grupo</label>
          <input id={`${idBase}-sec`} list={`${idBase}-secs`} value={section} onChange={(e) => setSection(e.target.value)} />
          <datalist id={`${idBase}-secs`}>
            {sections.filter(Boolean).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      ) : null}
      <label className="admin-check">
        <input type="checkbox" checked={isChild} onChange={(e) => setIsChild(e.target.checked)} /> Criança
      </label>
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="admin-card__actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </button>
        <button type="button" className="admin-btn" onClick={() => setOpen(false)} disabled={pending}>
          Fechar
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------- confirmações sem correspondência */

function UnlinkedPanel({ unlinked, guests }: { unlinked: UnlinkedName[]; guests: Guest[] }) {
  const pendingGuests = guests.filter((g) => g.status === "pendente");
  return (
    <section className="admin-panel guest-unlinked" aria-labelledby="sem-vinculo">
      <h2 id="sem-vinculo" className="guest-section__title">
        Confirmaram pelo site, mas não encontrei na lista ({unlinked.length})
      </h2>
      <p className="admin-muted">
        Escolha quem é na lista para marcar como confirmado, ou inclua como convidado novo.
      </p>
      <ul className="guest-unlinked__list">
        {unlinked.map((u, i) => (
          <UnlinkedRow key={`${u.rsvpId}-${u.name}-${i}`} item={u} pendingGuests={pendingGuests} />
        ))}
      </ul>
    </section>
  );
}

function UnlinkedRow({ item, pendingGuests }: { item: UnlinkedName; pendingGuests: Guest[] }) {
  const router = useRouter();
  const [choice, setChoice] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const id = `vinc-${item.rsvpId}-${fold(item.name).replace(/\s/g, "-")}`;

  const run = (target: { guestId: string } | { side: string }) =>
    start(async () => {
      const r = await linkConfirmedName(item.rsvpId, item.name, target);
      if (!r.ok) return setError(r.message);
      router.refresh();
    });

  const label = (g: Guest) => (g.note ? `${g.name} (${g.note})` : g.name);

  return (
    <li className="guest-unlinked__row">
      <p className="guest-unlinked__name">
        <strong>{item.name}</strong>
        {item.primary !== item.name ? <span className="admin-muted"> · veio junto com {item.primary}</span> : null}
      </p>
      <div className="admin-row">
        <select id={id} value={choice} onChange={(e) => setChoice(e.target.value)} aria-label={`Quem é ${item.name} na lista`}>
          <option value="">Quem é na lista?</option>
          {(["mae", "pai"] as const).map((s) => (
            <optgroup key={s} label={SIDE_LABEL[s]}>
              {pendingGuests
                .filter((g) => g.side === s)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {label(g)}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={!choice || pending}
          onClick={() => run({ guestId: choice })}
        >
          Vincular
        </button>
      </div>
      <div className="admin-card__actions">
        <button type="button" className="admin-btn admin-btn--small" disabled={pending} onClick={() => run({ side: "mae" })}>
          Incluir na lista da mãe
        </button>
        <button type="button" className="admin-btn admin-btn--small" disabled={pending} onClick={() => run({ side: "pai" })}>
          Incluir na lista do pai
        </button>
      </div>
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
