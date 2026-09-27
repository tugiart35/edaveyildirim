import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvitationPage } from "@/components/invitation/invitation-page";
import { RsvpSection } from "@/components/invitation/rsvp-section";
import { getGuestByToken, getWedding } from "@/lib/data";
import { coupleTitle } from "@/lib/utils/wedding";

/**
 * Davetli adı ve token metadata'ya asla girmez (şartname §38) ve sayfa
 * arama motorlarına kapatılır — kişisel bağlantı indekslenmemelidir.
 */
export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWedding();
  const couple = coupleTitle(wedding);

  return {
    title: `${couple} | Düğün Davetiyesi`,
    description: `${couple} çiftinin düğün davetiyesi.`,
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
      rsvpCard={<RsvpSection guest={guest} />}
    />
  );
}
