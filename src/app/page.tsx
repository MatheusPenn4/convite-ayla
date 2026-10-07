import { GardenDefs } from "@/components/garden/art";
import { ArtImg } from "@/components/garden/ArtImg";
import { AmbientGarden } from "@/components/garden/AmbientGarden";
import { Envelope } from "@/components/envelope/Envelope";
import { Hero } from "@/components/invite/Hero";
import { PartyDetails } from "@/components/invite/PartyDetails";
import { Countdown } from "@/components/invite/Countdown";
import { Closing } from "@/components/invite/Closing";
import { RsvpSection } from "@/components/rsvp/RsvpSection";
import { PageEffects } from "@/components/motion/PageEffects";
import { SafeBoundary } from "@/components/motion/SafeBoundary";
import { getEventDisplay } from "@/lib/event-info";

export default function InvitationPage() {
  const { rsvpDeadline } = getEventDisplay();

  return (
    <>
      <GardenDefs />
      <noscript>
        <style>{`.envelope-screen{display:none!important}`}</style>
      </noscript>
      <div className="side-garden" aria-hidden="true">
        <ArtImg name="corner-bouquet" className="side-garden__piece side-garden__piece--tl" />
        <ArtImg name="corner-bouquet" className="side-garden__piece side-garden__piece--bl" />
        <ArtImg name="corner-bouquet-mirror" className="side-garden__piece side-garden__piece--tr" />
        <ArtImg name="corner-bouquet-mirror" className="side-garden__piece side-garden__piece--br" />
      </div>
      <AmbientGarden />

      <SafeBoundary>
        <Envelope />
      </SafeBoundary>

      <main id="convite" className="invite" tabIndex={-1}>
        <Hero />
        <PartyDetails />
        <Countdown />
        <RsvpSection deadline={rsvpDeadline} />
        <Closing />
      </main>

      <PageEffects />
    </>
  );
}
