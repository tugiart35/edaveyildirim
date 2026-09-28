import Image from "next/image";

import { Countdown } from "@/components/invitation/countdown";
import type { InvitationPanel } from "@/types";

/**
 * Çizim kartı.
 *
 * Çizimler tarih, saat, mekân gibi bilgileri kendi içlerinde taşır;
 * bu yüzden yanına metin eklenmez — çizim tek başına konuşur.
 *
 * Yükseklik viewport'a göre sınırlanır: dikey bir çizim tam genişlikte
 * gösterilseydi kart bir ekranı aşar ve yığılma akışı okunmaz hale
 * gelirdi. Görsel asla kırpılmaz.
 */
export function ArtworkPanel({
  panel,
  weddingStartMs,
}: {
  panel: InvitationPanel;
  weddingStartMs: number;
}) {
  // Geri sayım varken çizime daha az yer kalmalı ki kart bir ekranı aşmasın.
  const artworkHeight = panel.countdown
    ? "h-[min(50vh,30rem)]"
    : "h-[min(62vh,38rem)]";

  return (
    <div className="flex flex-col items-center gap-7">
      <div className={`relative w-full max-w-md ${artworkHeight}`}>
        <Image
          src={panel.image}
          alt={panel.label}
          fill
          sizes="(min-width: 640px) 28rem, 100vw"
          className="object-contain"
        />
      </div>

      {panel.countdown ? <Countdown targetMs={weddingStartMs} /> : null}
    </div>
  );
}
