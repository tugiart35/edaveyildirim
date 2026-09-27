import { describe, expect, it } from "vitest";

import { ENTER_RANGE, computeStackFrame } from "@/lib/stack/stack-frame";

const VIEWPORT = 800;

describe("computeStackFrame — yerine oturma ilerlemesi", () => {
  it("yapışmış kart tam ilerlemede olur", () => {
    const { enter } = computeStackFrame([{ top: 20, pinTop: 20 }], VIEWPORT);
    expect(enter[0]).toBe(1);
  });

  it("yapışma noktasının üstündeki kart tam ilerlemede kalır", () => {
    // Yığının sonunda kartlar yukarı itilir; ilerleme 1'in üstüne çıkmamalı.
    const { enter } = computeStackFrame([{ top: -150, pinTop: 20 }], VIEWPORT);
    expect(enter[0]).toBe(1);
  });

  it("menzilin dışındaki kart sıfır ilerlemede olur", () => {
    const { enter } = computeStackFrame(
      [{ top: 20 + ENTER_RANGE + 1, pinTop: 20 }],
      VIEWPORT,
    );
    expect(enter[0]).toBe(0);
  });

  it("menzilin yarısında ilerleme yarıdır", () => {
    const { enter } = computeStackFrame(
      [{ top: 20 + ENTER_RANGE / 2, pinTop: 20 }],
      VIEWPORT,
    );
    expect(enter[0]).toBeCloseTo(0.5, 5);
  });

  it("her kartın ilerlemesini kendi yapışma noktasına göre ölçer", () => {
    const { enter } = computeStackFrame(
      [
        { top: 20, pinTop: 20 },
        { top: 80, pinTop: 80 },
        { top: 600, pinTop: 140 },
      ],
      VIEWPORT,
    );

    expect(enter[0]).toBe(1);
    expect(enter[1]).toBe(1);
    expect(enter[2]).toBe(0);
  });
});

describe("computeStackFrame — okunan kart", () => {
  it("örtülen kartı değil, açıkta kalanı seçer", () => {
    // İlk kart yapışmış ama ikinci kart hemen altından örtüyor.
    const { activeIndex } = computeStackFrame(
      [
        { top: 20, pinTop: 20 },
        { top: 80, pinTop: 80 },
      ],
      VIEWPORT,
    );

    // 0. kartın görünen dilimi 60px, 1. kartınki 720px.
    expect(activeIndex).toBe(1);
  });

  it("henüz yükselen kart ekranı doldurmadıysa öncekini seçer", () => {
    const { activeIndex } = computeStackFrame(
      [
        { top: 20, pinTop: 20 },
        { top: 700, pinTop: 80 },
      ],
      VIEWPORT,
    );

    // 0. kart 680px, 1. kart 100px görünüyor.
    expect(activeIndex).toBe(0);
  });

  it("ekranın üstüne taşan kartın yalnızca görünen kısmını sayar", () => {
    const { activeIndex } = computeStackFrame(
      [
        // Görünen: 0 → 40 arası, 40px.
        { top: -400, pinTop: 20 },
        { top: 40, pinTop: 80 },
      ],
      VIEWPORT,
    );

    expect(activeIndex).toBe(1);
  });

  it("tek kart varsa o karttır", () => {
    const { activeIndex } = computeStackFrame(
      [{ top: 300, pinTop: 20 }],
      VIEWPORT,
    );
    expect(activeIndex).toBe(0);
  });

  it("dört kartlık destede ortadakini doğru seçer", () => {
    const { activeIndex } = computeStackFrame(
      [
        { top: 20, pinTop: 20 }, // görünen 60
        { top: 80, pinTop: 80 }, // görünen 60
        { top: 140, pinTop: 140 }, // görünen 660 → okunan
        { top: 800, pinTop: 200 }, // görünen 0
      ],
      VIEWPORT,
    );

    expect(activeIndex).toBe(2);
  });
});
