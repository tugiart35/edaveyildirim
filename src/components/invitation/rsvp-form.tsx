"use client";

import { useRef, useState, useTransition } from "react";

import { submitRsvp } from "@/actions/rsvp";
import { cn } from "@/lib/utils/cn";
import { MAX_NOTE_LENGTH } from "@/lib/validation/schemas";
import type { GuestWithRsvp, Rsvp, RsvpStatus } from "@/types";

type View =
  /** Henüz seçim yapılmadı: iki büyük buton. */
  | { kind: "ask" }
  /** Seçim yapıldı, ayrıntılar giriliyor. */
  | { kind: "form"; status: RsvpStatus }
  /** Cevap kaydedildi. */
  | { kind: "saved"; rsvp: Rsvp; justSubmitted: boolean };

export function RsvpForm({ guest }: { guest: GuestWithRsvp }) {
  const [view, setView] = useState<View>(() =>
    guest.rsvp
      ? { kind: "saved", rsvp: guest.rsvp, justSubmitted: false }
      : { kind: "ask" },
  );
  const [count, setCount] = useState(
    guest.rsvp?.status === "attending" ? guest.rsvp.attendingCount : 1,
  );
  const [note, setNote] = useState(guest.rsvp?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * Çift gönderime karşı senkron kilit.
   *
   * `isPending` yalnızca bir sonraki render'da true olur; aynı tick içinde
   * gelen ikinci tıklama `disabled` özniteliğini henüz görmez. Ref anında
   * güncellendiği için o boşluğu kapatır (şartname §42).
   */
  const submitting = useRef(false);

  function send(status: RsvpStatus) {
    if (submitting.current) return;
    submitting.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await submitRsvp(guest.token, {
          status,
          attendingCount: status === "attending" ? count : 0,
          note: note.trim() === "" ? null : note,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setView({ kind: "saved", rsvp: result.rsvp, justSubmitted: true });
      } finally {
        submitting.current = false;
      }
    });
  }

  if (view.kind === "saved") {
    return (
      <RsvpSaved
        rsvp={view.rsvp}
        justSubmitted={view.justSubmitted}
        onEdit={() => {
          setError(null);
          setView({ kind: "ask" });
        }}
      />
    );
  }

  if (view.kind === "ask") {
    return (
      <div className="mt-12 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => setView({ kind: "form", status: "attending" })}
          className="w-full rounded-(--button-radius) bg-charcoal px-8 py-4 text-[0.7rem] tracking-[0.2em] text-ivory transition-opacity duration-300 hover:opacity-85 sm:w-auto"
        >
          EVET, KATILACAĞIM
        </button>
        <button
          type="button"
          onClick={() => setView({ kind: "form", status: "declined" })}
          className="w-full rounded-(--button-radius) border border-charcoal/25 px-8 py-4 text-[0.7rem] tracking-[0.2em] text-graphite transition-colors duration-300 hover:border-charcoal/50 hover:text-charcoal sm:w-auto"
        >
          NE YAZIK Kİ KATILAMAYACAĞIM
        </button>
      </div>
    );
  }

  const attending = view.status === "attending";

  return (
    <div className="mt-12 flex w-full flex-col items-center">
      {attending ? (
        <PeopleStepper
          value={count}
          max={guest.invitationLimit}
          disabled={isPending}
          onChange={setCount}
        />
      ) : (
        <p className="text-balance text-sm leading-loose text-graphite">
          Bildirdiğiniz için teşekkür ederiz. Dilerseniz bir not
          bırakabilirsiniz.
        </p>
      )}

      <NoteField value={note} disabled={isPending} onChange={setNote} />

      {error ? (
        <p role="alert" className="mt-6 text-sm text-status-pending">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex w-full flex-col items-center gap-4">
        <button
          type="button"
          disabled={isPending}
          onClick={() => send(view.status)}
          className="w-full rounded-(--button-radius) bg-charcoal px-8 py-4 text-[0.7rem] tracking-[0.2em] text-ivory transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-56"
        >
          {isPending ? "GÖNDERİLİYOR…" : "GÖNDER"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            setView({ kind: "ask" });
          }}
          className="text-[0.7rem] tracking-[0.15em] text-stone underline-offset-4 transition-colors duration-300 hover:text-charcoal disabled:opacity-50"
        >
          GERİ
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Kişi sayısı seçici. Davet hakkı 1 ise seçim yapılacak bir şey yoktur. */
function PeopleStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  if (max === 1) {
    return (
      <p className="text-sm leading-loose text-graphite">
        Sizi <span className="type-display text-xl text-charcoal">1 kişi</span>{" "}
        olarak bekliyoruz.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p id="people-label" className="text-sm text-graphite">
        Kaç kişi katılacaksınız?
      </p>

      <div className="mt-6 flex items-center gap-6">
        <StepperButton
          label="Bir kişi azalt"
          disabled={disabled || value <= 1}
          onClick={() => onChange(value - 1)}
        >
          −
        </StepperButton>

        <output
          aria-live="polite"
          aria-labelledby="people-label"
          className="min-w-28 text-center type-display text-3xl text-charcoal tabular-nums"
        >
          {value} kişi
        </output>

        <StepperButton
          label="Bir kişi artır"
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </StepperButton>
      </div>

      <p className="mt-4 text-xs text-stone">
        Sizin için {max} kişilik yer ayrıldı.
      </p>
    </div>
  );
}

function StepperButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 items-center justify-center rounded-full border border-charcoal/25 text-lg text-charcoal transition-colors duration-200 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:border-beige disabled:text-beige"
    >
      {children}
    </button>
  );
}

function NoteField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-12 w-full max-w-sm text-left">
      <label
        htmlFor="rsvp-note"
        className="block text-[0.7rem] tracking-[0.15em] text-stone"
      >
        BİZE İLETMEK İSTEDİĞİNİZ BİR NOT VAR MI?
      </label>

      <textarea
        id="rsvp-note"
        rows={3}
        maxLength={MAX_NOTE_LENGTH}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full resize-none border border-beige bg-warm-white px-4 py-3 text-sm leading-relaxed text-charcoal transition-colors duration-200 placeholder:text-stone focus:border-gold-soft disabled:opacity-50"
        placeholder="İsteğe bağlı"
      />

      <p className="mt-2 text-right text-xs text-stone tabular-nums">
        {value.length} / {MAX_NOTE_LENGTH}
      </p>
    </div>
  );
}

/** Kaydedilmiş cevabın özeti ve değiştirme bağlantısı (şartname §18-19). */
function RsvpSaved({
  rsvp,
  justSubmitted,
  onEdit,
}: {
  rsvp: Rsvp;
  justSubmitted: boolean;
  onEdit: () => void;
}) {
  const attending = rsvp.status === "attending";

  return (
    <div className="mt-12 flex w-full flex-col items-center text-center">
      {justSubmitted ? (
        attending ? (
          <>
            <p className="type-display text-3xl text-charcoal">
              Teşekkür ederiz 🤍
            </p>
            <p className="mt-6 max-w-sm text-balance text-sm leading-loose text-graphite">
              Sizi aramızda görmek için sabırsızlanıyoruz.
            </p>
            <p className="mt-4 text-sm text-graphite">
              {rsvp.attendingCount} kişi olarak katılımınız kaydedildi.
            </p>
          </>
        ) : (
          <>
            <p className="type-display text-3xl text-charcoal">
              Bilgi verdiğiniz için teşekkür ederiz.
            </p>
            <p className="mt-6 max-w-sm text-balance text-sm leading-loose text-graphite">
              Bu özel günümüzde aramızda olamayacağınız için üzgünüz.
              Sevgilerimizle.
            </p>
          </>
        )
      ) : (
        <>
          <p className="text-sm text-graphite">Katılım durumunuz</p>
          <p
            className={cn(
              "mt-4 type-display text-3xl ",
              attending ? "text-status-attending" : "text-graphite",
            )}
          >
            {attending ? "✓ Geliyorum" : "Katılamıyorum"}
          </p>
          {attending ? (
            <p className="mt-3 text-sm text-graphite">
              {rsvp.attendingCount} kişi
            </p>
          ) : null}
        </>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="mt-10 rounded-(--button-radius) border border-charcoal/25 px-8 py-3.5 text-[0.7rem] tracking-[0.2em] text-charcoal transition-colors duration-300 hover:border-gold hover:text-gold"
      >
        CEVABIMI DEĞİŞTİR
      </button>

      <p className="mt-6 text-xs leading-relaxed text-stone">
        Cevabınızı düğüne kadar dilediğiniz zaman değiştirebilirsiniz.
      </p>
    </div>
  );
}
