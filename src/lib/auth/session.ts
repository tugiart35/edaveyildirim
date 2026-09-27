import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "dugun_admin";

/** Oturum ömrü: bir hafta. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * İmzalı oturum jetonu.
 *
 * Biçim: `<payload base64url>.<hmac base64url>`
 *
 * Payload yalnızca bitiş zamanını taşır — tek admin olduğu için kimlik
 * bilgisine gerek yok. İmza olmadan üretilemez, süresi dolunca geçersizdir.
 */
export function createSessionToken(
  secret: string,
  now: number = Date.now(),
): string {
  const payload = encode({ exp: now + SESSION_MAX_AGE_SECONDS * 1000 });
  return `${payload}.${sign(payload, secret)}`;
}

/** Jetonun imzasını ve süresini doğrular. */
export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token || secret === "") return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!equals(signature, sign(payload, secret))) return false;

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (typeof decoded !== "object" || decoded === null) return false;
    const { exp } = decoded as { exp?: unknown };

    return typeof exp === "number" && Number.isFinite(exp) && now < exp;
  } catch {
    return false;
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

/** Sabit zamanlı karşılaştırma — imza sızıntısını engeller. */
function equals(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
