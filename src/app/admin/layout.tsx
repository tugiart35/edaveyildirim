import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Düğün Paneli",
  robots: { index: false, follow: false },
};

/**
 * Admin bölümünün kökü.
 *
 * `data-theme="admin"` davetiye temasını sıfırlar: panel çiftin seçtiği
 * renklerden bağımsız, nötr ve okunaklı kalır.
 *
 * Kabuk (sidebar) burada değil, giriş ekranı dışındaki sayfalarda kurulur —
 * `/admin` giriş ekranının menüsü olmamalı.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div data-theme="admin" className="min-h-dvh bg-ivory text-charcoal">
      {children}
    </div>
  );
}
