#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import pkg from "@next/env";
import { customAlphabet } from "nanoid";

import { SCHEMA_SQL } from "../src/lib/db/schema.ts";

/**
 * Veritabanını hazırlar ve başlangıç verisini yazar.
 *
 *     npm run seed
 *
 * Mevcut veriyi asla ezmez: tablolar doluysa dokunmaz, boşsa örnek
 * veriyle başlar.
 *
 * Production'da otomatik çalışmaz (şartname §50); elle çağrılır.
 */

pkg.loadEnvConfig(process.cwd());

const databaseFile =
  process.env.DATABASE_FILE ?? path.join(process.cwd(), ".data", "wedding.db");

mkdirSync(path.dirname(databaseFile), { recursive: true });

const db = new DatabaseSync(databaseFile);
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");
db.exec(SCHEMA_SQL);

console.log(`Veritabanı: ${databaseFile}\n`);

const nanoid = customAlphabet(
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  10,
);

const now = () => new Date().toISOString();

/* -------------------------------------------------------------------------- */
/*                                Örnek veri                                  */
/* -------------------------------------------------------------------------- */

const demoWedding = {
  bride_name: "Ayşe",
  groom_name: "Mehmet",
  name_order: "bride_first",
  event_date: "2026-10-18",
  event_time: "19:30",
  timezone: "Europe/Istanbul",
  venue_name: "Çırağan Palace",
  venue_address: "Çırağan Cad. No:32, Beşiktaş, İstanbul",
  maps_url: "https://maps.google.com/?q=Ciragan+Palace+Istanbul",
  invitation_text:
    "Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.",
  theme: "elegant",
  primary_image: "/mock/hero.jpg",
  gallery_images: JSON.stringify([
    "/mock/galeri-1.jpg",
    "/mock/galeri-2.jpg",
    "/mock/galeri-3.jpg",
    "/mock/galeri-4.jpg",
  ]),
  music_url: null,
  enable_child_split: 0,
};

const demoGuests = [
  { name: "Ahmet Yılmaz",  phone: "+905551111111", group_name: "Arkadaşlar",  invitation_limit: 2, rsvp: { status: "attending", attending_count: 2, note: null } },
  { name: "Mehmet Kaya",   phone: "+905552222222", group_name: "Aile",        invitation_limit: 4, rsvp: null },
  { name: "Seda Demir",    phone: "+905553333333", group_name: "İş",          invitation_limit: 1, rsvp: { status: "declined", attending_count: 0, note: "O tarihte şehir dışında olacağım, çok üzgünüm." } },
  { name: "Can Ailesi",    phone: "+905554444444", group_name: "Akraba",      invitation_limit: 5, rsvp: { status: "attending", attending_count: 4, note: null } },
  { name: "Zeynep Arslan", phone: null,            group_name: "Gelin Ailesi", invitation_limit: 3, rsvp: null },
];

/* -------------------------------------------------------------------------- */
/*                                   Düğün                                    */
/* -------------------------------------------------------------------------- */

const weddingCount = db.prepare("SELECT COUNT(*) AS n FROM weddings").get().n;
let weddingId;

if (weddingCount > 0) {
  weddingId = db
    .prepare("SELECT id FROM weddings ORDER BY created_at ASC LIMIT 1")
    .get().id;
  console.log("• Düğün kaydı zaten var, dokunulmadı.");
} else {
  const source = demoWedding;

  weddingId = randomUUID();
  const timestamp = now();

  db.prepare(
    `INSERT INTO weddings
       (id, bride_name, groom_name, name_order, event_date, event_time,
        timezone, venue_name, venue_address, maps_url, invitation_text,
        theme, primary_image, gallery_images, music_url, enable_child_split,
        created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    weddingId,
    source.bride_name,
    source.groom_name,
    source.name_order,
    source.event_date,
    source.event_time,
    source.timezone,
    source.venue_name,
    source.venue_address,
    source.maps_url,
    source.invitation_text,
    source.theme,
    source.primary_image,
    source.gallery_images,
    source.music_url,
    source.enable_child_split,
    timestamp,
    timestamp,
  );

  console.log("✓ Örnek düğün kaydı oluşturuldu.");
}

/* -------------------------------------------------------------------------- */
/*                                  Davetliler                                */
/* -------------------------------------------------------------------------- */

const guestCount = db.prepare("SELECT COUNT(*) AS n FROM guests").get().n;

if (guestCount > 0) {
  console.log(`• ${guestCount} davetli zaten var, dokunulmadı.\n`);
  process.exit(0);
}

const insertGuest = db.prepare(
  `INSERT INTO guests
     (id, wedding_id, name, phone, group_name, invitation_limit, token,
      created_at, updated_at)
   VALUES (?,?,?,?,?,?,?,?,?)`,
);

const insertRsvp = db.prepare(
  `INSERT INTO rsvps
     (id, guest_id, status, attending_count, note, responded_at, updated_at)
   VALUES (?,?,?,?,?,?,?)`,
);

const rows = demoGuests.map((guest) => ({ ...guest, token: nanoid() }));

for (const row of rows) {
  const id = randomUUID();
  const timestamp = now();

  try {
    insertGuest.run(
      id,
      weddingId,
      row.name,
      row.phone ?? null,
      row.group_name ?? null,
      row.invitation_limit,
      row.token ?? nanoid(),
      row.created_at ?? timestamp,
      row.updated_at ?? timestamp,
    );

    if (row.rsvp) {
      insertRsvp.run(
        randomUUID(),
        id,
        row.rsvp.status,
        row.rsvp.attendingCount ?? row.rsvp.attending_count,
        row.rsvp.note ?? null,
        row.rsvp.respondedAt ?? timestamp,
        row.rsvp.updatedAt ?? timestamp,
      );
    }

    console.log(`  ✓ ${row.name.padEnd(18)} /invite/${row.token}`);
  } catch (error) {
    console.error(`  ✗ ${row.name}: ${error.message}`);
  }
}

console.log("\nTamam.");
