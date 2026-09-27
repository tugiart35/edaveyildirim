import Image from "next/image";

import { Hairline } from "@/components/invitation/primitives";
import { formatLongDate } from "@/lib/utils/date";
import { trUpper } from "@/lib/utils/text";
import { coupleNames, monogram } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/**
 * Tam ekran açılış.
 *
 * Fotoğraf varsa tüm ekranı kaplar ve üzerine ivory bir perde çekilir;
 * yoksa çiftin baş harflerinden monogram gösterilir. Her iki durumda da
 * tipografi aynı kalır — davetiyenin kimliği fotoğrafa bağlı değildir.
 */
export function InvitationHero({
  wedding,
  guestName,
}: {
  wedding: Wedding;
  guestName?: string;
}) {
  const [first, second] = coupleNames(wedding);
  const hasPhoto = Boolean(wedding.primaryImage);

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24">
      {wedding.primaryImage ? (
        <>
          <Image
            src={wedding.primaryImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Metnin okunabilirliği için yumuşak perde. */}
          <div aria-hidden className="absolute inset-0 bg-ivory/75" />
        </>
      ) : null}

      {/* Basılı davetiye hissi veren ince çerçeve. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 border border-beige sm:inset-8"
      />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        {guestName ? (
          <p className="mb-10 text-sm leading-relaxed text-graphite">
            Sevgili{" "}
            <span className="font-display text-xl text-charcoal">{guestName}</span>,
          </p>
        ) : null}

        <p className="text-[0.7rem] tracking-[0.5em] text-gold">
          {monogram(wedding)}
        </p>

        <Hairline className="mt-6 w-10" />

        <h1 className="mt-10 font-display font-light leading-[0.95] text-charcoal">
          <span className="block text-6xl sm:text-7xl lg:text-8xl">{first}</span>
          <span className="my-4 block text-2xl font-light text-gold sm:text-3xl">
            &
          </span>
          <span className="block text-6xl sm:text-7xl lg:text-8xl">{second}</span>
        </h1>

        <Hairline className="mt-10 w-10" />

        <p className="mt-8 text-xs tracking-[0.35em] text-graphite sm:text-sm">
          {trUpper(formatLongDate(wedding.eventDate))}
        </p>

        {wedding.invitationText ? (
          <p className="mt-10 max-w-sm text-balance text-sm leading-loose text-graphite">
            {wedding.invitationText}
          </p>
        ) : null}
      </div>

      <ScrollHint hasPhoto={hasPhoto} />
    </section>
  );
}

/** Aşağı kaydırmayı ima eden ince çizgi. Dekoratif, ekran okuyucudan gizli. */
function ScrollHint({ hasPhoto }: { hasPhoto: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute bottom-12 left-1/2 block h-14 w-px -translate-x-1/2 overflow-hidden ${
        hasPhoto ? "bg-charcoal/15" : "bg-beige"
      }`}
    >
      <span className="scroll-hint absolute inset-x-0 top-0 block h-5 bg-gold" />
    </span>
  );
}
