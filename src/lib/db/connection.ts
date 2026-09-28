import "server-only";

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { SCHEMA_SQL } from "@/lib/db/schema";

/**
 * Veritabanı bağlantısı.
 *
 * Node'un yerleşik `node:sqlite` modülü kullanılır — derlenmesi gereken
 * bir yerel modül yok, bağımlılık yok. Bağlantı süreç başına bir kez
 * açılır ve açık kalır.
 *
 * Dosyanın yeri `DATABASE_FILE` ile belirlenir. Sunucuda bu, kalıcı bir
 * diske (Dokploy volume) işaret etmelidir; aksi halde her dağıtımda
 * davetli listesi silinir.
 */

export const databaseFile =
  process.env.DATABASE_FILE ?? path.join(process.cwd(), ".data", "wedding.db");

/**
 * Next.js geliştirme modunda modülleri yeniden yüklediği için bağlantı
 * global üzerinde saklanır; her sıcak yeniden yüklemede yeni bir dosya
 * tanıtıcısı açılmasını engeller.
 */
const globalForDb = globalThis as typeof globalThis & {
  __weddingDb?: DatabaseSync;
};

export function getDatabase(): DatabaseSync {
  if (globalForDb.__weddingDb) return globalForDb.__weddingDb;

  mkdirSync(path.dirname(databaseFile), { recursive: true });

  const db = new DatabaseSync(databaseFile);
  applyPragmas(db);
  db.exec(SCHEMA_SQL);
  applyMigrations(db);
  ensureWedding(db);

  globalForDb.__weddingDb = db;
  return db;
}

/**
 * Boş bir veritabanına yer tutucu düğün kaydı koyar.
 *
 * Uygulamanın her sayfası bir düğün kaydı olduğunu varsayar. Bu olmadan
 * taze kurulumda ilk istek hata verirdi; admin panele girip bilgileri
 * düzenleyemeden sıkışıp kalırdı.
 *
 * Değerler bilinçli olarak geneldir: admin `/admin/settings` üzerinden
 * kendi bilgilerini girer.
 */
function ensureWedding(db: DatabaseSync): void {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM weddings").get() as {
    n: number;
  };
  if (n > 0) return;

  const timestamp = new Date().toISOString();

  // Bir yıl sonrası: geçerli bir tarih olmalı, ama gerçek tarih değil.
  const placeholderDate = new Date();
  placeholderDate.setFullYear(placeholderDate.getFullYear() + 1);

  db.prepare(
    `INSERT INTO weddings
       (id, bride_name, groom_name, event_date, event_time, venue_name,
        invitation_text, created_at, updated_at)
     VALUES (?, 'Gelin', 'Damat', ?, '19:00', 'Mekân', ?, ?, ?)`,
  ).run(
    randomUUID(),
    placeholderDate.toISOString().slice(0, 10),
    "Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.",
    timestamp,
    timestamp,
  );
}

/** Test ve script'ler için: verilen dosyada (veya bellekte) yeni bağlantı. */
export function openDatabase(file: string): DatabaseSync {
  if (file !== ":memory:") {
    mkdirSync(path.dirname(file), { recursive: true });
  }

  const db = new DatabaseSync(file);
  applyPragmas(db);
  db.exec(SCHEMA_SQL);
  applyMigrations(db);
  return db;
}

/**
 * Şemaya sonradan eklenen sütunlar.
 *
 * `CREATE TABLE IF NOT EXISTS` var olan bir tabloyu değiştirmez; yeni
 * bir sütun eklendiğinde çalışan veritabanları geride kalır. Burası
 * eksik sütunları tamamlar ve her açılışta güvenle tekrar çalışır.
 */
function applyMigrations(db: DatabaseSync): void {
  addColumn(db, "weddings", "cover_image", "TEXT");
  addColumn(db, "weddings", "rsvp_image", "TEXT");
  addColumn(db, "weddings", "panels", "TEXT NOT NULL DEFAULT '[]'");
}

function addColumn(
  db: DatabaseSync,
  table: string,
  column: string,
  definition: string,
): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;

  if (columns.some((existing) => existing.name === column)) return;

  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function applyPragmas(db: DatabaseSync): void {
  // Yabancı anahtarlar SQLite'ta bağlantı başına açılır; kapalıyken
  // ON DELETE CASCADE çalışmaz ve silinen davetlinin cevabı ortada kalır.
  db.exec("PRAGMA foreign_keys = ON");

  // WAL: okuma yazmayı bloklamaz. Düğün günü herkes aynı anda cevap
  // verdiğinde davetiye sayfaları beklemeye girmez.
  db.exec("PRAGMA journal_mode = WAL");

  // Yazma sırasında kilit varsa hemen hata vermek yerine bekle.
  db.exec("PRAGMA busy_timeout = 5000");
}
