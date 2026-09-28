import { Countdown } from "@/components/invitation/countdown";
import type { InvitationPanel } from "@/types";

/**
 * Çizim kartı.
 *
 * Çizimler tarih, saat, mekân gibi bilgileri kendi içlerinde taşır;
 * bu yüzden yanına metin eklenmez — çizim tek başına konuşur.
 *
 * Görsel **kendi en–boy oranını korur**. `next/image`'ın `fill` kipi
 * sabit boyutlu bir kap ister; oranı farklı bir çizim (örneğin yatay
 * bir metin çizimi dikey bir kutuda) o kalıba sokulunca küçülüp
 * okunamaz hale geliyordu. Düz `<img>` tarayıcının doğal
 * boyutlandırmasını kullanır: yalnızca üst sınırlar verilir, oran
 * çizimin kendisinden gelir.
 *
 * Yükseklik sınırı önemlidir: kart bir ekranı aşarsa yığılma akışı
 * okunmaz hale gelir.
 */
export function ArtworkPanel({
  panel,
  weddingStartMs,
}: {
  panel: InvitationPanel;
  weddingStartMs: number;
}) {
  // Geri sayım varken çizime daha az yer kalmalı ki kart bir ekranı aşmasın.
  const maxHeight = panel.countdown
    ? "max-h-[min(46vh,28rem)]"
    : "max-h-[min(60vh,36rem)]";

  return (
    <div className="flex flex-col items-center gap-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={panel.image}
        alt={panel.label}
        loading="lazy"
        decoding="async"
        className={`h-auto w-auto max-w-full object-contain ${maxHeight}`}
      />

      {panel.countdown ? <Countdown targetMs={weddingStartMs} /> : null}
    </div>
  );
}
