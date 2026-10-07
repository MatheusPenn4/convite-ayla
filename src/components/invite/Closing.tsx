import { eventConfig } from "@/config/event";
import { BottomGarland, Butterfly } from "@/components/garden/art";

export function Closing() {
  return (
    <footer className="closing" data-reveal>
      <Butterfly tone="rose" className="closing__butterfly perched" />
      <p className="closing__message">Esperamos você para florescer essa lembrança com a gente.</p>
      <p className="closing__sign">
        <span>Com carinho,</span>
        <span className="closing__family">família da {eventConfig.displayName}</span>
      </p>
      <BottomGarland className="closing__garland" />
    </footer>
  );
}
