import { randomUUID } from "node:crypto";
import type { DatabaseSync, SQLInputValue } from "node:sqlite";

import { generateToken } from "@/lib/utils/token";
import type {
  GuestInput,
  RsvpInput,
  WeddingInput,
} from "@/lib/validation/schemas";
import type {
  Guest,
  GuestWithRsvp,
  InvitationPanel,
  NameOrder,
  Rsvp,
  Theme,
  Wedding,
} from "@/types";

/**
 * Veri erişimi.
 *
 * Bağlantı dışarıdan verilir; böylece testler bellek içi bir
 * veritabanıyla gerçek SQL'i çalıştırabilir. Uygulama `@/lib/data`
 * üzerinden tek bir örneğe erişir.
 *
 * `node:sqlite` senkrondur. Fonksiyonlar yine de `async` imzalıdır:
 * sorgular mikrosaniyeler sürer, ama imzayı değiştirmek tüm arayüz
 * kodunu etkilerdi ve ileride başka bir veritabanına geçişi engellerdi.
 */
export function createRepository(db: DatabaseSync) {
  /**
   * `node:sqlite` satırları `Record<string, SQLOutputValue>` olarak döner.
   * Şemayı biz yazdığımız için satır biçimini biliyoruz; dönüşüm tek
   * yerde toplanıyor ki her sorguda çift cast tekrarlanmasın.
   */
  function queryOne<T>(sql: string, ...params: SQLParams): T | undefined {
    return db.prepare(sql).get(...params) as unknown as T | undefined;
  }

  function queryAll<T>(sql: string, ...params: SQLParams): T[] {
    return db.prepare(sql).all(...params) as unknown as T[];
  }

  /* ------------------------------------------------------------------ */
  /*                               Wedding                              */
  /* ------------------------------------------------------------------ */

  async function getWedding(): Promise<Wedding> {
    // MVP tek düğün içindir: en eski kayıt o düğündür.
    const row = queryOne<WeddingRow>(
      "SELECT * FROM weddings ORDER BY created_at ASC LIMIT 1",
    );

    if (!row) {
      throw new Error(
        "Düğün kaydı bulunamadı. `npm run seed` ile başlangıç verisini oluşturun.",
      );
    }

    return toWedding(row);
  }

  async function updateWedding(input: WeddingInput): Promise<Wedding> {
    const current = await getWedding();

    db.prepare(
      `UPDATE weddings SET
         bride_name = ?, groom_name = ?, name_order = ?,
         event_date = ?, event_time = ?, timezone = ?,
         venue_name = ?, venue_address = ?, maps_url = ?,
         invitation_text = ?, theme = ?,
         cover_image = ?, rsvp_image = ?, primary_image = ?, gallery_images = ?, panels = ?,
         music_url = ?,
         enable_child_split = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      input.brideName,
      input.groomName,
      input.nameOrder,
      input.eventDate,
      input.eventTime,
      input.timezone,
      input.venueName,
      input.venueAddress,
      input.mapsUrl || null,
      input.invitationText,
      input.theme,
      input.coverImage,
      input.rsvpImage,
      input.primaryImage,
      JSON.stringify(input.galleryImages),
      JSON.stringify(input.panels),
      input.musicUrl,
      input.enableChildSplit ? 1 : 0,
      now(),
      current.id,
    );

    return getWedding();
  }

  /* ------------------------------------------------------------------ */
  /*                                Guests                              */
  /* ------------------------------------------------------------------ */

  const GUEST_WITH_RSVP = `
    SELECT
      g.*,
      r.id              AS rsvp_id,
      r.status          AS rsvp_status,
      r.attending_count AS rsvp_attending_count,
      r.adult_count     AS rsvp_adult_count,
      r.child_count     AS rsvp_child_count,
      r.note            AS rsvp_note,
      r.responded_at    AS rsvp_responded_at,
      r.updated_at      AS rsvp_updated_at
    FROM guests g
    LEFT JOIN rsvps r ON r.guest_id = g.id
  `;

  async function listGuests(): Promise<GuestWithRsvp[]> {
    const rows = queryAll<GuestJoinRow>(GUEST_WITH_RSVP);

    // Sıralama Türkçe alfabeye göre; SQLite'ın collation'ı buna uymaz.
    return rows
      .map(toGuestWithRsvp)
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }

  async function getGuestByToken(token: string): Promise<GuestWithRsvp | null> {
    const row = queryOne<GuestJoinRow>(
      `${GUEST_WITH_RSVP} WHERE g.token = ?`,
      token,
    );

    return row ? toGuestWithRsvp(row) : null;
  }

  async function getGuestById(id: string): Promise<GuestWithRsvp | null> {
    const row = queryOne<GuestJoinRow>(`${GUEST_WITH_RSVP} WHERE g.id = ?`, id);

    return row ? toGuestWithRsvp(row) : null;
  }

  async function createGuest(input: GuestInput): Promise<Guest> {
    const wedding = await getWedding();
    const timestamp = now();
    const id = randomUUID();

    // Benzersizlik UNIQUE index ile garanti; çakışma ihtimali çok düşük
    // ama gerçekleşirse yeni token ile denenir.
    for (let attempt = 0; attempt < TOKEN_ATTEMPTS; attempt += 1) {
      try {
        db.prepare(
          `INSERT INTO guests
             (id, wedding_id, name, phone, group_name, invitation_limit,
              token, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          id,
          wedding.id,
          input.name,
          input.phone,
          input.groupName,
          input.invitationLimit,
          generateToken(),
          timestamp,
          timestamp,
        );

        const created = await getGuestById(id);
        if (!created) throw new Error("Davetli kaydedildi ama okunamadı.");
        return created;
      } catch (error) {
        if (!isTokenCollision(error)) throw error;
      }
    }

    throw new Error("Benzersiz davet bağlantısı üretilemedi.");
  }

  async function updateGuest(id: string, input: GuestInput): Promise<Guest> {
    // Token asla değişmez — paylaşılmış linkler çalışmaya devam etmeli.
    const result = db
      .prepare(
        `UPDATE guests SET
           name = ?, phone = ?, group_name = ?, invitation_limit = ?,
           updated_at = ?
         WHERE id = ?`,
      )
      .run(
        input.name,
        input.phone,
        input.groupName,
        input.invitationLimit,
        now(),
        id,
      );

    if (result.changes === 0) throw new Error(`Davetli bulunamadı: ${id}`);

    const updated = await getGuestById(id);
    if (!updated) throw new Error(`Davetli bulunamadı: ${id}`);
    return updated;
  }

  async function deleteGuest(id: string): Promise<void> {
    // RSVP kaydı ON DELETE CASCADE ile birlikte gider.
    db.prepare("DELETE FROM guests WHERE id = ?").run(id);
  }

  /* ------------------------------------------------------------------ */
  /*                                 RSVP                               */
  /* ------------------------------------------------------------------ */

  async function saveRsvp(guestId: string, input: RsvpInput): Promise<Rsvp> {
    const timestamp = now();

    // guest_id UNIQUE olduğu için upsert tek kayıt garantisini korur.
    // `responded_at` ilk cevabın zamanıdır; güncellemede korunur.
    db.prepare(
      `INSERT INTO rsvps
         (id, guest_id, status, attending_count, adult_count, child_count,
          note, responded_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)
       ON CONFLICT (guest_id) DO UPDATE SET
         status          = excluded.status,
         attending_count = excluded.attending_count,
         note            = excluded.note,
         updated_at      = excluded.updated_at`,
    ).run(
      randomUUID(),
      guestId,
      input.status,
      input.attendingCount,
      input.note,
      timestamp,
      timestamp,
    );

    const row = queryOne<RsvpRow>(
      "SELECT * FROM rsvps WHERE guest_id = ?",
      guestId,
    );

    if (!row) throw new Error("Cevap kaydedildi ama okunamadı.");
    return toRsvp(row);
  }

  return {
    getWedding,
    updateWedding,
    listGuests,
    getGuestByToken,
    getGuestById,
    createGuest,
    updateGuest,
    deleteGuest,
    saveRsvp,
  };
}

export type Repository = ReturnType<typeof createRepository>;

/* -------------------------------------------------------------------------- */
/*                            Satır → uygulama tipi                           */
/* -------------------------------------------------------------------------- */

/** Token çakışmasında kaç kez yeniden denenecek. */
const TOKEN_ATTEMPTS = 5;

type SQLParams = SQLInputValue[];

interface WeddingRow {
  id: string;
  bride_name: string;
  groom_name: string;
  name_order: string;
  event_date: string;
  event_time: string;
  timezone: string;
  venue_name: string;
  venue_address: string | null;
  maps_url: string | null;
  invitation_text: string | null;
  theme: string;
  cover_image: string | null;
  rsvp_image: string | null;
  primary_image: string | null;
  gallery_images: string;
  panels: string;
  music_url: string | null;
  enable_child_split: number;
  created_at: string;
  updated_at: string;
}

interface GuestRow {
  id: string;
  wedding_id: string;
  name: string;
  phone: string | null;
  group_name: string | null;
  invitation_limit: number;
  token: string;
  created_at: string;
  updated_at: string;
}

interface RsvpRow {
  id: string;
  guest_id: string;
  status: string;
  attending_count: number;
  adult_count: number | null;
  child_count: number | null;
  note: string | null;
  responded_at: string;
  updated_at: string;
}

type GuestJoinRow = GuestRow & {
  rsvp_id: string | null;
  rsvp_status: string | null;
  rsvp_attending_count: number | null;
  rsvp_adult_count: number | null;
  rsvp_child_count: number | null;
  rsvp_note: string | null;
  rsvp_responded_at: string | null;
  rsvp_updated_at: string | null;
};

function toWedding(row: WeddingRow): Wedding {
  return {
    id: row.id,
    brideName: row.bride_name,
    groomName: row.groom_name,
    nameOrder: row.name_order as NameOrder,
    eventDate: row.event_date,
    eventTime: row.event_time,
    timezone: row.timezone,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    mapsUrl: row.maps_url,
    invitationText: row.invitation_text,
    theme: row.theme as Theme,
    coverImage: row.cover_image,
    rsvpImage: row.rsvp_image,
    primaryImage: row.primary_image,
    galleryImages: parseGallery(row.gallery_images),
    panels: parsePanels(row.panels),
    musicUrl: row.music_url,
    enableChildSplit: row.enable_child_split === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toGuestWithRsvp(row: GuestJoinRow): GuestWithRsvp {
  return {
    id: row.id,
    weddingId: row.wedding_id,
    name: row.name,
    phone: row.phone,
    groupName: row.group_name,
    invitationLimit: row.invitation_limit,
    token: row.token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rsvp:
      row.rsvp_id === null
        ? null
        : {
            id: row.rsvp_id,
            guestId: row.id,
            status: row.rsvp_status as Rsvp["status"],
            attendingCount: row.rsvp_attending_count ?? 0,
            adultCount: row.rsvp_adult_count,
            childCount: row.rsvp_child_count,
            note: row.rsvp_note,
            respondedAt: row.rsvp_responded_at ?? "",
            updatedAt: row.rsvp_updated_at ?? "",
          },
  };
}

function toRsvp(row: RsvpRow): Rsvp {
  return {
    id: row.id,
    guestId: row.guest_id,
    status: row.status as Rsvp["status"],
    attendingCount: row.attending_count,
    adultCount: row.adult_count,
    childCount: row.child_count,
    note: row.note,
    respondedAt: row.responded_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Panel listesi.
 *
 * Şema `json_valid` ile korur; yine de biçimi bozuk bir kayıt tüm
 * davetiyeyi düşürmemeli — tanınmayan girdiler sessizce elenir.
 */
function parsePanels(value: string): InvitationPanel[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is InvitationPanel =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as InvitationPanel).label === "string" &&
          typeof (item as InvitationPanel).image === "string",
      )
      .map((panel) => ({
        label: panel.label,
        image: panel.image,
        countdown: panel.countdown === true,
        directions: panel.directions === true,
      }));
  } catch {
    return [];
  }
}

/** Şema `json_valid` ile korur; yine de bozuk veri uygulamayı düşürmemeli. */
function parseGallery(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function now(): string {
  return new Date().toISOString();
}

function isTokenCollision(error: unknown): boolean {
  return error instanceof Error && error.message.includes("guests.token");
}
