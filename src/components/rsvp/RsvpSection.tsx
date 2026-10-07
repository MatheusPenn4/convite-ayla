"use client";

import { useEffect, useRef, useState } from "react";
import { eventConfig } from "@/config/event";
import type { SavedRsvp } from "@/lib/rsvp-types";
import { peopleLabel } from "@/lib/validation";
import { Burst } from "@/components/garden/Burst";
import { Butterfly } from "@/components/garden/art";
import { ArtImg } from "@/components/garden/ArtImg";
import { CheckIcon } from "@/components/invite/icons";
import { RsvpForm } from "./RsvpForm";
import { readConfirmed } from "./storage";

type View =
  | { kind: "cta" }
  | { kind: "form" }
  | { kind: "success"; rsvp: SavedRsvp; replayed: boolean; fresh: boolean };

export function RsvpSection({ deadline }: { deadline: string | null }) {
  const [view, setView] = useState<View>({ kind: "cta" });
  const successTitle = useRef<HTMLHeadingElement>(null);

  // Ao voltar no mesmo navegador, mostra que já houve confirmação.
  useEffect(() => {
    const saved = readConfirmed();
    if (saved) setView({ kind: "success", rsvp: saved, replayed: false, fresh: false });
  }, []);

  useEffect(() => {
    if (view.kind === "success" && view.fresh) {
      successTitle.current?.focus({ preventScroll: true });
      successTitle.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [view]);

  return (
    <section className="card rsvp" id="confirmar" aria-labelledby="rsvp-titulo" data-reveal>
      <Butterfly tone="sky" className="rsvp__butterfly perched" />
      <h2 className="section-title" id="rsvp-titulo">
        <ArtImg name="tiny-sprig" className="section-title__sprig" />
        Confirmação de presença
      </h2>

      {view.kind === "cta" ? (
        <div className="rsvp__cta">
          <p className="rsvp__lead">
            Sua presença vai deixar o jardim da {eventConfig.displayName} ainda mais bonito.
            {deadline ? ` Confirme até ${deadline}.` : ""}
          </p>
          <button
            type="button"
            className="btn btn--primary btn--block btn--glow"
            aria-expanded="false"
            aria-controls="rsvp-area"
            onClick={() => setView({ kind: "form" })}
          >
            Confirmar presença
          </button>
        </div>
      ) : null}

      <div id="rsvp-area" className="rsvp__area">
        {view.kind === "form" ? (
          <div className="rsvp__panel">
            <RsvpForm onSuccess={(rsvp, replayed) => setView({ kind: "success", rsvp, replayed, fresh: true })} />
          </div>
        ) : null}

        {view.kind === "success" ? (
          <div className="rsvp-success">
            {view.fresh ? <Burst scale={0.75} className="rsvp-success__burst" /> : null}
            <span className="rsvp-success__seal" aria-hidden="true">
              <CheckIcon />
            </span>
            <h3 className="rsvp-success__title" tabIndex={-1} ref={successTitle}>
              Presença confirmada!&nbsp;
              <span aria-hidden="true">🌸</span>
            </h3>
            <p className="rsvp-success__text">
              Estamos felizes em ter vocês no primeiro aninho da {eventConfig.displayName}.
            </p>
            {view.replayed ? (
              <p className="rsvp-success__note">Esta confirmação já estava registrada, então nada foi duplicado.</p>
            ) : null}

            <ul className="rsvp-success__names" aria-label="Nomes registrados">
              <li>{view.rsvp.name}</li>
              {view.rsvp.companions.map((c, i) => (
                <li key={`${i}-${c}`}>{c}</li>
              ))}
            </ul>
            <p className="rsvp-success__total">
              Total: <strong>{peopleLabel(view.rsvp.total)}</strong>
            </p>
            {!view.fresh ? (
              <p className="rsvp-success__note">Confirmação registrada a partir deste aparelho.</p>
            ) : null}
            <button type="button" className="btn btn--link" onClick={() => setView({ kind: "form" })}>
              Fazer outra confirmação
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
