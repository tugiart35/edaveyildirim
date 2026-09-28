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
 * Bir çizim panelinin üstünde ya da altında gösterilir; kendi başlığı ve
 * kabuğu yoktur, onları panel sağlar. Rengi `currentColor`'dan alır —
 * çizim üstünde kalem rengiyle, tek başınayken metin rengiyle çizilir.
 *
 * Sayılar yalnızca tarayıcıda hesaplanır: sayfa her istekte üretilse de
 * sunucu ile ziyaretçinin saati farklı olabilir ve hidrasyon uyuşmazlığı
 * çıkardı. Sayılar gelene kadar görünmez bir yer tutucu aynı yeri kaplar,
 * böylece düzen kaymaz.
 *
 * Düğün tarihi geçmişse hiçbir şey gösterilmez.
 */
export function Countdown({ targetMs }: { targetMs: number }) {
  const [state, setState] = useState<{ parts: CountdownParts | null } | null>(
    null,
  );

  useEffect(() => {
    const tick = () => setState({ parts: countdownTo(targetMs, Date.now()) });
    tick();

    // Dakika hassasiyeti yeterli; saniyede bir render etmeye gerek yok.
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, [targetMs]);

  // Düğün günü geldi: geri sayım artık anlamlı değil.
  if (state !== null && state.parts === null) return null;

  const parts = state?.parts ?? null;

  return (
    <div className="flex items-start justify-center gap-8 sm:gap-14">
      {UNITS.map((unit) => (
        <div key={unit.key} className="flex flex-col items-center">
          <span
            className="type-display text-4xl leading-none tabular-nums text-current sm:text-5xl"
            // Sayılar gelene kadar yer tutucu görünmez durur.
            style={parts === null ? { visibility: "hidden" } : undefined}
          >
            {parts === null ? "00" : String(parts[unit.key]).padStart(2, "0")}
          </span>
          <span className="mt-3 text-[0.6rem] tracking-[0.3em] text-current opacity-70">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
