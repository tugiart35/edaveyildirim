"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { createGuestAction, updateGuestAction } from "@/actions/guests";
import type { GuestWithRsvp } from "@/types";

const GROUP_SUGGESTIONS = [
  "Gelin Ailesi",
  "Damat Ailesi",
  "Arkadaşlar",
  "İş",
  "Akraba",
  "Diğer",
];

/**
 * Davetli ekleme ve düzenleme formu (şartname §28-29).
 *
 * Yerel `<dialog>` öğesi kullanılır: odak tuzağı, Esc ile kapatma ve
 * arka planın devre dışı kalması tarayıcıdan gelir, kütüphane gerekmez.
 */
export function GuestFormDialog({
  guest,
  triggerLabel,
  variant = "primary",
}: {
  /** Verilirse düzenleme, verilmezse yeni davetli. */
  guest?: GuestWithRsvp;
  triggerLabel: string;
  variant?: "primary" | "ghost";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const submitting = useRef(false);

  const editing = guest !== undefined;
  const attendingCount =
    guest?.rsvp?.status === "attending" ? guest.rsvp.attendingCount : 0;

  const [limit, setLimit] = useState(guest?.invitationLimit ?? 1);

  /**
   * Açıklık React state'inde tutulur, `<dialog>` ona göre sürülür.
   * Doğrudan `showModal()` çağırmak ref'i render sırasında okumayı
   * gerektirirdi; bu yol hem lint'e hem React kurallarına uyar.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  function open() {
    setError(null);
    setLimit(guest?.invitationLimit ?? 1);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;

    const data = new FormData(event.currentTarget);
    const input = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      groupName: String(data.get("groupName") ?? ""),
      invitationLimit: Number(data.get("invitationLimit") ?? 1),
    };

    setError(null);

    startTransition(async () => {
      try {
        const result = editing
          ? await updateGuestAction(guest.id, input)
          : await createGuestAction(input);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        close();
      } finally {
        submitting.current = false;
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          variant === "primary"
            ? "rounded-(--button-radius) bg-charcoal px-5 py-2.5 text-sm font-medium text-warm-white transition-opacity duration-200 hover:opacity-90"
            : "rounded-(--button-radius) border border-beige px-3 py-1.5 text-xs text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal"
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        // Esc ile kapatıldığında state ile DOM ayrışmamalı.
        onClose={() => setIsOpen(false)}
        aria-labelledby="guest-form-title"
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-(--card-radius) border border-beige bg-warm-white p-0 text-charcoal backdrop:bg-charcoal/40"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <h2 id="guest-form-title" className="type-display text-lg">
            {editing ? "Davetliyi Düzenle" : "Yeni Davetli"}
          </h2>

          <Field label="Ad Soyad" htmlFor="name" required>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={120}
              defaultValue={guest?.name ?? ""}
              disabled={isPending}
              autoComplete="off"
              className={inputClass}
            />
          </Field>

          <Field label="Telefon" htmlFor="phone" hint="WhatsApp paylaşımı için">
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              maxLength={30}
              placeholder="+905551234567"
              defaultValue={guest?.phone ?? ""}
              disabled={isPending}
              autoComplete="off"
              className={inputClass}
            />
          </Field>

          <Field label="Grup" htmlFor="groupName">
            <input
              id="groupName"
              name="groupName"
              type="text"
              list="guest-groups"
              maxLength={60}
              defaultValue={guest?.groupName ?? ""}
              disabled={isPending}
              autoComplete="off"
              className={inputClass}
            />
            <datalist id="guest-groups">
              {GROUP_SUGGESTIONS.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </Field>

          <Field
            label="Maksimum Davetli Sayısı"
            htmlFor="invitationLimit"
            required
            hint="Bu kişinin kaç kişiyle gelebileceği"
          >
            <input
              id="invitationLimit"
              name="invitationLimit"
              type="number"
              min={1}
              max={50}
              required
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              disabled={isPending}
              className={inputClass}
            />
          </Field>

          {editing && attendingCount > limit ? (
            <p className="rounded-(--button-radius) bg-status-pending-bg px-3 py-2 text-xs leading-relaxed text-status-pending">
              Bu davetli {attendingCount} kişi olarak katılacağını bildirmişti.
              Hakkı {limit} kişiye düşürülürse mevcut cevabı hakkını aşmış
              olarak kalır.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-status-pending">
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              className="rounded-(--button-radius) border border-beige px-4 py-2.5 text-sm text-graphite transition-colors duration-200 hover:text-charcoal disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-(--button-radius) bg-charcoal px-5 py-2.5 text-sm font-medium text-warm-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

const inputClass =
  "w-full rounded-(--button-radius) border border-beige bg-warm-white px-3 py-2.5 text-sm text-charcoal transition-colors duration-200 focus:border-gold disabled:opacity-50";

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-graphite">
        {label}
        {required ? (
          <span className="ml-0.5 text-status-pending">*</span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-stone">{hint}</p> : null}
    </div>
  );
}
