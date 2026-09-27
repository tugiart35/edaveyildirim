import { Hairline, Reveal, Section, SectionLabel } from "@/components/invitation/primitives";
import { formatLongDate, formatWeekday } from "@/lib/utils/date";
import type { Wedding } from "@/types";

/** Tarih, saat, mekân ve yol tarifi. */
export function WeddingDetails({ wedding }: { wedding: Wedding }) {
  return (
    <Section className="border-t border-beige">
      <Reveal className="flex flex-col items-center text-center">
        <SectionLabel>Düğün</SectionLabel>

        <p className="mt-12 font-display text-4xl font-light leading-tight text-charcoal sm:text-5xl">
          {formatLongDate(wedding.eventDate)}
        </p>
        <p className="mt-3 text-xs tracking-[0.3em] text-stone">
          {formatWeekday(wedding.eventDate)}
        </p>

        <Hairline className="my-10 w-10" />

        <p className="font-display text-4xl font-light text-charcoal sm:text-5xl">
          {wedding.eventTime}
        </p>

        <Hairline className="my-10 w-10" />

        <p className="font-display text-3xl font-light text-charcoal sm:text-4xl">
          {wedding.venueName}
        </p>

        {wedding.venueAddress ? (
          <address className="mt-4 max-w-xs text-balance text-sm not-italic leading-relaxed text-graphite">
            {wedding.venueAddress}
          </address>
        ) : null}

        {wedding.mapsUrl ? (
          <a
            href={wedding.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-10 inline-block rounded-[2px] border border-charcoal/25 px-9 py-3.5 text-[0.7rem] tracking-[0.25em] text-charcoal transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            YOL TARİFİ
          </a>
        ) : null}
      </Reveal>
    </Section>
  );
}
