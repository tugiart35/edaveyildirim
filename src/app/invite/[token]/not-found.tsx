import Link from "next/link";

import { Hairline } from "@/components/invitation/primitives";

/**
 * Geçersiz davet bağlantısı.
 *
 * Gerçek 404 döner ama ton davetiyenin geri kalanıyla aynı kalır —
 * ziyaretçi teknik bir hata ekranıyla karşılaşmaz (şartname §42).
 */
export default function InviteNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      <div aria-hidden className="pointer-events-none fixed inset-4 border border-beige sm:inset-8" />

      <div className="relative flex max-w-sm flex-col items-center">
        <Hairline className="w-10" />

        <h1 className="mt-10 font-display text-3xl font-light leading-snug text-charcoal sm:text-4xl">
          Davet bağlantısı bulunamadı.
        </h1>

        <p className="mt-6 text-balance text-sm leading-loose text-graphite">
          Lütfen size gönderilen bağlantıyı kontrol edin.
        </p>

        <Link
          href="/"
          className="mt-10 inline-block rounded-[2px] border border-charcoal/25 px-9 py-3.5 text-[0.7rem] tracking-[0.25em] text-charcoal transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          DAVETİYEYE GİT
        </Link>
      </div>
    </main>
  );
}
