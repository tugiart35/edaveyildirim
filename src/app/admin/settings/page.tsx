import { AdminShell } from "@/components/admin/admin-shell";
import { getWedding } from "@/lib/data";
import { formatLongDate } from "@/lib/utils/date";
import { coupleTitle } from "@/lib/utils/wedding";

/**
 * Admin sayfaları her istekte taze veriyle üretilir; panelin işi
 * anlık doğru sayıyı göstermek.
 */
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const wedding = await getWedding();

  return (
    <AdminShell>
      <h1 className="type-display text-2xl text-charcoal">Düğün Bilgileri</h1>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-(--card-radius) border border-beige bg-beige sm:grid-cols-2">
        <Row term="Çift" value={coupleTitle(wedding)} />
        <Row term="Tarih" value={formatLongDate(wedding.eventDate)} />
        <Row term="Saat" value={wedding.eventTime} />
        <Row term="Mekân" value={wedding.venueName} />
        <Row term="Adres" value={wedding.venueAddress ?? "—"} />
        <Row term="Tema" value={wedding.theme} />
      </dl>

      <p className="mt-6 text-sm leading-relaxed text-graphite">
        Düzenleme formu, görsel yükleme ve tema seçimi Adım 7&rsquo;de gelecek.
      </p>
    </AdminShell>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="bg-warm-white px-5 py-4">
      <dt className="text-xs text-stone">{term}</dt>
      <dd className="mt-1 text-sm text-charcoal">{value}</dd>
    </div>
  );
}
