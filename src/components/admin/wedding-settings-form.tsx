"use client";

import { useRef, useState, useTransition } from "react";

import { PanelFields } from "@/components/admin/panel-fields";
import { ThemePicker } from "@/components/admin/theme-picker";
import { MAX_GALLERY_IMAGES } from "@/lib/validation/schemas";
import type { InvitationPanel, NameOrder, Theme, Wedding } from "@/types";

export function WeddingSettingsForm({ wedding }: { wedding: Wedding }) {
  const [theme, setTheme] = useState<Theme>(wedding.theme);
  const [nameOrder, setNameOrder] = useState<NameOrder>(wedding.nameOrder);
  const [coverImage, setCoverImage] = useState(wedding.coverImage ?? "");
  const [primaryImage, setPrimaryImage] = useState(wedding.primaryImage ?? "");
  const [gallery, setGallery] = useState<string[]>(wedding.galleryImages);
  const [panels, setPanels] = useState<InvitationPanel[]>(wedding.panels);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const submitting = useRef(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;

    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();

    const input = {
      brideName: text("brideName"),
      groomName: text("groomName"),
      nameOrder,
      eventDate: text("eventDate"),
      eventTime: text("eventTime"),
      timezone: text("timezone") || "Europe/Istanbul",
      venueName: text("venueName"),
      venueAddress: text("venueAddress") || null,
      mapsUrl: text("mapsUrl") || null,
      invitationText: text("invitationText") || null,
      theme,
      coverImage: coverImage.trim() || null,
      primaryImage: primaryImage.trim() || null,
      galleryImages: gallery.filter((src) => src.trim() !== ""),
      panels: panels.filter(
        (panel) => panel.label.trim() !== "" && panel.image.trim() !== "",
      ),
      musicUrl: text("musicUrl") || null,
      enableChildSplit: wedding.enableChildSplit,
    };

    setError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        // Server action'ı dinamik yükle: form ilk açılışta daha hafif.
        const { updateWeddingAction } = await import("@/actions/wedding");
        const result = await updateWeddingAction(input);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setSaved(true);
      } finally {
        submitting.current = false;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Section title="Çift">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Gelinin adı" htmlFor="brideName" required>
            <input
              id="brideName"
              name="brideName"
              required
              maxLength={80}
              defaultValue={wedding.brideName}
              disabled={isPending}
              className={inputClass}
            />
          </Field>

          <Field label="Damadın adı" htmlFor="groomName" required>
            <input
              id="groomName"
              name="groomName"
              required
              maxLength={80}
              defaultValue={wedding.groomName}
              disabled={isPending}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Davetiyede isim sırası" htmlFor="nameOrder">
          <select
            id="nameOrder"
            value={nameOrder}
            onChange={(event) => setNameOrder(event.target.value as NameOrder)}
            disabled={isPending}
            className={inputClass}
          >
            <option value="bride_first">Önce gelin</option>
            <option value="groom_first">Önce damat</option>
          </select>
        </Field>
      </Section>

      <Section title="Düğün">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tarih" htmlFor="eventDate" required>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              defaultValue={wedding.eventDate}
              disabled={isPending}
              className={inputClass}
            />
          </Field>

          <Field label="Başlangıç saati" htmlFor="eventTime" required>
            <input
              id="eventTime"
              name="eventTime"
              type="time"
              required
              defaultValue={wedding.eventTime}
              disabled={isPending}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Mekân adı" htmlFor="venueName" required>
          <input
            id="venueName"
            name="venueName"
            required
            maxLength={120}
            defaultValue={wedding.venueName}
            disabled={isPending}
            className={inputClass}
          />
        </Field>

        <Field label="Adres" htmlFor="venueAddress">
          <input
            id="venueAddress"
            name="venueAddress"
            maxLength={300}
            defaultValue={wedding.venueAddress ?? ""}
            disabled={isPending}
            className={inputClass}
          />
        </Field>

        <Field
          label="Google Maps bağlantısı"
          htmlFor="mapsUrl"
          hint="Boş bırakılırsa davetiyedeki Yol Tarifi butonu gizlenir"
        >
          <input
            id="mapsUrl"
            name="mapsUrl"
            type="url"
            placeholder="https://maps.google.com/?q=..."
            defaultValue={wedding.mapsUrl ?? ""}
            disabled={isPending}
            className={inputClass}
          />
        </Field>

        <Field
          label="Saat dilimi"
          htmlFor="timezone"
          hint="Geri sayım bu saat dilimine göre hesaplanır"
        >
          <input
            id="timezone"
            name="timezone"
            defaultValue={wedding.timezone}
            disabled={isPending}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Davetiye metni">
        <Field label="Davet cümlesi" htmlFor="invitationText">
          <textarea
            id="invitationText"
            name="invitationText"
            rows={3}
            maxLength={600}
            defaultValue={wedding.invitationText ?? ""}
            disabled={isPending}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </Section>

      <Section title="Çizim panelleri">
        <PanelFields
          panels={panels}
          disabled={isPending}
          onChange={setPanels}
        />
      </Section>

      <Section title="Görseller">
        <ImageField
          id="coverImage"
          label="Kapak görseli"
          hint="Davetiyeyi açanın gördüğü ilk şey. Çizim veya tasarım; kırpılmadan, kendi zeminiyle gösterilir. Çift isimlerini içeriyorsa tipografi tekrarlanmaz."
          value={coverImage}
          disabled={isPending}
          onChange={setCoverImage}
        />

        <ImageField
          id="primaryImage"
          label="Ana fotoğraf"
          hint="Kapak görseli yoksa kullanılır: tüm ekranı kaplar, üzerine isimler biner. İkisi de boşsa baş harflerden monogram gösterilir."
          value={primaryImage}
          disabled={isPending}
          onChange={setPrimaryImage}
        />

        <GalleryField
          images={gallery}
          disabled={isPending}
          onChange={setGallery}
        />

        <Field
          label="Fon müziği"
          htmlFor="musicUrl"
          hint="Tarayıcı kısıtları nedeniyle otomatik başlamaz; ziyaretçi butona basar."
        >
          <input
            id="musicUrl"
            name="musicUrl"
            placeholder="/mock/muzik.mp3"
            defaultValue={wedding.musicUrl ?? ""}
            disabled={isPending}
            className={inputClass}
          />
        </Field>

        <p className="rounded-(--button-radius) bg-sand px-3 py-2 text-xs leading-relaxed text-graphite">
          Şimdilik dosya yolu yazılıyor. Dosya yükleme Adım 11&rsquo;de
          eklenecek; alanlar aynı kalacak, yanlarına bir yükleme butonu gelecek.
        </p>
      </Section>

      <Section title="Tema">
        <ThemePicker value={theme} disabled={isPending} onChange={setTheme} />
      </Section>

      {error ? (
        <p role="alert" className="text-sm text-status-pending">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-(--button-radius) bg-charcoal px-6 py-3 text-sm font-medium text-warm-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </button>

        <p role="status" className="text-sm text-status-attending">
          {saved && !isPending ? "Bilgiler kaydedildi." : ""}
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function ImageField({
  id,
  label,
  hint,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-graphite">
        {label}
      </label>

      <div className="flex items-start gap-3">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/mock/hero.jpg"
          disabled={disabled}
          className={inputClass}
        />
        <Thumbnail src={value} alt={label} />
      </div>

      {hint ? <p className="text-xs text-stone">{hint}</p> : null}
    </div>
  );
}

function GalleryField({
  images,
  disabled,
  onChange,
}: {
  images: string[];
  disabled: boolean;
  onChange: (images: string[]) => void;
}) {
  const full = images.length >= MAX_GALLERY_IMAGES;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-graphite">
        Galeri fotoğrafları{" "}
        <span className="text-xs text-stone">
          (en fazla {MAX_GALLERY_IMAGES})
        </span>
      </p>

      {images.length === 0 ? (
        <p className="text-xs text-stone">
          Fotoğraf eklenmezse davetiyedeki &ldquo;Biz&rdquo; kartı gizlenir.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {images.map((src, index) => (
            <li key={index} className="flex items-start gap-3">
              <label htmlFor={`gallery-${index}`} className="sr-only">
                {index + 1}. fotoğraf
              </label>
              <input
                id={`gallery-${index}`}
                value={src}
                onChange={(event) => {
                  const next = [...images];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                disabled={disabled}
                className={inputClass}
              />
              <Thumbnail src={src} alt={`${index + 1}. fotoğraf`} />
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                aria-label={`${index + 1}. fotoğrafı kaldır`}
                className="mt-1 shrink-0 rounded-(--button-radius) border border-beige px-3 py-2 text-xs text-graphite transition-colors duration-200 hover:border-status-pending/40 hover:text-status-pending disabled:opacity-50"
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled || full}
        onClick={() => onChange([...images, ""])}
        className="mt-1 w-fit rounded-(--button-radius) border border-beige px-4 py-2 text-xs text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
      >
        {full ? `En fazla ${MAX_GALLERY_IMAGES} fotoğraf` : "Fotoğraf ekle"}
      </button>
    </div>
  );
}

/**
 * Küçük önizleme.
 *
 * `next/image` yerine düz `<img>`: buraya kullanıcı elle yol yazıyor,
 * geçersiz bir değer optimizasyon katmanında hata üretirdi. Önizleme
 * sessizce boş kalmalı.
 */
function Thumbnail({ src, alt }: { src: string; alt: string }) {
  if (src.trim() === "") {
    return (
      <div
        aria-hidden
        className="size-11 shrink-0 rounded-(--button-radius) border border-dashed border-beige"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-11 shrink-0 rounded-(--button-radius) border border-beige object-cover"
    />
  );
}

const inputClass =
  "w-full min-w-0 rounded-(--button-radius) border border-beige bg-warm-white px-3 py-2.5 text-sm text-charcoal transition-colors duration-200 focus:border-gold disabled:opacity-50";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-(--card-radius) border border-beige bg-warm-white p-5 sm:p-6">
      <h2 className="type-display text-base text-charcoal">{title}</h2>
      {children}
    </section>
  );
}

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
    <div className="flex min-w-0 flex-col gap-1.5">
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
