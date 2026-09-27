"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminEmail,
  adminPasswordHash,
  authSecret,
  isAuthConfigured,
} from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/auth/session";

export type LoginResult = { ok: true } | { ok: false; error: string };

/** Giriş denemesi. Başarılıysa imzalı oturum çerezi yazar. */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!isAuthConfigured()) {
    return {
      ok: false,
      error:
        "Admin girişi yapılandırılmamış. ADMIN_EMAIL, ADMIN_PASSWORD_HASH ve AUTH_SECRET değerlerini .env.local dosyasına ekleyin.",
    };
  }

  const emailMatches =
    email.trim().toLocaleLowerCase("tr-TR") ===
    adminEmail.trim().toLocaleLowerCase("tr-TR");

  // E-posta yanlış olsa bile şifre doğrulanır: erken çıkış, hangi alanın
  // hatalı olduğunu zamanlama üzerinden ele verirdi.
  const passwordMatches = await verifyPassword(password, adminPasswordHash);

  if (!emailMatches || !passwordMatches) {
    return { ok: false, error: "E-posta veya şifre hatalı." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(authSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { ok: true };
}

/** Çıkış: oturum çerezini siler ve giriş ekranına döner. */
export async function logout(): Promise<never> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin");
}
