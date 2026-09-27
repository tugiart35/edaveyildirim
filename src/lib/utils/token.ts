import { customAlphabet } from "nanoid";

/**
 * Karışması kolay karakterler (0/O, 1/l/I) çıkarılmış alfabe.
 * Davet linki telefonda elle yazılabilir veya sesli okunabilir olmalı.
 */
const TOKEN_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

export const TOKEN_LENGTH = 10;

const nanoid = customAlphabet(TOKEN_ALPHABET, TOKEN_LENGTH);

/** Tahmin edilmesi zor, URL güvenli davetli token'ı üretir. */
export function generateToken(): string {
  return nanoid();
}

/** Bir string'in token biçimine uyup uymadığını kontrol eder. */
export function isValidTokenFormat(value: string): boolean {
  if (value.length !== TOKEN_LENGTH) return false;
  for (const char of value) {
    if (!TOKEN_ALPHABET.includes(char)) return false;
  }
  return true;
}
