"use client";

import { MAX_PANELS } from "@/lib/validation/schemas";
import type { InvitationPanel } from "@/types";

/**
 * Çizim panelleri.
 *
 * Panellerin **sırası davetiyedeki kart sırasıdır**; bu yüzden yukarı /
 * aşağı taşıma düğmeleri var. Her panel bir etiket (kart başlığı) ve bir
 * görsel yolundan oluşur.
 */
export function PanelFields({
  panels,
  disabled,
  onChange,
}: {
  panels: InvitationPanel[];
  disabled: boolean;
  onChange: (panels: InvitationPanel[]) => void;
}) {
  const full = panels.length >= MAX_PANELS;

  function update(index: number, patch: Partial<InvitationPanel>) {
    onChange(
      panels.map((panel, i) => (i === index ? { ...panel, ...patch } : panel)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= panels.length) return;

    const next = [...panels];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm text-graphite">
          Çizim panelleri{" "}
          <span className="text-xs text-stone">(en fazla {MAX_PANELS})</span>
        </p>
        <p className="mt-1 text-xs text-stone">
          Davetiyede kapaktan sonra, buradaki sırayla kart olarak görünür.
          Çizimler kırpılmadan gösterilir.
        </p>
      </div>

      {panels.length === 0 ? (
        <p className="text-xs text-stone">Henüz panel eklenmedi.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {panels.map((panel, index) => (
            <li
              key={index}
              className="flex flex-col gap-2 rounded-(--button-radius) border border-beige p-3 sm:flex-row sm:items-start"
            >
              <span className="shrink-0 pt-2.5 text-xs tabular-nums text-stone sm:w-6">
                {index + 1}.
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label htmlFor={`panel-label-${index}`} className="sr-only">
                  {index + 1}. panelin etiketi
                </label>
                <input
                  id={`panel-label-${index}`}
                  value={panel.label}
                  onChange={(event) =>
                    update(index, { label: event.target.value })
                  }
                  placeholder="Kart etiketi (örn. Düğün)"
                  maxLength={40}
                  disabled={disabled}
                  className={inputClass}
                />

                <label htmlFor={`panel-image-${index}`} className="sr-only">
                  {index + 1}. panelin görseli
                </label>
                <input
                  id={`panel-image-${index}`}
                  value={panel.image}
                  onChange={(event) =>
                    update(index, { image: event.target.value })
                  }
                  placeholder="/design/dugun.jpg"
                  disabled={disabled}
                  className={inputClass}
                />

                <label className="flex items-center gap-2 text-xs text-graphite">
                  <input
                    type="checkbox"
                    checked={panel.countdown === true}
                    onChange={(event) =>
                      update(index, { countdown: event.target.checked })
                    }
                    disabled={disabled}
                    className="accent-charcoal"
                  />
                  Düğüne kalan süreyi çizimin üstüne yaz
                </label>
                <p className="-mt-1 pl-6 text-xs text-stone">
                  Katılım kartı bu panelin hemen önüne yerleşir; geri
                  sayım davetiyeyi kapatan kart olur.
                </p>

                <label className="flex items-center gap-2 text-xs text-graphite">
                  <input
                    type="checkbox"
                    checked={panel.directions === true}
                    onChange={(event) =>
                      update(index, { directions: event.target.checked })
                    }
                    disabled={disabled}
                    className="accent-charcoal"
                  />
                  Kart başlığında &ldquo;Yol Tarifi&rdquo; bağlantısı göster
                </label>
              </div>

              <Preview src={panel.image} label={panel.label} />

              <div className="flex shrink-0 gap-1">
                <IconButton
                  label={`${index + 1}. paneli yukarı taşı`}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </IconButton>
                <IconButton
                  label={`${index + 1}. paneli aşağı taşı`}
                  disabled={disabled || index === panels.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </IconButton>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(panels.filter((_, i) => i !== index))}
                  className="rounded-(--button-radius) border border-beige px-3 py-2 text-xs text-graphite transition-colors duration-200 hover:border-status-pending/40 hover:text-status-pending disabled:opacity-50"
                >
                  Kaldır
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled || full}
        onClick={() =>
          onChange([
            ...panels,
            { label: "", image: "", countdown: false, directions: false },
          ])
        }
        className="w-fit rounded-(--button-radius) border border-beige px-4 py-2 text-xs text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
      >
        {full ? `En fazla ${MAX_PANELS} panel` : "Panel ekle"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const inputClass =
  "w-full min-w-0 rounded-(--button-radius) border border-beige bg-warm-white px-3 py-2.5 text-sm text-charcoal transition-colors duration-200 focus:border-gold disabled:opacity-50";

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-(--button-radius) border border-beige px-3 py-2 text-xs text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/**
 * Küçük önizleme.
 *
 * `next/image` yerine düz `<img>`: yolu kullanıcı elle yazıyor, geçersiz
 * bir değer optimizasyon katmanında hata üretirdi. Önizleme sessizce
 * boş kalmalı.
 */
function Preview({ src, label }: { src: string; label: string }) {
  if (src.trim() === "") {
    return (
      <div
        aria-hidden
        className="h-14 w-11 shrink-0 rounded-(--button-radius) border border-dashed border-beige"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label || "Panel önizlemesi"}
      className="h-14 w-11 shrink-0 rounded-(--button-radius) border border-beige object-contain"
    />
  );
}
