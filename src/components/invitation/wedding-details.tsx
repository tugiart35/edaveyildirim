import { Hairline } from "@/components/invitation/primitives";
import { formatLongDate, formatWeekday } from "@/lib/utils/date";
import type { Wedding } from "@/types";

/**
 * Tarih, saat ve mekân.
 *
 * Yol tarifi bağlantısı kartın başlık şeridinde durur (bkz. `CardStack`),
 * bu yüzden burada tekrarlanmaz.
 */
export function WeddingDetails({ wedding }: { wedding: Wedding }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="type-display text-4xl leading-tight text-charcoal sm:text-5xl">
        {formatLongDate(wedding.eventDate)}
      </p>
      <p className="mt-3 text-xs tracking-[0.3em] text-stone">
        {formatWeekday(wedding.eventDate)}
      </p>

      <Hairline className="my-10 w-10" />

      <p className="type-display text-4xl text-charcoal sm:text-5xl">
        {wedding.eventTime}
      </p>

      <Hairline className="my-10 w-10" />

      <p className="type-display text-3xl text-charcoal sm:text-4xl">
        {wedding.venueName}
      </p>

      {wedding.venueAddress ? (
        <address className="mt-4 max-w-xs text-balance text-sm not-italic leading-relaxed text-graphite">
          {wedding.venueAddress}
        </address>
      ) : null}
    </div>
  );
}
