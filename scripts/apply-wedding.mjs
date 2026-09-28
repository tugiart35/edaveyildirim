#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import pkg from "@next/env";

import { SCHEMA_SQL } from "../src/lib/db/schema.ts";

/**
 * Davetiyenin görünümünü `config/wedding.json`'daki değerlere getirir.
 *
 *     npm run apply-wedding
 *
 * Neden var: davetiyenin nasıl göründüğü (kapak, paneller, tarih, tema)
 * veritabanında durur, kodda değil. Bu yüzden yeni kodu deploy etmek
 * canlıyı yerele benzetmez — ayarların da taşınması gerekir. Onları
 * elle girmek yerine tek bir dosyada tutup her iki ortama da aynı
 * dosyadan uyguluyoruz.
 *
 * **Davetlilere dokunmaz.** Yalnızca `weddings` satırını günceller;
 * davetli listesi ve verilen cevaplar olduğu gibi kalır.
 *
 * Hedef veritabanı `DATABASE_FILE` ile seçilir:
 *
 *     DATABASE_FILE=/data/wedding.db npm run apply-wedding
 */

pkg.loadEnvConfig(process.cwd());

const configFile = path.join(process.cwd(), "config", "wedding.json");
const config = JSON.parse(readFileSync(configFile, "utf8"));

const databaseFile =
  process.env.DATABASE_FILE ?? path.join(process.cwd(), ".data", "wedding.db");

mkdirSync(path.dirname(databaseFile), { recursive: true });

const db = new DatabaseSync(databaseFile);
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");
db.exec(SCHEMA_SQL);

console.log(`Veritabanı: ${databaseFile}`);
console.log(`Ayarlar   : ${configFile}\n`);

/* -------------------------------------------------------------------------- */

// Veritabanı sütunlarına birebir karşılık gelen değerler.
const values = {
  bride_name: config.brideName,
  groom_name: config.groomName,
  name_order: config.nameOrder,
  event_date: config.eventDate,
  event_time: config.eventTime,
  timezone: config.timezone,
  venue_name: config.venueName,
  venue_address: config.venueAddress ?? null,
  maps_url: config.mapsUrl ?? null,
  invitation_text: config.invitationText ?? null,
  theme: config.theme,
  primary_image: config.primaryImage ?? null,
  cover_image: config.coverImage ?? null,
  rsvp_image: config.rsvpImage ?? null,
  gallery_images: JSON.stringify(config.galleryImages ?? []),
  panels: JSON.stringify(config.panels ?? []),
  music_url: config.musicUrl ?? null,
  enable_child_split: config.enableChildSplit ? 1 : 0,
};

const columns = Object.keys(values);
const timestamp = new Date().toISOString();

const existing = db
  .prepare("SELECT * FROM weddings ORDER BY created_at ASC LIMIT 1")
  .get();

if (existing) {
  // Neyin değiştiğini yazdır: canlıda körlemesine çalıştırılacak.
  const changed = columns.filter(
    (column) => String(existing[column] ?? "") !== String(values[column] ?? ""),
  );

  if (changed.length === 0) {
    console.log("Değişen bir şey yok, ayarlar zaten uygulanmış.\n");
    process.exit(0);
  }

  db.prepare(
    `UPDATE weddings
        SET ${columns.map((column) => `${column} = ?`).join(", ")},
            updated_at = ?
      WHERE id = ?`,
  ).run(...columns.map((column) => values[column]), timestamp, existing.id);

  for (const column of changed) {
    console.log(`  ${column}`);
    console.log(`    − ${truncate(existing[column])}`);
    console.log(`    + ${truncate(values[column])}`);
  }
  console.log(`\n✓ ${changed.length} alan güncellendi.\n`);
} else {
  db.prepare(
    `INSERT INTO weddings (id, ${columns.join(", ")}, created_at, updated_at)
     VALUES (?, ${columns.map(() => "?").join(", ")}, ?, ?)`,
  ).run(
    randomUUID(),
    ...columns.map((column) => values[column]),
    timestamp,
    timestamp,
  );

  console.log("✓ Düğün kaydı oluşturuldu.\n");
}

/** Uzun JSON alanlarının çıktıyı boğmasını engeller. */
function truncate(value) {
  const text = value === null || value === undefined ? "(boş)" : String(value);
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}
