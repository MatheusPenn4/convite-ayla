/**
 * Ilustrações próprias do Jardim Encantado, desenhadas em SVG.
 *
 * As peças são <g> posicionáveis (origem no centro/base) e compartilham os
 * gradientes e o filtro de aquarela definidos uma única vez em <GardenDefs />.
 */
import type { CSSProperties, ReactNode, SVGProps } from "react";

type Place = { x?: number; y?: number; s?: number; r?: number; className?: string; opacity?: number };

function place({ x = 0, y = 0, s = 1, r = 0 }: Place) {
  return `translate(${x} ${y}) rotate(${r}) scale(${s})`;
}

function rays(count: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => offset + (360 / count) * i);
}

/* -------------------------------------------------------------------------- */
/* Definições globais                                                          */
/* -------------------------------------------------------------------------- */

export function GardenDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <GardenDefsContent />
    </svg>
  );
}

/** Gradientes e filtro de aquarela (reutilizado também na imagem de compartilhamento). */
export function GardenDefsContent() {
  return (
      <defs>
        {/* Pétalas: mais intensas na base, quase brancas nas bordas, como aquarela. */}
        <radialGradient id="ay-rose" cx="50%" cy="100%" r="105%">
          <stop offset="0" stopColor="#d9668f" />
          <stop offset=".45" stopColor="#ee9ab7" />
          <stop offset="1" stopColor="#fde3ec" />
        </radialGradient>
        <radialGradient id="ay-blush" cx="50%" cy="100%" r="105%">
          <stop offset="0" stopColor="#ef9fba" />
          <stop offset=".5" stopColor="#f8c8d7" />
          <stop offset="1" stopColor="#fff1f5" />
        </radialGradient>
        <radialGradient id="ay-lilac" cx="50%" cy="100%" r="105%">
          <stop offset="0" stopColor="#9b7fcb" />
          <stop offset=".5" stopColor="#c9b5e7" />
          <stop offset="1" stopColor="#f3ecfb" />
        </radialGradient>
        <radialGradient id="ay-lavender" cx="50%" cy="100%" r="105%">
          <stop offset="0" stopColor="#b9a2dc" />
          <stop offset=".55" stopColor="#ddd0f0" />
          <stop offset="1" stopColor="#f8f4fd" />
        </radialGradient>
        <radialGradient id="ay-sky" cx="50%" cy="100%" r="110%">
          <stop offset="0" stopColor="#7eabd8" />
          <stop offset=".6" stopColor="#b8d5ef" />
          <stop offset="1" stopColor="#eaf3fb" />
        </radialGradient>
        <radialGradient id="ay-butter" cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#fbe7a4" />
          <stop offset="1" stopColor="#ecc252" />
        </radialGradient>
        <linearGradient id="ay-leaf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6f9470" />
          <stop offset="1" stopColor="#b3cdab" />
        </linearGradient>
        <linearGradient id="ay-leaf-soft" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#9fbe99" />
          <stop offset="1" stopColor="#d6e6cf" />
        </linearGradient>
        <radialGradient id="ay-wing-rose" cx="100%" cy="60%" r="110%">
          <stop offset="0" stopColor="#d6648e" />
          <stop offset=".45" stopColor="#f0a6c0" />
          <stop offset="1" stopColor="#fde6ee" />
        </radialGradient>
        <radialGradient id="ay-wing-lilac" cx="100%" cy="60%" r="110%">
          <stop offset="0" stopColor="#8d6fc2" />
          <stop offset=".5" stopColor="#c8b2ea" />
          <stop offset="1" stopColor="#f4eefc" />
        </radialGradient>
        <radialGradient id="ay-wing-sky" cx="100%" cy="60%" r="110%">
          <stop offset="0" stopColor="#6f9fd0" />
          <stop offset=".5" stopColor="#b3d1ee" />
          <stop offset="1" stopColor="#eef5fc" />
        </radialGradient>
        <radialGradient id="ay-wash" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#fbe1ea" stopOpacity=".95" />
          <stop offset=".6" stopColor="#efe4f7" stopOpacity=".7" />
          <stop offset="1" stopColor="#fdf8f6" stopOpacity="0" />
        </radialGradient>
        {/* Bordas irregulares de tinta molhada. */}
        <filter id="ay-wc" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
  );
}

/* -------------------------------------------------------------------------- */
/* Flores                                                                      */
/* -------------------------------------------------------------------------- */

const ROSE_PETAL = "M0 0 C-16 -6 -26 -26 -18 -40 C-12 -50 12 -50 18 -40 C26 -26 16 -6 0 0Z";

/** Flor cheia (peônia/rosa aberta). Raio aproximado: 46. */
export function Rose({ tone = "rose", ...p }: Place & { tone?: "rose" | "blush" | "lilac" }) {
  const fill = `url(#ay-${tone})`;
  const edge = tone === "lilac" ? "#9c82c9" : "#d9729a";
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <g filter="url(#ay-wc)">
        {rays(6, 8).map((a) => (
          <path key={`o${a}`} d={ROSE_PETAL} transform={`rotate(${a})`} fill={fill} fillOpacity=".82" stroke={edge} strokeOpacity=".28" strokeWidth=".8" />
        ))}
        {rays(5, 40).map((a) => (
          <path key={`m${a}`} d={ROSE_PETAL} transform={`rotate(${a}) scale(.68)`} fill={fill} fillOpacity=".9" stroke={edge} strokeOpacity=".3" strokeWidth="1" />
        ))}
        {rays(4, 15).map((a) => (
          <path key={`i${a}`} d={ROSE_PETAL} transform={`rotate(${a}) scale(.4)`} fill={fill} stroke={edge} strokeOpacity=".35" strokeWidth="1.4" />
        ))}
      </g>
      <circle r="8" fill={fill} />
      <path d="M0 0 C-3 -1 -2 -5 1 -5 C5 -5 6 0 3 3 C0 6 -6 5 -7 0 C-8 -5 -4 -9 1 -9" fill="none" stroke={edge} strokeOpacity=".55" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

const COSMOS_PETAL = "M0 0 C-7 -8 -10 -25 -6.5 -34 L-2.5 -31 L0 -35.5 L2.5 -31 L6.5 -34 C10 -25 7 -8 0 0Z";

/** Flor tipo cosmos/margarida com miolo amarelo. Raio aproximado: 35. */
export function Cosmos({ tone = "lilac", ...p }: Place & { tone?: "lilac" | "blush" | "lavender" }) {
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <g filter="url(#ay-wc)">
        {rays(8, 10).map((a) => (
          <path key={a} d={COSMOS_PETAL} transform={`rotate(${a})`} fill={`url(#ay-${tone})`} fillOpacity=".9" stroke="#8f74bf" strokeOpacity=".22" strokeWidth=".8" />
        ))}
      </g>
      <circle r="7.5" fill="url(#ay-butter)" />
      {rays(9).map((a) => (
        <circle key={a} cx="0" cy="-5.2" r="1" fill="#c9962b" opacity=".7" transform={`rotate(${a})`} />
      ))}
    </g>
  );
}

/** Florzinha de cinco pétalas redondas (miosótis). Raio aproximado: 14. */
export function Blossom({ tone = "sky", ...p }: Place & { tone?: "sky" | "blush" | "lavender" | "butter" }) {
  const fill = tone === "butter" ? "url(#ay-butter)" : `url(#ay-${tone})`;
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      {rays(5, -18).map((a) => (
        <ellipse key={a} cx="0" cy="-7.2" rx="6" ry="6.8" transform={`rotate(${a})`} fill={fill} fillOpacity=".95" stroke="#ffffff" strokeOpacity=".6" strokeWidth=".6" />
      ))}
      <circle r="3.4" fill="#fff8e1" />
      <circle r="2" fill="#efc657" />
    </g>
  );
}

/** Botão de flor com sépalas. Base na origem, cresce para cima (~30). */
export function Bud({ tone = "rose", ...p }: Place & { tone?: "rose" | "blush" | "lilac" }) {
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <path d="M0 0 C-9 -6 -10 -19 0 -28 C10 -19 9 -6 0 0Z" fill={`url(#ay-${tone})`} filter="url(#ay-wc)" />
      <path d="M0 -2 C-6 -5 -9 -10 -8 -15 C-4 -11 -2 -8 0 -2Z M0 -2 C6 -5 9 -10 8 -15 C4 -11 2 -8 0 -2Z" fill="url(#ay-leaf)" />
    </g>
  );
}

/** Ramo de lavanda. Base na origem, cresce para cima (~90). */
export function Lavender(p: Place) {
  const buds = Array.from({ length: 11 }, (_, i) => i);
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <path d="M0 0 C1 -30 -2 -60 2 -92" fill="none" stroke="#86a283" strokeWidth="1.6" strokeLinecap="round" />
      {buds.map((i) => {
        const y = -48 - i * 4.2;
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <ellipse
            key={i}
            cx={side * (2.6 - i * 0.12) + (i > 8 ? 0 : 0.5)}
            cy={y}
            rx={3.2 - i * 0.12}
            ry={4.6 - i * 0.14}
            transform={`rotate(${side * 24} ${side * 2.6} ${y})`}
            fill="url(#ay-lavender)"
            stroke="#9a83c6"
            strokeOpacity=".35"
            strokeWidth=".6"
          />
        );
      })}
    </g>
  );
}

const LEAF = "M0 0 C6 -6 7.5 -16 0 -25 C-7.5 -16 -6 -6 0 0Z";

export function Leaf({ soft = false, ...p }: Place & { soft?: boolean }) {
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <path d={LEAF} fill={soft ? "url(#ay-leaf-soft)" : "url(#ay-leaf)"} />
      <path d="M0 -2 C0.6 -9 0.4 -16 0 -22" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth=".8" strokeLinecap="round" />
    </g>
  );
}

/** Ramo com folhas alternadas. Base na origem, cresce para cima (~length). */
export function Sprig({ length = 90, leaves = 6, soft = false, bend = 14, ...p }: Place & { length?: number; leaves?: number; soft?: boolean; bend?: number }) {
  const pts = Array.from({ length: leaves }, (_, i) => (i + 1) / (leaves + 0.6));
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <path d={`M0 0 Q${bend} ${-length * 0.5} 0 ${-length}`} fill="none" stroke="#7f9e7c" strokeWidth="1.5" strokeLinecap="round" />
      {pts.map((t, i) => {
        // ponto aproximado sobre a curva quadrática
        const x = 2 * (1 - t) * t * bend;
        const y = -length * t;
        const side = i % 2 === 0 ? -1 : 1;
        const sc = 0.95 - t * 0.35;
        return <Leaf key={i} x={x} y={y} r={side * 52} s={sc} soft={soft} />;
      })}
      <Leaf x={0} y={-length} r={0} s={0.55} soft={soft} />
    </g>
  );
}

/** Pontinhos de flor-mosquitinho. */
export function Baby({ dots, ...p }: Place & { dots: Array<[number, number, number?]> }) {
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      {dots.map(([x, y, r = 2.2], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? "#f6dc8d" : "#ffffff"} stroke="#e7c3d2" strokeOpacity=".6" strokeWidth=".5" />
      ))}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Borboleta                                                                   */
/* -------------------------------------------------------------------------- */

const WING_UP = "M-2 -3 C-10 -28 -38 -40 -45 -24 C-50 -11 -34 1 -2 2Z";
const WING_LOW = "M-2 2 C-20 4 -34 17 -28 29 C-22 39 -7 27 -2 7Z";

type ButterflyTone = "rose" | "lilac" | "sky";

function Wing({ tone }: { tone: ButterflyTone }) {
  const edge = tone === "rose" ? "#c4557f" : tone === "lilac" ? "#7c5fb3" : "#5b8cc0";
  return (
    <>
      <path d={WING_UP} fill={`url(#ay-wing-${tone})`} stroke={edge} strokeOpacity=".45" strokeWidth="1.1" />
      <path d={WING_LOW} fill={`url(#ay-wing-${tone})`} stroke={edge} strokeOpacity=".45" strokeWidth="1.1" />
      <path className="bf-line" d="M-4 -2 C-14 -12 -26 -20 -38 -24 M-4 3 C-14 10 -20 17 -24 25" fill="none" stroke={edge} strokeOpacity=".28" strokeWidth=".9" />
      <circle cx="-34" cy="-21" r="3.2" fill="#fff" fillOpacity=".75" />
      <circle cx="-26" cy="-26" r="1.8" fill="#fff" fillOpacity=".7" />
      <circle cx="-22" cy="24" r="2.2" fill="#fff" fillOpacity=".7" />
      <circle cx="-40" cy="-14" r="1.4" fill="#f4d77a" />
    </>
  );
}

/**
 * Borboleta com asas que batem (classes .bf-wing-l/.bf-wing-r animadas no CSS).
 * Use dentro de um <svg viewBox="-50 -45 100 90">.
 */
export function ButterflyShape({ tone = "rose", ...p }: Place & { tone?: ButterflyTone }) {
  return (
    <g transform={place(p)} opacity={p.opacity} className={p.className}>
      <g className="bf-wing-l">
        <Wing tone={tone} />
      </g>
      <g className="bf-wing-r">
        <g transform="scale(-1 1)">
          <Wing tone={tone} />
        </g>
      </g>
      <ellipse cx="0" cy="3" rx="2.4" ry="13" fill="#5b3a55" />
      <circle cx="0" cy="-11" r="3.2" fill="#5b3a55" />
      <path className="bf-line" d="M-1 -13 C-4 -22 -9 -27 -13 -28 M1 -13 C4 -22 9 -27 13 -28" fill="none" stroke="#5b3a55" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="-13" cy="-28" r="1.5" fill="#5b3a55" />
      <circle cx="13" cy="-28" r="1.5" fill="#5b3a55" />
    </g>
  );
}

export function Butterfly({ tone = "rose", className, style, title }: { tone?: ButterflyTone; className?: string; style?: CSSProperties; title?: string }) {
  return (
    <svg viewBox="-50 -45 100 90" className={className} style={style} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} focusable="false">
      {title ? <title>{title}</title> : null}
      <ButterflyShape tone={tone} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Pétala solta                                                                */
/* -------------------------------------------------------------------------- */

export function PetalShape({ tone = "blush" }: { tone?: "rose" | "blush" | "lilac" | "lavender" }) {
  return (
    <svg viewBox="-12 -16 24 30" aria-hidden="true" focusable="false">
      <path d="M0 12 C-11 4 -10 -10 -2 -14 C0 -11 2 -11 3 -14 C10 -9 10 5 0 12Z" fill={`url(#ay-${tone})`} fillOpacity=".9" stroke="#d9729a" strokeOpacity=".2" strokeWidth=".6" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Composições                                                                 */
/* -------------------------------------------------------------------------- */

type ArtProps = SVGProps<SVGSVGElement>;

function Art({ children, viewBox, ...rest }: ArtProps & { children: ReactNode }) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

/** Buquê de canto: origem no canto superior esquerdo (espelhe com CSS para a direita). */
export function CornerBouquet({ mirror = false, ...props }: ArtProps & { mirror?: boolean }) {
  return (
    <Art viewBox="0 0 240 220" {...props}>
      <g transform={mirror ? "translate(240 0) scale(-1 1)" : undefined}>
      <Sprig x={18} y={30} r={128} length={150} leaves={7} />
      <Sprig x={30} y={20} r={160} length={120} leaves={6} soft bend={-12} />
      <Sprig x={10} y={60} r={100} length={110} leaves={5} soft />
      <Lavender x={40} y={40} r={142} s={0.95} />
      <Rose x={46} y={46} s={0.95} r={10} tone="rose" />
      <Cosmos x={108} y={30} s={0.72} r={-12} tone="lilac" />
      <Rose x={24} y={112} s={0.6} r={-20} tone="blush" />
      <Bud x={150} y={56} r={118} s={0.85} tone="blush" />
      <Blossom x={92} y={82} s={0.95} tone="sky" />
      <Blossom x={74} y={104} s={0.7} tone="blush" />
      <Blossom x={140} y={18} s={0.6} tone="lavender" />
      <Baby x={0} y={0} dots={[[124, 66], [132, 74, 1.8], [64, 132], [56, 142, 1.6], [168, 36, 1.8], [96, 116, 1.6]]} />
      </g>
    </Art>
  );
}

/** Ramalhete baixo para os cantos inferiores da moldura do retrato. */
export function FrameCluster(props: ArtProps) {
  return (
    <Art viewBox="0 0 170 130" {...props}>
      <Sprig x={60} y={100} r={-62} length={92} leaves={6} />
      <Sprig x={70} y={96} r={-20} length={70} leaves={5} soft />
      <Lavender x={84} y={104} r={14} s={0.75} />
      <Sprig x={52} y={104} r={-104} length={58} leaves={4} soft />
      <Rose x={66} y={86} s={0.72} r={-8} tone="rose" />
      <Cosmos x={112} y={88} s={0.56} r={20} tone="lavender" />
      <Blossom x={36} y={92} s={0.8} tone="sky" />
      <Blossom x={96} y={110} s={0.62} tone="blush" />
      <Bud x={124} y={104} r={64} s={0.65} tone="lilac" />
      <Baby dots={[[44, 72, 1.8], [138, 76, 1.6], [86, 66, 1.6]]} />
    </Art>
  );
}

/** Guirlanda circular para o selo "1 ano". */
export function Wreath(props: ArtProps) {
  const leaves = rays(18, 4);
  return (
    <Art viewBox="-60 -60 120 120" {...props}>
      <circle r="47" fill="none" stroke="#9fbe99" strokeWidth="1.2" />
      {leaves.map((a, i) => (
        <g key={a} transform={`rotate(${a}) translate(0 -47)`}>
          <Leaf r={i % 2 ? 58 : -58} s={i % 3 === 0 ? 0.5 : 0.42} soft={i % 2 === 0} />
        </g>
      ))}
      <Rose x={-30} y={36} s={0.36} tone="rose" />
      <Rose x={-8} y={46} s={0.28} tone="blush" r={20} />
      <Blossom x={14} y={46} s={0.6} tone="sky" />
      <Cosmos x={34} y={-34} s={0.34} tone="lilac" />
      <Blossom x={44} y={-16} s={0.48} tone="blush" />
      <Blossom x={-44} y={-20} s={0.42} tone="lavender" />
    </Art>
  );
}

/** Divisor horizontal com ramos e uma flor ao centro. */
export function SprigDivider(props: ArtProps) {
  return (
    <Art viewBox="0 0 240 48" {...props}>
      <Sprig x={120} y={26} r={-90} length={96} leaves={6} bend={-6} soft />
      <Sprig x={120} y={26} r={90} length={96} leaves={6} bend={6} soft />
      <Blossom x={96} y={24} s={0.55} tone="sky" />
      <Blossom x={144} y={24} s={0.55} tone="lavender" />
      <Rose x={120} y={24} s={0.34} tone="rose" />
    </Art>
  );
}

/** Guirlanda inferior larga para o encerramento. */
export function BottomGarland(props: ArtProps) {
  return (
    <Art viewBox="0 0 400 130" preserveAspectRatio="xMidYMax meet" {...props}>
      <Sprig x={200} y={120} r={-68} length={150} leaves={8} />
      <Sprig x={200} y={120} r={68} length={150} leaves={8} bend={-14} />
      <Sprig x={200} y={122} r={-30} length={86} leaves={5} soft />
      <Sprig x={200} y={122} r={30} length={86} leaves={5} soft bend={-14} />
      <Lavender x={168} y={124} r={-22} s={0.8} />
      <Lavender x={232} y={124} r={22} s={0.8} />
      <Rose x={200} y={104} s={0.7} tone="rose" />
      <Rose x={152} y={110} s={0.5} r={-14} tone="blush" />
      <Rose x={250} y={110} s={0.5} r={14} tone="lilac" />
      <Cosmos x={108} y={108} s={0.5} r={10} tone="lavender" />
      <Cosmos x={296} y={108} s={0.5} r={-10} tone="blush" />
      <Blossom x={124} y={84} s={0.7} tone="sky" />
      <Blossom x={278} y={82} s={0.7} tone="sky" />
      <Blossom x={226} y={78} s={0.5} tone="blush" />
      <Blossom x={176} y={80} s={0.5} tone="lavender" />
      <Bud x={70} y={116} r={-74} s={0.7} tone="blush" />
      <Bud x={330} y={116} r={74} s={0.7} tone="lilac" />
      <Baby dots={[[150, 76], [252, 74], [94, 92, 1.6], [312, 90, 1.6], [200, 66, 1.8]]} />
    </Art>
  );
}

/** Pequeno raminho para acompanhar títulos. */
export function TinySprig(props: ArtProps) {
  return (
    <Art viewBox="0 0 60 24" {...props}>
      <Sprig x={4} y={14} r={90} length={50} leaves={4} soft bend={4} />
      <Blossom x={50} y={13} s={0.42} tone="blush" />
    </Art>
  );
}

/** Cantinho floral da contagem regressiva. */
export function CountdownFlowers(props: ArtProps) {
  return (
    <Art viewBox="0 0 120 80" {...props}>
      <Sprig x={20} y={74} r={-50} length={60} leaves={4} soft />
      <Sprig x={22} y={74} r={-12} length={46} leaves={3} />
      <Rose x={28} y={60} s={0.42} tone="lilac" />
      <Cosmos x={56} y={66} s={0.36} tone="blush" r={14} />
      <Blossom x={10} y={52} s={0.5} tone="sky" />
    </Art>
  );
}

/** Raminho no canto do envelope. */
export function EnvelopeFlowers(props: ArtProps) {
  return (
    <Art viewBox="0 0 120 70" {...props}>
      <Sprig x={22} y={68} r={-50} length={58} leaves={5} soft />
      <Sprig x={26} y={68} r={-12} length={40} leaves={3} />
      <Rose x={30} y={56} s={0.38} tone="rose" />
      <Blossom x={52} y={61} s={0.5} tone="sky" />
      <Blossom x={14} y={46} s={0.42} tone="lavender" />
    </Art>
  );
}
