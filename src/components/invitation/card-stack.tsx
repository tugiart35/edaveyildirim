"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

import { computeStackFrame } from "@/lib/stack/stack-frame";
import { trUpper } from "@/lib/utils/text";

export interface StackCard {
  id: string;
  label: string;
  content: ReactNode;
  /** Kart başlığının sağındaki opsiyonel bağlantı. */
  action?: { href: string; label: string };
  /**
   * İçeriği okuma sütununa sıkıştırmaz, kartın tüm genişliğini verir.
   * Galeri gibi görsel içerikler içindir; metin bloklarında kullanılmaz.
   */
  wide?: boolean;
}

/**
 * Üst üste yığılan kart akışı.
 *
 * Her kart `position: sticky` ile sırasına göre artan bir üst boşlukta
 * durur; bir sonraki kart üzerine kayarken öncekinin yalnızca başlık
 * şeridi görünür kalır. Sayfa aşağı akan bir landing page değil,
 * ilerledikçe biriken bir deste gibi okunur.
 *
 * Bir kart yapıştıktan sonra ekranda ona kalan yer sabittir: altındaki
 * boşluğa bir sonraki kart oturur. Bu yüzden kart yüksekliği o pay ile
 * sınırlanır (`--card-room`) ve sığmayan içerik kartın içinde kaydırılır;
 * aksi halde uzun bir kartın alt kısmı sonraki kartın altında kalıp hiçbir
 * kaydırma noktasında görünmüyordu.
 *
 * Dikkat: yapışkan öğenin kendisine `transform` uygulanmaz — hareket
 * kart *içeriğine* verilir (bkz. `.card-content`), aksi halde sticky
 * davranışı riske girer. Aynı nedenle atalarda `overflow: hidden` yoktur.
 */
export function CardStack({ cards }: { cards: StackCard[] }) {
  const stackRef = useRef<HTMLDivElement>(null);

  useScrollProgress(stackRef, cards.length);

  return (
    <div
      ref={stackRef}
      className="card-stack relative -mt-10 px-4 pb-10 sm:-mt-16 sm:px-6"
    >
      {cards.map((card, index) => (
        <section
          key={card.id}
          id={card.id}
          aria-labelledby={`${card.id}-label`}
          className="sticky mx-auto mb-4 flex max-w-5xl flex-col overflow-hidden rounded-(--card-radius) border border-beige bg-warm-white sm:mb-5"
          style={
            {
              "--pin-top": `calc(${index} * var(--card-header) + var(--stack-gap))`,
              top: "var(--pin-top)",
              zIndex: index + 1,
            } as CSSProperties
          }
        >
          <header className="flex h-(--card-header) shrink-0 items-center justify-between gap-4 border-b border-beige px-6 sm:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="card-rule h-px shrink-0 bg-gold-soft"
              />
              <h2
                id={`${card.id}-label`}
                className="card-label truncate text-[0.65rem] tracking-(--label-tracking)"
              >
                {trUpper(card.label)}
              </h2>
            </div>

            {card.action ? (
              <a
                href={card.action.href}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 rounded-(--button-radius) border border-charcoal/20 px-5 py-2 text-[0.6rem] tracking-[0.2em] text-charcoal transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                {trUpper(card.action.label)}
                <span aria-hidden className="ml-1.5">
                  ↗
                </span>
              </a>
            ) : null}
          </header>

          <div className="card-body flex flex-1 px-6 sm:px-10">
            <div
              className={
                card.wide
                  ? "card-content w-full"
                  : "card-content w-full max-w-xl"
              }
            >
              {card.content}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Her kaydırma karesinde kartların yerine oturma ilerlemesini (`--enter`)
 * ve okunmakta olan kartı (`data-active`) günceller.
 *
 * Kütüphane kullanılmaz: rAF ile sınırlanmış tek bir pasif dinleyici yeter.
 */
function useScrollProgress(
  stackRef: RefObject<HTMLDivElement | null>,
  cardCount: number,
) {
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const sections = Array.from(
        stack.querySelectorAll<HTMLElement>(":scope > section"),
      );

      // DOM okuması burada, hesap saf fonksiyonda (test edilebilir).
      const geometry = sections.map((section) => ({
        top: section.getBoundingClientRect().top,
        pinTop: Number.parseFloat(getComputedStyle(section).top) || 0,
      }));

      const { enter, activeIndex } = computeStackFrame(
        geometry,
        window.innerHeight,
      );

      for (const [index, section] of sections.entries()) {
        section.style.setProperty("--enter", enter[index].toFixed(3));
        section.dataset.active = String(index === activeIndex);
      }
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [stackRef, cardCount]);
}
