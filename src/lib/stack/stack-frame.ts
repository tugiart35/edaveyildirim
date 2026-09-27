/** Kartın yerine oturmasının tamamlanmış sayılacağı mesafe (px). */
export const ENTER_RANGE = 280;

export interface CardGeometry {
  /** Kartın ekrandaki üst konumu (getBoundingClientRect().top). */
  top: number;
  /** Kartın yapıştığı üst konum (computed `top`). */
  pinTop: number;
}

export interface StackFrame {
  /** Kart başına yerine oturma ilerlemesi: 0 = aşağıda, 1 = yapıştı. */
  enter: number[];
  /** Ekranda en çok yer kaplayan, yani okunmakta olan kartın sırası. */
  activeIndex: number;
}

/**
 * Bir kaydırma karesinde kartların durumunu hesaplar.
 *
 * Saf fonksiyondur: DOM okumaları çağıran tarafta yapılır, buradaki
 * matematik tarayıcı olmadan test edilebilir.
 */
export function computeStackFrame(
  cards: CardGeometry[],
  viewportHeight: number,
): StackFrame {
  const enter: number[] = [];

  let activeIndex = 0;
  let widestSlice = -Infinity;

  cards.forEach((card, index) => {
    const distance = card.top - card.pinTop;
    enter.push(clamp01(1 - distance / ENTER_RANGE));

    // Bir kartın gerçekte görünen yüksekliği, kendi üstünden bir sonraki
    // kartın üstüne kadardır — gerisi zaten sonraki kartın altında kalır.
    const next = cards[index + 1];
    const coveredAt = next ? next.top : viewportHeight;
    const slice = Math.min(coveredAt, viewportHeight) - Math.max(card.top, 0);

    if (slice > widestSlice) {
      widestSlice = slice;
      activeIndex = index;
    }
  });

  return { enter, activeIndex };
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
