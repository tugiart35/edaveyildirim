import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { listGuests } from "@/lib/data";
import { computeWeddingStats } from "@/lib/stats/wedding-stats";
import { guestStatus, type GuestWithRsvp } from "@/types";

/**
 * Admin sayfaları her istekte taze veriyle üretilir; panelin işi
 * anlık doğru sayıyı göstermek.
 */
export const dynamic = "force-dynamic";

/** Bekleyenler listesinde gösterilecek en fazla kişi. */
const PENDING_PREVIEW = 8;

export default async function DashboardPage() {
  const guests = await listGuests();
  const stats = computeWeddingStats(guests);
  const pending = guests.filter((guest) => guestStatus(guest) === "pending");

  return (
    <AdminShell>
      <h1 className="type-display text-2xl text-charcoal">Dashboard</h1>

      <div className="mt-8">
        {guests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-6">
            <DashboardStats stats={stats} />
            {pending.length > 0 ? <PendingList guests={pending} /> : null}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

/** Kimi arayacağını bilmek için: henüz cevap vermemiş davetliler. */
function PendingList({ guests }: { guests: GuestWithRsvp[] }) {
  const shown = guests.slice(0, PENDING_PREVIEW);
  const remaining = guests.length - shown.length;

  return (
    <section className="rounded-(--card-radius) border border-beige bg-warm-white px-5 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs text-stone">Cevap Bekleyenler</h2>
        <Link
          href="/admin/guests"
          className="text-xs text-graphite underline-offset-4 hover:text-charcoal hover:underline"
        >
          Davetli listesine git
        </Link>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {shown.map((guest) => (
          <li
            key={guest.id}
            className="rounded-full bg-sand px-3 py-1.5 text-xs text-charcoal"
          >
            {guest.name}
            {guest.phone ? (
              <span className="ml-2 text-stone">{guest.phone}</span>
            ) : null}
          </li>
        ))}

        {remaining > 0 ? (
          <li className="px-1 py-1.5 text-xs text-stone">
            ve {remaining} kişi daha
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-(--card-radius) border border-dashed border-beige bg-warm-white px-6 py-16 text-center">
      <p className="type-display text-lg text-charcoal">
        Henüz davetli eklemediniz.
      </p>
      <p className="mt-2 text-sm text-graphite">
        Davetli ekledikçe beklenen kişi sayısı burada görünecek.
      </p>

      <Link
        href="/admin/guests"
        className="mt-6 inline-block rounded-(--button-radius) bg-charcoal px-5 py-2.5 text-sm font-medium text-warm-white transition-opacity duration-200 hover:opacity-90"
      >
        Davetli Ekle
      </Link>
    </div>
  );
}
