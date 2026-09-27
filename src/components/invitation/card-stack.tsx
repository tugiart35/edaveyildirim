"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { computeStackFrame } from "@/lib/stack/stack-frame";
import { trUpper } from "@/lib/utils/text";

export interface StackCard {
  id: string;
  label: string;
  content: ReactNode;
  /** Kart başlığının sağındaki opsiyonel bağlantı. */
  action?: { href: string; label: string };
  /** Düğün tarihi geçtiğinde bu kart tamamen kaldırılır. */
  hideWhenPast?: boolean;
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
 * Dikkat: yapışkan öğenin kendisine `transform` uygulanmaz — hareket
 * kart *içeriğine* verilir (bkz. `.card-content`), aksi halde sticky
 * davranışı riske girer. Aynı nedenle atalarda `overflow: hidden` yoktur.
 */
export function CardStack({
  cards,
  weddingStartMs,
}: {
  cards: StackCard[];
  weddingStartMs: number;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState(false);

  // Düğün geçtiyse geri sayım kartı düşer. Sayfa statik üretildiği için
  // bu karar sunucuda verilemez.
  useEffect(() => {
    const check = () => setPast(Date.now() >= weddingStartMs);
    check();

    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [weddingStartMs]);

  const visible = past ? cards.filter((card) => !card.hideWhenPast) : cards;

  useScrollProgress(stackRef, visible.length);

  return (
    <div
      ref={stackRef}
      className="card-stack relative -mt-10 px-4 pb-10 sm:-mt-16 sm:px-6"
    >
      {visible.map((card, index) => (
        <section
          key={card.id}
          id={card.id}
          aria-labelledby={`${card.id}-label`}
          className="sticky mx-auto mb-4 max-w-5xl overflow-hidden rounded-(--card-radius) border border-beige bg-warm-white sm:mb-5"
          style={{
            top: `calc(${index} * var(--card-header) + var(--stack-gap))`,
            zIndex: index + 1,
          }}
        >
          <header className="flex h-(--card-header) items-center justify-between gap-4 border-b border-beige px-6 sm:px-10">
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

          <div className="flex min-h-[62svh] items-center justify-center px-6 py-14 sm:px-10 sm:py-20">
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
