import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { getWedding } from "@/lib/data";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Düğün Davetiyesi",
  description: "Online düğün davetiyesi ve katılım bildirimi.",
};

/**
 * Tema kök öğeye yazılır: sayfa arka planı `body` üzerinde olduğu için
 * tema değişkenlerinin `body`'yi de kapsaması gerekir.
 *
 * Admin paneli davetiye temasından etkilenmemelidir; kendi layout'unda
 * `data-theme` değerini sıfırlar.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const wedding = await getWedding();

  return (
    <html
      lang="tr"
      data-theme={wedding.theme}
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
