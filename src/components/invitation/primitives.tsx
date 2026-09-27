import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Kaydırma sırasında yumuşakça beliren sarmalayıcı.
 *
 * Kart içeriklerinde kullanılmaz: orada hareketi `.card-content` ve
 * `CardStack`'in yazdığı `--enter` ilerlemesi yönetir. Bu sarmalayıcı
 * yığının dışındaki öğeler (footer) içindir.
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
    <span aria-hidden className={cn("block h-px w-12 bg-gold-soft", className)} />
  );
}
