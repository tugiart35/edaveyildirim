import { describe, expect, it } from "vitest";

import { rsvpInputSchemaFor } from "@/lib/validation/schemas";

describe("rsvpInputSchemaFor", () => {
  const schema = rsvpInputSchemaFor(4);

  it("davet hakkı kadar kişi kabul eder", () => {
    const result = schema.safeParse({
      status: "attending",
      attendingCount: 4,
      note: null,
    });
    expect(result.success).toBe(true);
  });

  it("davet hakkını aşan sayıyı reddeder", () => {
    const result = schema.safeParse({
      status: "attending",
      attendingCount: 5,
      note: null,
    });
    expect(result.success).toBe(false);
  });

  it("katılan için en az 1 kişi ister", () => {
    const result = schema.safeParse({
      status: "attending",
      attendingCount: 0,
      note: null,
    });
    expect(result.success).toBe(false);
  });

  it("katılmayan için kişi sayısını 0 olmaya zorlar", () => {
    expect(
      schema.safeParse({ status: "declined", attendingCount: 0, note: null })
        .success,
    ).toBe(true);

    expect(
      schema.safeParse({ status: "declined", attendingCount: 2, note: null })
        .success,
    ).toBe(false);
  });

  it("500 karakterden uzun notu reddeder", () => {
    const result = schema.safeParse({
      status: "attending",
      attendingCount: 1,
      note: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("tam 500 karakterlik notu kabul eder", () => {
    const result = schema.safeParse({
      status: "attending",
      attendingCount: 1,
      note: "a".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("boş notu null'a çevirir", () => {
    const result = schema.safeParse({
      status: "attending",
      attendingCount: 1,
      note: "   ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBeNull();
  });

  it("davet hakkı 1 olanı tek kişiyle sınırlar", () => {
    const single = rsvpInputSchemaFor(1);
    expect(
      single.safeParse({ status: "attending", attendingCount: 2, note: null })
        .success,
    ).toBe(false);
  });
});
