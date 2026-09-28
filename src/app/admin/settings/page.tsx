import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { WeddingSettingsForm } from "@/components/admin/wedding-settings-form";
import { getWedding } from "@/lib/data";

/**
 * Admin sayfaları her istekte taze veriyle üretilir; panelin işi
 * anlık doğru sayıyı göstermek.
 */
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const wedding = await getWedding();

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="type-display text-2xl text-charcoal">
            Düğün Bilgileri
          </h1>
          <p className="mt-1 text-sm text-graphite">
            Buradaki değişiklikler davetiyeye anında yansır.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-(--button-radius) border border-beige px-4 py-2.5 text-sm text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal"
        >
          Davetiyeyi görüntüle ↗
        </Link>
      </div>

      <div className="mt-8 max-w-3xl">
        <WeddingSettingsForm wedding={wedding} />
      </div>
    </AdminShell>
  );
}
