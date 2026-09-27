"use client";

import { useEffect, useState } from "react";

import { Reveal, Section, SectionLabel } from "@/components/invitation/primitives";
import { countdownTo, type CountdownParts } from "@/lib/utils/date";

const UNITS: Array<{ key: keyof CountdownParts; label: string }> = [
  { key: "days", label: "GÜN" },
  { key: "hours", label: "SAAT" },
  { key: "minutes", label: "DAKİKA" },
];

/**
 * Düğüne kalan süre.
 *
 * Sayılar yalnızca tarayıcıda hesaplanır. Sayfa statik olarak önceden
 * üretildiği için sunucudaki `Date.now()` build zamanına donar; ziyaretçinin
 * saati tek doğru kaynaktır.
 *
 * Bölümün kabuğu (başlık, çerçeve, yükseklik) sunucuda da render edilir ve
 * sayılar görünmez bir yer tutucuyla aynı yeri kaplar — böylece hidrasyon
 * sırasında sayfa zıplamaz.
 *
 * Düğün tarihi geçmişse bölüm tamamen kaldırılır (şartname §10).
 */
export function Countdown({ targetMs }: { targetMs: number }) {
  const [state, setState] = useState<{ parts: CountdownParts | null } | null>(null);

  useEffect(() => {
    const tick = () => setState({ parts: countdownTo(targetMs, Date.now()) });
    tick();

    // Dakika hassasiyeti yeterli; saniyede bir render etmeye gerek yok.
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, [targetMs]);

  // Düğün günü geldi: bölüm artık anlamlı değil.
  if (state !== null && state.parts === null) return null;

  const parts = state?.parts ?? null;

  return (
    <Section className="border-t border-beige">
      <Reveal className="flex flex-col items-center text-center">
        <SectionLabel>Düğünümüze</SectionLabel>

        <div className="mt-12 flex items-start justify-center gap-8 sm:gap-14">
          {UNITS.map((unit) => (
            <div key={unit.key} className="flex flex-col items-center">
              <span
                className="font-display text-5xl font-light leading-none tabular-nums text-charcoal sm:text-6xl"
                // Sayılar gelene kadar yer tutucu görünmez durur.
                style={parts === null ? { visibility: "hidden" } : undefined}
              >
                {parts === null ? "00" : String(parts[unit.key]).padStart(2, "0")}
              </span>
              <span className="mt-3 text-[0.6rem] tracking-[0.3em] text-stone">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
