/**
 * Configuração central do convite.
 *
 * Tudo o que aparece no convite sai daqui. Campos ainda não definidos ficam
 * entre colchetes (ex.: "[NOME DO LOCAL]") e são ocultados automaticamente na
 * interface até serem preenchidos — basta trocar o texto e publicar de novo.
 */
export const eventConfig = {
  /** Nome completo da aniversariante (posição secundária no convite). */
  fullName: "Ayla Sophia de Lima Penna",
  /** Nome em destaque. */
  displayName: "Ayla Sophia",
  /** Idade comemorada. */
  age: 1,
  theme: "Jardim Encantado",

  /**
   * Instante exato da festa com fuso explícito (ISO 8601).
   * A contagem regressiva usa este valor e não depende do fuso do celular.
   * Valor inicial a validar quando a cidade for preenchida.
   */
  startsAt: "2026-12-13T19:00:00-04:00",
  /** Fuso IANA usado para exibir data e horário. */
  timeZone: "America/Cuiaba",

  venueName: "[NOME DO LOCAL]",
  address: "[ENDEREÇO COMPLETO]",
  cityState: "[CIDADE/UF]",

  /** Prazo para confirmar presença no formato AAAA-MM-DD (ex.: "2026-11-30"). */
  rsvpDeadline: "[DATA LIMITE]",

  /**
   * Foto da aniversariante. Coloque o arquivo em /public/images/ e informe
   * o caminho (ex.: "/images/ayla.jpg"). Enquanto pendente, o convite mostra
   * uma janela com vista para o jardim encantado.
   */
  photo: {
    src: "[ARQUIVO DA FOTO DA AYLA]",
    alt: "Foto da Ayla Sophia",
    /** Ponto focal do recorte (CSS object-position) para manter o rosto centralizado. */
    focalPoint: "50% 35%",
  },

  /** URL pública do site (ex.: "https://aylasophia.vercel.app"). */
  publicUrl: "[URL DO SITE]",

  share: {
    title: "Ayla Sophia faz 1 ano 🌸",
    description:
      "Você está convidado para celebrar esse momento especial no nosso Jardim Encantado. 13 de dezembro de 2026, às 19h.",
    /** Imagem gerada em src/app/opengraph-image.tsx (1200 × 630). */
    imageAlt: "Convite floral do primeiro aninho da Ayla Sophia, 13 de dezembro de 2026, às 19h",
  },

  rsvp: {
    /** Limite de familiares por confirmação (protege contra envios abusivos). */
    maxCompanions: 15,
    /** Limite de caracteres por nome. */
    maxNameLength: 120,
  },
} as const;

export type EventConfig = typeof eventConfig;
