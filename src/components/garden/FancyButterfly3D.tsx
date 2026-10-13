import { ArtImg } from "./ArtImg";
import type { ButterflyTone } from "./butterfly-art";

/**
 * Borboleta em aquarela com asas que dobram em 3D: cada asa é uma imagem
 * (/art/bf-<cor>-wing.svg) que gira no eixo do corpo. Leve e roda na GPU.
 */
export function FancyButterfly3D({ tone = "rose", className = "" }: { tone?: ButterflyTone; className?: string }) {
  return (
    <span className={`fb3d ${className}`} aria-hidden="true">
      <span className="fb3d__tilt">
        <span className="fb3d__wing fb3d__wing--l">
          <ArtImg name={`bf-${tone}-wing`} className="fb3d__img" eager />
        </span>
        <span className="fb3d__wing fb3d__wing--r">
          <ArtImg name={`bf-${tone}-wing`} className="fb3d__img fb3d__img--mirror" eager />
        </span>
        <ArtImg name={`bf-${tone}-body`} className="fb3d__body" eager />
      </span>
    </span>
  );
}
