import type { WeddingStats } from "@/lib/stats/wedding-stats";

/**
 * Dashboard istatistikleri (şartname §23-25).
 *
 * En üstte tek bir büyük rakam: beklenen toplam kişi. Bu projenin
 * en önemli metriği odur; geri kalan her şey onu destekler.
 *
 * "Davetli kaydı" ile "gelecek kişi" bilinçli olarak ayrı gösterilir:
 * tek bir davetli birden çok kişiyle gelebilir.
 */
export function DashboardStats({ stats }: { stats: WeddingStats }) {
  return (
    <div className="flex flex-col gap-6">
      <Headline stats={stats} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card
          label="Toplam Davetli"
          value={stats.totalGuests}
          unit="kayıt"
          hint="Listedeki kişi sayısı"
        />
        <Card
          label="Toplam Davet Hakkı"
          value={stats.totalCapacity}
          unit="kişi"
          hint="Herkes hakkının tamamıyla gelseydi"
        />
        <Card
          label="Gelecek"
          value={stats.expectedPeople}
          unit="kişi"
          hint={`${stats.attendingGuests} davetli kaydından`}
          tone="attending"
        />
        <Card
          label="Gelmeyecek"
          value={stats.decliningGuests}
          unit="davetli"
          tone="declined"
        />
        <Card
          label="Cevap Bekleyen"
          value={stats.pendingGuests}
          unit="davetli"
          tone="pending"
        />
        <ResponseRate stats={stats} />
      </div>

      <Breakdown stats={stats} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Headline({ stats }: { stats: WeddingStats }) {
  return (
    <section className="rounded-(--card-radius) border border-beige bg-warm-white px-6 py-10 text-center">
      <h2 className="text-xs tracking-(--label-tracking) text-stone">
        TOPLAM BEKLENEN KİŞİ
      </h2>
      <p className="type-display mt-3 text-6xl tabular-nums text-charcoal sm:text-7xl">
        {stats.expectedPeople}
      </p>
      <p className="mt-3 text-sm text-graphite">
        {stats.attendingGuests} davetli katılacağını bildirdi
        {stats.pendingGuests > 0
          ? ` · ${stats.pendingGuests} davetliden cevap bekleniyor`
          : ""}
      </p>
    </section>
  );
}

const TONES = {
  neutral: "text-charcoal",
  attending: "text-status-attending",
  declined: "text-status-declined",
  pending: "text-status-pending",
} as const;

function Card({
  label,
  value,
  unit,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number;
  unit: string;
  hint?: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="rounded-(--card-radius) border border-beige bg-warm-white px-5 py-5">
      <p className="text-xs text-stone">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className={`type-display text-3xl tabular-nums ${TONES[tone]}`}>
          {value}
        </span>
        <span className="text-xs text-graphite">{unit}</span>
      </p>
      {hint ? <p className="mt-1.5 text-xs text-stone">{hint}</p> : null}
    </div>
  );
}

/** Şartname §24: responded_guests / total_guests. */
function ResponseRate({ stats }: { stats: WeddingStats }) {
  return (
    <div className="rounded-(--card-radius) border border-beige bg-warm-white px-5 py-5">
      <p className="text-xs text-stone">Yanıt Oranı</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="type-display text-3xl tabular-nums text-charcoal">
          %{stats.responseRate}
        </span>
      </p>
      <div className="mt-3">
        <Bar value={stats.responseRate} className="bg-charcoal" />
      </div>
      <p className="mt-1.5 text-xs text-stone">
        {stats.respondedGuests} / {stats.totalGuests} davetli cevapladı
      </p>
    </div>
  );
}

/** Şartname §25: ağır chart kütüphanesi yerine basit çubuklar. */
function Breakdown({ stats }: { stats: WeddingStats }) {
  const rows = [
    {
      label: "Geliyor",
      percent: stats.breakdown.attending,
      count: stats.attendingGuests,
      className: "bg-status-attending",
    },
    {
      label: "Gelmiyor",
      percent: stats.breakdown.declined,
      count: stats.decliningGuests,
      className: "bg-status-declined",
    },
    {
      label: "Cevap Bekleniyor",
      percent: stats.breakdown.pending,
      count: stats.pendingGuests,
      className: "bg-status-pending",
    },
  ];

  return (
    <section className="rounded-(--card-radius) border border-beige bg-warm-white px-5 py-5">
      <h2 className="text-xs text-stone">Davetli Dağılımı</h2>

      <dl className="mt-4 flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-graphite">{row.label}</dt>
              <dd className="tabular-nums text-charcoal">
                %{row.percent}
                <span className="ml-2 text-xs text-stone">
                  {row.count} davetli
                </span>
              </dd>
            </div>
            <div className="mt-2">
              <Bar value={row.percent} className={row.className} />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <div
      role="presentation"
      className="h-1.5 w-full overflow-hidden rounded-full bg-sand"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${className}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
