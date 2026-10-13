/**
 * Tamanho natural (viewBox) de cada ilustração estática servida em /art/<nome>.svg.
 * Fica separado do catálogo para não levar os desenhos para o JavaScript do navegador.
 */
export const ART_SIZES = {
  "corner-bouquet": [240, 220],
  "corner-bouquet-mirror": [240, 220],
  "frame-cluster": [170, 130],
  wreath: [120, 120],
  "sprig-divider": [240, 48],
  "bottom-garland": [400, 130],
  "tiny-sprig": [60, 24],
  "countdown-flowers": [120, 80],
  "gw-sky": [400, 300],
  "gw-hills": [400, 300],
  "gw-trees": [400, 300],
  "gw-meadow": [400, 300],
  "gw-front": [400, 300],
  "bf-rose-wing": [64, 116],
  "bf-rose-body": [128, 116],
  "bf-peach-wing": [64, 116],
  "bf-peach-body": [128, 116],
  "bf-iris-wing": [64, 116],
  "bf-iris-body": [128, 116],
  "bf-lavender-wing": [64, 116],
  "bf-lavender-body": [128, 116],
  "bf-sky-wing": [64, 116],
  "bf-sky-body": [128, 116],
  "bf-orchid-wing": [64, 116],
  "bf-orchid-body": [128, 116],
} as const;

export type ArtName = keyof typeof ART_SIZES;
export const ART_NAMES = Object.keys(ART_SIZES) as ArtName[];
