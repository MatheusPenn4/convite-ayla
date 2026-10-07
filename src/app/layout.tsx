import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces, Pinyon_Script } from "next/font/google";
import { eventConfig } from "@/config/event";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const script = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-script", display: "swap" });
const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const { title, description } = eventConfig.share;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title,
  description,
  applicationName: `${eventConfig.displayName} · ${eventConfig.age} ano`,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: `${eventConfig.displayName} · ${eventConfig.theme}`,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  // Convite particular: não aparece em buscadores (pré-visualização do WhatsApp continua funcionando).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbeef2",
  colorScheme: "light",
};

// Executa antes da pintura: marca JS ativo e pula o envelope se já foi aberto nesta sessão.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('ayla:envelope')==='open'||location.hash==='#convite')d.dataset.envelope='open'}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${script.variable} ${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
