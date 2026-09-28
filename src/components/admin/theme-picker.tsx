"use client";

import { THEMES, type Theme } from "@/types";

const LABELS: Record<Theme, string> = {
  minimal: "Minimal",
  romantic: "Romantic",
  modern: "Modern",
  elegant: "Elegant",
  editorial: "Editorial",
};

const DESCRIPTIONS: Record<Theme, string> = {
  minimal: "Soğuk beyaz, sans-serif, keskin köşeler",
  romantic: "Pudra tonları, yumuşak köşeler, hap butonlar",
  modern: "Yüksek kontrast, tek renk, köşeli",
  elegant: "Ivory ve altın, zarif serif",
  editorial: "Sıcak kağıt, terracotta, dergi hissi",
};

/**
 * Tema seçimi.
 *
 * Her seçenek kendi temasıyla render edilir: `data-theme` o kutuya
 * yazıldığı için renk, tipografi ve köşe yarıçapı doğrudan önizlenir.
 * Ayrı bir önizleme ekranına gerek kalmaz.
 */
export function ThemePicker({
  value,
  disabled,
  onChange,
}: {
  value: Theme;
  disabled: boolean;
  onChange: (theme: Theme) => void;
}) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm text-graphite">Tema</legend>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme) => {
          const selected = theme === value;

          return (
            <label
              key={theme}
              data-theme={theme}
              className={`flex cursor-pointer flex-col gap-2 rounded-(--card-radius) border bg-warm-white p-4 transition-shadow duration-200 ${
                selected
                  ? "border-charcoal shadow-[0_0_0_1px_var(--color-charcoal)]"
                  : "border-beige hover:border-charcoal/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={selected}
                  onChange={() => onChange(theme)}
                  className="accent-charcoal"
                />
                <span className="type-display text-base text-charcoal">
                  {LABELS[theme]}
                </span>
              </span>

              {/* Temanın kendi dilinde küçük bir örnek. */}
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-px w-5 bg-gold-soft" />
                <span className="type-display text-lg text-charcoal">
                  Ayşe <span className="text-gold">&</span> Mehmet
                </span>
              </span>

              <span
                aria-hidden
                className="w-fit rounded-(--button-radius) bg-charcoal px-3 py-1 text-[0.6rem] tracking-[0.2em] text-ivory"
              >
                YOL TARİFİ
              </span>

              <span className="text-xs leading-relaxed text-stone">
                {DESCRIPTIONS[theme]}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
