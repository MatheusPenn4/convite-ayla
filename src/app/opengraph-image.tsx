import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eventConfig } from "@/config/event";
import { getEventDisplay } from "@/lib/event-info";
import { BottomGarland, ButterflyShape, CornerBouquet, GardenDefsContent } from "@/components/garden/art";

// Imagem de compartilhamento (WhatsApp/redes): gerada no build, sem dados de convidados.
export const alt = eventConfig.share.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * O gerador de imagens só aceita elementos SVG "puros" e não lida bem com
 * <svg> aninhados nem com filtros: expande os componentes de ilustração,
 * converte <svg> internos em grupos posicionados e remove o filtro de aquarela.
 */
type AnyProps = Record<string, unknown> & { children?: ReactNode };

function intrinsic(node: ReactNode, nested = false): ReactNode {
  if (Array.isArray(node)) return node.map((n) => intrinsic(n, nested));
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<AnyProps>;
  if (typeof el.type === "function") {
    return intrinsic((el.type as (p: unknown) => ReactNode)(el.props), nested);
  }
  const { children, filter: _filter, ...props } = el.props;
  const kids = children === undefined ? [] : Children.toArray(children).map((c) => intrinsic(c, true));

  if (el.type === "svg" && nested) {
    const [, , vbW] = String(props.viewBox ?? "0 0 1 1").split(/\s+/).map(Number);
    const scale = Number(props.width ?? vbW) / vbW;
    return (
      <g transform={`translate(${Number(props.x ?? 0)} ${Number(props.y ?? 0)}) scale(${scale})`}>{kids}</g>
    );
  }
  return createElement(el.type as string, { ...props, key: el.key }, ...kids);
}

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export default async function OpenGraphImage() {
  const [script, serifItalic, serif] = await Promise.all([
    font("pinyon-script-latin-400-normal.woff"),
    font("fraunces-latin-500-italic.woff"),
    font("fraunces-latin-600-normal.woff"),
  ]);
  const e = getEventDisplay();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#fdf8f6",
          color: "#4a2c44",
        }}
      >
        {intrinsic(<svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <GardenDefsContent />
          <ellipse cx="200" cy="80" rx="520" ry="300" fill="#f9d6e2" opacity=".55" />
          <ellipse cx="1080" cy="560" rx="560" ry="320" fill="#e8dcf6" opacity=".6" />
          <ellipse cx="600" cy="320" rx="430" ry="250" fill="#fffdfc" opacity=".9" />
          <rect x="34" y="34" width="1132" height="562" rx="36" fill="none" stroke="#e3b6c8" strokeOpacity=".55" strokeWidth="2" />
          <CornerBouquet x={-20} y={-20} width={430} height={394} />
          <CornerBouquet mirror x={790} y={-20} width={430} height={394} />
          <BottomGarland x={300} y={470} width={600} height={195} />
          <g transform="translate(1035 420) rotate(18) scale(1.1)">
            <ButterflyShape tone="lilac" />
          </g>
          <g transform="translate(150 470) rotate(-14) scale(.9)">
            <ButterflyShape tone="rose" />
          </g>
        </svg>)}

        <div style={{ display: "flex", fontFamily: "Fraunces Italic", fontSize: 40, color: "#a6466f", marginTop: -40 }}>
          Meu primeiro aninho
        </div>
        <div style={{ display: "flex", fontFamily: "Pinyon Script", fontSize: 168, lineHeight: 1.15, color: "#a6466f", padding: "0 40px" }}>
          {eventConfig.displayName}
        </div>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 46, color: "#4a2c44", marginTop: -6 }}>
          faz {eventConfig.age} ano · {eventConfig.theme}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            padding: "14px 34px",
            borderRadius: 999,
            background: "#fdf0f4",
            border: "2px solid #f2c4d4",
            fontFamily: "Fraunces Italic",
            fontSize: 34,
            color: "#86345a",
          }}
        >
          {`${e.dateLong} · ${e.time}`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pinyon Script", data: script, weight: 400, style: "normal" },
        { name: "Fraunces Italic", data: serifItalic, weight: 500, style: "italic" },
        { name: "Fraunces", data: serif, weight: 600, style: "normal" },
      ],
    },
  );
}
