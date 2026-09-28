import type {
  GuestInput,
  RsvpInput,
  WeddingInput,
} from "@/lib/validation/schemas";
import type { Guest, GuestWithRsvp, Rsvp, Wedding } from "@/types";

/**
 * Veri deposu arayüzü.
 *
 * İki implementasyonu vardır:
 *
 * - `json-repository`  — geliştirme için tek dosyalık JSON deposu
 * - `supabase-repository` — Postgres
 *
 * Hangisinin kullanılacağına `index.ts` ortam değişkenlerine bakarak
 * karar verir. Arayüz kodu ikisini de tanımaz.
 */
export interface WeddingStore {
  getWedding(): Promise<Wedding>;
  updateWedding(input: WeddingInput): Promise<Wedding>;

  listGuests(): Promise<GuestWithRsvp[]>;
  getGuestByToken(token: string): Promise<GuestWithRsvp | null>;
  getGuestById(id: string): Promise<GuestWithRsvp | null>;
  createGuest(input: GuestInput): Promise<Guest>;
  updateGuest(id: string, input: GuestInput): Promise<Guest>;
  deleteGuest(id: string): Promise<void>;

  saveRsvp(guestId: string, input: RsvpInput): Promise<Rsvp>;
}
