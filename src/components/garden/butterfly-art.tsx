/**
 * Borboletas em aquarela realista (arte própria), desenhadas em SVG e servidas
 * como imagens estáticas em /art/bf-<cor>-wing.svg e /art/bf-<cor>-body.svg.
 * A asa direita é a esquerda espelhada; o movimento 3D fica no CSS (.fb3d).
 */

export const BUTTERFLY_TONES = {
  rose: { inner: "#fff3d6", mid: "#fde2e8", outer: "#f5afc2", edge: "#ea85a5", vein: "#d8678a", spot: "#df5a7d", body: "#ef9db2", bodyDark: "#df7f9b" },
  peach: { inner: "#fff1c9", mid: "#ffe1d8", outer: "#f8bcbb", edge: "#ef8f9c", vein: "#dd7886", spot: "#e05f73", body: "#f3a7a9", bodyDark: "#e2848c" },
  iris: { inner: "#f1fbff", mid: "#d5e7fa", outer: "#c3b3ef", edge: "#9d80da", vein: "#8a6fcf", spot: "#7a56c4", body: "#b9a5e8", bodyDark: "#8f74cf" },
  lavender: { inner: "#fdf7ff", mid: "#efdff8", outer: "#d8baf0", edge: "#b98fe0", vein: "#a77cd3", spot: "#9366c3", body: "#cdb0ea", bodyDark: "#a888d6" },
  sky: { inner: "#f6fcff", mid: "#dcefff", outer: "#afd4f3", edge: "#7fb3e4", vein: "#6c9fd4", spot: "#5a8fca", body: "#a9cbee", bodyDark: "#7fa9da" },
  orchid: { inner: "#fff7fd", mid: "#f6e3f7", outer: "#e5c0ea", edge: "#cf99da", vein: "#bb80c9", spot: "#a560b6", body: "#ddb1e5", bodyDark: "#bf8acb" },
} as const;

export type ButterflyTone = keyof typeof BUTTERFLY_TONES;
export const BUTTERFLY_TONE_NAMES = Object.keys(BUTTERFLY_TONES) as ButterflyTone[];

// Contornos com a borda externa levemente ondulada (asa esquerda; corpo em x = 0).
const FORE =
  "M-3 -6 C -10 -28, -26 -48, -46 -52 C -54 -53, -59 -48, -60 -40 Q -63 -35 -60 -31 Q -62 -26 -59 -22 Q -61 -16 -57 -12 Q -56 -8 -52 -6 C -44 -1, -30 2, -16 3 C -9 3, -5 1, -3 -2 Z";
const HIND =
  "M-3 2 C -14 4, -30 6, -42 14 C -52 21, -54 34, -48 42 Q -46 47 -40 46 Q -36 52 -30 49 Q -24 53 -19 47 C -12 38, -6 22, -3 8 Z";

const FORE_VEINS = [
  "M-4 -4 C -14 -20, -28 -38, -44 -49",
  "M-4 -3 C -16 -16, -32 -30, -52 -42",
  "M-5 -2 C -20 -12, -38 -22, -58 -32",
  "M-30 -16 C -40 -21, -50 -24, -59 -24",
  "M-5 -1 C -20 -6, -40 -10, -58 -17",
  "M-5 0 C -22 -1, -40 -4, -55 -9",
  "M-6 1 C -20 2, -34 1, -48 -3",
  "M-24 -9 C -28 -15, -27 -21, -23 -26",
  "M-36 -13 C -38 -20, -38 -27, -34 -33",
];
const HIND_VEINS = [
  "M-4 4 C -18 8, -32 12, -46 20",
  "M-4 5 C -18 14, -32 24, -47 35",
  "M-4 6 C -14 18, -26 32, -38 45",
  "M-4 6 C -10 20, -18 34, -26 49",
  "M-4 5 C -8 18, -10 30, -14 44",
  "M-22 16 C -26 22, -28 28, -27 34",
];

function WingDefs({ tone }: { tone: ButterflyTone }) {
  const c = BUTTERFLY_TONES[tone];
  return (
    <defs>
      <radialGradient id="w-fill" cx="0" cy="0" r="62" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={c.inner} />
        <stop offset=".38" stopColor={c.inner} />
        <stop offset=".62" stopColor={c.mid} />
        <stop offset=".86" stopColor={c.outer} />
        <stop offset="1" stopColor={c.edge} />
      </radialGradient>
      <clipPath id="w-fore">
        <path d={FORE} />
      </clipPath>
      <clipPath id="w-hind">
        <path d={HIND} />
      </clipPath>
      {/* tinta acumulada na borda */}
      <filter id="w-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.8" />
      </filter>
      {/* granulado da aquarela */}
      <filter id="w-grain" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4" result="n" />
        <feColorMatrix
          in="n"
          type="matrix"
          values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.75 0 0 0 -0.3`}
          result="light"
        />
        <feComposite in="light" in2="SourceGraphic" operator="in" result="speckle" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="speckle" />
        </feMerge>
      </filter>
      {/* traço de nanquim levemente irregular */}
      <filter id="w-ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="9" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="0.9" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

function WingPart({ d, clip, tone, veins }: { d: string; clip: string; tone: ButterflyTone; veins: string[] }) {
  const c = BUTTERFLY_TONES[tone];
  return (
    <g>
      <g clipPath={`url(#${clip})`}>
        <g filter="url(#w-grain)">
          <path d={d} fill="url(#w-fill)" />
          {/* faixa clara por dentro da borda */}
          <path d={d} fill="none" stroke="#fffaf4" strokeWidth="15" strokeOpacity=".45" filter="url(#w-soft)" />
          {/* borda mais escura, como tinta que escorreu para a margem */}
          <path d={d} fill="none" stroke={c.edge} strokeWidth="9" strokeOpacity=".55" filter="url(#w-soft)" />
          <path d={d} fill="none" stroke={c.edge} strokeWidth="3.4" strokeOpacity=".45" />
        </g>
        {veins.map((v, i) => (
          <path key={i} d={v} fill="none" stroke={c.vein} strokeWidth={i < 2 ? 0.62 : 0.45} strokeOpacity=".85" strokeLinecap="round" />
        ))}
      </g>
      <path d={d} fill="none" stroke={c.vein} strokeWidth=".75" strokeOpacity=".95" strokeLinejoin="round" filter="url(#w-ink)" />
    </g>
  );
}

/** Asa esquerda completa (anterior + posterior). viewBox "-64 -58 64 116". */
export function ButterflyWingArt({ tone }: { tone: ButterflyTone }) {
  const c = BUTTERFLY_TONES[tone];
  return (
    <svg viewBox="-64 -58 64 116" aria-hidden="true" focusable="false">
      <WingDefs tone={tone} />
      <WingPart d={HIND} clip="w-hind" tone={tone} veins={HIND_VEINS} />
      <WingPart d={FORE} clip="w-fore" tone={tone} veins={FORE_VEINS} />
      {/* pintinhas */}
      <g fill={c.spot}>
        <circle cx="-50" cy="-40" r="3.2" opacity=".85" filter="url(#w-soft)" />
        <circle cx="-50" cy="-40" r="2.4" opacity=".75" />
        <circle cx="-43" cy="-45.5" r="2.3" opacity=".8" />
        <circle cx="-55" cy="-31" r="1.4" opacity=".6" />
        <circle cx="-41" cy="33" r="2.2" opacity=".85" />
        <circle cx="-34" cy="39.5" r="2.5" opacity=".85" />
        <circle cx="-26.5" cy="43" r="2" opacity=".8" />
        <circle cx="-45" cy="23" r="1.5" opacity=".6" />
      </g>
      {/* brilho suave */}
      <ellipse cx="-24" cy="-22" rx="12" ry="3.6" transform="rotate(-35 -24 -22)" fill="#fff" opacity=".28" filter="url(#w-soft)" />
      <ellipse cx="-20" cy="16" rx="7" ry="2.6" transform="rotate(35 -20 16)" fill="#fff" opacity=".22" filter="url(#w-soft)" />
    </svg>
  );
}

/** Corpo segmentado e antenas. viewBox "-64 -58 128 116". */
export function ButterflyBodyArt({ tone }: { tone: ButterflyTone }) {
  const c = BUTTERFLY_TONES[tone];
  const segments = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="-64 -58 128 116" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="b-fill" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".35" stopColor={c.body} />
          <stop offset="1" stopColor={c.bodyDark} />
        </radialGradient>
      </defs>
      {/* antenas com pontinha arredondada */}
      <g fill="none" stroke={c.bodyDark} strokeWidth=".9" strokeLinecap="round">
        <path d="M-1.4 -16 C -5 -28, -10 -38, -15 -45" />
        <path d="M1.4 -16 C 5 -28, 10 -38, 15 -45" />
      </g>
      <ellipse cx="-15.4" cy="-46" rx="1.6" ry="2.2" fill={c.bodyDark} transform="rotate(-30 -15.4 -46)" />
      <ellipse cx="15.4" cy="-46" rx="1.6" ry="2.2" fill={c.bodyDark} transform="rotate(30 15.4 -46)" />
      {/* abdômen em anéis */}
      {segments.map((i) => {
        const y = 4 + i * 3.6;
        const rx = 3.3 - i * 0.28;
        return <ellipse key={i} cx="0" cy={y} rx={rx} ry="2.4" fill="url(#b-fill)" stroke={c.bodyDark} strokeOpacity=".45" strokeWidth=".5" />;
      })}
      {/* tórax e cabeça */}
      <ellipse cx="0" cy="-5" rx="4.2" ry="7" fill="url(#b-fill)" stroke={c.bodyDark} strokeOpacity=".5" strokeWidth=".6" />
      <circle cx="0" cy="-14.5" r="3.6" fill="url(#b-fill)" stroke={c.bodyDark} strokeOpacity=".5" strokeWidth=".6" />
      {/* pontinho de luz */}
      <circle cx="-0.6" cy="-2" r="1.5" fill="#fff" opacity=".9" />
      <circle cx="-0.6" cy="-2" r="3.2" fill="#fff" opacity=".25" />
    </svg>
  );
}
