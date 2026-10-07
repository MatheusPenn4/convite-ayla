import { eventConfig } from "@/config/event";
import { CornerBouquet, SprigDivider, TinySprig } from "@/components/garden/art";
import { Portrait } from "./Portrait";

export function Hero() {
  return (
    <header className="hero">
      <CornerBouquet className="hero__corner hero__corner--left sway" />
      <CornerBouquet mirror className="hero__corner hero__corner--right sway sway--late" />

      <p className="hero__eyebrow">
        <TinySprig className="hero__eyebrow-sprig" />
        <span>Meu primeiro aninho</span>
        <TinySprig className="hero__eyebrow-sprig hero__eyebrow-sprig--flip" />
      </p>

      <Portrait />

      <h1 className="hero__name" id="titulo-convite" tabIndex={-1}>
        {eventConfig.displayName}
      </h1>
      <p className="hero__fullname">{eventConfig.fullName}</p>

      <SprigDivider className="divider" />

      <p className="hero__message" data-reveal>
        Há um ano, nosso jardim ganhou sua flor mais preciosa. Venha celebrar o primeiro aninho da{" "}
        {eventConfig.displayName} e fazer parte desse momento tão especial.
      </p>
    </header>
  );
}
