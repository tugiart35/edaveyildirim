import { getWedding } from "@/lib/data";
import { formatLongDate } from "@/lib/utils/date";
import { coupleNames } from "@/lib/utils/wedding";

/**
 * Generic davetiye sayfası.
 *
 * Adım 2'de tam davetiye deneyimiyle değiştirilecek. Şimdilik veri
 * katmanının uçtan uca çalıştığını doğrular.
 */
export default async function HomePage() {
  const wedding = await getWedding();
  const [first, second] = coupleNames(wedding);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-stone">
        Düğün Davetiyesi
      </p>

      <h1 className="font-display text-5xl font-light leading-tight text-charcoal sm:text-6xl">
        {first}
        <span className="mx-3 text-gold">&</span>
        {second}
      </h1>

      <p className="text-sm tracking-[0.2em] text-graphite">
        {formatLongDate(wedding.eventDate)} · {wedding.eventTime}
      </p>

      <p className="max-w-sm text-sm leading-relaxed text-graphite">
        {wedding.venueName}
      </p>

      <p className="mt-8 border-t border-beige pt-8 text-xs leading-relaxed text-stone">
        Adım 1 tamamlandı: veri katmanı çalışıyor. Davetiye tasarımı Adım
        2&rsquo;de gelecek.
      </p>
    </main>
  );
}
