import type { CSSProperties } from "react";
import { Butterfly, PetalShape } from "./art";

type Particle = { kind: "petal" | "butterfly"; dx: number; dy: number; rot: number; delay: number; size: number; tone: number };

// Trajetórias fixas (determinísticas) para uma revelação equilibrada.
const PARTICLES: Particle[] = [
  { kind: "butterfly", dx: -150, dy: -210, rot: -18, delay: 0, size: 46, tone: 0 },
  { kind: "butterfly", dx: 160, dy: -180, rot: 16, delay: 90, size: 40, tone: 1 },
  { kind: "butterfly", dx: -60, dy: -280, rot: -6, delay: 180, size: 34, tone: 2 },
  { kind: "butterfly", dx: 110, dy: -300, rot: 10, delay: 260, size: 30, tone: 0 },
  { kind: "petal", dx: -190, dy: -60, rot: -220, delay: 40, size: 16, tone: 0 },
  { kind: "petal", dx: 200, dy: -40, rot: 240, delay: 70, size: 18, tone: 1 },
  { kind: "petal", dx: -120, dy: -150, rot: -160, delay: 120, size: 14, tone: 2 },
  { kind: "petal", dx: 130, dy: -130, rot: 180, delay: 150, size: 15, tone: 3 },
  { kind: "petal", dx: -30, dy: -190, rot: 200, delay: 200, size: 13, tone: 1 },
  { kind: "petal", dx: 40, dy: -220, rot: -200, delay: 230, size: 16, tone: 0 },
  { kind: "petal", dx: -220, dy: 30, rot: -140, delay: 260, size: 12, tone: 3 },
  { kind: "petal", dx: 220, dy: 50, rot: 150, delay: 300, size: 13, tone: 2 },
];

const BUTTERFLY_TONES = ["rose", "lilac", "sky"] as const;
const PETAL_TONES = ["blush", "rose", "lilac", "lavender"] as const;

/** Explosão breve de pétalas e borboletas a partir do centro do elemento pai. */
export function Burst({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  return (
    <div className={`burst ${className}`} aria-hidden="true">
      {PARTICLES.map((p, i) => {
        const style = {
          "--dx": `${p.dx * scale}px`,
          "--dy": `${p.dy * scale}px`,
          "--rot": `${p.rot}deg`,
          "--delay": `${p.delay}ms`,
          "--size": `${p.size}px`,
        } as CSSProperties;
        return (
          <span key={i} className={`burst__item burst__item--${p.kind}`} style={style}>
            {p.kind === "butterfly" ? (
              <Butterfly tone={BUTTERFLY_TONES[p.tone % 3]} className="flutter" />
            ) : (
              <PetalShape tone={PETAL_TONES[p.tone % 4]} />
            )}
          </span>
        );
      })}
    </div>
  );
}
