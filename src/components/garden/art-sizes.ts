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
  "envelope-flowers": [120, 70],
  "gw-sky": [400, 300],
  "gw-hills": [400, 300],
  "gw-trees": [400, 300],
  "gw-meadow": [400, 300],
  "gw-front": [400, 300],
} as const;

export type ArtName = keyof typeof ART_SIZES;
export const ART_NAMES = Object.keys(ART_SIZES) as ArtName[];
