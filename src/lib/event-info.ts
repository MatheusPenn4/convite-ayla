import { eventConfig } from "@/config/event";
import { filled } from "./pending";

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);

/** Instante da festa (UTC) calculado a partir do ISO com fuso explícito. */
export const eventStartMs = Date.parse(eventConfig.startsAt);

function partsInZone(date: Date) {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: eventConfig.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return map;
}

/** Textos já formatados no fuso do evento, independentes do fuso do visitante. */
export function getEventDisplay() {
  const p = partsInZone(new Date(eventStartMs));
  const minutes = p.minute === "00" ? "" : p.minute;
  const time = `${Number(p.hour)}h${minutes}`;
  const venueName = filled(eventConfig.venueName);
  const address = filled(eventConfig.address);
  const cityState = filled(eventConfig.cityState);

  return {
    weekday: capitalize(p.weekday),
    day: p.day,
    month: p.month,
    year: p.year,
    dateLong: `${p.day} de ${p.month} de ${p.year}`,
    time,
    timeLong: `Às ${time}`,
    venueName,
    address,
    cityState,
    rsvpDeadline: formatDeadline(eventConfig.rsvpDeadline),
    mapsUrl: getMapsUrl(venueName, address, cityState),
  };
}

function formatDeadline(raw: string): string | null {
  const value = filled(raw);
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value; // texto livre já escrito pela família
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12));
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" }).format(date);
}

/**
 * Link do Google Maps com o endereço completo codificado.
 * Retorna null enquanto o endereço estiver pendente — nunca abre um destino inventado.
 */
export function getMapsUrl(venueName: string | null, address: string | null, cityState: string | null) {
  if (!address) return null;
  const query = [venueName, address, cityState].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
