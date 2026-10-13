"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO = {
  portrait: { src: "/video/fundo-retrato.mp4", poster: "/video/fundo-retrato.jpg" },
  landscape: { src: "/video/fundo-paisagem.mp4", poster: "/video/fundo-paisagem.jpg" },
};
const LANDSCAPE_QUERY = "(min-aspect-ratio: 1/1)";

/**
 * Fundo fixo do convite: vídeo em loop (flores nos cantos, borboletas nas
 * laterais) atrás do conteúdo. Só começa a baixar depois que a abertura termina,
 * para não disputar a rede com ela; até lá (e com movimento reduzido) fica a
 * imagem do primeiro quadro. Pausa com a aba escondida.
 */
export function InviteBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const mq = window.matchMedia(LANDSCAPE_QUERY);
    let started = false;

    const play = () => {
      video.play().catch(() => {
        /* autoplay bloqueado (ex.: modo economia do iPhone): fica a imagem */
      });
    };
    const load = () => {
      const next = VIDEO[mq.matches ? "landscape" : "portrait"].src;
      if (video.getAttribute("src") === next) return;
      setPlaying(false);
      video.muted = true;
      video.src = next;
      play();
    };
    const start = () => {
      if (started || root.dataset.envelope !== "open") return;
      started = true;
      load();
      mq.addEventListener("change", load);
    };
    const onVisibility = () => {
      if (!started) return;
      if (document.hidden) video.pause();
      else play();
    };

    const observer = new MutationObserver(start);
    observer.observe(root, { attributes: true, attributeFilter: ["data-envelope"] });
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", load);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <picture>
        <source media={LANDSCAPE_QUERY} srcSet={VIDEO.landscape.poster} />
        {/* eslint-disable-next-line @next/next/no-img-element -- quadro inicial do vídeo, já otimizado */}
        <img className="backdrop__poster" src={VIDEO.portrait.poster} alt="" decoding="async" fetchPriority="low" />
      </picture>
      <video
        ref={videoRef}
        className={`backdrop__video${playing ? " is-playing" : ""}`}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
      />
    </div>
  );
}
