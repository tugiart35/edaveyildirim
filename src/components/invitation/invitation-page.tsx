import type { ReactNode } from "react";

import { ArtworkPanel } from "@/components/invitation/artwork-panel";
import { CardStack, type StackCard } from "@/components/invitation/card-stack";
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
 *
 * Kart sırası: önce çizim panelleri (ayarlardaki sırayla), sonra galeri,
 * düğün bilgileri ve katılım.
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

  const cards: StackCard[] = wedding.panels.map((panel, index) => ({
    id: `panel-${index + 1}`,
    label: panel.label,
    wide: true,
    // Yol tarifi, bilgileri taşıyan çizimin kendi başlığında durur.
    action:
      panel.directions && wedding.mapsUrl
        ? { href: wedding.mapsUrl, label: "Yol Tarifi" }
        : undefined,
    content: <ArtworkPanel panel={panel} weddingStartMs={weddingStartMs} />,
  }));

  if (wedding.galleryImages.length > 0) {
    cards.push({
      id: "biz",
      label: "Biz",
      wide: true,
      content: <PhotoGallery wedding={wedding} />,
    });
  }

  // Çizim panelleri tarih ve mekânı zaten taşır. Panel yoksa bilgilerin
  // hiç görünmemesini engellemek için yazılı kart yedek olarak kalır.
  if (wedding.panels.length === 0) {
    cards.push({
      id: "dugun",
      label: "Düğün",
      action: wedding.mapsUrl
        ? { href: wedding.mapsUrl, label: "Yol Tarifi" }
        : undefined,
      content: <WeddingDetails wedding={wedding} />,
    });
  }

  /*
    Katılım kartı, geri sayım panelinin **önüne** girer.

    Geri sayım davetiyeyi kapatan karttır: cevap verildikten sonra
    geriye kalan tek şey beklemektir. Katılım sona konduğunda davetiye
    bir formla bitiyordu.

    Geri sayım paneli yoksa katılım en sonda kalır — kural tek yerde
    ve öngörülebilir: "katılım, geri sayımdan hemen önce".
  */
  // Panel kartları diziye sırayla ilk eklendiği için panel indeksi
  // kart indeksiyle birebir aynıdır.
  const countdownIndex = wedding.panels.findIndex((panel) => panel.countdown);

  cards.splice(countdownIndex === -1 ? cards.length : countdownIndex, 0, {
    id: "katilim",
    label: "Katılım",
    content: rsvpCard,
  });

  return (
    <>
      <ScrollReveal />
      <main>
        <InvitationHero wedding={wedding} guestName={guestName} />
        <CardStack cards={cards} />
      </main>
      <InvitationFooter wedding={wedding} />
    </>
  );
}
