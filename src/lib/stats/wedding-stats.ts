import { expectedPeopleFor, type GuestWithRsvp } from "@/types";

export interface WeddingStats {
  /** Davetli kaydı sayısı. */
  totalGuests: number;
  /** Tüm davet haklarının toplamı — davetiyenin teorik kapasitesi. */
  totalCapacity: number;
  /** Cevap veren davetli sayısı. */
  respondedGuests: number;
  /** Henüz cevap vermemiş davetli sayısı. */
  pendingGuests: number;
  /** "Geliyorum" diyen davetli kaydı sayısı. */
  attendingGuests: number;
  /** "Gelemiyorum" diyen davetli kaydı sayısı. */
  decliningGuests: number;
  /**
   * Düğüne gelmesi beklenen toplam kişi sayısı.
   * Bu projenin en önemli metriğidir ve davetli kaydı sayısından farklıdır:
   * tek bir davetli kaydı birden çok kişiyle gelebilir.
   */
  expectedPeople: number;
  /** Yanıt oranı, 0-100 arası yuvarlanmış yüzde. */
  responseRate: number;
  /** Geliyor / gelmiyor / bekleyen dağılımı, yüzde olarak. */
  breakdown: {
    attending: number;
    declined: number;
    pending: number;
  };
}

/**
 * Davetli listesinden dashboard istatistiklerini hesaplar.
 *
 * Saf fonksiyondur: veritabanı olmadan test edilebilir.
 */
export function computeWeddingStats(guests: GuestWithRsvp[]): WeddingStats {
  let totalCapacity = 0;
  let attendingGuests = 0;
  let decliningGuests = 0;
  let expectedPeople = 0;

  for (const guest of guests) {
    totalCapacity += guest.invitationLimit;

    if (guest.rsvp?.status === "attending") {
      attendingGuests += 1;
      expectedPeople += expectedPeopleFor(guest);
    } else if (guest.rsvp?.status === "declined") {
      decliningGuests += 1;
    }
  }

  const totalGuests = guests.length;
  const respondedGuests = attendingGuests + decliningGuests;
  const pendingGuests = totalGuests - respondedGuests;

  return {
    totalGuests,
    totalCapacity,
    respondedGuests,
    pendingGuests,
    attendingGuests,
    decliningGuests,
    expectedPeople,
    responseRate: percentage(respondedGuests, totalGuests),
    breakdown: {
      attending: percentage(attendingGuests, totalGuests),
      declined: percentage(decliningGuests, totalGuests),
      pending: percentage(pendingGuests, totalGuests),
    },
  };
}

function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
