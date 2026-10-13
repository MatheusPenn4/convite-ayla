"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { eventConfig } from "@/config/event";
import { ArtImg } from "@/components/garden/ArtImg";
import { FancyButterfly3D } from "@/components/garden/FancyButterfly3D";
import type { ButterflyTone } from "@/components/garden/butterfly-art";
import { requestMotionPermission } from "@/lib/motion-permission";

type Phase = "closed" | "opening" | "done";

const STORAGE_KEY = "ayla:envelope";
/** Duração da saída (deve acompanhar os tempos do CSS). */
const OPENING_MS = 1700;
const REDUCED_MS = 260;

/** Borboletas que pairam e cruzam a tela; cada uma com cor, tamanho, rota e ritmo próprios. */
const FLYERS: Array<{ tone: ButterflyTone; cls: string; flap: string; ax: string; ay: string }> = [
  { tone: "peach", cls: "a", flap: ".42s", ax: "-60vw", ay: "-40vh" },
  { tone: "iris", cls: "b", flap: ".5s", ax: "60vw", ay: "-45vh" },
  { tone: "rose", cls: "c", flap: ".36s", ax: "70vw", ay: "-20vh" },
  { tone: "lavender", cls: "d", flap: ".46s", ax: "-70vw", ay: "-30vh" },
  { tone: "sky", cls: "e", flap: ".4s", ax: "40vw", ay: "-70vh" },
  { tone: "orchid", cls: "f", flap: ".55s", ax: "-50vw", ay: "40vh" },
];

const KICKER = "CONVITE";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function OpeningScreen() {
  const [phase, setPhase] = useState<Phase>("closed");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const focusTitle = useRef(false);

  // Já aberto nesta sessão (ou link direto para #convite) → não mostra.
  useEffect(() => {
    let alreadyOpen = document.documentElement.dataset.envelope === "open" || window.location.hash === "#convite";
    try {
      alreadyOpen ||= sessionStorage.getItem(STORAGE_KEY) === "open";
    } catch {
      /* armazenamento indisponível */
    }
    if (alreadyOpen) {
      setPhase("done");
      return;
    }
    document.getElementById("convite")?.setAttribute("inert", "");
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.style.overflow = "hidden";
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  // Ao terminar: libera o convite e leva o foco ao título.
  useEffect(() => {
    if (phase !== "done") return;
    const root = document.documentElement;
    root.dataset.envelope = "open";
    root.style.removeProperty("overflow");
    document.getElementById("convite")?.removeAttribute("inert");
    try {
      sessionStorage.setItem(STORAGE_KEY, "open");
    } catch {
      /* ignora */
    }
    if (focusTitle.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("titulo-convite")?.focus({ preventScroll: true });
    }
  }, [phase]);

  // Garantia: se algo travar, o convite é liberado mesmo assim.
  useEffect(() => {
    if (phase !== "opening") return;
    const timer = setTimeout(() => setPhase("done"), prefersReducedMotion() ? REDUCED_MS : OPENING_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const open = useCallback(() => {
    // Aproveita o toque de abertura para liberar o sensor de inclinação no iPhone.
    requestMotionPermission();
    focusTitle.current = true;
    setPhase((p) => (p === "closed" ? "opening" : p));
  }, []);

  const skip = useCallback((event: MouseEvent) => {
    event.preventDefault();
    focusTitle.current = true;
    setPhase("done");
  }, []);

  if (phase === "done") return null;

  return (
    <section className={`envelope-screen opening${phase === "opening" ? " is-opening" : ""}`} aria-label="Abertura do convite">
      <span className="opening__glow opening__glow--a" aria-hidden="true" />
      <span className="opening__glow opening__glow--b" aria-hidden="true" />

      <ArtImg name="opening-branch" className="opening__branch" eager />
      <ArtImg name="opening-top" className="opening__flowers opening__flowers--top" eager />
      <ArtImg name="opening-bottom" className="opening__flowers opening__flowers--bottom" eager />

      <div className="opening__sparkles" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="opening__flyers" aria-hidden="true">
        {FLYERS.map((f) => (
          <span
            key={f.cls}
            className={`opening__fly opening__fly--${f.cls}`}
            style={{ "--flap": f.flap, "--ax": f.ax, "--ay": f.ay } as CSSProperties}
          >
            <FancyButterfly3D tone={f.tone} />
          </span>
        ))}
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="opening__stage"
        onClick={open}
        disabled={phase !== "closed"}
        aria-label={`Abrir o convite de aniversário de ${eventConfig.displayName}`}
      >
        <span className="opening__title" aria-hidden="true">
          <span className="opening__kicker">
            {KICKER.split("").map((ch, i) => (
              <span key={i} style={{ "--i": i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
          <span className="opening__script">Especial</span>
        </span>

        <span className="opening__hero" aria-hidden="true">
          <span className="opening__shadow" />
          <FancyButterfly3D tone="rose" />
        </span>

        <span className="opening__lead" aria-hidden="true">
          Um jardim de amor espera por você
        </span>
        <span className="opening__hint" aria-hidden="true">
          Toque para abrir o convite
        </span>
      </button>

      <a href="#convite" className="opening__skip" onClick={skip}>
        Ver convite
      </a>
    </section>
  );
}
