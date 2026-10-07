"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { eventConfig } from "@/config/event";
import { Butterfly } from "@/components/garden/art";
import { ArtImg } from "@/components/garden/ArtImg";
import { Burst } from "@/components/garden/Burst";
import { requestMotionPermission } from "@/lib/motion-permission";

type Phase = "closed" | "opening" | "done";

const STORAGE_KEY = "ayla:envelope";
/** Duração total da abertura (deve acompanhar os tempos do CSS). */
const OPENING_MS = 2300;
const REDUCED_MS = 260;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Envelope() {
  const [phase, setPhase] = useState<Phase>("closed");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const focusTitle = useRef(false);

  // Estado inicial: já aberto nesta sessão (ou link direto para #convite) → não mostra.
  useEffect(() => {
    let alreadyOpen = document.documentElement.dataset.envelope === "open" || window.location.hash === "#convite";
    try {
      alreadyOpen ||= sessionStorage.getItem(STORAGE_KEY) === "open";
    } catch {
      /* armazenamento indisponível: segue normalmente */
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
    <section className={`envelope-screen${phase === "opening" ? " is-opening" : ""}`} aria-label="Abertura do convite">
      <ArtImg name="corner-bouquet" className="envelope-screen__corner envelope-screen__corner--tl" eager />
      <ArtImg name="corner-bouquet" className="envelope-screen__corner envelope-screen__corner--br" eager />

      <p className="envelope-screen__lead">Um jardim de amor espera por você</p>

      <div className="envelope-wrap">
        <button
          ref={buttonRef}
          type="button"
          className="envelope"
          onClick={open}
          aria-describedby="envelope-dica"
          aria-label={`Abrir o convite de aniversário de ${eventConfig.displayName}`}
          disabled={phase !== "closed"}
        >
          <span className="envelope__back" />
          <span className="envelope__card">
            <span className="envelope__card-eyebrow">Meu primeiro aninho</span>
            <span className="envelope__card-name">{eventConfig.displayName}</span>
            <ArtImg name="sprig-divider" className="envelope__card-sprig" eager />
          </span>
          <svg className="envelope__pocket" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="env-side" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#f6d3df" />
                <stop offset="1" stopColor="#f9e0e8" />
              </linearGradient>
              <linearGradient id="env-bottom" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#f7d7e2" />
                <stop offset="1" stopColor="#fbe7ee" />
              </linearGradient>
            </defs>
            <path d="M0 0 L49 39 L0 70Z" fill="url(#env-side)" />
            <path d="M100 0 L51 39 L100 70Z" fill="url(#env-side)" />
            <path d="M0 70 L50 33 L100 70Z" fill="url(#env-bottom)" />
            <path d="M0 70 L50 33 L100 70" fill="none" stroke="#e7a9bf" strokeOpacity=".55" strokeWidth=".35" vectorEffect="non-scaling-stroke" />
          </svg>
          <ArtImg name="envelope-flowers" className="envelope__flowers" eager />
          <span className="envelope__flap">
            <svg viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f3c6d6" />
                  <stop offset="1" stopColor="#f8dbe5" />
                </linearGradient>
              </defs>
              <path d="M0 0 H100 L53 41 Q50 44 47 41 Z" fill="url(#env-flap)" />
              <path d="M0 0 L47 41 Q50 44 53 41 L100 0" fill="none" stroke="#e4a0b8" strokeOpacity=".6" strokeWidth=".4" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
          <span className="envelope__seal">
            <Butterfly tone="rose" className="envelope__seal-butterfly flutter flutter--slow" />
          </span>
        </button>
        {phase === "opening" ? <Burst className="envelope-burst" /> : null}
      </div>

      <p className="envelope-screen__hint" id="envelope-dica">
        Toque para abrir o convite
      </p>

      <a href="#convite" className="envelope-screen__skip" onClick={skip}>
        Ver convite
      </a>
    </section>
  );
}
