"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Davet linkini panoya kopyalar (şartname §33).
 *
 * Clipboard API güvenli bağlam ister (https veya localhost); erişilemezse
 * metin alanı üzerinden yedek yöntem kullanılır, böylece yerel ağdan
 * http ile açıldığında da çalışır.
 */
export function CopyLinkButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    const ok = await writeToClipboard(url);
    if (!ok) return;

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} için davet linkini kopyala`}
      className="rounded-(--button-radius) border border-beige px-3 py-1.5 text-xs text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal"
    >
      {copied ? "Kopyalandı" : "Linki Kopyala"}
      <span role="status" className="sr-only">
        {copied ? "Davet linki kopyalandı." : ""}
      </span>
    </button>
  );
}

async function writeToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Yedek yönteme düş.
    }
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(field);
  return ok;
}
