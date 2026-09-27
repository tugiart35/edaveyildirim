import { describe, expect, it } from "vitest";

import { TOKEN_LENGTH, generateToken, isValidTokenFormat } from "@/lib/utils/token";

describe("generateToken", () => {
  it("sabit uzunlukta token üretir", () => {
    expect(generateToken()).toHaveLength(TOKEN_LENGTH);
  });

  it("karışması kolay karakterler içermez", () => {
    const tokens = Array.from({ length: 500 }, generateToken).join("");
    expect(tokens).not.toMatch(/[0O1lI]/);
  });

  it("pratikte benzersiz token üretir", () => {
    const tokens = new Set(Array.from({ length: 5000 }, generateToken));
    expect(tokens.size).toBe(5000);
  });

  it("ürettiği her token biçim kontrolünden geçer", () => {
    for (let i = 0; i < 100; i += 1) {
      expect(isValidTokenFormat(generateToken())).toBe(true);
    }
  });
});

describe("isValidTokenFormat", () => {
  it("yanlış uzunluğu reddeder", () => {
    expect(isValidTokenFormat("abc")).toBe(false);
  });

  it("sequential id'yi reddeder", () => {
    expect(isValidTokenFormat("153")).toBe(false);
  });

  it("alfabe dışı karakteri reddeder", () => {
    expect(isValidTokenFormat("Px82Kms9-")).toBe(false);
  });
});
