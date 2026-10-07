"use client";

import { useEffect, useState } from "react";
import { eventStartMs } from "@/lib/event-info";
import { ArtImg } from "@/components/garden/ArtImg";

const UNITS = [
  { key: "days", one: "dia", many: "dias", ms: 86_400_000 },
  { key: "hours", one: "hora", many: "horas", ms: 3_600_000 },
  { key: "minutes", one: "minuto", many: "minutos", ms: 60_000 },
  { key: "seconds", one: "segundo", many: "segundos", ms: 1_000 },
] as const;

function split(remaining: number) {
  let rest = remaining;
  return UNITS.map((u) => {
    const value = Math.floor(rest / u.ms);
    rest -= value * u.ms;
    return { ...u, value };
  });
}

export function Countdown() {
  // Só calcula no navegador: evita divergência de horário entre servidor e cliente.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t < eventStartMs) timer = setTimeout(tick, 1000 - (t % 1000) + 10);
    };
    tick();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const remaining = now == null ? null : Math.max(0, eventStartMs - now);
  const arrived = remaining === 0;
  const parts = remaining == null ? null : split(remaining);

  return (
    <section className="countdown" aria-labelledby="contagem-titulo" data-reveal>
      <ArtImg name="countdown-flowers" className="countdown__flowers" />
      <ArtImg name="countdown-flowers" className="countdown__flowers" />
      <h2 className="section-title section-title--script" id="contagem-titulo">
        {arrived ? "Chegou o momento de celebrar!" : "Falta pouco para o nosso jardim florescer"}
      </h2>

      {arrived ? null : (
        <div className="countdown__grid" role="timer" aria-live="off">
          {(parts ?? UNITS.map((u) => ({ ...u, value: null as number | null }))).map((u) => (
            <div className="countdown__cell" key={u.key}>
              <span className="countdown__value">{u.value == null ? "··" : String(u.value).padStart(2, "0")}</span>
              <span className="countdown__label">{u.value === 1 ? u.one : u.many}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
