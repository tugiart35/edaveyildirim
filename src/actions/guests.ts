"use server";

import { revalidatePath } from "next/cache";

import { createGuest, deleteGuest, updateGuest } from "@/lib/data";
import { guestInputSchema } from "@/lib/validation/schemas";
import type { Guest } from "@/types";

export type GuestActionResult =
  { ok: true; guest: Guest } | { ok: false; error: string };

/**
 * Admin işlemleri `proxy.ts` tarafından korunan rotalardan çağrılır;
 * oturumu olmayan biri bu sayfalara hiç ulaşamaz.
 */

/** Yeni davetli ekler ve kişiye özel token üretir. */
export async function createGuestAction(
  input: unknown,
): Promise<GuestActionResult> {
  const parsed = guestInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error.issues) };
  }

  try {
    const guest = await createGuest(parsed.data);
    revalidateAdmin();
    return { ok: true, guest };
  } catch {
    return { ok: false, error: "Davetli eklenemedi. Lütfen tekrar deneyin." };
  }
}

/** Davetli bilgilerini günceller. Token değişmez. */
export async function updateGuestAction(
  id: string,
  input: unknown,
): Promise<GuestActionResult> {
  const parsed = guestInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error.issues) };
  }

  try {
    const guest = await updateGuest(id, parsed.data);
    revalidateAdmin();
    return { ok: true, guest };
  } catch {
    return {
      ok: false,
      error: "Davetli güncellenemedi. Lütfen tekrar deneyin.",
    };
  }
}

/** Davetliyi ve varsa cevabını siler. */
export async function deleteGuestAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await deleteGuest(id);
    revalidateAdmin();
    return { ok: true };
  } catch {
    return { ok: false, error: "Davetli silinemedi. Lütfen tekrar deneyin." };
  }
}

function revalidateAdmin() {
  revalidatePath("/admin/guests");
  revalidatePath("/admin/dashboard");
}

function firstIssue(issues: { message: string }[]): string {
  return issues[0]?.message ?? "Girdiğiniz bilgiler geçersiz.";
}
