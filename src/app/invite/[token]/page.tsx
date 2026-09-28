import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvitationPage } from "@/components/invitation/invitation-page";
import { RsvpSection } from "@/components/invitation/rsvp-section";
import { getGuestByToken, getWedding } from "@/lib/data";
import { shareMetadata } from "@/lib/share-metadata";

/**
 * Davetli adı ve token metadata'ya asla girmez (şartname §38) ve sayfa
 * arama motorlarına kapatılır — kişisel bağlantı indekslenmemelidir.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    ...shareMetadata(await getWedding()),
    // Kişisel bağlantı arama motorlarına kapalıdır; bağlantı önizlemesi
    // (WhatsApp vb.) bundan etkilenmez.
    robots: { index: false, follow: false },
  };
}

/** Kişiye özel davetiye. */
export default async function InvitePage(props: PageProps<"/invite/[token]">) {
  const { token } = await props.params;
  const guest = await getGuestByToken(token);

  if (!guest) notFound();

  const wedding = await getWedding();

  return (
    <InvitationPage
      wedding={wedding}
      guestName={guest.name}
      rsvpCard={<RsvpSection guest={guest} wedding={wedding} />}
    />
  );
}
