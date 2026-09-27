import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvitationPage } from "@/components/invitation/invitation-page";
import { Reveal, Section, SectionLabel } from "@/components/invitation/primitives";
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
      rsvpSlot={
        <Section className="border-t border-beige">
          <Reveal className="flex flex-col items-center text-center">
            <SectionLabel>Katılım</SectionLabel>
            <p className="mt-10 font-display text-3xl font-light text-charcoal sm:text-4xl">
              Aramızda olacak mısınız?
            </p>
            <p className="mt-6 max-w-sm text-balance text-sm leading-loose text-graphite">
              Planlamamızı yapabilmemiz için katılım durumunuzu bildirmenizi
              rica ederiz.
            </p>
            <p className="mt-10 text-xs leading-relaxed text-stone">
              RSVP formu Adım 3&rsquo;te gelecek.
            </p>
          </Reveal>
        </Section>
      }
    />
  );
}
