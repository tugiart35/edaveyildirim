/**
 * Ortam yapılandırması.
 *
 * Kod hiçbir alan adına bağlı yazılmaz; tüm mutlak adresler `siteUrl`
 * üzerinden üretilir (şartname §64).
 *
 * `SITE_URL` çalışma anında okunur — `NEXT_PUBLIC_` öneki bilinçli
 * olarak kullanılmaz. O önek değeri derleme anında paketin içine gömer;
 * o zaman alan adını değiştirmek için yeniden derlemek gerekirdi.
 * Değer yalnızca sunucuda, davet bağlantılarını üretirken okunuyor.
 *
 * Eski `NEXT_PUBLIC_SITE_URL` tanımı da kabul edilir.
 */
export const siteUrl = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");
