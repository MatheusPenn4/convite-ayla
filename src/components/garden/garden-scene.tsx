/**
 * Camadas da vista da janela (céu, colinas, árvores, campo, flores da frente).
 * Viram arquivos SVG estáticos em /art/gw-*.svg no build; a página só usa <img>.
 */
import type { ReactNode } from "react";
import { Blossom, Bud, Cosmos, Lavender, Rose, Sprig } from "./art";

/* Gerador pseudoaleatório fixo: mesma cena no servidor e no navegador. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A cena é mais larga que a janela: inclinando, aparecem as laterais do jardim. */
const SCENE = "-100 -25 400 300";
function SceneSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox={SCENE} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ céu */
function Sky() {
  return (
    <>
      <defs>
        <linearGradient id="gw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3d6f3" />
          <stop offset=".38" stopColor="#f5dcea" />
          <stop offset=".62" stopColor="#fde9e4" />
          <stop offset=".8" stopColor="#fff3df" />
        </linearGradient>
        <radialGradient id="gw-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffdf3" />
          <stop offset=".25" stopColor="#fff6dd" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffe9d2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-120" y="-40" width="440" height="330" fill="url(#gw-sky)" />
      <linearGradient id="gw-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffaf0" stopOpacity=".55" />
        <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
      </linearGradient>
      <g fill="url(#gw-ray)">
        <path d="M146 92 L96 190 L118 190Z" />
        <path d="M146 92 L134 196 L150 196Z" />
        <path d="M146 92 L170 192 L188 188Z" />
        <path d="M146 92 L60 170 L74 178Z" opacity=".6" />
      </g>
      <circle cx="146" cy="92" r="70" fill="url(#gw-sun)" />
      <circle cx="146" cy="92" r="11" fill="#fffdf6" opacity=".9" />
      <g fill="#fff" opacity=".75">
        <ellipse cx="40" cy="48" rx="26" ry="7" />
        <ellipse cx="52" cy="43" rx="15" ry="8" />
        <ellipse cx="30" cy="45" rx="11" ry="6" />
      </g>
      <g fill="#fff" opacity=".7">
        <ellipse cx="-50" cy="34" rx="24" ry="6.5" />
        <ellipse cx="-40" cy="29" rx="13" ry="7" />
        <ellipse cx="250" cy="56" rx="28" ry="7" />
        <ellipse cx="262" cy="50" rx="15" ry="8" />
      </g>
      <g fill="#fff" opacity=".6">
        <ellipse cx="150" cy="30" rx="22" ry="5.5" />
        <ellipse cx="160" cy="26" rx="12" ry="6" />
      </g>
    </>
  );
}

/* -------------------------------------------------------------- colinas */
function Hills() {
  return (
    <>
      <path d="M-120 130 C -80 118, -40 136, -10 132 C 20 124, 60 134, 96 126 C 130 118, 168 130, 220 120 C 250 114, 280 126, 320 118 L320 290 L-120 290Z" fill="#dccfee" opacity=".85" />
      <g fill="#cdbfe4" opacity=".75">
        {[-96, -82, -66, -50, -34, -20, -6, 8, 20, 34, 50, 64, 140, 154, 168, 182, 196, 210, 226, 242, 258, 274, 290].map((x, i) => (
          <ellipse key={x} cx={x} cy={135 - (i % 3)} rx={7 + (i % 2) * 2} ry={6 + (i % 3)} />
        ))}
      </g>
      <path d="M-120 146 C -70 136, -40 150, 0 146 C 30 138, 70 150, 112 141 C 150 133, 182 143, 220 136 C 260 130, 290 142, 320 136 L320 290 L-120 290Z" fill="#c3e0b6" opacity=".9" />
      <path d="M-120 156 C -60 150, -20 160, 40 154 C 90 158, 120 152, 140 151 C 170 147, 196 152, 240 148 C 270 146, 300 152, 320 150 L320 290 L-120 290Z" fill="#acd59a" />
    </>
  );
}

/* --------------------------------------------- árvores floridas + caramanchão */
const CANOPY: Array<[number, number, number, number]> = [
  [0, -26, 13, 0], [-12, -18, 10, 1], [12, -19, 11, 2], [-19, -6, 8, 0], [19, -7, 9, 1],
  [-7, -8, 11, 2], [8, -6, 10, 0], [0, -38, 9, 1], [-14, -30, 8, 2], [14, -31, 8, 0], [0, 2, 8, 1],
];
const BLOSSOM_TONES = ["#f6c2d4", "#f9d8e3", "#eeaac3"];

function BlossomTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const rand = seeded(Math.round(x * 7 + y));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-1.6 0 C -1 -8, -2 -14, -1 -22 M0 -12 C 4 -16, 6 -18, 9 -22 M-1 -15 C -5 -18, -8 -20, -11 -23" stroke="#8b6c77" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="2" cy="1.5" rx="20" ry="3.4" fill="#6f8f6a" opacity=".28" />
      {CANOPY.map(([cx, cy, r], i) => (
        <circle key={`s${i}`} cx={cx + 1.5} cy={cy - 12} r={r} fill="#d98aa9" opacity=".55" />
      ))}
      {CANOPY.map(([cx, cy, r, t], i) => (
        <circle key={i} cx={cx} cy={cy - 14} r={r * 0.92} fill={BLOSSOM_TONES[t]} />
      ))}
      {CANOPY.slice(0, 6).map(([cx, cy, r], i) => (
        <circle key={`h${i}`} cx={cx - r * 0.3} cy={cy - 14 - r * 0.35} r={r * 0.42} fill="#fde8ef" opacity=".7" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={`d${i}`} cx={r1((rand() - 0.5) * 40)} cy={r1(-14 - rand() * 46 + 8)} r={r1(0.7 + rand() * 0.9)} fill={i % 3 ? "#fff" : "#fbe6a6"} opacity=".9" />
      ))}
    </g>
  );
}

function Arbor() {
  return (
    <g>
      {/* arco branco */}
      <path d="M86 168 V146 A14 14 0 0 1 114 146 V168" fill="none" stroke="#fffaf6" strokeWidth="2.4" />
      <path d="M89.5 168 V147 A10.5 10.5 0 0 1 110.5 147 V168" fill="none" stroke="#f1e4ea" strokeWidth="1" />
      {/* rosas trepadeiras */}
      {[[86, 160], [86, 151], [88, 142], [93, 135], [100, 132], [107, 135], [112, 142], [114, 151], [114, 160]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={i % 2 ? 2.4 : 2.8} fill={i % 3 === 0 ? "#e98fb0" : "#f3b4c9"} />
          <circle cx={cx + 1.5} cy={cy + 1.6} r="1.4" fill="#8fb08a" />
        </g>
      ))}
    </g>
  );
}

function Trees() {
  return (
    <>
      <g fill="#9fcf8b">
        <ellipse cx="62" cy="160" rx="16" ry="7" />
        <ellipse cx="140" cy="158" rx="18" ry="7" />
        <ellipse cx="10" cy="162" rx="16" ry="8" />
        <ellipse cx="192" cy="157" rx="16" ry="8" />
        <ellipse cx="-40" cy="160" rx="22" ry="8" />
        <ellipse cx="-88" cy="158" rx="16" ry="7" />
        <ellipse cx="236" cy="158" rx="20" ry="8" />
        <ellipse cx="286" cy="160" rx="18" ry="8" />
      </g>
      <BlossomTree x={-62} y={168} s={1.25} />
      <BlossomTree x={-20} y={158} s={0.6} />
      <BlossomTree x={-92} y={156} s={0.55} />
      <BlossomTree x={256} y={168} s={1.2} />
      <BlossomTree x={218} y={156} s={0.55} />
      <BlossomTree x={294} y={158} s={0.65} />
      <BlossomTree x={34} y={164} s={1.05} />
      <BlossomTree x={170} y={160} s={0.85} />
      <BlossomTree x={128} y={156} s={0.5} />
      <BlossomTree x={66} y={157} s={0.45} />
      <Arbor />
    </>
  );
}

/* ---------------------------------------------------- campo cheio de flores */
function Meadow() {
  return (
    <>
      <defs>
        <linearGradient id="gw-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8dd9c" />
          <stop offset=".5" stopColor="#9fd083" />
          <stop offset="1" stopColor="#84bf6c" />
        </linearGradient>
      </defs>
      <path d="M-120 168 C -40 160, 40 166, 100 165 C 160 166, 240 158, 320 164 L320 290 L-120 290Z" fill="url(#gw-grass)" />
      <path d="M66 270 C 84 222, 93 196, 96 170 L104 170 C 107 196, 116 222, 134 270Z" fill="#f4e7dc" />
      <path d="M66 270 C 84 222, 93 196, 96 170 M134 270 C 116 222, 107 196, 104 170" fill="none" stroke="#e2cdbd" strokeWidth="1.2" />
    </>
  );
}

/* --------------------------------------------- flores em primeiro plano */
function Stem({ from, to, bend = 6 }: { from: [number, number]; to: [number, number]; bend?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  return <path d={`M${x1} ${y1} Q ${(x1 + x2) / 2 + bend} ${(y1 + y2) / 2} ${x2} ${y2}`} stroke="#7a9b77" strokeWidth="1.7" fill="none" strokeLinecap="round" />;
}

function Foreground() {
  return (
    <>
      <g>
        <Lavender x={8} y={262} r={-6} s={1.35} />
        <Sprig x={4} y={262} r={4} length={120} leaves={7} />
        <Stem from={[16, 262]} to={[22, 168]} bend={-10} />
        <Rose x={22} y={168} s={0.7} tone="rose" />
      </g>
      <g>
        <Stem from={[34, 262]} to={[42, 194]} bend={8} />
        <Cosmos x={42} y={194} s={0.5} tone="lilac" r={-10} />
        <Stem from={[26, 262]} to={[10, 206]} bend={-4} />
        <Blossom x={10} y={206} s={0.8} tone="sky" />
      </g>
      <g>
        <Lavender x={194} y={262} r={8} s={1.3} />
        <Sprig x={198} y={262} r={-6} length={116} leaves={7} bend={-12} />
        <Stem from={[182, 262]} to={[178, 174]} bend={10} />
        <Rose x={178} y={174} s={0.62} tone="lilac" r={14} />
      </g>
      <g>
        <Stem from={[166, 262]} to={[158, 200]} bend={-6} />
        <Cosmos x={158} y={200} s={0.44} tone="blush" r={8} />
        <Stem from={[196, 262]} to={[194, 150]} bend={-6} />
        <Bud x={194} y={152} s={0.85} tone="blush" r={6} />
        <Blossom x={190} y={212} s={0.72} tone="lavender" />
      </g>
      <g>
        <Stem from={[-14, 262]} to={[-20, 182]} bend={8} />
        <Rose x={-20} y={182} s={0.66} tone="blush" />
        <Lavender x={-34} y={262} r={-10} s={1.2} />
        <Blossom x={-6} y={220} s={0.7} tone="butter" />
      </g>
      <g>
        <Stem from={[214, 262]} to={[220, 186]} bend={-8} />
        <Rose x={220} y={186} s={0.64} tone="rose" r={-10} />
        <Lavender x={232} y={262} r={10} s={1.2} />
        <Blossom x={208} y={224} s={0.7} tone="sky" />
      </g>
    </>
  );
}

/* ------------------------------------------------ camadas exportadas */
export const SkyLayer = () => <SceneSvg><Sky /></SceneSvg>;
export const HillsLayer = () => <SceneSvg><Hills /></SceneSvg>;
export const TreesLayer = () => <SceneSvg><Trees /></SceneSvg>;
export const MeadowLayer = () => <SceneSvg><Meadow /></SceneSvg>;
export const FrontLayer = () => <SceneSvg><Foreground /></SceneSvg>;

/** Vista completa (sem paralaxe), usada na imagem para compartilhar. */
export function SceneContent() {
  return (
    <>
      <Sky />
      <Hills />
      <Trees />
      <Meadow />
      <Foreground />
    </>
  );
}
