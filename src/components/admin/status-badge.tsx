import type { GuestStatus } from "@/types";

const LABELS: Record<GuestStatus, string> = {
  attending: "Geliyor",
  declined: "Gelmiyor",
  pending: "Cevap Bekleniyor",
};

/** Durum renkleri sade ve WCAG AA kontrastlı tutulur (şartname §27). */
const STYLES: Record<GuestStatus, string> = {
  attending: "bg-status-attending-bg text-status-attending",
  declined: "bg-status-declined-bg text-status-declined",
  pending: "bg-status-pending-bg text-status-pending",
};

export function StatusBadge({ status }: { status: GuestStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
