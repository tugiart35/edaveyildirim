import "server-only";

import { createRepository } from "@/lib/data/repository";
import { getDatabase } from "@/lib/db/connection";

/**
 * Uygulamanın tek veri erişim noktası.
 *
 * Arayüz kodu yalnızca bu modülü tanır; altındaki SQLite'ı görmez.
 * Bağlantı ilk kullanımda açılır, süreç boyunca açık kalır.
 */
const repository = createRepository(getDatabase());

export const getWedding = repository.getWedding;
export const updateWedding = repository.updateWedding;

export const listGuests = repository.listGuests;
export const getGuestByToken = repository.getGuestByToken;
export const getGuestById = repository.getGuestById;
export const createGuest = repository.createGuest;
export const updateGuest = repository.updateGuest;
export const deleteGuest = repository.deleteGuest;

export const saveRsvp = repository.saveRsvp;
