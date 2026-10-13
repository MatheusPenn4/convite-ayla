"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { eventConfig } from "@/config/event";
import { FancyButterfly3D } from "@/components/garden/FancyButterfly3D";
import { requestMotionPermission } from "@/lib/motion-permission";

type Phase = "closed" | "opening" | "done";

const STORAGE_KEY = "ayla:envelope";
/** Duração da saída (deve acompanhar os tempos do CSS). */
const OPENING_MS = 1700;
const REDUCED_MS = 260;

const KICKER = "CONVITE";

const VIDEO = {
  portrait: { src: "/video/abertura-retrato.mp4", poster: "/video/abertura-retrato.jpg" },
  landscape: { src: "/video/abertura-paisagem.mp4", poster: "/video/abertura-paisagem.jpg" },
};
const LANDSCAPE_QUERY = "(min-aspect-ratio: 1/1)";

/**
 * Fundo em vídeo (flores, borboletas e brilhos em loop, feito no Remotion).
 * A imagem do primeiro quadro aparece na hora; o vídeo entra por cima quando
 * começa a tocar. Com movimento reduzido, fica só a imagem.
 */
function OpeningVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion()) return;
    const mq = window.matchMedia(LANDSCAPE_QUERY);
    const load = () => {
      const next = VIDEO[mq.matches ? "landscape" : "portrait"].src;
      if (video.getAttribute("src") === next) return;
      setPlaying(false);
      video.muted = true;
      video.src = next;
      video.play().catch(() => {
        /* autoplay bloqueado (ex.: modo economia do iPhone): fica a imagem */
      });
    };
    load();
    mq.addEventListener("change", load);
    return () => mq.removeEventListener("change", load);
  }, []);

  return (
    <div className="opening__media" aria-hidden="true">
      <picture>
        <source media={LANDSCAPE_QUERY} srcSet={VIDEO.landscape.poster} />
        {/* eslint-disable-next-line @next/next/no-img-element -- quadro inicial do vídeo, já otimizado */}
        <img className="opening__poster" src={VIDEO.portrait.poster} alt="" decoding="async" fetchPriority="high" />
      </picture>
      <video
        ref={videoRef}
        className={`opening__video${playing ? " is-playing" : ""}`}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
      />
    </div>
  );
}

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
      <OpeningVideo />

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
