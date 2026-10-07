import { getEventDisplay } from "@/lib/event-info";
import { TinySprig } from "@/components/garden/art";
import { CalendarIcon, ClockIcon, PinIcon, RouteIcon } from "./icons";

export function PartyDetails() {
  const e = getEventDisplay();
  const hasPlace = Boolean(e.venueName || e.address || e.cityState);

  return (
    <section className="card details" aria-labelledby="detalhes-titulo" data-reveal>
      <h2 className="section-title" id="detalhes-titulo">
        <TinySprig className="section-title__sprig" />
        Celebre com a gente
      </h2>

      <div className="date-tile">
        <p className="sr-only">
          {e.weekday}, {e.dateLong}, {e.timeLong.toLowerCase()}.
        </p>
        <div className="date-tile__row" aria-hidden="true">
          <div className="date-tile__side">
            <CalendarIcon />
            <span>{e.weekday}</span>
          </div>
          <div className="date-tile__day">{e.day}</div>
          <div className="date-tile__side">
            <ClockIcon />
            <span>{e.timeLong}</span>
          </div>
        </div>
        <p className="date-tile__month" aria-hidden="true">
          {e.month} de {e.year}
        </p>
      </div>

      <div className="place">
        <PinIcon className="place__icon" />
        <div className="place__text">
          <h3 className="sr-only">Local</h3>
          {e.venueName ? <p className="place__name">{e.venueName}</p> : null}
          {e.address ? <p>{e.address}</p> : null}
          {e.cityState ? <p>{e.cityState}</p> : null}
          {!hasPlace ? <p className="place__soon">Local e endereço em breve</p> : null}
        </div>
      </div>

      {e.mapsUrl ? (
        <a className="btn btn--soft" href={e.mapsUrl} target="_blank" rel="noopener noreferrer">
          Como chegar
          <RouteIcon />
          <span className="sr-only"> (abre o Google Maps em nova aba)</span>
        </a>
      ) : (
        <p className="soon-chip">Localização em breve</p>
      )}

      {e.rsvpDeadline ? <p className="details__deadline">Confirme sua presença até {e.rsvpDeadline}.</p> : null}
    </section>
  );
}
