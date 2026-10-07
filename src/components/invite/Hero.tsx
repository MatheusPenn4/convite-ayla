import { eventConfig } from "@/config/event";
import { ArtImg } from "@/components/garden/ArtImg";
import { Portrait } from "./Portrait";

export function Hero() {
  return (
    <header className="hero">
      <ArtImg name="corner-bouquet" className="hero__corner hero__corner--left sway" eager />
      <ArtImg name="corner-bouquet-mirror" className="hero__corner hero__corner--right sway sway--late" eager />

      <p className="hero__eyebrow">
        <ArtImg name="tiny-sprig" className="hero__eyebrow-sprig" eager />
        <span>Meu primeiro aninho</span>
        <ArtImg name="tiny-sprig" className="hero__eyebrow-sprig hero__eyebrow-sprig--flip" eager />
      </p>

      <Portrait />

      <h1 className="hero__name" id="titulo-convite" tabIndex={-1}>
        {eventConfig.displayName}
      </h1>
      <p className="hero__fullname">{eventConfig.fullName}</p>

      <ArtImg name="sprig-divider" className="divider" eager />

      <div className="hero__message" data-reveal>
        <p>
          Há um ano, nosso jardim ganhou sua flor mais preciosa. Desde então, {eventConfig.displayName} trouxe mais
          amor, luz e alegria para nossas vidas.
        </p>
        <p>Venha celebrar conosco o seu primeiro aninho e fazer parte desse momento tão especial.</p>
      </div>
    </header>
  );
}
