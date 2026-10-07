import { toSvgString } from "@/lib/svg-serialize";
import { GardenDefsContent } from "@/components/garden/art";
import { ART_CATALOG } from "@/components/garden/art-catalog";
import { ART_NAMES, type ArtName } from "@/components/garden/art-sizes";

// Gerado uma vez no build: cada ilustração vira um arquivo SVG em cache.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ART_NAMES.map((name) => ({ file: `${name}.svg` }));
}

const DEFS = toSvgString(<GardenDefsContent />);

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = file.replace(/\.svg$/, "") as ArtName;
  const render = ART_CATALOG[name];
  if (!render) return new Response("Not found", { status: 404 });

  // Arquivo SVG independente: namespace + gradientes/filtros embutidos.
  const markup = toSvgString(render())
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')
    .replace(/(<svg[^>]*>)/, `$1${DEFS}`);

  return new Response(markup, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
    },
  });
}
