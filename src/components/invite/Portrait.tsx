import Image from "next/image";
import { eventConfig } from "@/config/event";
import { getPhoto } from "@/lib/photo";
import { Butterfly } from "@/components/garden/art";
import { ArtImg } from "@/components/garden/ArtImg";
import { GardenWindow } from "@/components/garden/GardenWindow";

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
          <GardenWindow />
        )}
      </div>
      <ArtImg name="frame-cluster" className="portrait__cluster" eager />
      <Butterfly tone="lilac" className="portrait__butterfly perched" />
      <p className="age-badge">
        <ArtImg name="wreath" className="age-badge__wreath" eager />
        <span className="age-badge__num">{eventConfig.age}</span>
        <span className="age-badge__word">{eventConfig.age === 1 ? "ano" : "anos"}</span>
      </p>
    </div>
  );
}
