import "server-only";

import { jsonRepository } from "@/lib/data/json-repository";
import { isSupabaseConfigured } from "@/lib/data/supabase-client";
import { supabaseRepository } from "@/lib/data/supabase-repository";
import type { WeddingStore } from "@/lib/data/store";

/**
 * Uygulamanın tek veri erişim noktası.
 *
 * Supabase yapılandırılmışsa Postgres, değilse geliştirme için JSON
 * dosyası kullanılır. Arayüz kodu bu ayrımı görmez — iki implementasyon
 * da `WeddingStore` arayüzünü uygular.
 *
 * Böylece proje veritabanı olmadan da çalışır; anahtarlar `.env.local`
 * dosyasına eklendiği anda Postgres devreye girer.
 */
const store: WeddingStore = isSupabaseConfigured()
  ? supabaseRepository
  : jsonRepository;

/** Hangi deponun etkin olduğunu gösterir (kurulum ekranları için). */
export const activeStore = isSupabaseConfigured() ? "supabase" : "json";

export const getWedding = store.getWedding;
export const updateWedding = store.updateWedding;

export const listGuests = store.listGuests;
export const getGuestByToken = store.getGuestByToken;
export const getGuestById = store.getGuestById;
export const createGuest = store.createGuest;
export const updateGuest = store.updateGuest;
export const deleteGuest = store.deleteGuest;

export const saveRsvp = store.saveRsvp;
