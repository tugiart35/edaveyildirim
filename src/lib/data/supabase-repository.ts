import { getSupabase } from "@/lib/data/supabase-client";
import {
  toGuest,
  toRsvp,
  toWedding,
  type GuestRow,
  type RsvpRow,
  type WeddingRow,
} from "@/lib/data/supabase-mappers";
import type { WeddingStore } from "@/lib/data/store";
import { generateToken } from "@/lib/utils/token";
import type {
  GuestInput,
  RsvpInput,
  WeddingInput,
} from "@/lib/validation/schemas";
import type { Guest, GuestWithRsvp, Rsvp, Wedding } from "@/types";

/**
 * Postgres deposu.
 *
 * Tüm erişim `service_role` anahtarıyla ve yalnızca sunucudan yapılır;
 * RLS tarafında hiçbir policy yoktur (bkz. `supabase/migrations`).
 *
 * Davranışı `json-repository` ile birebir aynı olmalıdır — arayüz kodu
 * hangisinin arkada olduğunu bilmez.
 */

const GUEST_SELECT = "*, rsvps(*)";

type GuestRowWithRsvp = GuestRow & { rsvps: RsvpRow[] | RsvpRow | null };

/* -------------------------------------------------------------------------- */
/*                                   Wedding                                  */
/* -------------------------------------------------------------------------- */

async function getWedding(): Promise<Wedding> {
  // MVP tek düğün içindir: en eski kayıt o düğündür.
  const { data, error } = await getSupabase()
    .from("weddings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<WeddingRow>();

  if (error) throw new Error(`Düğün bilgisi okunamadı: ${error.message}`);
  if (!data) {
    throw new Error(
      "Düğün kaydı bulunamadı. `npm run seed` ile başlangıç verisini oluşturun.",
    );
  }

  return toWedding(data);
}

async function updateWedding(input: WeddingInput): Promise<Wedding> {
  const current = await getWedding();

  const { data, error } = await getSupabase()
    .from("weddings")
    .update({
      bride_name: input.brideName,
      groom_name: input.groomName,
      name_order: input.nameOrder,
      event_date: input.eventDate,
      event_time: input.eventTime,
      timezone: input.timezone,
      venue_name: input.venueName,
      venue_address: input.venueAddress,
      maps_url: input.mapsUrl || null,
      invitation_text: input.invitationText,
      theme: input.theme,
      primary_image: input.primaryImage,
      gallery_images: input.galleryImages,
      music_url: input.musicUrl,
      enable_child_split: input.enableChildSplit,
    })
    .eq("id", current.id)
    .select("*")
    .single<WeddingRow>();

  if (error) throw new Error(`Düğün bilgisi kaydedilemedi: ${error.message}`);
  return toWedding(data);
}

/* -------------------------------------------------------------------------- */
/*                                    Guests                                  */
/* -------------------------------------------------------------------------- */

async function listGuests(): Promise<GuestWithRsvp[]> {
  const { data, error } = await getSupabase()
    .from("guests")
    .select(GUEST_SELECT)
    .returns<GuestRowWithRsvp[]>();

  if (error) throw new Error(`Davetliler okunamadı: ${error.message}`);

  // Sıralama Türkçe alfabeye göre; Postgres'in collation'ına güvenmiyoruz.
  return (data ?? [])
    .map(withRsvp)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

async function getGuestByToken(token: string): Promise<GuestWithRsvp | null> {
  const { data, error } = await getSupabase()
    .from("guests")
    .select(GUEST_SELECT)
    .eq("token", token)
    .maybeSingle<GuestRowWithRsvp>();

  if (error) throw new Error(`Davetli okunamadı: ${error.message}`);
  return data ? withRsvp(data) : null;
}

async function getGuestById(id: string): Promise<GuestWithRsvp | null> {
  const { data, error } = await getSupabase()
    .from("guests")
    .select(GUEST_SELECT)
    .eq("id", id)
    .maybeSingle<GuestRowWithRsvp>();

  if (error) throw new Error(`Davetli okunamadı: ${error.message}`);
  return data ? withRsvp(data) : null;
}

/** Token çakışmasında kaç kez yeniden denenecek. */
const TOKEN_ATTEMPTS = 5;

async function createGuest(input: GuestInput): Promise<Guest> {
  const wedding = await getWedding();

  // Benzersizlik veritabanındaki UNIQUE index ile garanti; çakışma
  // ihtimali çok düşük ama gerçekleşirse yeni token ile denenir.
  for (let attempt = 0; attempt < TOKEN_ATTEMPTS; attempt += 1) {
    const { data, error } = await getSupabase()
      .from("guests")
      .insert({
        wedding_id: wedding.id,
        name: input.name,
        phone: input.phone,
        group_name: input.groupName,
        invitation_limit: input.invitationLimit,
        token: generateToken(),
      })
      .select("*")
      .single<GuestRow>();

    if (!error) return toGuest(data);
    if (!isUniqueViolation(error.code)) {
      throw new Error(`Davetli eklenemedi: ${error.message}`);
    }
  }

  throw new Error("Benzersiz davet bağlantısı üretilemedi.");
}

async function updateGuest(id: string, input: GuestInput): Promise<Guest> {
  // Token asla değişmez — paylaşılmış linkler çalışmaya devam etmeli.
  const { data, error } = await getSupabase()
    .from("guests")
    .update({
      name: input.name,
      phone: input.phone,
      group_name: input.groupName,
      invitation_limit: input.invitationLimit,
    })
    .eq("id", id)
    .select("*")
    .single<GuestRow>();

  if (error) throw new Error(`Davetli güncellenemedi: ${error.message}`);
  return toGuest(data);
}

async function deleteGuest(id: string): Promise<void> {
  // RSVP kaydı ON DELETE CASCADE ile birlikte gider.
  const { error } = await getSupabase().from("guests").delete().eq("id", id);
  if (error) throw new Error(`Davetli silinemedi: ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/*                                    RSVP                                    */
/* -------------------------------------------------------------------------- */

async function saveRsvp(guestId: string, input: RsvpInput): Promise<Rsvp> {
  // guest_id UNIQUE olduğu için upsert tek kayıt garantisini korur.
  // `responded_at` ilk cevabın zamanıdır; güncellemede dokunulmaz.
  const { data, error } = await getSupabase()
    .from("rsvps")
    .upsert(
      {
        guest_id: guestId,
        status: input.status,
        attending_count: input.attendingCount,
        note: input.note,
      },
      { onConflict: "guest_id", ignoreDuplicates: false },
    )
    .select("*")
    .single<RsvpRow>();

  if (error) throw new Error(`Cevap kaydedilemedi: ${error.message}`);
  return toRsvp(data);
}

/* -------------------------------------------------------------------------- */

/**
 * Gömülü RSVP ilişkisini tekil hale getirir.
 *
 * `guest_id` UNIQUE olduğu için en fazla bir kayıt olabilir, ancak
 * PostgREST ilişkiyi kaynağa göre dizi veya nesne olarak dönebilir.
 */
function withRsvp(row: GuestRowWithRsvp): GuestWithRsvp {
  const { rsvps, ...guestRow } = row;
  const first = Array.isArray(rsvps) ? (rsvps[0] ?? null) : rsvps;

  return {
    ...toGuest(guestRow),
    rsvp: first ? toRsvp(first) : null,
  };
}

/** Postgres benzersizlik ihlali. */
function isUniqueViolation(code: string | undefined): boolean {
  return code === "23505";
}

export const supabaseRepository: WeddingStore = {
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
