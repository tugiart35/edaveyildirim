#!/usr/bin/env node
import pkg from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";

/**
 * Supabase'e başlangıç verisi yazar.
 *
 *     npm run seed              düğün kaydı + örnek davetliler
 *     npm run seed -- --only-wedding   yalnızca düğün kaydı
 *
 * Production'da asla otomatik çalışmaz (şartname §50): elle çağrılır ve
 * NODE_ENV=production ise açık onay ister.
 */

pkg.loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli. .env.local dosyanızı kontrol edin.",
  );
  process.exit(1);
}

const onlyWedding = process.argv.includes("--only-wedding");
const force = process.argv.includes("--force");

if (process.env.NODE_ENV === "production" && !force) {
  console.error(
    "Production ortamında seed çalıştırmak için --force bayrağı gerekir.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const nanoid = customAlphabet(
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  10,
);

/* -------------------------------------------------------------------------- */

const { data: existing, error: readError } = await supabase
  .from("weddings")
  .select("id")
  .limit(1)
  .maybeSingle();

if (readError) {
  console.error("Veritabanına ulaşılamadı:", readError.message);
  console.error("Migration'ı çalıştırdınız mı? supabase/migrations/0001_init.sql");
  process.exit(1);
}

let weddingId = existing?.id;

if (weddingId) {
  console.log("• Düğün kaydı zaten var, atlanıyor.");
} else {
  const { data, error } = await supabase
    .from("weddings")
    .insert({
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
      gallery_images: [
        "/mock/galeri-1.jpg",
        "/mock/galeri-2.jpg",
        "/mock/galeri-3.jpg",
        "/mock/galeri-4.jpg",
      ],
    })
    .select("id")
    .single();

  if (error) {
    console.error("Düğün kaydı oluşturulamadı:", error.message);
    process.exit(1);
  }

  weddingId = data.id;
  console.log("✓ Düğün kaydı oluşturuldu.");
}

if (onlyWedding) {
  console.log("\nTamam. Davetliler atlandı (--only-wedding).");
  process.exit(0);
}

/* -------------------------------------------------------------------------- */

const guests = [
  { name: "Ahmet Yılmaz", phone: "+905551111111", group_name: "Arkadaşlar", invitation_limit: 2, rsvp: { status: "attending", attending_count: 2 } },
  { name: "Mehmet Kaya", phone: "+905552222222", group_name: "Aile", invitation_limit: 4, rsvp: null },
  { name: "Seda Demir", phone: "+905553333333", group_name: "İş", invitation_limit: 1, rsvp: { status: "declined", attending_count: 0, note: "O tarihte şehir dışında olacağım, çok üzgünüm." } },
  { name: "Can Ailesi", phone: "+905554444444", group_name: "Akraba", invitation_limit: 5, rsvp: { status: "attending", attending_count: 4 } },
  { name: "Zeynep Arslan", phone: null, group_name: "Gelin Ailesi", invitation_limit: 3, rsvp: null },
];

const { count } = await supabase
  .from("guests")
  .select("id", { count: "exact", head: true });

if (count && count > 0) {
  console.log(`• ${count} davetli zaten var, örnek davetliler atlanıyor.`);
  process.exit(0);
}

for (const { rsvp, ...guest } of guests) {
  const { data, error } = await supabase
    .from("guests")
    .insert({ ...guest, wedding_id: weddingId, token: nanoid() })
    .select("id, name, token")
    .single();

  if (error) {
    console.error(`  ✗ ${guest.name}: ${error.message}`);
    continue;
  }

  if (rsvp) {
    const { error: rsvpError } = await supabase
      .from("rsvps")
      .insert({ guest_id: data.id, note: null, ...rsvp });

    if (rsvpError) console.error(`  ✗ ${guest.name} cevabı: ${rsvpError.message}`);
  }

  console.log(`  ✓ ${data.name.padEnd(16)} /invite/${data.token}`);
}

console.log("\nTamam.");
