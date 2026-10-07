import { eventConfig } from "@/config/event";
import { filled } from "./pending";

/** Caminho da foto da aniversariante, ou null enquanto pendente. */
export function getPhoto() {
  const src = filled(eventConfig.photo.src);
  if (!src) return null;
  return { src, alt: eventConfig.photo.alt, focalPoint: eventConfig.photo.focalPoint };
}
