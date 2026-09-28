import type { Metadata } from "next";

import { InvitationPage } from "@/components/invitation/invitation-page";
import { getWedding } from "@/lib/data";
import { shareMetadata } from "@/lib/share-metadata";

/**
 * Davetiye her istekte veritabanından üretilir.
 *
 * Statik üretim burada yanlış olurdu: sayfa derleme anındaki veriyle
 * dondurulur ve sunucuda bambaşka bir veritabanı olsa bile o eski
 * içeriği servis eder. SQLite okuması mikrosaniyeler sürdüğü için
 * dinamik üretmenin görünür bir maliyeti yok.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return shareMetadata(await getWedding());
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
          {wedding.rsvpImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wedding.rsvpImage}
              alt="Aramızda olacak mısınız?"
              loading="lazy"
              decoding="async"
              className="h-auto w-auto max-h-[min(34vh,18rem)] max-w-full object-contain"
            />
          ) : (
            <h3 className="type-display text-3xl text-charcoal sm:text-4xl">
              Aramızda olacak mısınız?
            </h3>
          )}
          <p className="mt-8 max-w-sm text-balance text-sm leading-loose text-graphite">
            Katılım durumunuzu bildirmek için size gönderilen kişisel davet
            bağlantısını kullanabilirsiniz.
          </p>
        </div>
      }
    />
  );
}
