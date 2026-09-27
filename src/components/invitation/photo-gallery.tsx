import Image from "next/image";

import { Reveal, Section, SectionLabel } from "@/components/invitation/primitives";
import { coupleTitle } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/**
 * Editorial galeri.
 *
 * İlk fotoğraf tam genişlik, kalanlar iki sütun — 1 ile 5 arası her sayıda
 * dengeli durur. Fotoğraf yoksa bölüm tamamen gizlenir (şartname §11).
 */
export function PhotoGallery({ wedding }: { wedding: Wedding }) {
  const images = wedding.galleryImages;
  if (images.length === 0) return null;

  const [lead, ...rest] = images;
  const couple = coupleTitle(wedding);

  return (
    <Section className="border-t border-beige">
      <Reveal className="flex flex-col items-center">
        <SectionLabel>Biz</SectionLabel>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <Reveal className="sm:col-span-2">
          <figure className="relative aspect-[4/3] overflow-hidden bg-sand">
            <Image
              src={lead}
              alt={`${couple} — fotoğraf 1`}
              fill
              sizes="(min-width: 640px) 36rem, 100vw"
              className="object-cover"
            />
          </figure>
        </Reveal>

        {rest.map((src, index) => (
          <Reveal key={src} delay={(index % 2) * 120}>
            <figure className="relative aspect-[3/4] overflow-hidden bg-sand">
              <Image
                src={src}
                alt={`${couple} — fotoğraf ${index + 2}`}
                fill
                sizes="(min-width: 640px) 18rem, 100vw"
                className="object-cover"
              />
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
