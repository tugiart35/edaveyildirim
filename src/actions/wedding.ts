"use server";

import { revalidatePath } from "next/cache";

import { updateWedding } from "@/lib/data";
import { weddingInputSchema } from "@/lib/validation/schemas";
import type { Wedding } from "@/types";

export type WeddingActionResult =
  { ok: true; wedding: Wedding } | { ok: false; error: string };

/**
 * Düğün bilgilerini günceller (şartname §36).
 *
 * Davetiye sayfaları statik olarak önceden üretildiği için değişiklikten
 * sonra hepsi yeniden doğrulanmalıdır; aksi halde ziyaretçiler eski
 * bilgileri görmeye devam eder.
 */
export async function updateWeddingAction(
  input: unknown,
): Promise<WeddingActionResult> {
  const parsed = weddingInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Girdiğiniz bilgiler geçersiz.",
    };
  }

  try {
    const wedding = await updateWedding(parsed.data);

    revalidatePath("/");
    revalidatePath("/invite/[token]", "page");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");

    return { ok: true, wedding };
  } catch {
    return {
      ok: false,
      error: "Bilgiler kaydedilemedi. Lütfen tekrar deneyin.",
    };
  }
}
