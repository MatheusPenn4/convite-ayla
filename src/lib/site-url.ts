import { eventConfig } from "@/config/event";
import { filled } from "./pending";

function normalize(url: string): string | null {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

/**
 * URL pública absoluta usada nos metadados de compartilhamento.
 * Ordem: configuração do evento → NEXT_PUBLIC_SITE_URL → domínio de produção
 * da Vercel (definido automaticamente) → localhost em desenvolvimento.
 */
export function getSiteUrl(): string {
  const candidates = [
    filled(eventConfig.publicUrl),
    filled(process.env.NEXT_PUBLIC_SITE_URL),
    filled(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    filled(process.env.VERCEL_URL),
  ];
  for (const c of candidates) {
    const url = c && normalize(c);
    if (url) return url;
  }
  return "http://localhost:3000";
}
