import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { demoGuests, demoRsvps, demoWedding } from "@/lib/data/demo-data";
import type { Guest, Rsvp, Wedding } from "@/types";

/**
 * Frontend fazının geçici veri deposu: tek bir JSON dosyası.
 *
 * Backend fazında bu dosyanın yerini Supabase alacak. `src/lib/data/index.ts`
 * içindeki imzalar değişmeyeceği için arayüz kodu etkilenmez.
 */

export interface StoreShape {
  wedding: Wedding;
  guests: Guest[];
  rsvps: Rsvp[];
}

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "dev-store.json");

function initialStore(): StoreShape {
  return {
    wedding: structuredClone(demoWedding),
    guests: structuredClone(demoGuests),
    rsvps: structuredClone(demoRsvps),
  };
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const store = initialStore();
    await persist(store);
    return store;
  }
}

async function persist(store: StoreShape): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  // Kısmi yazımın dosyayı bozmaması için geçici dosyaya yazıp yer değiştir.
  const tempPath = `${STORE_PATH}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(tempPath, STORE_PATH);
}

/**
 * Yazma işlemlerini sıraya sokar.
 *
 * Aynı anda gelen iki RSVP'nin oku-değiştir-yaz döngüsünde birbirini
 * ezmesini engeller.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

export async function withStore<T>(
  mutate: (store: StoreShape) => T | Promise<T>,
): Promise<T> {
  const run = async (): Promise<T> => {
    const store = await readStore();
    const result = await mutate(store);
    await persist(store);
    return result;
  };

  const queued = writeQueue.then(run, run);
  // Kuyruğun bir hatayla kopmasını engelle.
  writeQueue = queued.catch(() => undefined);
  return queued;
}

export async function loadStore(): Promise<StoreShape> {
  return readStore();
}

/** Depoyu örnek veriye döndürür. Yalnızca geliştirme için. */
export async function resetStore(): Promise<void> {
  await persist(initialStore());
}
