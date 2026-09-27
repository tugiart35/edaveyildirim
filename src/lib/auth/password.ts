import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Şifre saklama.
 *
 * Node'un yerleşik `scrypt`'i kullanılır — bcrypt kadar güvenli, ek
 * bağımlılık gerektirmez. Tuz her hash'in içinde taşınır:
 *
 *     scrypt.<tuz base64url>.<anahtar base64url>
 *
 * Ayraç olarak bcrypt geleneğindeki `$` değil `.` kullanılır: Next.js
 * `.env` dosyalarında değişken genişletmesi yapar ve `$...` dizilerini
 * değişken referansı sanıp siler. base64url nokta içermediği için `.`
 * güvenli bir ayraçtır.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scrypt(normalize(password), salt, KEY_LENGTH);
  return `scrypt.${salt.toString("base64url")}.${key.toString("base64url")}`;
}

/**
 * Şifreyi saklanan hash ile karşılaştırır.
 *
 * Karşılaştırma sabit zamanlıdır; hash bozuksa sessizce false döner.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltPart, keyPart] = stored.split(".");
  if (scheme !== "scrypt" || !saltPart || !keyPart) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltPart, "base64url");
    expected = Buffer.from(keyPart, "base64url");
  } catch {
    return false;
  }

  if (salt.length === 0 || expected.length === 0) return false;

  const actual = await scrypt(normalize(password), salt, expected.length);
  return timingSafeEqual(expected, actual);
}

/** Farklı klavyelerden gelen aynı şifrenin eşleşmesini sağlar. */
function normalize(password: string): string {
  return password.normalize("NFKC");
}
