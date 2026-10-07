import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eventConfig } from "@/config/event";
import { getEventDisplay } from "@/lib/event-info";
import { toSvgString } from "@/lib/svg-serialize";
import {
  BottomGarland,
  ButterflyShape,
  CornerBouquet,
  FrameCluster,
  GardenDefsContent,
  Wreath,
} from "@/components/garden/art";
import { SceneContent } from "@/components/garden/garden-scene";

/**
 * Cartão para enviar no WhatsApp junto com o link (1080 × 1350).
 * Gerado no build a partir das mesmas ilustrações e dados do convite.
 * Acesse em /convite.png para baixar.
 */
export const dynamic = "force-static";

const W = 1080;
const H = 1350;

// Janela em arco (mesma proporção 4:5 do convite)
const WIN = { x: 322, y: 108, w: 436, h: 545 };
const BADGE = { cx: WIN.x + WIN.w + 6, cy: WIN.y + WIN.h - 44 };
const R = WIN.w / 2;

function archPath(x: number, y: number, w: number, h: number, inset = 0) {
  const r = w / 2 - inset;
  const left = x + inset;
  const right = x + w - inset;
  const top = y + inset;
  const bottom = y + h - inset;
  const c = 22;
  return `M${left} ${top + r} A${r} ${r} 0 0 1 ${right} ${top + r} V${bottom - c} Q${right} ${bottom} ${right - c} ${bottom} H${left + c} Q${left} ${bottom} ${left} ${bottom - c} Z`;
}

function artSvg() {
  const { x, y, w, h } = WIN;
  const sx = w / 200;
  const sy = h / 250;
  const bars = `translate(${x} ${y}) scale(${sx} ${sy})`;

  const tree = (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <GardenDefsContent />
      <defs>
        <clipPath id="win">
          <path d={archPath(x, y, w, h)} />
        </clipPath>
        <radialGradient id="wash-a" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f9d6e2" stopOpacity=".75" />
          <stop offset="1" stopColor="#f9d6e2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wash-b" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e8dcf6" stopOpacity=".85" />
          <stop offset="1" stopColor="#e8dcf6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffdfc" stopOpacity=".95" />
          <stop offset="1" stopColor="#fffdfc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* papel e manchas de aquarela */}
      <rect width={W} height={H} fill="#fdf8f6" />
      <ellipse cx="120" cy="80" rx="620" ry="420" fill="url(#wash-a)" />
      <ellipse cx="1040" cy="380" rx="560" ry="420" fill="url(#wash-b)" />
      <ellipse cx="60" cy="1050" rx="520" ry="380" fill="url(#wash-b)" />
      <ellipse cx="1060" cy="1320" rx="620" ry="380" fill="url(#wash-a)" />
      <ellipse cx="540" cy="960" rx="520" ry="300" fill="url(#glow)" />
      <rect x="28" y="28" width={W - 56} height={H - 56} rx="40" fill="none" stroke="#e3b6c8" strokeOpacity=".5" strokeWidth="2" />

      {/* buquês nos cantos de cima */}
      <CornerBouquet x={-24} y={-24} width={330} height={302} />
      <CornerBouquet mirror x={W - 306} y={-24} width={330} height={302} />

      {/* moldura externa fina */}
      <path d={archPath(x - 22, y - 22, w + 44, h + 44)} fill="none" stroke="#b29ad8" strokeOpacity=".55" strokeWidth="2" />

      {/* vista do jardim recortada no arco */}
      <g clipPath="url(#win)">
        <svg x={x} y={y} width={w} height={h} viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
          <SceneContent />
        </svg>
        {/* reflexo do vidro */}
        <path d={`M${x} ${y} L${x + w * 0.42} ${y} L${x} ${y + h * 0.55} Z`} fill="#ffffff" opacity=".16" />
      </g>

      {/* batentes em cruz, puxador e moldura branca */}
      <g transform={bars} fill="none" strokeLinecap="square">
        <path d="M100 0 V250 M0 100 H200" stroke="rgba(110,60,90,.16)" strokeWidth="6" transform="translate(1 1.6)" />
        <path d="M100 0 V250 M0 100 H200" stroke="#fffaf7" strokeWidth="4.6" />
      </g>
      <circle cx={x + w / 2} cy={y + h * 0.4} r="10" fill="#fffaf7" stroke="#e9d3dc" strokeWidth="2" />
      <circle cx={x + w / 2} cy={y + h * 0.4} r="4.5" fill="#e8cd86" />
      <rect x={x + w / 2 + 10} y={y + h * 0.6} width="5" height="24" rx="2.5" fill="#e8cd86" />
      <path d={archPath(x, y, w, h)} fill="none" stroke="#fffaf7" strokeWidth="26" clipPath="url(#win)" />
      <path d={archPath(x, y, w, h, 13)} fill="none" stroke="#d6a6bd" strokeOpacity=".45" strokeWidth="2" />
      <path d={archPath(x, y, w, h)} fill="none" stroke="#fffdfc" strokeWidth="10" />
      <path d={archPath(x - 6, y - 6, w + 12, h + 12)} fill="none" stroke="#d996b4" strokeOpacity=".45" strokeWidth="2" />

      {/* flores na base da janela e selo "1 ano" */}
      <FrameCluster x={x - 150} y={y + h - 196} width={330} height={252} />
      <circle cx={BADGE.cx} cy={BADGE.cy} r="78" fill="#fffdfc" />
      <Wreath x={BADGE.cx - 96} y={BADGE.cy - 96} width={192} height={192} />

      {/* borboletas */}
      <g transform={`translate(${x + w + 30} ${y + 70}) rotate(22) scale(1.35)`}>
        <ButterflyShape tone="lilac" />
      </g>
      <g transform={`translate(${x - 70} ${y + 250}) rotate(-18) scale(1.05)`}>
        <ButterflyShape tone="rose" />
      </g>
      <g transform="translate(915 1030) rotate(14) scale(.85)">
        <ButterflyShape tone="sky" />
      </g>

      {/* guirlanda de baixo */}
      <BottomGarland x={(W - 640) / 2} y={H - 208} width={640} height={208} />
    </svg>
  );
  return `data:image/svg+xml;base64,${Buffer.from(toSvgString(tree)).toString("base64")}`;
}

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export async function GET() {
  const [script, serifItalic, serif, serifRegular] = await Promise.all([
    font("pinyon-script-latin-400-normal.woff"),
    font("fraunces-latin-500-italic.woff"),
    font("fraunces-latin-600-normal.woff"),
    font("fraunces-latin-400-normal.woff"),
  ]);
  const e = getEventDisplay();
  const city = (e.cityState ?? "").split(",")[0].trim();
  const venue = [e.venueName, city].filter(Boolean).join(" · ");
  const center = { position: "absolute" as const, left: 0, width: W, display: "flex", justifyContent: "center" };

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", color: "#4a2c44" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artSvg()} width={W} height={H} alt="" style={{ position: "absolute", left: 0, top: 0 }} />

        <div style={{ ...center, top: 46, fontFamily: "Fraunces Italic", fontSize: 44, color: "#a6466f" }}>
          Meu primeiro aninho
        </div>

        {/* "1 ano" no selo */}
        <div
          style={{
            position: "absolute",
            left: BADGE.cx - 80,
            top: BADGE.cy - 58,
            width: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#a6466f",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 76, lineHeight: 1 }}>{eventConfig.age}</div>
          <div style={{ display: "flex", fontFamily: "Fraunces Italic", fontSize: 30, lineHeight: 1, color: "#6c4f66" }}>
            {eventConfig.age === 1 ? "ano" : "anos"}
          </div>
        </div>

        <div style={{ ...center, top: 692, fontFamily: "Pinyon Script", fontSize: 156, lineHeight: 1.2, color: "#a6466f" }}>
          {eventConfig.displayName}
        </div>

        <div style={{ ...center, top: 922, fontFamily: "Fraunces", fontSize: 44 }}>
          {`${e.weekday}, ${e.dateLong} · ${e.time}`}
        </div>
        {venue ? (
          <div style={{ ...center, top: 984, fontFamily: "Fraunces Regular", fontSize: 34, color: "#6c4f66" }}>{venue}</div>
        ) : null}

        <div style={{ ...center, top: 1056 }}>
          <div
            style={{
              display: "flex",
              padding: "16px 44px",
              borderRadius: 999,
              background: "#fdf0f4",
              border: "3px solid #f2c4d4",
              fontFamily: "Fraunces",
              fontSize: 36,
              color: "#86345a",
            }}
          >
            Confirme sua presença pelo link abaixo
          </div>
        </div>

        <div style={{ ...center, top: 1152, fontFamily: "Fraunces Italic", fontSize: 30, color: "#6c4f66" }}>
          {`Com carinho, família da ${eventConfig.displayName}`}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Pinyon Script", data: script, weight: 400, style: "normal" },
        { name: "Fraunces Italic", data: serifItalic, weight: 500, style: "italic" },
        { name: "Fraunces", data: serif, weight: 600, style: "normal" },
        { name: "Fraunces Regular", data: serifRegular, weight: 400, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
