import { Countdown } from "@/components/invitation/countdown";
import type { InvitationPanel } from "@/types";

/**
 * Çizim kartı.
 *
 * Çizimler tarih, saat, mekân gibi bilgileri kendi içlerinde taşır;
 * bu yüzden yanına metin eklenmez — çizim tek başına konuşur.
 *
 * Görsel **kendi en–boy oranını korur**. `next/image`'ın `fill` kipi
 * sabit boyutlu bir kap ister; oranı farklı bir çizim o kalıba sokulunca
 * küçülüp okunamaz hale geliyordu. Düz `<img>` tarayıcının doğal
 * boyutlandırmasını kullanır: yalnızca üst sınırlar verilir.
 *
 * Yükseklik sınırı önemlidir: kart bir ekranı aşarsa yığılma akışı
 * okunmaz hale gelir. Sınır sabit bir `vh` değil `--card-fit`'tir — kartın
 * sırası derinleştikçe üstte biriken başlıklar yüzünden ona kalan yer
 * azalır; çizim de o kadar küçülür.
 */
export function ArtworkPanel({
  panel,
  weddingStartMs,
}: {
  panel: InvitationPanel;
  weddingStartMs: number;
}) {
  return (
    <div className="flex justify-center">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={panel.image}
          alt={panel.label}
          loading="lazy"
          decoding="async"
          className="h-auto w-auto max-h-[min(var(--card-fit),38rem)] max-w-full object-contain"
        />

        {/*
          Geri sayım çizimin üstüne biner ve kalem rengiyle yazılır;
          böylece ayrı bir arayüz parçası gibi değil, çizimin bir
          parçası gibi okunur.

          Dikeyde tam ortada değil %34'te durur. Değer ölçüldü: çizimin
          satır satır koyuluğu çıkarıldığında başlık %5.8–%9.2, saat
          çizimi %59–%95 aralığını kaplıyor; aradaki boşluğun ortası
          %34.1. Tam orta (%50) sayıları saatin tepesine yapıştırıp
          üstte kocaman bir boşluk bırakıyordu.
        */}
        {panel.countdown ? (
          <div className="pointer-events-none absolute inset-x-0 top-[34%] flex -translate-y-1/2 justify-center text-ink">
            <Countdown targetMs={weddingStartMs} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
