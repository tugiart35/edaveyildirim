import { describe, expect, it } from "vitest";

import {
  countdownTo,
  formatLongDate,
  formatWeekday,
  weddingStartTimestamp,
} from "@/lib/utils/date";
import type { Wedding } from "@/types";

const wedding: Wedding = {
  id: "w1",
  brideName: "Ayşe",
  groomName: "Mehmet",
  nameOrder: "bride_first",
  eventDate: "2026-10-18",
  eventTime: "19:30",
  timezone: "Europe/Istanbul",
  venueName: "Çırağan Palace",
  venueAddress: null,
  mapsUrl: null,
  invitationText: null,
  theme: "elegant",
  coverImage: null,
  rsvpImage: null,
  primaryImage: null,
  galleryImages: [],
  panels: [],
  musicUrl: null,
  enableChildSplit: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("weddingStartTimestamp", () => {
  it("düğün saatini kendi saat diliminde yorumlar", () => {
    // Europe/Istanbul UTC+3 → 19:30 yerel = 16:30 UTC
    expect(weddingStartTimestamp(wedding)).toBe(
      Date.parse("2026-10-18T16:30:00.000Z"),
    );
  });

  it("sunucunun saat diliminden etkilenmez", () => {
    const utcWedding = { ...wedding, timezone: "UTC" };
    expect(weddingStartTimestamp(utcWedding)).toBe(
      Date.parse("2026-10-18T19:30:00.000Z"),
    );
  });
});

describe("formatLongDate", () => {
  it("Türkçe uzun tarih biçimi üretir", () => {
    expect(formatLongDate("2026-10-18")).toBe("18 Ekim 2026");
  });
});

describe("formatWeekday", () => {
  it("gün adını büyük harfle başlatır", () => {
    expect(formatWeekday("2026-10-18")).toBe("Pazar");
    expect(formatWeekday("2026-10-17")).toBe("Cumartesi");
  });
});

describe("countdownTo", () => {
  const now = Date.parse("2026-10-01T00:00:00.000Z");

  it("kalan süreyi parçalara ayırır", () => {
    const target = Date.parse("2026-10-03T05:20:30.000Z");
    expect(countdownTo(target, now)).toEqual({
      days: 2,
      hours: 5,
      minutes: 20,
      seconds: 30,
    });
  });

  it("düğün tarihi geçmişse null döner", () => {
    const target = Date.parse("2026-09-30T00:00:00.000Z");
    expect(countdownTo(target, now)).toBeNull();
  });

  it("tam başlangıç anında null döner", () => {
    expect(countdownTo(now, now)).toBeNull();
  });
});
