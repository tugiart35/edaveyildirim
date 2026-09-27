import { describe, expect, it } from "vitest";

import { computeWeddingStats } from "@/lib/stats/wedding-stats";
import type { GuestWithRsvp, RsvpStatus } from "@/types";

function guest(
  name: string,
  invitationLimit: number,
  rsvp: { status: RsvpStatus; attendingCount: number } | null,
): GuestWithRsvp {
  return {
    id: name,
    weddingId: "w1",
    name,
    phone: null,
    groupName: null,
    invitationLimit,
    token: `token-${name}`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    rsvp: rsvp
      ? {
          id: `rsvp-${name}`,
          guestId: name,
          status: rsvp.status,
          attendingCount: rsvp.attendingCount,
          adultCount: null,
          childCount: null,
          note: null,
          respondedAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        }
      : null,
  };
}

describe("computeWeddingStats", () => {
  it("şartname §60'taki örneği doğru hesaplar", () => {
    // Guest A = 2, Guest B = 4, Guest C = declined → beklenen toplam 6
    const stats = computeWeddingStats([
      guest("A", 4, { status: "attending", attendingCount: 2 }),
      guest("B", 5, { status: "attending", attendingCount: 4 }),
      guest("C", 2, { status: "declined", attendingCount: 0 }),
    ]);

    expect(stats.expectedPeople).toBe(6);
  });

  it("davetli kaydı ile gelecek kişi sayısını karıştırmaz", () => {
    const stats = computeWeddingStats([
      guest("A", 4, { status: "attending", attendingCount: 4 }),
    ]);

    expect(stats.attendingGuests).toBe(1);
    expect(stats.expectedPeople).toBe(4);
  });

  it("cevap vermemiş davetliyi bekleyen sayar", () => {
    const stats = computeWeddingStats([
      guest("A", 2, { status: "attending", attendingCount: 2 }),
      guest("B", 3, null),
      guest("C", 1, null),
    ]);

    expect(stats.respondedGuests).toBe(1);
    expect(stats.pendingGuests).toBe(2);
  });

  it("gelmeyen davetliyi beklenen toplama katmaz", () => {
    const stats = computeWeddingStats([
      guest("A", 4, { status: "declined", attendingCount: 0 }),
      guest("B", 4, { status: "attending", attendingCount: 3 }),
    ]);

    expect(stats.expectedPeople).toBe(3);
    expect(stats.decliningGuests).toBe(1);
  });

  it("davet hakkı toplamını cevaplardan bağımsız hesaplar", () => {
    const stats = computeWeddingStats([
      guest("A", 2, { status: "attending", attendingCount: 1 }),
      guest("B", 4, null),
      guest("C", 5, { status: "declined", attendingCount: 0 }),
    ]);

    expect(stats.totalCapacity).toBe(11);
    expect(stats.totalGuests).toBe(3);
  });

  it("yanıt oranını yüzde olarak yuvarlar", () => {
    const stats = computeWeddingStats([
      guest("A", 1, { status: "attending", attendingCount: 1 }),
      guest("B", 1, { status: "declined", attendingCount: 0 }),
      guest("C", 1, null),
    ]);

    // 2/3 = %66.67 → 67
    expect(stats.responseRate).toBe(67);
  });

  it("davetli listesi boşken sıfıra bölmez", () => {
    const stats = computeWeddingStats([]);

    expect(stats.responseRate).toBe(0);
    expect(stats.expectedPeople).toBe(0);
    expect(stats.breakdown).toEqual({ attending: 0, declined: 0, pending: 0 });
  });
});
