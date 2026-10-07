/**
 * Janela em arco com vista para um jardim encantado.
 *
 * A cena é desenhada em camadas de profundidade (céu, colinas, árvores, campo,
 * flores da frente). A parte interativa (paralaxe, toque) fica em
 * GardenWindowStage; aqui é tudo SVG estático renderizado no servidor.
 */
import type { CSSProperties, ReactNode } from "react";
import { Blossom, Bud, Butterfly, Cosmos, Lavender, Rose, Sprig } from "./art";
import { GardenWindowStage } from "./GardenWindowStage";

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

const VIEW = "0 0 200 250";

function Layer({ depth, className = "", children }: { depth: number; className?: string; children: ReactNode }) {
  return (
    <div className={`gw__layer ${className}`} style={{ "--d": depth } as CSSProperties} aria-hidden="true">
      <svg viewBox={VIEW} preserveAspectRatio="xMidYMax slice" focusable="false">
        {children}
      </svg>
    </div>
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
      <rect x="-20" y="-20" width="240" height="290" fill="url(#gw-sky)" />
      <linearGradient id="gw-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffaf0" stopOpacity=".55" />
        <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
      </linearGradient>
      <g className="gw-rays" fill="url(#gw-ray)">
        <path d="M146 92 L96 190 L118 190Z" />
        <path d="M146 92 L134 196 L150 196Z" />
        <path d="M146 92 L170 192 L188 188Z" />
        <path d="M146 92 L60 170 L74 178Z" opacity=".6" />
      </g>
      <circle cx="146" cy="92" r="70" fill="url(#gw-sun)" />
      <circle cx="146" cy="92" r="11" fill="#fffdf6" opacity=".9" />
      <g className="gw-cloud" fill="#fff" opacity=".75">
        <ellipse cx="40" cy="48" rx="26" ry="7" />
        <ellipse cx="52" cy="43" rx="15" ry="8" />
        <ellipse cx="30" cy="45" rx="11" ry="6" />
      </g>
      <g className="gw-cloud gw-cloud--slow" fill="#fff" opacity=".6">
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
      <path d="M-20 142 C 20 124, 60 134, 96 126 C 130 118, 168 130, 220 120 L220 270 L-20 270Z" fill="#dccfee" opacity=".85" />
      <g fill="#cdbfe4" opacity=".75">
        {[-6, 8, 20, 34, 50, 64, 140, 154, 168, 182, 196, 210].map((x, i) => (
          <ellipse key={x} cx={x} cy={135 - (i % 3)} rx={7 + (i % 2) * 2} ry={6 + (i % 3)} />
        ))}
      </g>
      <path d="M-20 152 C 30 138, 70 150, 112 141 C 150 133, 182 143, 220 136 L220 270 L-20 270Z" fill="#c9dcc8" opacity=".9" />
      <path d="M-20 160 C 40 150, 90 158, 140 151 C 170 147, 196 152, 220 149 L220 270 L-20 270Z" fill="#b7d0b2" />
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
      <g fill="#a9c7a2">
        <ellipse cx="62" cy="160" rx="16" ry="7" />
        <ellipse cx="140" cy="158" rx="18" ry="7" />
        <ellipse cx="10" cy="162" rx="16" ry="8" />
        <ellipse cx="192" cy="157" rx="16" ry="8" />
      </g>
      <BlossomTree x={34} y={164} s={1.05} />
      <BlossomTree x={170} y={160} s={0.85} />
      <BlossomTree x={128} y={156} s={0.5} />
      <BlossomTree x={66} y={157} s={0.45} />
      <Arbor />
    </>
  );
}

/* ---------------------------------------------------- campo cheio de flores */
const MEADOW_TONES = ["#f4a9c4", "#f8cdd9", "#c9b2e8", "#ffffff", "#f6d77f", "#a9cbea"];
const BLOSSOM_KIND = ["blush", "lavender", "sky", "butter"] as const;

/** Fileiras de lavanda que convergem para o caramanchão (dão profundidade). */
function LavenderRows() {
  const rows: ReactNode[] = [];
  const HORIZON = 168;
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const x0 = 100 + side * (40 + k * 30);
      const x1 = 100 + side * (12 + k * 9);
      const buds: ReactNode[] = [];
      for (let i = 0; i <= 30; i++) {
        const t = Math.pow(i / 30, 1.6); // mais espaçado perto, mais denso ao longe
        const y = 252 - (252 - HORIZON) * t;
        const x = x0 + (x1 - x0) * t;
        const size = 4.2 * (1 - t) + 0.7;
        buds.push(
          <g key={i}>
            <ellipse cx={r1(x)} cy={r1(y + size * 0.5)} rx={r1(size * 1.5)} ry={r1(size * 0.7)} fill="#8fae86" opacity=".9" />
            <ellipse cx={r1(x)} cy={r1(y - size * 0.3)} rx={r1(size * 1.2)} ry={r1(size)} fill={i % 3 ? "#b49ad8" : "#c9b5e7"} />
            <ellipse cx={r1(x - size * 0.3)} cy={r1(y - size * 0.6)} rx={r1(size * 0.45)} ry={r1(size * 0.4)} fill="#e6dcf5" opacity=".8" />
          </g>,
        );
      }
      rows.push(<g key={`${side}${k}`}>{buds.reverse()}</g>);
    }
  }
  return <>{rows}</>;
}

function Meadow() {
  const rand = seeded(1212);
  const dots = Array.from({ length: 60 }, () => {
    const depth = Math.pow(rand(), 0.75); // mais flores perto da janela
    const y = 168 + depth * 84;
    let x = rand() * 220 - 10;
    if (y < 200 && x > 80 && x < 120) x += x < 100 ? -24 : 24; // deixa o caminho livre
    return { x: r1(x), y: r1(y), size: r1(0.55 + depth * 2.1), tone: Math.floor(rand() * MEADOW_TONES.length) };
  });
  const grass = Array.from({ length: 46 }, () => {
    const y = 172 + rand() * 80;
    const x = rand() * 220 - 10;
    const h = 2 + ((y - 172) / 80) * 6;
    return `M${r1(x)} ${r1(y)} q ${r1(rand() * 2 - 1)} ${r1(-h / 2)} ${r1(rand() * 3 - 1.5)} ${r1(-h)}`;
  });
  return (
    <>
      <defs>
        <linearGradient id="gw-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd6ad" />
          <stop offset="1" stopColor="#93b787" />
        </linearGradient>
      </defs>
      <path d="M-20 170 C 40 162, 120 168, 220 160 L220 270 L-20 270Z" fill="url(#gw-grass)" />
      <path d="M66 270 C 84 222, 93 196, 96 170 L104 170 C 107 196, 116 222, 134 270Z" fill="#f4e7dc" />
      <path d="M66 270 C 84 222, 93 196, 96 170 M134 270 C 116 222, 107 196, 104 170" fill="none" stroke="#e2cdbd" strokeWidth="1.2" />
      {[[92, 240, 3.2], [106, 226, 2.6], [97, 212, 2.2], [103, 200, 1.8], [99, 190, 1.4], [101, 181, 1]].map(([cx, cy, rx], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={rx * 0.45} fill="#e6d3c3" />
      ))}
      <path d={grass.join(" ")} stroke="#7fa676" strokeWidth=".8" fill="none" strokeLinecap="round" opacity=".8" />
      <LavenderRows />
      {dots.map((d, i) =>
        d.size > 1.9 ? (
          <Blossom key={i} x={d.x} y={d.y} s={r1(d.size * 0.11 * 10) / 10} tone={BLOSSOM_KIND[d.tone % 4]} />
        ) : (
          <circle key={i} cx={d.x} cy={d.y} r={d.size} fill={MEADOW_TONES[d.tone]} />
        ),
      )}
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
      <g className="gw-sway">
        <Lavender x={8} y={262} r={-6} s={1.35} />
        <Sprig x={4} y={262} r={4} length={120} leaves={7} />
        <Stem from={[16, 262]} to={[22, 168]} bend={-10} />
        <Rose x={22} y={168} s={0.7} tone="rose" />
      </g>
      <g className="gw-sway gw-sway--b">
        <Stem from={[34, 262]} to={[42, 194]} bend={8} />
        <Cosmos x={42} y={194} s={0.5} tone="lilac" r={-10} />
        <Stem from={[26, 262]} to={[10, 206]} bend={-4} />
        <Blossom x={10} y={206} s={0.8} tone="sky" />
      </g>
      <g className="gw-sway gw-sway--c">
        <Lavender x={194} y={262} r={8} s={1.3} />
        <Sprig x={198} y={262} r={-6} length={116} leaves={7} bend={-12} />
        <Stem from={[182, 262]} to={[178, 174]} bend={10} />
        <Rose x={178} y={174} s={0.62} tone="lilac" r={14} />
      </g>
      <g className="gw-sway gw-sway--b">
        <Stem from={[166, 262]} to={[158, 200]} bend={-6} />
        <Cosmos x={158} y={200} s={0.44} tone="blush" r={8} />
        <Stem from={[196, 262]} to={[194, 150]} bend={-6} />
        <Bud x={194} y={152} s={0.85} tone="blush" r={6} />
        <Blossom x={190} y={212} s={0.72} tone="lavender" />
      </g>
    </>
  );
}

/* ------------------------------------------------------- moldura da janela */
function WindowFrame() {
  return (
    <svg className="gw__frame" viewBox={VIEW} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="square">
        <path d="M100 0 V250 M0 100 H200" stroke="rgba(110,60,90,.16)" strokeWidth="6" transform="translate(1 1.6)" />
        <path d="M100 0 V250 M0 100 H200" stroke="#fffaf7" strokeWidth="4.6" />
        <path d="M100 0 V250 M0 100 H200" stroke="#f1e2e8" strokeWidth="1" transform="translate(1.6 1.6)" opacity=".8" />
      </g>
      <circle cx="100" cy="100" r="4.2" fill="#fffaf7" stroke="#e9d3dc" strokeWidth=".8" />
      <circle cx="100" cy="100" r="1.8" fill="#e8cd86" />
      {/* puxador */}
      <rect x="104.5" y="150" width="2.2" height="10" rx="1.1" fill="#e8cd86" />
    </svg>
  );
}

export function GardenWindow() {
  return (
    <GardenWindowStage label="Janela em arco com vista para um jardim encantado, cheio de flores e borboletas">
      <Layer depth={0.15} className="gw__sky"><Sky /></Layer>
      <Layer depth={0.3}><Hills /></Layer>
      <Layer depth={0.45}><Trees /></Layer>
      <Layer depth={0.65}><Meadow /></Layer>
      <div className="gw__flyers" aria-hidden="true">
        <div className="gw-fly gw-fly--a"><Butterfly tone="rose" className="flutter" /></div>
        <div className="gw-fly gw-fly--b"><Butterfly tone="lilac" className="flutter flutter--slow" /></div>
        <div className="gw-fly gw-fly--c"><Butterfly tone="sky" className="flutter" /></div>
      </div>
      <div className="gw__pollen" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => <span key={i} />)}
      </div>
      <Layer depth={1} className="gw__front"><Foreground /></Layer>
      <div className="gw__glass" aria-hidden="true" />
      <WindowFrame />
      <div className="gw__rim" aria-hidden="true" />
    </GardenWindowStage>
  );
}
