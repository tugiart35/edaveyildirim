import type { ReactNode } from "react";

import { CardStack, type StackCard } from "@/components/invitation/card-stack";
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
 * Hero tam ekran bir kapak olarak durur; sonrasındaki her bölüm üst üste
 * yığılan bir kart olur. Generic (`/`) ve kişiye özel (`/invite/[token]`)
 * sayfalar aynı kartları paylaşır, tek fark selamlama ve katılım kartının
 * içeriğidir.
 */
export function InvitationPage({
  wedding,
  guestName,
  rsvpCard,
}: {
  wedding: Wedding;
  guestName?: string;
  rsvpCard: ReactNode;
}) {
  const weddingStartMs = weddingStartTimestamp(wedding);

  const cards: StackCard[] = [
    {
      id: "geri-sayim",
      label: "Geri Sayım",
      hideWhenPast: true,
      content: <Countdown targetMs={weddingStartMs} />,
    },
  ];

  if (wedding.galleryImages.length > 0) {
    cards.push({
      id: "biz",
      label: "Biz",
      wide: true,
      content: <PhotoGallery wedding={wedding} />,
    });
  }

  cards.push({
    id: "dugun",
    label: "Düğün",
    action: wedding.mapsUrl
      ? { href: wedding.mapsUrl, label: "Yol Tarifi" }
      : undefined,
    content: <WeddingDetails wedding={wedding} />,
  });

  cards.push({
    id: "katilim",
    label: "Katılım",
    content: rsvpCard,
  });

  return (
    <>
      <ScrollReveal />
      <main>
        <InvitationHero wedding={wedding} guestName={guestName} />
        <CardStack cards={cards} weddingStartMs={weddingStartMs} />
      </main>
      <InvitationFooter wedding={wedding} />
    </>
  );
}
