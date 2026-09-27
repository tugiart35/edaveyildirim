import Image from "next/image";

import { coupleTitle } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/**
 * Yatay fotoğraf şeridi.
 *
 * Izgara yerine şerit kullanılmasının nedeni yükseklik: dikey bir ızgarada
 * dört fotoğraf kartı iki ekran boyuna çıkarıyor ve yığılma akışını
 * bozuyordu. Şerit kartı tek ekran yüksekliğinde tutar, mobilde de doğal
 * bir kaydırma hareketiyle gezilir.
 *
 * İlk fotoğraf yatay, kalanlar dikey — sabit yükseklikte farklı genişlikler
 * editorial bir ritim verir. Kenardan yarım görünen sonraki fotoğraf,
 * kaydırılabileceğinin işaretidir.
 *
 * Fotoğraf yoksa kart hiç oluşturulmaz (şartname §11); bu karar sayfa
 * seviyesinde verilir.
 */
export function PhotoGallery({ wedding }: { wedding: Wedding }) {
  const couple = coupleTitle(wedding);

  return (
    // Kartın yatay dolgusunu iptal edip şeridi kenara kadar taşır.
    <div className="-mx-6 sm:-mx-10">
      <ul
        // Kaydırılabilir alan klavyeyle de gezilebilmeli.
        tabIndex={0}
        aria-label={`${couple} fotoğrafları`}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 sm:gap-4 sm:px-10"
      >
        {wedding.galleryImages.map((src, index) => (
          <li
            key={src}
            // Dar ekranda genişlik sınırı, sonraki fotoğrafın kenardan
            // görünmesini garanti eder — kaydırılabilirliğin tek işareti bu.
            className="h-80 max-w-[78%] shrink-0 snap-center sm:h-96 sm:max-w-none"
            style={{ aspectRatio: index === 0 ? "4 / 3" : "3 / 4" }}
          >
            <figure className="relative h-full w-full overflow-hidden rounded-[calc(var(--card-radius)/2)] bg-sand">
              <Image
                src={src}
                alt={`${couple} — fotoğraf ${index + 1}`}
                fill
                sizes="(min-width: 640px) 28rem, 80vw"
                className="object-cover"
              />
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
