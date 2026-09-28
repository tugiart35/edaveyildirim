import { z } from "zod";

import { THEMES } from "@/types";

export const MAX_NOTE_LENGTH = 500;
export const MAX_GALLERY_IMAGES = 5;
export const MAX_PANELS = 8;

/* -------------------------------------------------------------------------- */
/*                                   Wedding                                  */
/* -------------------------------------------------------------------------- */

export const weddingInputSchema = z.object({
  brideName: z.string().trim().min(1, "Gelinin adı gerekli.").max(80),
  groomName: z.string().trim().min(1, "Damadın adı gerekli.").max(80),
  nameOrder: z.enum(["bride_first", "groom_first"]),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalı."),
  eventTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saat SS:DD biçiminde olmalı."),
  timezone: z.string().trim().min(1),
  venueName: z.string().trim().min(1, "Mekân adı gerekli.").max(120),
  venueAddress: z.string().trim().max(300).nullable(),
  mapsUrl: z
    .union([z.url("Geçerli bir bağlantı girin."), z.literal("")])
    .nullable(),
  invitationText: z.string().trim().max(600).nullable(),
  theme: z.enum(THEMES as unknown as [string, ...string[]]),
  coverImage: z.string().nullable(),
  primaryImage: z.string().nullable(),
  galleryImages: z.array(z.string()).max(MAX_GALLERY_IMAGES),
  panels: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Panel etiketi gerekli.").max(40),
        image: z.string().trim().min(1, "Panel görseli gerekli."),
        countdown: z.boolean().optional(),
      }),
    )
    .max(MAX_PANELS),
  musicUrl: z.string().nullable(),
  enableChildSplit: z.boolean(),
});

export type WeddingInput = z.infer<typeof weddingInputSchema>;

/* -------------------------------------------------------------------------- */
/*                                    Guest                                   */
/* -------------------------------------------------------------------------- */

export const guestInputSchema = z.object({
  name: z.string().trim().min(1, "Ad soyad gerekli.").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  groupName: z
    .string()
    .trim()
    .max(60)
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  invitationLimit: z
    .number()
    .int("Davet hakkı tam sayı olmalı.")
    .min(1, "Davet hakkı en az 1 olmalı.")
    .max(50, "Davet hakkı en fazla 50 olabilir."),
});

export type GuestInput = z.infer<typeof guestInputSchema>;

/* -------------------------------------------------------------------------- */
/*                                    RSVP                                    */
/* -------------------------------------------------------------------------- */

/**
 * RSVP şeması. `invitationLimit` iki tabloyu ilgilendirdiği için burada
 * doğrulanamaz; sunucu tarafında davetli kaydı okunarak kontrol edilir
 * (bkz. `rsvpInputSchemaFor`).
 */
export const rsvpInputSchema = z
  .object({
    status: z.enum(["attending", "declined"]),
    attendingCount: z.number().int().min(0),
    note: z
      .string()
      .trim()
      .max(
        MAX_NOTE_LENGTH,
        `Not en fazla ${MAX_NOTE_LENGTH} karakter olabilir.`,
      )
      .nullable()
      .transform((value) => (value === "" ? null : value)),
  })
  .refine(
    (value) => value.status !== "attending" || value.attendingCount >= 1,
    {
      message: "Katılacaksanız en az 1 kişi seçmelisiniz.",
      path: ["attendingCount"],
    },
  )
  .refine(
    (value) => value.status !== "declined" || value.attendingCount === 0,
    {
      message: "Katılmayacaksanız kişi sayısı 0 olmalıdır.",
      path: ["attendingCount"],
    },
  );

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

/**
 * Belirli bir davetlinin davet hakkına göre daraltılmış RSVP şeması.
 * Sunucu bu şemayı veritabanından okuduğu limitle kurar; istemciden gelen
 * limit değerine asla güvenilmez.
 */
export function rsvpInputSchemaFor(invitationLimit: number) {
  return rsvpInputSchema.refine(
    (value) =>
      value.status !== "attending" || value.attendingCount <= invitationLimit,
    {
      message: `En fazla ${invitationLimit} kişi seçebilirsiniz.`,
      path: ["attendingCount"],
    },
  );
}
