import type { Guest, Wedding } from "@/types";

/** Çiftin isimlerini `nameOrder` tercihine göre sıralar. */
export function coupleNames(wedding: Wedding): [string, string] {
  return wedding.nameOrder === "groom_first"
    ? [wedding.groomName, wedding.brideName]
    : [wedding.brideName, wedding.groomName];
}

/** "Ayşe & Mehmet" */
export function coupleTitle(wedding: Wedding): string {
  return coupleNames(wedding).join(" & ");
}

/** Fotoğraf yoksa gösterilecek monogram: "A & M" */
export function monogram(wedding: Wedding): string {
  return coupleNames(wedding)
    .map((name) => name.trim().charAt(0).toLocaleUpperCase("tr-TR"))
    .join(" & ");
}

/** Davetlinin kişisel davetiye adresi. Domain'e bağlı değildir. */
export function invitationUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/invite/${token}`;
}

/** Telefon numarasını wa.me biçimine indirger (yalnızca rakamlar). */
export function whatsappNumber(phone: string | null): string {
  return phone ? phone.replace(/\D/g, "") : "";
}

/** Davetliye gönderilecek WhatsApp mesaj metni. */
export function whatsappMessage(
  wedding: Wedding,
  guest: Guest,
  siteUrl: string,
): string {
  const firstName = guest.name.trim().split(/\s+/)[0];
  return [
    `Merhaba ${firstName},`,
    "",
    `${coupleTitle(wedding)} düğününde sizi de aramızda görmekten mutluluk duyarız. 🤍`,
    "",
    "Davetiyemiz:",
    invitationUrl(siteUrl, guest.token),
    "",
    "Katılım durumunuzu davetiye içerisinden bize iletebilirsiniz.",
  ].join("\n");
}

/** Hazır `wa.me` bağlantısı. Telefon yoksa numara olmadan paylaşım açar. */
export function whatsappShareUrl(
  wedding: Wedding,
  guest: Guest,
  siteUrl: string,
): string {
  const number = whatsappNumber(guest.phone);
  const text = encodeURIComponent(whatsappMessage(wedding, guest, siteUrl));
  return `https://wa.me/${number}?text=${text}`;
}
