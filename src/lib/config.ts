/**
 * Ortam yapılandırması.
 *
 * Kod hiçbir domain'e bağlı yazılmaz; tüm mutlak adresler `siteUrl`
 * üzerinden üretilir.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
