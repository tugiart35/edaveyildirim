import { randomUUID } from "node:crypto";

import { loadStore, withStore } from "@/lib/data/json-store";
import { generateToken } from "@/lib/utils/token";
import type {
  GuestInput,
  RsvpInput,
  WeddingInput,
} from "@/lib/validation/schemas";
import type { WeddingStore } from "@/lib/data/store";
import type { Guest, GuestWithRsvp, Rsvp, Wedding } from "@/types";

/**
 * Geliştirme deposu: tek bir JSON dosyası.
 *
 * Supabase yapılandırılmamışken kullanılır; proje veritabanı olmadan da
 * çalışır. Davranışı `supabase-repository` ile aynı olmalıdır.
 */

/* -------------------------------------------------------------------------- */
/*                                   Wedding                                  */
/* -------------------------------------------------------------------------- */

async function getWedding(): Promise<Wedding> {
  const store = await loadStore();
  return store.wedding;
}

async function updateWedding(input: WeddingInput): Promise<Wedding> {
  return withStore((store) => {
    store.wedding = {
      ...store.wedding,
      ...input,
      mapsUrl: input.mapsUrl || null,
      theme: input.theme as Wedding["theme"],
      updatedAt: new Date().toISOString(),
    };
    return store.wedding;
  });
}

/* -------------------------------------------------------------------------- */
/*                                    Guests                                  */
/* -------------------------------------------------------------------------- */

async function listGuests(): Promise<GuestWithRsvp[]> {
  const store = await loadStore();
  const rsvpByGuest = new Map(store.rsvps.map((rsvp) => [rsvp.guestId, rsvp]));

  return store.guests
    .map((guest) => ({ ...guest, rsvp: rsvpByGuest.get(guest.id) ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

async function getGuestByToken(token: string): Promise<GuestWithRsvp | null> {
  const store = await loadStore();
  const guest = store.guests.find((candidate) => candidate.token === token);
  if (!guest) return null;

  const rsvp = store.rsvps.find((candidate) => candidate.guestId === guest.id);
  return { ...guest, rsvp: rsvp ?? null };
}

async function getGuestById(id: string): Promise<GuestWithRsvp | null> {
  const store = await loadStore();
  const guest = store.guests.find((candidate) => candidate.id === id);
  if (!guest) return null;

  const rsvp = store.rsvps.find((candidate) => candidate.guestId === guest.id);
  return { ...guest, rsvp: rsvp ?? null };
}

async function createGuest(input: GuestInput): Promise<Guest> {
  return withStore((store) => {
    const now = new Date().toISOString();

    let token = generateToken();
    while (store.guests.some((guest) => guest.token === token)) {
      token = generateToken();
    }

    const guest: Guest = {
      id: randomUUID(),
      weddingId: store.wedding.id,
      name: input.name,
      phone: input.phone,
      groupName: input.groupName,
      invitationLimit: input.invitationLimit,
      token,
      createdAt: now,
      updatedAt: now,
    };

    store.guests.push(guest);
    return guest;
  });
}

async function updateGuest(id: string, input: GuestInput): Promise<Guest> {
  return withStore((store) => {
    const guest = store.guests.find((candidate) => candidate.id === id);
    if (!guest) throw new Error(`Davetli bulunamadı: ${id}`);

    // Token asla değişmez — paylaşılmış linkler çalışmaya devam etmeli.
    guest.name = input.name;
    guest.phone = input.phone;
    guest.groupName = input.groupName;
    guest.invitationLimit = input.invitationLimit;
    guest.updatedAt = new Date().toISOString();

    return guest;
  });
}

async function deleteGuest(id: string): Promise<void> {
  await withStore((store) => {
    store.guests = store.guests.filter((guest) => guest.id !== id);
    store.rsvps = store.rsvps.filter((rsvp) => rsvp.guestId !== id);
  });
}

/* -------------------------------------------------------------------------- */
/*                                    RSVP                                    */
/* -------------------------------------------------------------------------- */

/**
 * Davetlinin cevabını kaydeder veya günceller.
 *
 * Her davetli için en fazla bir RSVP kaydı tutulur. İlk cevabın zamanı
 * (`respondedAt`) sonraki güncellemelerde korunur.
 */
async function saveRsvp(guestId: string, input: RsvpInput): Promise<Rsvp> {
  return withStore((store) => {
    const now = new Date().toISOString();
    const existing = store.rsvps.find((rsvp) => rsvp.guestId === guestId);

    if (existing) {
      existing.status = input.status;
      existing.attendingCount = input.attendingCount;
      existing.note = input.note;
      existing.updatedAt = now;
      return existing;
    }

    const rsvp: Rsvp = {
      id: randomUUID(),
      guestId,
      status: input.status,
      attendingCount: input.attendingCount,
      adultCount: null,
      childCount: null,
      note: input.note,
      respondedAt: now,
      updatedAt: now,
    };

    store.rsvps.push(rsvp);
    return rsvp;
  });
}

export const jsonRepository: WeddingStore = {
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
