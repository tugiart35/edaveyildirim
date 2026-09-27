import { AdminShell } from "@/components/admin/admin-shell";
import { GuestFormDialog } from "@/components/admin/guest-form-dialog";
import { GuestTable } from "@/components/admin/guest-table";
import { siteUrl } from "@/lib/config";
import { getWedding, listGuests } from "@/lib/data";

/**
 * Admin sayfaları her istekte taze veriyle üretilir; panelin işi
 * anlık doğru sayıyı göstermek.
 */
export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const [guests, wedding] = await Promise.all([listGuests(), getWedding()]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="type-display text-2xl text-charcoal">Davetliler</h1>
          <p className="mt-1 text-sm text-graphite">
            {guests.length === 0
              ? "Henüz davetli yok."
              : `${guests.length} davetli kayıtlı.`}
          </p>
        </div>

        <GuestFormDialog triggerLabel="Yeni Davetli" />
      </div>

      <div className="mt-8">
        {guests.length === 0 ? (
          <EmptyState />
        ) : (
          <GuestTable guests={guests} wedding={wedding} siteUrl={siteUrl} />
        )}
      </div>
    </AdminShell>
  );
}

/** Şartname §48. */
function EmptyState() {
  return (
    <div className="rounded-(--card-radius) border border-dashed border-beige bg-warm-white px-6 py-16 text-center">
      <p className="type-display text-lg text-charcoal">
        Henüz davetli eklemediniz.
      </p>
      <p className="mt-2 text-sm text-graphite">
        İlk davetlinizi ekleyerek başlayın.
      </p>

      <div className="mt-6 flex justify-center">
        <GuestFormDialog triggerLabel="Davetli Ekle" />
      </div>
    </div>
  );
}
