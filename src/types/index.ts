/**
 * Uygulama genelinde kullanılan veri tipleri.
 *
 * Bu tipler veri kaynağından bağımsızdır: frontend fazında JSON dosyasından,
 * backend fazında Supabase'ten aynı şekilde dönerler.
 */

export type NameOrder = "bride_first" | "groom_first";

export type Theme = "minimal" | "romantic" | "modern" | "elegant" | "editorial";

export const THEMES: readonly Theme[] = [
  "minimal",
  "romantic",
  "modern",
  "elegant",
  "editorial",
];

/** RSVP kaydının veritabanındaki durumu. `pending` saklanmaz, türetilir. */
export type RsvpStatus = "attending" | "declined";

/** UI'da gösterilen üç değerli durum. */
export type GuestStatus = RsvpStatus | "pending";

/**
 * Davetiye paneli.
 *
 * Her panel, yığındaki bir kart olarak görünür ve içinde bir çizim
 * taşır. Çizimler tarih, saat, mekân gibi bilgileri kendi içlerinde
 * barındırabildiği için panel yalnızca etiket ve görselden oluşur.
 */
export interface InvitationPanel {
  /** Kart başlık şeridindeki etiket. */
  label: string;
  /** Çizim yolu. */
  image: string;
  /**
   * Açıksa düğüne kalan süre çizimin üstüne yazılır ve katılım kartı
   * bu panelin hemen önüne yerleşir (bkz. `InvitationPage`).
   */
  countdown?: boolean;
  /** Açıksa kart başlığına "Yol Tarifi" bağlantısı konur. */
  directions?: boolean;
}

export interface Wedding {
  id: string;
  brideName: string;
  groomName: string;
  nameOrder: NameOrder;
  /** ISO tarih: "2026-10-18" */
  eventDate: string;
  /** 24 saat formatı: "19:30" */
  eventTime: string;
  /** IANA timezone: "Europe/Istanbul" */
  timezone: string;
  venueName: string;
  venueAddress: string | null;
  mapsUrl: string | null;
  invitationText: string | null;
  theme: Theme;
  /**
   * Kapak çizimi/görseli.
   *
   * `primaryImage`'dan farklıdır: fotoğraf tüm ekranı kaplar ve üzerine
   * tipografi bindirilir; kapak görseli ise kendi zeminiyle bir bütündür
   * ve kırpılmadan, ortalanmış olarak gösterilir. Çift isimlerini zaten
   * içeriyorsa tipografi tekrar edilmez.
   */
  coverImage: string | null;
  /**
   * Katılım kartının başındaki çizim.
   *
   * Soruyu çizim sorar, hemen altında cevap butonları gelir. Ayrı bir
   * panel olsaydı soru ile cevap farklı kartlara düşer ve davetli
   * soruyu okuduktan sonra cevap vermek için kaydırmak zorunda kalırdı.
   */
  rsvpImage: string | null;
  primaryImage: string | null;
  galleryImages: string[];
  /** Sırasıyla gösterilen çizim kartları. */
  panels: InvitationPanel[];
  musicUrl: string | null;
  /** Yetişkin/çocuk ayrımı. Şema hazır, arayüz sonraki turda. */
  enableChildSplit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  phone: string | null;
  groupName: string | null;
  invitationLimit: number;
  token: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rsvp {
  id: string;
  guestId: string;
  status: RsvpStatus;
  attendingCount: number;
  adultCount: number | null;
  childCount: number | null;
  note: string | null;
  respondedAt: string;
  updatedAt: string;
}

/** Davetli + varsa RSVP kaydı. RSVP yoksa davetli "cevap bekleniyor" durumundadır. */
export interface GuestWithRsvp extends Guest {
  rsvp: Rsvp | null;
}

/** Bir davetlinin üç değerli görünen durumunu döndürür. */
export function guestStatus(guest: GuestWithRsvp): GuestStatus {
  return guest.rsvp?.status ?? "pending";
}

/** Bu davetliden beklenen kişi sayısı. Gelmeyen veya cevap vermeyen için 0. */
export function expectedPeopleFor(guest: GuestWithRsvp): number {
  return guest.rsvp?.status === "attending" ? guest.rsvp.attendingCount : 0;
}
