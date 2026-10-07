import { ART_SIZES, type ArtName } from "./art-sizes";

/**
 * Ilustração estática como imagem (arquivo SVG gerado no build e guardado em cache).
 * Muito mais leve que repetir o desenho dentro do HTML; decorativa para leitores de tela.
 */
export function ArtImg({ name, className, eager = false }: { name: ArtName; className?: string; eager?: boolean }) {
  const [width, height] = ART_SIZES[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG vetorial estático, sem otimização de imagem
    <img
      src={`/art/${name}.svg`}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      className={className ? `art ${className}` : "art"}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
