import type { ReactNode } from "react";

import { Countdown } from "@/components/invitation/countdown";
import { InvitationFooter } from "@/components/invitation/invitation-footer";
import { InvitationHero } from "@/components/invitation/invitation-hero";
import { PhotoGallery } from "@/components/invitation/photo-gallery";
import { ScrollReveal } from "@/components/invitation/scroll-reveal";
import { WeddingDetails } from "@/components/invitation/wedding-details";
import { weddingStartTimestamp } from "@/lib/utils/date";
import type { Wedding } from "@/types";

/**
 * Davetiyenin ortak gövdesi.
 *
 * Generic (`/`) ve kişiye özel (`/invite/[token]`) sayfalar aynı bölümleri
 * paylaşır; tek fark selamlama ve RSVP alanıdır. `rsvpSlot` kişiye özel
 * sayfada RSVP bölümünü buraya yerleştirir.
 */
export function InvitationPage({
  wedding,
  guestName,
  rsvpSlot,
}: {
  wedding: Wedding;
  guestName?: string;
  rsvpSlot?: ReactNode;
}) {
  return (
    <>
      <ScrollReveal />
      <main>
        <InvitationHero wedding={wedding} guestName={guestName} />
        <Countdown targetMs={weddingStartTimestamp(wedding)} />
        <PhotoGallery wedding={wedding} />
        <WeddingDetails wedding={wedding} />
        {rsvpSlot}
      </main>
      <InvitationFooter wedding={wedding} />
    </>
  );
}
