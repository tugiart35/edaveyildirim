"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { login } from "@/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // `isPending` bir render geç geldiği için aynı tick'teki ikinci
  // gönderimi ref ile engelliyoruz.
  const submitting = useRef(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    setError(null);

    startTransition(async () => {
      try {
        const result = await login(email, password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.replace(next);
        router.refresh();
      } finally {
        submitting.current = false;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm text-graphite">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending}
          className="rounded-(--button-radius) border border-beige bg-warm-white px-4 py-3 text-sm text-charcoal transition-colors duration-200 focus:border-gold disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm text-graphite">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="rounded-(--button-radius) border border-beige bg-warm-white px-4 py-3 text-sm text-charcoal transition-colors duration-200 focus:border-gold disabled:opacity-50"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm leading-relaxed text-status-pending">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-(--button-radius) bg-charcoal px-6 py-3 text-sm font-medium text-warm-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
