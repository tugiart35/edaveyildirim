import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { computeWeddingStats } from "@/lib/stats/wedding-stats";
import { listGuests } from "@/lib/data";

/**
 * Admin sayfaları her istekte taze veriyle üretilir; panelin işi
 * anlık doğru sayıyı göstermek.
 */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const guests = await listGuests();
  const stats = computeWeddingStats(guests);

  return (
    <AdminShell>
      <h1 className="type-display text-2xl text-charcoal">Dashboard</h1>

      <div className="mt-8 rounded-(--card-radius) border border-beige bg-warm-white px-6 py-10 text-center">
        <p className="text-xs tracking-(--label-tracking) text-stone">
          TOPLAM BEKLENEN KİŞİ
        </p>
        <p className="type-display mt-3 text-6xl tabular-nums text-charcoal">
          {stats.expectedPeople}
        </p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-graphite">
        Kartlar, yanıt oranı ve dağılım Adım 5&rsquo;te gelecek.{" "}
        <Link href="/admin/guests" className="underline hover:text-charcoal">
          Davetli listesine git
        </Link>
        .
      </p>
    </AdminShell>
  );
}
