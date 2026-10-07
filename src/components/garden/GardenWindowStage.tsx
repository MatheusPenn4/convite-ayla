"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Butterfly, PetalShape } from "./art";

type Burst = { id: number; x: number; y: number };

const MAX_SHIFT = 11; // deslocamento máximo (px) da camada mais próxima
const IDLE_AFTER_MS = 2500;
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

const PETALS = [
  { dx: -34, dy: -26, rot: -160, tone: "blush" },
  { dx: 30, dy: -34, rot: 190, tone: "lavender" },
  { dx: -18, dy: -52, rot: 220, tone: "rose" },
  { dx: 22, dy: -14, rot: -200, tone: "lilac" },
] as const;

/**
 * Dá vida à janela: as camadas se deslocam conforme o dedo, o mouse ou a
 * inclinação do celular (paralaxe), e um toque solta uma borboleta com pétalas.
 * Sem interação, a vista "respira" devagar. Tudo pausa fora da tela, em segundo
 * plano e com movimento reduzido.
 */
export function GardenWindowStage({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef({ x: 0, y: 0, at: 0 });
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cur = { x: 0, y: 0 };
    let raf = 0;
    let onScreen = false;

    const loop = (t: number) => {
      const i = input.current;
      const idle = !i.at || t - i.at > IDLE_AFTER_MS;
      const tx = idle ? Math.sin(t / 4200) * 0.45 : i.x;
      const ty = idle ? Math.cos(t / 5300) * 0.3 : i.y;
      cur.x += (tx - cur.x) * 0.06;
      cur.y += (ty - cur.y) * 0.06;
      el.style.setProperty("--gx", (-cur.x * MAX_SHIFT).toFixed(2));
      el.style.setProperty("--gy", (-cur.y * MAX_SHIFT * 0.6).toFixed(2));
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && onScreen && document.visibilityState === "visible") raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(el);
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);

    // Inclinação do celular (Android). No iPhone exigiria um pedido de permissão; lá vale o toque.
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined;
    const canTilt = DOE && typeof DOE.requestPermission !== "function";
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      input.current = { x: clamp(e.gamma / 25), y: clamp((e.beta - 45) / 25), at: performance.now() };
    };
    if (canTilt) window.addEventListener("deviceorientation", onTilt);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (canTilt) window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  function track(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    input.current = {
      x: clamp(((e.clientX - r.left) / r.width - 0.5) * 2),
      y: clamp(((e.clientY - r.top) / r.height - 0.5) * 2),
      at: performance.now(),
    };
  }

  function burst(e: PointerEvent<HTMLDivElement>) {
    track(e);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const b = {
      id: nextId.current++,
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
    setBursts((list) => [...list.slice(-3), b]);
    setTimeout(() => setBursts((list) => list.filter((x) => x.id !== b.id)), 1800);
  }

  return (
    <div
      ref={ref}
      className="gw"
      role="img"
      aria-label={label}
      onPointerMove={track}
      onPointerDown={burst}
      onPointerLeave={() => (input.current.at = 0)}
    >
      {children}
      {bursts.map((b) => (
        <span key={b.id} className="gw-burst" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden="true">
          <span className="gw-burst__butterfly">
            <Butterfly tone={b.id % 3 === 0 ? "sky" : b.id % 2 ? "rose" : "lilac"} className="flutter" />
          </span>
          {PETALS.map((p, i) => (
            <span
              key={i}
              className="gw-burst__petal"
              style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg` } as CSSProperties}
            >
              <PetalShape tone={p.tone} />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
