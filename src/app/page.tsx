import type { Metadata } from "next";

import { InvitationPage } from "@/components/invitation/invitation-page";
import { getWedding } from "@/lib/data";
import { coupleTitle } from "@/lib/utils/wedding";

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWedding();
  const couple = coupleTitle(wedding);

  return {
    title: `${couple} | Düğün Davetiyesi`,
    description: `${couple} çiftinin düğün davetiyesi.`,
  };
}

/**
 * Generic davetiye.
 *
 * Kişisel link olmadan gelen ziyaretçiye yalnızca davetiye gösterilir;
 * RSVP formu yoktur (şartname §8).
 */
export default async function HomePage() {
  const wedding = await getWedding();

  return (
    <InvitationPage
      wedding={wedding}
      rsvpCard={
        <div className="flex flex-col items-center text-center">
          <h3 className="type-display text-3xl text-charcoal sm:text-4xl">
            Aramızda olacak mısınız?
          </h3>
          <p className="mt-8 max-w-sm text-balance text-sm leading-loose text-graphite">
            Katılım durumunuzu bildirmek için size gönderilen kişisel davet
            bağlantısını kullanabilirsiniz.
          </p>
        </div>
      }
    />
  );
}
