import { Butterfly, PetalShape } from "./art";

/**
 * Camada decorativa fixa atrás do conteúdo: poucas borboletas em voo e
 * algumas pétalas caindo. Não recebe cliques e é ignorada por leitores de tela.
 * Removida por completo em prefers-reduced-motion (ver CSS).
 */
export function AmbientGarden() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__flight ambient__flight--a">
        <Butterfly tone="rose" className="ambient__butterfly flutter" />
      </div>
      <div className="ambient__flight ambient__flight--b">
        <Butterfly tone="lilac" className="ambient__butterfly flutter flutter--slow" />
      </div>
      <div className="ambient__flight ambient__flight--c">
        <Butterfly tone="sky" className="ambient__butterfly flutter" />
      </div>

      <span className="ambient__petal ambient__petal--1"><PetalShape tone="blush" /></span>
      <span className="ambient__petal ambient__petal--2"><PetalShape tone="lavender" /></span>
      <span className="ambient__petal ambient__petal--3"><PetalShape tone="rose" /></span>
      <span className="ambient__petal ambient__petal--4"><PetalShape tone="lilac" /></span>
      <span className="ambient__petal ambient__petal--5"><PetalShape tone="blush" /></span>
    </div>
  );
}
