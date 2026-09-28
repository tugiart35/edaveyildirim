import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import { beforeEach, describe, expect, it } from "vitest";

import { createRepository, type Repository } from "@/lib/data/repository";
import { openDatabase } from "@/lib/db/connection";

/**
 * Veri katmanı testleri bellek içi gerçek bir SQLite üzerinde koşar:
 * şema, CHECK kısıtları ve yabancı anahtarlar dahil her şey gerçek.
 */

let db: DatabaseSync;
let repo: Repository;

const WEDDING_ID = "wedding-1";

beforeEach(() => {
  db = openDatabase(":memory:");

  const timestamp = "2026-01-01T00:00:00.000Z";
  db.prepare(
    `INSERT INTO weddings
       (id, bride_name, groom_name, event_date, event_time, venue_name,
        created_at, updated_at)
     VALUES (?, 'Ayşe', 'Mehmet', '2026-10-18', '19:30', 'Çırağan Palace', ?, ?)`,
  ).run(WEDDING_ID, timestamp, timestamp);

  repo = createRepository(db);
});

function guestInput(
  overrides: Partial<Parameters<Repository["createGuest"]>[0]> = {},
) {
  return {
    name: "Ahmet Yılmaz",
    phone: "+905551111111",
    groupName: "Arkadaşlar",
    invitationLimit: 4,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */

describe("davetli yönetimi", () => {
  it("davetli ekler ve benzersiz token üretir", async () => {
    const a = await repo.createGuest(guestInput({ name: "Ahmet Yılmaz" }));
    const b = await repo.createGuest(guestInput({ name: "Zeynep Arslan" }));

    expect(a.token).toHaveLength(10);
    expect(a.token).not.toBe(b.token);
    expect(a.weddingId).toBe(WEDDING_ID);
  });

  it("davetliyi token ile bulur", async () => {
    const created = await repo.createGuest(guestInput());
    const found = await repo.getGuestByToken(created.token);

    expect(found?.id).toBe(created.id);
    expect(found?.rsvp).toBeNull();
  });

  it("bilinmeyen token için null döner", async () => {
    await expect(repo.getGuestByToken("yokBoyle1")).resolves.toBeNull();
  });

  it("güncellemede token değişmez", async () => {
    const created = await repo.createGuest(guestInput());
    const updated = await repo.updateGuest(
      created.id,
      guestInput({ name: "Ahmet Y.", invitationLimit: 2 }),
    );

    expect(updated.token).toBe(created.token);
    expect(updated.name).toBe("Ahmet Y.");
    expect(updated.invitationLimit).toBe(2);
  });

  it("olmayan davetliyi güncellemeye çalışınca hata verir", async () => {
    await expect(
      repo.updateGuest(randomUUID(), guestInput()),
    ).rejects.toThrow();
  });

  it("davetliyi silince cevabı da silinir", async () => {
    const guest = await repo.createGuest(guestInput());
    await repo.saveRsvp(guest.id, {
      status: "attending",
      attendingCount: 2,
      note: null,
    });

    await repo.deleteGuest(guest.id);

    expect(await repo.getGuestById(guest.id)).toBeNull();
    const rsvpCount = db.prepare("SELECT COUNT(*) AS n FROM rsvps").get() as {
      n: number;
    };
    expect(rsvpCount.n).toBe(0);
  });

  it("listeyi Türkçe alfabeye göre sıralar", async () => {
    for (const name of ["Zeynep", "Çiğdem", "İpek", "Ahmet", "Ömer"]) {
      await repo.createGuest(guestInput({ name }));
    }

    const names = (await repo.listGuests()).map((guest) => guest.name);
    expect(names).toEqual(["Ahmet", "Çiğdem", "İpek", "Ömer", "Zeynep"]);
  });
});

describe("RSVP kaydı", () => {
  it("cevabı kaydeder", async () => {
    const guest = await repo.createGuest(guestInput());
    const rsvp = await repo.saveRsvp(guest.id, {
      status: "attending",
      attendingCount: 3,
      note: "Görüşmek üzere",
    });

    expect(rsvp.status).toBe("attending");
    expect(rsvp.attendingCount).toBe(3);
    expect(rsvp.note).toBe("Görüşmek üzere");
  });

  it("ikinci cevap yeni kayıt açmaz, mevcut olanı günceller", async () => {
    const guest = await repo.createGuest(guestInput());

    await repo.saveRsvp(guest.id, {
      status: "attending",
      attendingCount: 3,
      note: null,
    });
    await repo.saveRsvp(guest.id, {
      status: "declined",
      attendingCount: 0,
      note: null,
    });

    const { n } = db.prepare("SELECT COUNT(*) AS n FROM rsvps").get() as {
      n: number;
    };
    expect(n).toBe(1);

    const found = await repo.getGuestById(guest.id);
    expect(found?.rsvp?.status).toBe("declined");
    expect(found?.rsvp?.attendingCount).toBe(0);
  });

  it("ilk cevabın zamanını güncellemede korur", async () => {
    const guest = await repo.createGuest(guestInput());

    const first = await repo.saveRsvp(guest.id, {
      status: "attending",
      attendingCount: 1,
      note: null,
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const second = await repo.saveRsvp(guest.id, {
      status: "attending",
      attendingCount: 2,
      note: null,
    });

    expect(second.respondedAt).toBe(first.respondedAt);
    expect(second.updatedAt).not.toBe(first.updatedAt);
  });
});

describe("veritabanı kuralları", () => {
  it("gelmeyenin kişi sayısı sıfırdan farklı olamaz", async () => {
    const guest = await repo.createGuest(guestInput());

    expect(() =>
      db
        .prepare(
          `INSERT INTO rsvps (id, guest_id, status, attending_count, responded_at, updated_at)
           VALUES (?, ?, 'declined', 3, '2026-01-01', '2026-01-01')`,
        )
        .run(randomUUID(), guest.id),
    ).toThrow();
  });

  it("gelen en az bir kişi olmalı", async () => {
    const guest = await repo.createGuest(guestInput());

    expect(() =>
      db
        .prepare(
          `INSERT INTO rsvps (id, guest_id, status, attending_count, responded_at, updated_at)
           VALUES (?, ?, 'attending', 0, '2026-01-01', '2026-01-01')`,
        )
        .run(randomUUID(), guest.id),
    ).toThrow();
  });

  it("aynı davetliye ikinci bir RSVP satırı eklenemez", async () => {
    const guest = await repo.createGuest(guestInput());
    await repo.saveRsvp(guest.id, {
      status: "attending",
      attendingCount: 1,
      note: null,
    });

    expect(() =>
      db
        .prepare(
          `INSERT INTO rsvps (id, guest_id, status, attending_count, responded_at, updated_at)
           VALUES (?, ?, 'attending', 2, '2026-01-01', '2026-01-01')`,
        )
        .run(randomUUID(), guest.id),
    ).toThrow();
  });

  it("500 karakterden uzun not kabul edilmez", async () => {
    const guest = await repo.createGuest(guestInput());

    expect(() =>
      db
        .prepare(
          `INSERT INTO rsvps (id, guest_id, status, attending_count, note, responded_at, updated_at)
           VALUES (?, ?, 'attending', 1, ?, '2026-01-01', '2026-01-01')`,
        )
        .run(randomUUID(), guest.id, "a".repeat(501)),
    ).toThrow();
  });

  it("davet hakkı sıfır olamaz", async () => {
    expect(() =>
      db
        .prepare(
          `INSERT INTO guests (id, wedding_id, name, invitation_limit, token, created_at, updated_at)
           VALUES (?, ?, 'Test', 0, ?, '2026-01-01', '2026-01-01')`,
        )
        .run(randomUUID(), WEDDING_ID, "tokenAAAA1"),
    ).toThrow();
  });

  it("aynı token iki davetliye verilemez", async () => {
    const guest = await repo.createGuest(guestInput());

    expect(() =>
      db
        .prepare(
          `INSERT INTO guests (id, wedding_id, name, invitation_limit, token, created_at, updated_at)
           VALUES (?, ?, 'Test', 1, ?, '2026-01-01', '2026-01-01')`,
        )
        .run(randomUUID(), WEDDING_ID, guest.token),
    ).toThrow();
  });

  it("galeri en fazla 5 fotoğraf alır", async () => {
    expect(() =>
      db
        .prepare("UPDATE weddings SET gallery_images = ? WHERE id = ?")
        .run(JSON.stringify(["1", "2", "3", "4", "5", "6"]), WEDDING_ID),
    ).toThrow();
  });

  it("geçersiz tema kabul edilmez", async () => {
    expect(() =>
      db
        .prepare("UPDATE weddings SET theme = 'neon' WHERE id = ?")
        .run(WEDDING_ID),
    ).toThrow();
  });
});

describe("düğün bilgileri", () => {
  it("günceller ve geri okur", async () => {
    const current = await repo.getWedding();

    const updated = await repo.updateWedding({
      brideName: "Eda",
      groomName: "Yıldırım",
      nameOrder: "groom_first",
      eventDate: "2027-06-12",
      eventTime: "17:00",
      timezone: "Europe/Istanbul",
      venueName: "Sait Halim Paşa Yalısı",
      venueAddress: "Sarıyer, İstanbul",
      mapsUrl: "https://maps.google.com/?q=test",
      invitationText: "Bizimle olun.",
      theme: "romantic",
      coverImage: "/design/kapak.jpg",
      primaryImage: "/mock/hero.jpg",
      galleryImages: ["/a.jpg", "/b.jpg"],
      panels: [{ label: "Düğün", image: "/design/dugun.jpg", countdown: true }],
      musicUrl: null,
      enableChildSplit: false,
    });

    expect(updated.id).toBe(current.id);
    expect(updated.brideName).toBe("Eda");
    expect(updated.nameOrder).toBe("groom_first");
    expect(updated.theme).toBe("romantic");
    expect(updated.coverImage).toBe("/design/kapak.jpg");
    expect(updated.panels).toEqual([
      { label: "Düğün", image: "/design/dugun.jpg", countdown: true },
    ]);
    expect(updated.galleryImages).toEqual(["/a.jpg", "/b.jpg"]);
    expect(updated.enableChildSplit).toBe(false);
  });

  it("boş maps bağlantısını null olarak saklar", async () => {
    const current = await repo.getWedding();

    const updated = await repo.updateWedding({
      brideName: current.brideName,
      groomName: current.groomName,
      nameOrder: current.nameOrder,
      eventDate: current.eventDate,
      eventTime: current.eventTime,
      timezone: current.timezone,
      venueName: current.venueName,
      venueAddress: null,
      mapsUrl: "",
      invitationText: null,
      theme: current.theme,
      coverImage: null,
      primaryImage: null,
      galleryImages: [],
      panels: [],
      musicUrl: null,
      enableChildSplit: false,
    });

    expect(updated.mapsUrl).toBeNull();
    expect(updated.coverImage).toBeNull();
  });

  it("şemaya sonradan eklenen sütun mevcut veritabanına da uygulanır", () => {
    // cover_image sütunu ilk sürümde yoktu; applyMigrations onu ekler.
    const columns = db.prepare("PRAGMA table_info(weddings)").all() as Array<{
      name: string;
    }>;

    expect(columns.map((column) => column.name)).toContain("cover_image");
    expect(columns.map((column) => column.name)).toContain("panels");
  });

  it("panel sayısı sekizi aşamaz", () => {
    const many = JSON.stringify(
      Array.from({ length: 9 }, (_, i) => ({
        label: `P${i}`,
        image: "/a.jpg",
      })),
    );

    expect(() =>
      db
        .prepare("UPDATE weddings SET panels = ? WHERE id = ?")
        .run(many, WEDDING_ID),
    ).toThrow();
  });
});
