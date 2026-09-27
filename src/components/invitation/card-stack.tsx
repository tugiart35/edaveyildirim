"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { trUpper } from "@/lib/utils/text";

export interface StackCard {
  id: string;
  label: string;
  content: ReactNode;
  /** Kart başlığının sağındaki opsiyonel bağlantı. */
  action?: { href: string; label: string };
  /** Düğün tarihi geçtiğinde bu kart tamamen kaldırılır. */
  hideWhenPast?: boolean;
}

/**
 * Üst üste yığılan kart akışı.
 *
 * Her kart `position: sticky` ile kendi sırasına göre bir üst boşlukta
 * durur; bir sonraki kart üzerine kayarken öncekinin yalnızca başlık
 * şeridi görünür kalır. Böylece sayfa aşağı akan bir landing page değil,
 * ilerledikçe biriken bir deste gibi okunur.
 *
 * Yığılma saf CSS'tir. Bu bileşenin istemci tarafında olmasının tek
 * nedeni, düğün geçtiğinde geri sayım kartını listeden düşürmektir —
 * sayfa statik üretildiği için bu karar sunucuda verilemez.
 *
 * Dikkat: yapışkan öğenin kendisine `transform` uygulanmamalıdır
 * (`Reveal` yalnızca kart içeriğinde kullanılır), aksi halde sticky bozulur.
 */
export function CardStack({
  cards,
  weddingStartMs,
}: {
  cards: StackCard[];
  weddingStartMs: number;
}) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const check = () => setPast(Date.now() >= weddingStartMs);
    check();

    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [weddingStartMs]);

  const visible = past ? cards.filter((card) => !card.hideWhenPast) : cards;

  return (
    <div className="card-stack relative -mt-10 px-4 pb-10 sm:px-6 sm:-mt-16">
      {visible.map((card, index) => (
        <section
          key={card.id}
          id={card.id}
          aria-labelledby={`${card.id}-label`}
          className="sticky mx-auto mb-4 max-w-5xl overflow-hidden rounded-[1.5rem] border border-beige bg-warm-white shadow-[0_6px_36px_rgba(42,39,36,0.06)] sm:mb-5 sm:rounded-[1.75rem]"
          style={{
            top: `calc(${index} * var(--card-header) + var(--stack-gap))`,
            zIndex: index + 1,
          }}
        >
          <header className="flex h-(--card-header) items-center justify-between gap-4 border-b border-beige px-6 sm:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden className="h-px w-6 shrink-0 bg-gold-soft" />
              <h2
                id={`${card.id}-label`}
                className="truncate text-[0.65rem] tracking-[0.35em] text-stone"
              >
                {trUpper(card.label)}
              </h2>
            </div>

            {card.action ? (
              <a
                href={card.action.href}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 rounded-full border border-charcoal/20 px-5 py-2 text-[0.6rem] tracking-[0.2em] text-charcoal transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                {trUpper(card.action.label)}
                <span aria-hidden className="ml-1.5">
                  ↗
                </span>
              </a>
            ) : null}
          </header>

          <div className="flex min-h-[62svh] items-center justify-center px-6 py-14 sm:px-10 sm:py-20">
            <div className="w-full max-w-xl">{card.content}</div>
          </div>
        </section>
      ))}
    </div>
  );
}
