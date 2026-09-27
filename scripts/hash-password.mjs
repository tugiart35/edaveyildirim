#!/usr/bin/env node
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

/**
 * Admin şifresinin hash'ini üretir.
 *
 *     npm run hash-password -- "şifreniz"
 *
 * Çıktıyı .env.local içindeki ADMIN_PASSWORD_HASH değerine yazın.
 * Şifrenin düz hali hiçbir yere kaydedilmez.
 */
const password = process.argv[2];

if (!password) {
  console.error('Kullanım: npm run hash-password -- "şifreniz"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("Şifre en az 8 karakter olmalı.");
  process.exit(1);
}

const salt = randomBytes(16);
const key = await scrypt(password.normalize("NFKC"), salt, 64);

// Ayraç `.` — `.env` dosyalarında `$` değişken genişletmesine takılıyor.
console.log("\nADMIN_PASSWORD_HASH değeri:\n");
console.log(`scrypt.${salt.toString("base64url")}.${key.toString("base64url")}`);
console.log("\nAyrıca AUTH_SECRET için rastgele bir değer:\n");
console.log(randomBytes(32).toString("hex"));
console.log();
