"use server";

import { revalidatePath } from "next/cache";

import { getGuestByToken, saveRsvp } from "@/lib/data";
import { rsvpInputSchemaFor } from "@/lib/validation/schemas";
import type { Rsvp } from "@/types";

export type SubmitRsvpResult =
  { ok: true; rsvp: Rsvp } | { ok: false; error: string };

/**
 * Davetlinin katılım cevabını kaydeder.
 *
 * Davetli token üzerinden bulunur; davet hakkı istemciden değil
 * veritabanından okunur. Tarayıcıdan gelen hiçbir sınır değerine
 * güvenilmez (şartname §41).
 */
export async function submitRsvp(
  token: string,
  input: unknown,
): Promise<SubmitRsvpResult> {
  const guest = await getGuestByToken(token);
  if (!guest) {
    return { ok: false, error: "Davet bağlantısı bulunamadı." };
  }

  const parsed = rsvpInputSchemaFor(guest.invitationLimit).safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Girdiğiniz bilgiler geçersiz.",
    };
  }

  try {
    const rsvp = await saveRsvp(guest.id, parsed.data);

    // Davetiye sayfası ve admin ekranları güncel sayıları göstermeli.
    revalidatePath("/invite/[token]", "page");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/guests");

    return { ok: true, rsvp };
  } catch {
    return { ok: false, error: "Bir sorun oluştu. Lütfen tekrar deneyin." };
  }
}
