import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("şifre saklama", () => {
  it("doğru şifreyi kabul eder", async () => {
    const hash = await hashPassword("dogru-sifre-2026");
    await expect(verifyPassword("dogru-sifre-2026", hash)).resolves.toBe(true);
  });

  it("yanlış şifreyi reddeder", async () => {
    const hash = await hashPassword("dogru-sifre-2026");
    await expect(verifyPassword("yanlis-sifre", hash)).resolves.toBe(false);
  });

  it("şifreyi düz metin olarak saklamaz", async () => {
    const hash = await hashPassword("gizli-sifre");
    expect(hash).not.toContain("gizli-sifre");
  });

  it("aynı şifre için her seferinde farklı hash üretir", async () => {
    const [a, b] = await Promise.all([
      hashPassword("ayni-sifre"),
      hashPassword("ayni-sifre"),
    ]);

    // Tuz rastgele olduğu için hash'ler farklı, ikisi de doğrulanır.
    expect(a).not.toBe(b);
    await expect(verifyPassword("ayni-sifre", a)).resolves.toBe(true);
    await expect(verifyPassword("ayni-sifre", b)).resolves.toBe(true);
  });

  it("Türkçe karakterli şifreyi doğru işler", async () => {
    const hash = await hashPassword("çğıöşüÇĞİÖŞÜ-2026");
    await expect(verifyPassword("çğıöşüÇĞİÖŞÜ-2026", hash)).resolves.toBe(true);
  });

  it("bozuk hash'te çökmeden false döner", async () => {
    for (const bozuk of [
      "",
      "duz-metin",
      "bcrypt.a.b",
      "scrypt.",
      "scrypt.a",
    ]) {
      await expect(verifyPassword("herhangi", bozuk)).resolves.toBe(false);
    }
  });

  it("ayraç olarak $ kullanmaz", async () => {
    // Next.js .env dosyalarında $ ile başlayan dizileri değişken sanıp
    // siler; hash bu yüzden $ içermemelidir.
    const hash = await hashPassword("herhangi-bir-sifre");
    expect(hash).not.toContain("$");
    expect(hash.split(".")).toHaveLength(3);
  });

  it("boş hash ile boş şifre eşleşmez", async () => {
    await expect(verifyPassword("", "")).resolves.toBe(false);
  });
});
