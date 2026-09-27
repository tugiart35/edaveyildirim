"use client";

import { useEffect, useState } from "react";

import { countdownTo, type CountdownParts } from "@/lib/utils/date";

const UNITS: Array<{ key: keyof CountdownParts; label: string }> = [
  { key: "days", label: "GÜN" },
  { key: "hours", label: "SAAT" },
  { key: "minutes", label: "DAKİKA" },
];

/**
 * Düğüne kalan süre.
 *
 * Sayılar yalnızca tarayıcıda hesaplanır: sayfa statik olarak önceden
 * üretildiği için sunucudaki `Date.now()` build zamanına donar.
 * Sayılar gelene kadar görünmez bir yer tutucu aynı yeri kaplar, böylece
 * hidrasyon sırasında düzen kaymaz.
 *
 * Düğün geçtiğinde kartın tamamı `CardStack` tarafından kaldırılır.
 */
export function Countdown({ targetMs }: { targetMs: number }) {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(countdownTo(targetMs, Date.now()));
    tick();

    // Dakika hassasiyeti yeterli; saniyede bir render etmeye gerek yok.
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, [targetMs]);

  return (
    <div className="flex flex-col items-center text-center">
      <p className="type-display text-2xl text-graphite sm:text-3xl">
        Düğünümüze
      </p>

      <div className="mt-12 flex items-start justify-center gap-8 sm:gap-16">
        {UNITS.map((unit) => (
          <div key={unit.key} className="flex flex-col items-center">
            <span
              className="type-display text-6xl leading-none tabular-nums text-charcoal sm:text-7xl"
              style={parts === null ? { visibility: "hidden" } : undefined}
            >
              {parts === null ? "00" : String(parts[unit.key]).padStart(2, "0")}
            </span>
            <span className="mt-4 text-[0.6rem] tracking-[0.3em] text-stone">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
