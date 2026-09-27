/**
 * Türkçe büyük harf dönüşümü.
 *
 * CSS `text-transform: uppercase` bazı tarayıcılarda "Ekim" kelimesini
 * "EKIM" yapar; doğrusu "EKİM"dir. Bu yüzden büyük harfe çevirmeyi
 * stil katmanına bırakmıyoruz.
 */
export function trUpper(value: string): string {
  return value.toLocaleUpperCase("tr-TR");
}
