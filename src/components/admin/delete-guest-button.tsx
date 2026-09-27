"use client";

import { useRef, useState, useTransition } from "react";

import { deleteGuestAction } from "@/actions/guests";

/**
 * Davetli silme. Silmeden önce onay ister (şartname §29).
 *
 * Tarayıcının `confirm()` penceresi yerine `<dialog>` kullanılır: odak
 * tuzağı ve Esc davranışı aynı, ama sayfa bloke olmaz.
 */
export function DeleteGuestButton({ id, name }: { id: string; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const submitting = useRef(false);

  function remove() {
    if (submitting.current) return;
    submitting.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await deleteGuestAction(id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        dialogRef.current?.close();
      } finally {
        submitting.current = false;
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          dialogRef.current?.showModal();
        }}
        className="rounded-(--button-radius) border border-beige px-3 py-1.5 text-xs text-graphite transition-colors duration-200 hover:border-status-pending/40 hover:text-status-pending"
      >
        Sil
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`delete-${id}-title`}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-(--card-radius) border border-beige bg-warm-white p-0 text-charcoal backdrop:bg-charcoal/40"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id={`delete-${id}-title`} className="type-display text-lg">
            Davetli silinsin mi?
          </h2>

          <p className="text-sm leading-relaxed text-graphite">
            <span className="font-medium text-charcoal">{name}</span> ve varsa
            katılım cevabı kalıcı olarak silinecek. Bu kişiye gönderilmiş davet
            bağlantısı çalışmayı durdurur.
          </p>

          {error ? (
            <p role="alert" className="text-sm text-status-pending">
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isPending}
              className="rounded-(--button-radius) border border-beige px-4 py-2.5 text-sm text-graphite transition-colors duration-200 hover:text-charcoal disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="rounded-(--button-radius) bg-status-pending px-5 py-2.5 text-sm font-medium text-warm-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Siliniyor…" : "Sil"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
