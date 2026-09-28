import type { Guest, NameOrder, Rsvp, Theme, Wedding } from "@/types";

/**
 * Veritabanı satırları ile uygulama tipleri arasındaki dönüşüm.
 *
 * Postgres snake_case, uygulama camelCase kullanır. Dönüşüm tek yerde
 * toplanır ki kolon adları sadece burada geçsin.
 */

export interface WeddingRow {
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
  primary_image: string | null;
  gallery_images: unknown;
  music_url: string | null;
  enable_child_split: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestRow {
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

export interface RsvpRow {
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

export function toWedding(row: WeddingRow): Wedding {
  return {
    id: row.id,
    brideName: row.bride_name,
    groomName: row.groom_name,
    nameOrder: row.name_order as NameOrder,
    eventDate: row.event_date,
    // Postgres `time` alanını "19:30:00" olarak döner; uygulama "19:30" bekler.
    eventTime: row.event_time.slice(0, 5),
    timezone: row.timezone,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    mapsUrl: row.maps_url,
    invitationText: row.invitation_text,
    theme: row.theme as Theme,
    primaryImage: row.primary_image,
    galleryImages: toStringArray(row.gallery_images),
    musicUrl: row.music_url,
    enableChildSplit: row.enable_child_split,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toGuest(row: GuestRow): Guest {
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
  };
}

export function toRsvp(row: RsvpRow): Rsvp {
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

/** `jsonb` alanı beklenmedik bir şey içerirse boş diziye düşülür. */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
