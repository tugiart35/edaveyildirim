import { describe, expect, it } from "vitest";

import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";

const SECRET = "test-gizli-deger";
const NOW = Date.parse("2026-03-01T12:00:00.000Z");

describe("oturum jetonu", () => {
  it("ürettiği jetonu doğrular", () => {
    const token = createSessionToken(SECRET, NOW);
    expect(verifySessionToken(token, SECRET, NOW)).toBe(true);
  });

  it("başka gizli değerle imzalanmış jetonu reddeder", () => {
    const token = createSessionToken("baska-gizli-deger", NOW);
    expect(verifySessionToken(token, SECRET, NOW)).toBe(false);
  });

  it("payload değiştirilmiş jetonu reddeder", () => {
    const token = createSessionToken(SECRET, NOW);
    const [, signature] = token.split(".");

    // Süreyi uzatmaya çalış: imza artık uymaz.
    const sahte = Buffer.from(
      JSON.stringify({ exp: NOW + 10 ** 12 }),
      "utf8",
    ).toString("base64url");

    expect(verifySessionToken(`${sahte}.${signature}`, SECRET, NOW)).toBe(
      false,
    );
  });

  it("süresi dolmuş jetonu reddeder", () => {
    const token = createSessionToken(SECRET, NOW);
    const sonra = NOW + SESSION_MAX_AGE_SECONDS * 1000 + 1;

    expect(verifySessionToken(token, SECRET, sonra)).toBe(false);
  });

  it("süre dolmadan hemen önce geçerlidir", () => {
    const token = createSessionToken(SECRET, NOW);
    const sonra = NOW + SESSION_MAX_AGE_SECONDS * 1000 - 1;

    expect(verifySessionToken(token, SECRET, sonra)).toBe(true);
  });

  it("jeton yoksa reddeder", () => {
    expect(verifySessionToken(undefined, SECRET, NOW)).toBe(false);
    expect(verifySessionToken("", SECRET, NOW)).toBe(false);
  });

  it("gizli değer tanımlı değilse hiçbir jetonu kabul etmez", () => {
    // AUTH_SECRET unutulursa panel açığa çıkmamalı.
    const token = createSessionToken("", NOW);
    expect(verifySessionToken(token, "", NOW)).toBe(false);
  });

  it("bozuk biçimli jetonları reddeder", () => {
    for (const bozuk of ["imzasiz", ".", ".imza", "payload.", "a.b.c"]) {
      expect(verifySessionToken(bozuk, SECRET, NOW)).toBe(false);
    }
  });

  it("payload'ı JSON olmayan jetonu reddeder", () => {
    const payload = Buffer.from("düz metin", "utf8").toString("base64url");
    const token = createSessionToken(SECRET, NOW);
    const [, signature] = token.split(".");

    expect(verifySessionToken(`${payload}.${signature}`, SECRET, NOW)).toBe(
      false,
    );
  });
});
