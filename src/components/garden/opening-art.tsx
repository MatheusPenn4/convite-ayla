/**
 * Ilustrações da tela de abertura: borboletas brilhantes de várias cores,
 * flores brancas/rosadas com borda e miolo dourados e ramos de bolinhas.
 * Arte própria do convite (inspirada no clima "voo das borboletas").
 */
import type { CSSProperties, SVGProps } from "react";

type Place = { x?: number; y?: number; s?: number; r?: number };
const place = ({ x = 0, y = 0, s = 1, r = 0 }: Place) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

/* ------------------------------------------------------------ gradientes */

/** Gradientes das flores e do dourado (embutidos em cada arquivo de arte). */
export function OpeningDefsContent() {
  return (
    <defs>
      <radialGradient id="op-gold" cx="40%" cy="35%" r="70%">
        <stop offset="0" stopColor="#fff4c8" />
        <stop offset=".45" stopColor="#ecc65f" />
        <stop offset="1" stopColor="#b5852b" />
      </radialGradient>
      <radialGradient id="op-petal-white" cx="50%" cy="100%" r="105%">
        <stop offset="0" stopColor="#ee9fb8" />
        <stop offset=".3" stopColor="#f8cfdc" />
        <stop offset=".68" stopColor="#fff2f6" />
        <stop offset="1" stopColor="#ffffff" />
      </radialGradient>
      <radialGradient id="op-petal-blush" cx="50%" cy="100%" r="105%">
        <stop offset="0" stopColor="#e98aaa" />
        <stop offset=".45" stopColor="#f7c6d6" />
        <stop offset="1" stopColor="#fff0f5" />
      </radialGradient>
    </defs>
  );
}

/* ----------------------------------------------------------------- flores */

const PETAL = "M0 0 C-20 -4 -32 -30 -20 -48 C-12 -58 12 -58 20 -48 C32 -30 20 -4 0 0Z";

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Flor aberta com pétalas de borda dourada e miolo de glitter. Raio ~55. */
export function GlitterFlower({ tone = "white", seed = 1, ...p }: Place & { tone?: "white" | "blush"; seed?: number }) {
  const rand = seeded(seed * 97);
  const glitter = Array.from({ length: 30 }, (_, i) => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 13;
    return { cx: r1(Math.cos(a) * d), cy: r1(Math.sin(a) * d), r: r1(0.7 + rand() * 1.6), c: i % 3 };
  });
  const fill = `url(#op-petal-${tone})`;
  return (
    <g transform={place(p)}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={`o${a}`} d={PETAL} transform={`rotate(${a + 15})`} fill={fill} stroke="#d8ae57" strokeOpacity=".6" strokeWidth=".9" />
      ))}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={`i${a}`} d={PETAL} transform={`rotate(${a + 45}) scale(.62)`} fill={fill} stroke="#d8ae57" strokeOpacity=".5" strokeWidth="1.2" />
      ))}
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={`v${a}`} d="M0 -8 C 2 -20, 1 -32, 0 -42" transform={`rotate(${a + 15})`} fill="none" stroke="#e7a1b8" strokeOpacity=".35" strokeWidth=".8" />
      ))}
      <circle r="14" fill="url(#op-gold)" />
      {glitter.map((g, i) => (
        <circle key={i} cx={g.cx} cy={g.cy} r={g.r} fill={g.c === 0 ? "#fff3c4" : g.c === 1 ? "#e3b54d" : "#a87724"} />
      ))}
    </g>
  );
}

function Bud({ x, y, r = 0, s = 1 }: Place) {
  return (
    <g transform={place({ x, y, r, s })}>
      <path d="M0 0 C-9 -6 -10 -19 0 -28 C10 -19 9 -6 0 0Z" fill="url(#op-petal-blush)" stroke="#d8ae57" strokeOpacity=".5" strokeWidth=".8" />
    </g>
  );
}

function GoldDust({ seed, w, h, count }: { seed: number; w: number; h: number; count: number }) {
  const rand = seeded(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={r1(rand() * w)} cy={r1(rand() * h)} r={r1(0.8 + rand() * 2.6)} fill={i % 4 ? "url(#op-gold)" : "#fff1bf"} opacity={r1(0.6 + rand() * 0.4)} />
      ))}
    </g>
  );
}

type ArtProps = SVGProps<SVGSVGElement>;

/** Flores do topo da abertura (largura total da tela). */
export function OpeningTop(props: ArtProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false" {...props}>
      <OpeningDefsContent />
      <GoldDust seed={11} w={400} h={260} count={36} />
      <Bud x={128} y={92} r={-150} s={1.2} />
      <Bud x={268} y={96} r={150} s={1.1} />
      <GlitterFlower tone="blush" x={212} y={2} s={0.95} r={10} seed={2} />
      <GlitterFlower tone="white" x={58} y={64} s={1.55} r={-8} seed={3} />
      <GlitterFlower tone="white" x={348} y={58} s={1.35} r={22} seed={4} />
      <GlitterFlower tone="blush" x={128} y={14} s={0.75} r={30} seed={5} />
    </svg>
  );
}

/** Flores da base da abertura. */
export function OpeningBottom(props: ArtProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" {...props}>
      <OpeningDefsContent />
      <GoldDust seed={23} w={400} h={300} count={40} />
      <Bud x={150} y={236} r={-20} s={1.1} />
      <Bud x={262} y={226} r={24} s={1.2} />
      <GlitterFlower tone="blush" x={66} y={244} s={1.5} r={14} seed={6} />
      <GlitterFlower tone="white" x={206} y={298} s={1.15} r={-6} seed={7} />
      <GlitterFlower tone="white" x={344} y={238} s={1.45} r={-18} seed={8} />
      <GlitterFlower tone="blush" x={286} y={300} s={0.85} r={40} seed={9} />
    </svg>
  );
}

/** Ramo delicado de bolinhas rosadas para a lateral. */
export function OpeningBranch(props: ArtProps) {
  const dots: Array<[number, number, number]> = [
    [70, 30, 6], [86, 46, 5], [60, 58, 5.5], [92, 76, 6], [74, 92, 4.5], [98, 112, 5.5],
    [66, 130, 5], [90, 150, 6], [72, 172, 4.5], [96, 190, 5], [80, 214, 5.5],
  ];
  return (
    <svg viewBox="0 0 120 260" aria-hidden="true" focusable="false" {...props}>
      <path d="M118 250 C 92 200, 96 150, 78 100 C 70 72, 74 46, 70 20" fill="none" stroke="#e8a9bd" strokeWidth="1.6" strokeOpacity=".8" />
      <path d="M86 160 C 96 148, 92 140, 90 150 M80 110 C 66 98, 62 90, 60 58 M88 70 C 92 64, 94 60, 92 76" fill="none" stroke="#e8a9bd" strokeWidth="1.1" strokeOpacity=".7" />
      {dots.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#f3b3c7" opacity=".8" />
      ))}
    </svg>
  );
}
