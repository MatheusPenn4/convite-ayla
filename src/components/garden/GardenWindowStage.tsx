"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { requestMotionPermission } from "@/lib/motion-permission";
import { Butterfly, PetalShape } from "./art";

type Burst = { id: number; x: number; y: number };

// Deslocamento máximo da paisagem distante, em fração do tamanho da janela.
const PAN_X = 0.32;
const PAN_Y = 0.08;
const TILT_RANGE = 10; // graus de inclinação para o deslocamento máximo
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
      const tx = idle ? Math.sin(t / 4200) * 0.3 : i.x;
      const ty = idle ? Math.cos(t / 5300) * 0.25 : i.y;
      cur.x += (tx - cur.x) * 0.1;
      cur.y += (ty - cur.y) * 0.1;
      el.style.setProperty("--gx", (-cur.x * el.clientWidth * PAN_X).toFixed(1));
      el.style.setProperty("--gy", (-cur.y * el.clientHeight * PAN_Y).toFixed(1));
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

    // Inclinação do celular. A referência é a posição em que a pessoa está
    // segurando o aparelho, e ela acompanha devagar: a vista reage ao movimento
    // e volta ao centro quando o celular fica parado. (No iPhone, os eventos só
    // chegam depois da permissão pedida em requestMotionPermission.)
    const base = { x: NaN, y: NaN };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      if (Number.isNaN(base.x)) {
        base.x = e.gamma;
        base.y = e.beta;
      }
      // Volta ao centro devagar (alguns segundos) quando o celular fica parado.
      base.x += (e.gamma - base.x) * 0.004;
      base.y += (e.beta - base.y) * 0.004;
      input.current = {
        x: clamp((e.gamma - base.x) / TILT_RANGE),
        y: clamp((e.beta - base.y) / TILT_RANGE),
        at: performance.now(),
      };
    };
    window.addEventListener("deviceorientation", onTilt);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("deviceorientation", onTilt);
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
      onClick={requestMotionPermission}
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
