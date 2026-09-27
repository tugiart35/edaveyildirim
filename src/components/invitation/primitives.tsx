import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { trUpper } from "@/lib/utils/text";

/** Davetiye bölümü. Geniş dikey boşluk davetiyenin nefes almasını sağlar. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("px-6 py-20 sm:py-28 lg:py-36", className)}>
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </section>
  );
}

/**
 * Kaydırma sırasında yumuşakça beliren sarmalayıcı.
 * `delay` ile aynı bölümdeki öğeler sırayla açılabilir.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      className={className}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** İnce yatay ayraç çizgisi. */
export function Hairline({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block h-px w-12 bg-gold-soft", className)}
    />
  );
}

/** Bölüm başlığı: iki yanında hairline olan küçük, aralıklı büyük harf metin. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Hairline className="w-8 sm:w-12" />
      <h2 className="text-[0.65rem] font-medium tracking-[0.4em] text-stone">
        {trUpper(children)}
      </h2>
      <Hairline className="w-8 sm:w-12" />
    </div>
  );
}
