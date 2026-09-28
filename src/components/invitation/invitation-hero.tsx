import Image from "next/image";

import { Hairline } from "@/components/invitation/primitives";
import { formatLongDate } from "@/lib/utils/date";
import { trUpper } from "@/lib/utils/text";
import { coupleNames, coupleTitle, monogram } from "@/lib/utils/wedding";
import type { Wedding } from "@/types";

/**
 * Davetiyenin kapağı.
 *
 * Üç görünüm vardır:
 *
 * 1. **Kapak çizimi** (`coverImage`) — çizim kendi zeminiyle bir bütündür,
 *    kırpılmadan ortalanır. Çift isimleri genelde çizimin içinde olduğu
 *    için tipografiyle tekrar edilmez.
 * 2. **Fotoğraf** (`primaryImage`) — tüm ekranı kaplar, üzerine yumuşak
 *    bir perde ve tipografi biner.
 * 3. **Hiçbiri** — baş harflerden monogram.
 */
export function InvitationHero({
  wedding,
  guestName,
}: {
  wedding: Wedding;
  guestName?: string;
}) {
  if (wedding.coverImage) {
    return (
      <CoverArtwork
        wedding={wedding}
        guestName={guestName}
        source={wedding.coverImage}
      />
    );
  }

  return <TypographicCover wedding={wedding} guestName={guestName} />;
}

/* -------------------------------------------------------------------------- */

/**
 * Çizim kapak.
 *
 * Zemin `warm-white`: çizimlerin kağıt rengiyle (#fefdf7) neredeyse
 * birebir aynı, böylece görselin kenarları belli olmaz ve çizim sayfanın
 * üstünde bir dikdörtgen gibi durmaz.
 */
function CoverArtwork({
  wedding,
  guestName,
  source,
}: {
  wedding: Wedding;
  guestName?: string;
  source: string;
}) {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center gap-8 bg-paper px-6 pt-14 pb-24 sm:gap-10 sm:pt-16 sm:pb-28">
      <Greeting name={guestName} />

      {/*
        Çizim kendi oranını korur; yalnızca üst sınırlar verilir. Sınır
        eskiden 54vh idi, çünkü altında tarih ve davet cümlesi vardı.
        İkisi de kalkınca çizim tek başına kaldı; 68vh onu ekranın
        ortasında küçük bir pul gibi bırakmıyor, selamlama ve kaydırma
        ipucuna da yer kalıyor.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={source}
        alt={`${coupleTitle(wedding)} düğün davetiyesi`}
        // Kapak ilk görülen şey: geciktirilmeden yüklenmeli.
        fetchPriority="high"
        decoding="async"
        className="h-auto w-auto max-h-[min(68vh,40rem)] max-w-full object-contain"
      />

      {/*
        Çizimin altında yazı yoktur. Davet cümlesi de tarih de çizimin
        kendi içinde, kendi el yazısıyla duruyor; altlarına dizilen
        matbu kopyaları aynı şeyi ikinci kez, başka bir sesle
        söylüyordu. (İkisi de yazılı kapakta görünmeye devam eder.)
      */}
      <ScrollHint tone="light" />
    </section>
  );
}

/** Fotoğraflı ya da monogramlı klasik kapak. */
function TypographicCover({
  wedding,
  guestName,
}: {
  wedding: Wedding;
  guestName?: string;
}) {
  const [first, second] = coupleNames(wedding);
  const hasPhoto = Boolean(wedding.primaryImage);

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24">
      {wedding.primaryImage ? (
        <>
          <Image
            src={wedding.primaryImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Metnin okunabilirliği için yumuşak perde. */}
          <div aria-hidden className="absolute inset-0 bg-ivory/78" />
        </>
      ) : null}

      {/* Basılı davetiye hissi veren ince çerçeve. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 rounded-(--card-radius) border border-beige sm:inset-8"
      />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <Greeting name={guestName} className="mb-10" />

        <p className="text-[0.7rem] tracking-[0.5em] text-gold">
          {monogram(wedding)}
        </p>

        <Hairline className="mt-6 w-10" />

        <h1 className="type-display mt-10 leading-[0.95] text-charcoal">
          <span className="block text-6xl sm:text-7xl lg:text-8xl">
            {first}
          </span>
          <span className="my-4 block text-2xl text-gold sm:text-3xl">&</span>
          <span className="block text-6xl sm:text-7xl lg:text-8xl">
            {second}
          </span>
        </h1>

        <Hairline className="mt-10 w-10" />

        <p className="mt-8 text-xs tracking-(--label-tracking) text-graphite sm:text-sm">
          {trUpper(formatLongDate(wedding.eventDate))}
        </p>

        {wedding.invitationText ? (
          <p className="mt-10 max-w-sm text-balance text-sm leading-loose text-graphite">
            {wedding.invitationText}
          </p>
        ) : null}
      </div>

      <ScrollHint tone={hasPhoto ? "onPhoto" : "light"} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Greeting({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;

  return (
    <p className={`text-sm leading-relaxed text-graphite ${className ?? ""}`}>
      Sevgili <span className="type-display text-xl text-charcoal">{name}</span>
      ,
    </p>
  );
}

/** Aşağı kaydırmayı ima eden ince çizgi. Dekoratif, ekran okuyucudan gizli. */
function ScrollHint({ tone }: { tone: "light" | "onPhoto" }) {
  return (
    <span
      aria-hidden
      className={`absolute bottom-6 left-1/2 block h-10 w-px -translate-x-1/2 overflow-hidden sm:bottom-10 sm:h-14 ${
        tone === "onPhoto" ? "bg-charcoal/15" : "bg-beige"
      }`}
    >
      <span className="scroll-hint absolute inset-x-0 top-0 block h-5 bg-gold" />
    </span>
  );
}
