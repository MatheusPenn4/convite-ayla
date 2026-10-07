/**
 * Janela em arco com vista para um jardim encantado.
 *
 * As camadas da paisagem são imagens SVG estáticas (geradas no build a partir
 * de garden-scene.tsx) movidas pelo GardenWindowStage para criar profundidade.
 * Só as borboletas e o pólen são animados no próprio HTML.
 */
import { ArtImg } from "./ArtImg";
import { Butterfly } from "./art";
import { GardenWindowStage } from "./GardenWindowStage";

const VIEW = "0 0 200 250";

function Layer({ name, depth, className = "" }: { name: Parameters<typeof ArtImg>[0]["name"]; depth: number; className?: string }) {
  return (
    <div className={`gw__layer ${className}`} data-depth={depth} aria-hidden="true">
      <ArtImg name={name} className="gw__img" eager />
    </div>
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
      <Layer name="gw-sky" depth={1} className="gw__sky" />
      <Layer name="gw-hills" depth={0.92} />
      <Layer name="gw-trees" depth={0.78} />
      <Layer name="gw-meadow" depth={0.62} />
      <div className="gw__flyers" data-depth={0.55} aria-hidden="true">
        <div className="gw-fly gw-fly--a"><Butterfly tone="rose" className="flutter" /></div>
        <div className="gw-fly gw-fly--b"><Butterfly tone="lilac" className="flutter flutter--slow" /></div>
        <div className="gw-fly gw-fly--c"><Butterfly tone="sky" className="flutter" /></div>
      </div>
      <div className="gw__pollen" data-depth={0.45} aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => <span key={i} />)}
      </div>
      <Layer name="gw-front" depth={0.22} className="gw__front gw-breeze" />
      <div className="gw__glass" aria-hidden="true" />
      <WindowFrame />
      <div className="gw__rim" aria-hidden="true" />
    </GardenWindowStage>
  );
}
