"use client";

import { useEffect } from "react";

/**
 * Sayfadaki `[data-reveal]` öğelerini izler ve viewport'a girdiklerinde
 * görünür işaretler. Bölümlerin kendisi server component kalabilsin diye
 * tek bir yerden çalışır.
 *
 * Kütüphane kullanılmaz: animasyon CSS'te, tetikleme IntersectionObserver'da.
 * Sonradan DOM'a eklenen öğeler (geri sayım, RSVP sonrası ekran) de yakalanır.
 */
export function ScrollReveal() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const reveal = (element: HTMLElement) => {
      element.dataset.visible = "true";
    };

    if (prefersReducedMotion) {
      const showAll = () => {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(reveal);
      };
      showAll();

      const mutations = new MutationObserver(showAll);
      mutations.observe(document.body, { childList: true, subtree: true });
      return () => mutations.disconnect();
    }

    const intersections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          intersections.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(
          '[data-reveal]:not([data-visible="true"])',
        )
        .forEach((element) => intersections.observe(element));
    };

    observeAll();

    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      intersections.disconnect();
    };
  }, []);

  // JavaScript çalışmazsa içerik gizli kalmamalı.
  return (
    <noscript>
      <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
    </noscript>
  );
}
