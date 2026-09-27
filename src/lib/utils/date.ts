import type { Wedding } from "@/types";

/**
 * Düğünün başlangıç anını, düğünün kendi saat diliminde yorumlayarak
 * mutlak bir zaman damgasına (epoch ms) çevirir.
 *
 * `eventDate`/`eventTime` duvar saati olarak saklanır ("18 Ekim 19:30"),
 * bu yüzden sunucunun veya ziyaretçinin saat dilimi sonucu etkilememelidir.
 */
export function weddingStartTimestamp(wedding: Wedding): number {
  const naive = Date.parse(`${wedding.eventDate}T${wedding.eventTime}:00Z`);
  const offset = timezoneOffsetMs(naive, wedding.timezone);
  return naive - offset;
}

/** Verilen andaki UTC ile hedef saat dilimi arasındaki farkı ms olarak döner. */
function timezoneOffsetMs(utcMs: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(utcMs))
      .map((part) => [part.type, part.value]),
  );

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    // Intl bazı dillerde gece yarısını "24" olarak verir.
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - utcMs;
}

const LONG_DATE = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const WEEKDAY = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  timeZone: "UTC",
});

/** "18 Ekim 2026" */
export function formatLongDate(isoDate: string): string {
  return LONG_DATE.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "Cumartesi" */
export function formatWeekday(isoDate: string): string {
  const value = WEEKDAY.format(new Date(`${isoDate}T00:00:00Z`));
  return value.charAt(0).toLocaleUpperCase("tr-TR") + value.slice(1);
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Hedef zamana kalan süreyi parçalara ayırır.
 * Hedef geçmişteyse `null` döner — countdown gösterilmemelidir.
 */
export function countdownTo(
  targetMs: number,
  nowMs: number,
): CountdownParts | null {
  const remaining = targetMs - nowMs;
  if (remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
