import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { authSecret } from "@/lib/auth/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/** Yönlendirme hedefi yalnızca uygulama içi bir yol olabilir. */
function safeNext(value: string | undefined): string {
  if (!value) return "/admin/dashboard";
  if (!value.startsWith("/admin/")) return "/admin/dashboard";
  // Protokole benzeyen değerler açık yönlendirmeye yol açabilir.
  if (value.startsWith("//")) return "/admin/dashboard";
  return value;
}

export default async function AdminLoginPage(props: PageProps<"/admin">) {
  const params = await props.searchParams;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  const next = safeNext(
    typeof params.devam === "string" ? params.devam : undefined,
  );

  // Oturum zaten açıksa giriş ekranı gösterilmez.
  if (verifySessionToken(token, authSecret)) redirect(next);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="type-display text-2xl text-charcoal">Düğün Paneli</h1>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          Davetli listesini ve katılım durumlarını yönetmek için giriş yapın.
        </p>

        <div className="mt-8 rounded-(--card-radius) border border-beige bg-warm-white p-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
