import Image from "next/image";

import { coupleTitle } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/**
 * Editorial galeri.
 *
 * İlk fotoğraf tam genişlik, kalanlar iki sütun — 1 ile 5 arası her sayıda
 * dengeli durur. Fotoğraf yoksa kart hiç oluşturulmaz (şartname §11); bu
 * karar sayfa seviyesinde verilir.
 */
export function PhotoGallery({ wedding }: { wedding: Wedding }) {
  const [lead, ...rest] = wedding.galleryImages;
  const couple = coupleTitle(wedding);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <figure className="relative aspect-[4/3] overflow-hidden rounded-(--card-radius) bg-sand sm:col-span-2">
        <Image
          src={lead}
          alt={`${couple} — fotoğraf 1`}
          fill
          sizes="(min-width: 640px) 36rem, 100vw"
          className="object-cover"
        />
      </figure>

      {rest.map((src, index) => (
        <figure
          key={src}
          className="relative aspect-[3/4] overflow-hidden rounded-(--card-radius) bg-sand"
        >
          <Image
            src={src}
            alt={`${couple} — fotoğraf ${index + 2}`}
            fill
            sizes="(min-width: 640px) 18rem, 100vw"
            className="object-cover"
          />
        </figure>
      ))}
    </div>
  );
}
