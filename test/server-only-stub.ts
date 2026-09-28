/**
 * `server-only` paketinin test karşılığı.
 *
 * Gerçek paket, sunucuya ait bir modül istemci tarafına sızarsa derleme
 * hatası verir. Vitest'te "istemci" diye bir şey yok; bu boş modül
 * kontrolü devre dışı bırakır ama üretim davranışını değiştirmez.
 */
export {};
