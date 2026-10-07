import Image from "next/image";
import { eventConfig } from "@/config/event";
import { getPhoto } from "@/lib/photo";
import { Blossom, Butterfly, Cosmos, FrameCluster, Rose, Sprig, Wreath } from "@/components/garden/art";

/** Composição exibida enquanto a foto da Ayla não for adicionada. */
function Monogram() {
  return (
    <div className="monogram" role="img" aria-label={`Monograma floral com as iniciais ${eventConfig.initials}`}>
      <svg className="monogram__art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <rect width="200" height="250" fill="url(#ay-wash)" />
        <Sprig x={34} y={240} r={-28} length={74} leaves={5} soft />
        <Sprig x={166} y={240} r={28} length={74} leaves={5} soft bend={-14} />
        <Cosmos x={62} y={232} s={0.46} tone="lavender" r={12} />
        <Blossom x={138} y={226} s={0.66} tone="sky" />
        <Rose x={100} y={228} s={0.54} tone="blush" />
        <Blossom x={40} y={208} s={0.46} tone="blush" />
        <Blossom x={160} y={204} s={0.46} tone="lavender" />
      </svg>
      <span className="monogram__letters" aria-hidden="true">
        {eventConfig.initials}
      </span>
    </div>
  );
}

export function Portrait() {
  const photo = getPhoto();
  return (
    <div className="portrait">
      <div className="portrait__ring" aria-hidden="true" />
      <div className="portrait__frame">
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="(max-width: 480px) 66vw, 300px"
            style={{ objectFit: "cover", objectPosition: photo.focalPoint }}
          />
        ) : (
          <Monogram />
        )}
      </div>
      <FrameCluster className="portrait__cluster" />
      <Butterfly tone="lilac" className="portrait__butterfly perched" />
      <p className="age-badge">
        <Wreath className="age-badge__wreath" />
        <span className="age-badge__num">{eventConfig.age}</span>
        <span className="age-badge__word">{eventConfig.age === 1 ? "ano" : "anos"}</span>
      </p>
    </div>
  );
}
