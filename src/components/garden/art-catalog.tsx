import type { ReactElement } from "react";
import {
  BottomGarland,
  CornerBouquet,
  CountdownFlowers,
  FrameCluster,
  SprigDivider,
  TinySprig,
  Wreath,
} from "./art";
import { FrontLayer, HillsLayer, MeadowLayer, SkyLayer, TreesLayer } from "./garden-scene";
import { ButterflyBodyArt, ButterflyWingArt } from "./butterfly-art";
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
  "gw-sky": () => <SkyLayer />,
  "gw-hills": () => <HillsLayer />,
  "gw-trees": () => <TreesLayer />,
  "gw-meadow": () => <MeadowLayer />,
  "gw-front": () => <FrontLayer />,
  "bf-rose-wing": () => <ButterflyWingArt tone="rose" />,
  "bf-rose-body": () => <ButterflyBodyArt tone="rose" />,
  "bf-peach-wing": () => <ButterflyWingArt tone="peach" />,
  "bf-peach-body": () => <ButterflyBodyArt tone="peach" />,
  "bf-iris-wing": () => <ButterflyWingArt tone="iris" />,
  "bf-iris-body": () => <ButterflyBodyArt tone="iris" />,
  "bf-lavender-wing": () => <ButterflyWingArt tone="lavender" />,
  "bf-lavender-body": () => <ButterflyBodyArt tone="lavender" />,
  "bf-sky-wing": () => <ButterflyWingArt tone="sky" />,
  "bf-sky-body": () => <ButterflyBodyArt tone="sky" />,
  "bf-orchid-wing": () => <ButterflyWingArt tone="orchid" />,
  "bf-orchid-body": () => <ButterflyBodyArt tone="orchid" />,
};
