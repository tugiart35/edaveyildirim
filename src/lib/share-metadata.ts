import type { Metadata } from "next";

import { formatLongDate } from "@/lib/utils/date";
import { coupleTitle } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/**
 * Bağlantı önizlemesi (Open Graph).
 *
 * Davetiyeler ağırlıklı olarak WhatsApp'tan paylaşılıyor. Paylaşılan
 * bağlantının çıplak bir URL yerine davetiye görseliyle görünmesi,
 * davetlinin linke güvenmesini sağlıyor.
 *
 * Görsel kare (540×540): WhatsApp kare görselleri büyük önizleme olarak
 * gösterir. Facebook ve X yatay tercih eder ama kareyi kendi zeminine
 * yerleştirir.
 *
 * Kişisel davet bağlantıları da bu metni kullanır — davetlinin adı
 * önizlemeye ASLA girmez (şartname §38). Bağlantı yanlış kişiye
 * iletilirse bile kimin davet edildiği görünmez.
 */
export function shareMetadata(wedding: Wedding): Metadata {
  const couple = coupleTitle(wedding);
  const title = `${couple} | Düğün Davetiyesi`;
  const description = `${formatLongDate(wedding.eventDate)} · ${wedding.venueName}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: couple,
      title,
      description,
      images: [
        {
          url: "/og.png",
          width: 540,
          height: 540,
          alt: `${couple} düğün davetiyesi`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}
