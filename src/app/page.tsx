import { GardenDefs } from "@/components/garden/art";
import { InviteBackdrop } from "@/components/garden/InviteBackdrop";
import { OpeningScreen } from "@/components/envelope/OpeningScreen";
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
      <InviteBackdrop />

      <SafeBoundary>
        <OpeningScreen />
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
