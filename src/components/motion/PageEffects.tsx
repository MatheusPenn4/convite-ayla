"use client";

import { useEffect } from "react";

/**
 * Efeitos globais leves:
 *  • revela suavemente os blocos [data-reveal] ao entrarem na tela;
 *  • pausa animações contínuas quando a aba fica em segundo plano.
 * Sem JavaScript, todo o conteúdo já aparece normalmente.
 */
export function PageEffects() {
  useEffect(() => {
    const root = document.documentElement;

    const onVisibility = () => {
      root.toggleAttribute("data-hidden", document.visibilityState === "hidden");
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      items.forEach((el) => observer!.observe(el));
    } else {
      items.forEach((el) => el.classList.add("is-in"));
    }
    root.classList.add("reveal-ready");

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  return null;
}
