import type { ReactElement } from "react";
import {
  BottomGarland,
  CornerBouquet,
  CountdownFlowers,
  EnvelopeFlowers,
  FrameCluster,
  SprigDivider,
  TinySprig,
  Wreath,
} from "./art";
import { FrontLayer, HillsLayer, MeadowLayer, SkyLayer, TreesLayer } from "./garden-scene";
import type { ArtName } from "./art-sizes";

/** Desenho de cada arquivo /art/<nome>.svg (renderizado no build). */
export const ART_CATALOG: Record<ArtName, () => ReactElement> = {
  "corner-bouquet": () => <CornerBouquet />,
  "corner-bouquet-mirror": () => <CornerBouquet mirror />,
  "frame-cluster": () => <FrameCluster />,
  wreath: () => <Wreath />,
  "sprig-divider": () => <SprigDivider />,
  "bottom-garland": () => <BottomGarland preserveAspectRatio="xMidYMax meet" />,
  "tiny-sprig": () => <TinySprig />,
  "countdown-flowers": () => <CountdownFlowers />,
  "envelope-flowers": () => <EnvelopeFlowers />,
  "gw-sky": () => <SkyLayer />,
  "gw-hills": () => <HillsLayer />,
  "gw-trees": () => <TreesLayer />,
  "gw-meadow": () => <MeadowLayer />,
  "gw-front": () => <FrontLayer />,
};
