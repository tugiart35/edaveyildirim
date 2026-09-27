import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GuestWithRsvp } from "@/types";

const getGuestByToken = vi.fn();
const saveRsvp = vi.fn();

vi.mock("@/lib/data", () => ({
  getGuestByToken: (...args: unknown[]) => getGuestByToken(...args),
  saveRsvp: (...args: unknown[]) => saveRsvp(...args),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { submitRsvp } = await import("@/actions/rsvp");

function guest(invitationLimit: number): GuestWithRsvp {
  return {
    id: "guest-1",
    weddingId: "w1",
    name: "Ahmet Yılmaz",
    phone: null,
    groupName: null,
    invitationLimit,
    token: "Px82Kms92n",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    rsvp: null,
  };
}

beforeEach(() => {
  getGuestByToken.mockReset();
  saveRsvp.mockReset();
  saveRsvp.mockImplementation((guestId: string, input: Record<string, unknown>) => ({
    id: "rsvp-1",
    guestId,
    ...input,
    adultCount: null,
    childCount: null,
    respondedAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  }));
});

describe("submitRsvp", () => {
  it("geçersiz token'ı reddeder ve hiçbir şey kaydetmez", async () => {
    getGuestByToken.mockResolvedValue(null);

    const result = await submitRsvp("yokBoyleToken", {
      status: "attending",
      attendingCount: 1,
      note: null,
    });

    expect(result).toEqual({ ok: false, error: "Davet bağlantısı bulunamadı." });
    expect(saveRsvp).not.toHaveBeenCalled();
  });

  it("davet hakkını veritabanından okur, istemciden gelen sayıyı sınırlar", async () => {
    // Davetlinin gerçek hakkı 2; istemci 99 göndermeye çalışıyor.
    getGuestByToken.mockResolvedValue(guest(2));

    const result = await submitRsvp("Px82Kms92n", {
      status: "attending",
      attendingCount: 99,
      note: null,
    });

    expect(result.ok).toBe(false);
    expect(saveRsvp).not.toHaveBeenCalled();
  });

  it("limit dahilindeki cevabı kaydeder", async () => {
    getGuestByToken.mockResolvedValue(guest(4));

    const result = await submitRsvp("Px82Kms92n", {
      status: "attending",
      attendingCount: 3,
      note: "Görüşmek üzere",
    });

    expect(result.ok).toBe(true);
    expect(saveRsvp).toHaveBeenCalledWith("guest-1", {
      status: "attending",
      attendingCount: 3,
      note: "Görüşmek üzere",
    });
  });

  it("gelmeyen davetlinin kişi sayısını sıfıra zorlar", async () => {
    getGuestByToken.mockResolvedValue(guest(4));

    const kabul = await submitRsvp("Px82Kms92n", {
      status: "declined",
      attendingCount: 0,
      note: null,
    });
    expect(kabul.ok).toBe(true);

    const ret = await submitRsvp("Px82Kms92n", {
      status: "declined",
      attendingCount: 3,
      note: null,
    });
    expect(ret.ok).toBe(false);
  });

  it("500 karakterden uzun notu reddeder", async () => {
    getGuestByToken.mockResolvedValue(guest(4));

    const result = await submitRsvp("Px82Kms92n", {
      status: "attending",
      attendingCount: 1,
      note: "a".repeat(501),
    });

    expect(result.ok).toBe(false);
    expect(saveRsvp).not.toHaveBeenCalled();
  });

  it("beklenmeyen gövdeyi reddeder", async () => {
    getGuestByToken.mockResolvedValue(guest(4));

    const result = await submitRsvp("Px82Kms92n", { status: "belki" });

    expect(result.ok).toBe(false);
    expect(saveRsvp).not.toHaveBeenCalled();
  });

  it("kayıt sırasındaki hatayı dostane mesaja çevirir", async () => {
    getGuestByToken.mockResolvedValue(guest(4));
    saveRsvp.mockRejectedValue(new Error("bağlantı koptu"));

    const result = await submitRsvp("Px82Kms92n", {
      status: "attending",
      attendingCount: 1,
      note: null,
    });

    expect(result).toEqual({
      ok: false,
      error: "Bir sorun oluştu. Lütfen tekrar deneyin.",
    });
  });
});
