import "server-only";

/**
 * Admin kimlik yapılandırması.
 *
 * Değerler yalnızca ortam değişkenlerinden okunur; hiçbiri koda gömülmez
 * ve hiçbiri tarayıcıya gönderilmez (şartname §39).
 */
export const adminEmail = process.env.ADMIN_EMAIL ?? "";
export const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
export const authSecret = process.env.AUTH_SECRET ?? "";

/** Giriş yapılabilmesi için üç değerin de tanımlı olması gerekir. */
export function isAuthConfigured(): boolean {
  return adminEmail !== "" && adminPasswordHash !== "" && authSecret !== "";
}
