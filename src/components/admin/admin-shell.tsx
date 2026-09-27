"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/guests", label: "Davetliler" },
  { href: "/admin/settings", label: "Düğün Bilgileri" },
] as const;

/**
 * Admin paneli kabuğu.
 *
 * Masaüstünde sabit sidebar, mobilde çekmece (şartname §47).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Çekmece açıkken arka plan kaymamalı.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-ivory lg:flex">
      {/* Mobil üst çubuk */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-beige bg-warm-white px-4 py-3 lg:hidden">
        <span className="type-display text-base text-charcoal">
          Düğün Paneli
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="admin-nav"
          className="rounded-(--button-radius) border border-beige px-3 py-2 text-xs text-charcoal"
        >
          Menü
        </button>
      </header>

      {drawerOpen ? (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-charcoal/30 lg:hidden"
        />
      ) : null}

      <nav
        id="admin-nav"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-beige bg-warm-white px-4 py-6 transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <span className="type-display px-3 text-lg text-charcoal">
          Düğün Paneli
        </span>

        <ul className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  // Mobilde gezinince çekmece kapanmalı.
                  onClick={() => setDrawerOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-(--button-radius) px-3 py-2.5 text-sm transition-colors duration-200",
                    active
                      ? "bg-sand font-medium text-charcoal"
                      : "text-graphite hover:bg-sand/60 hover:text-charcoal",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-(--button-radius) px-3 py-2.5 text-left text-sm text-graphite transition-colors duration-200 hover:bg-sand/60 hover:text-charcoal"
          >
            Çıkış
          </button>
        </form>
      </nav>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}
