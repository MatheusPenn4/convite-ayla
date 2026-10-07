import { eventConfig } from "@/config/event";
import { Butterfly } from "@/components/garden/art";
import { ArtImg } from "@/components/garden/ArtImg";

export function Closing() {
  return (
    <footer className="closing" data-reveal>
      <Butterfly tone="rose" className="closing__butterfly perched" />
      <p className="closing__message">Esperamos você para florescer essa lembrança com a gente.</p>
      <p className="closing__sign">
        <span>Com carinho,</span>
        <span className="closing__family">família da {eventConfig.displayName}</span>
      </p>
      <ArtImg name="bottom-garland" className="closing__garland" />
    </footer>
  );
}
