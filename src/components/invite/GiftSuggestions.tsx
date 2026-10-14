import { eventConfig } from "@/config/event";
import { ArtImg } from "@/components/garden/ArtImg";
import { GiftIcon } from "./icons";

export function GiftSuggestions() {
  const { suggestions, sizes } = eventConfig.gifts;

  return (
    <section className="card gifts" aria-labelledby="presentes-titulo" data-reveal>
      <h2 className="section-title" id="presentes-titulo">
        <ArtImg name="tiny-sprig" className="section-title__sprig" />
        Sugestão de presente
      </h2>

      <GiftIcon className="gifts__icon" width={30} height={30} />
      <p className="gifts__intro">Sua presença é o nosso maior presente. Se quiser nos presentear, aqui vão algumas ideias:</p>

      <ul className="gifts__list">
        {suggestions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="gifts__sizes">
        <h3 className="gifts__sizes-title">Tamanhos da {eventConfig.displayName.split(" ")[0]}</h3>
        <dl>
          {sizes.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
