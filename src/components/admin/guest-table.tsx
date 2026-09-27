"use client";

import { useMemo, useState } from "react";

import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { DeleteGuestButton } from "@/components/admin/delete-guest-button";
import { GuestFormDialog } from "@/components/admin/guest-form-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { invitationUrl, whatsappShareUrl } from "@/lib/utils/wedding";
import {
  expectedPeopleFor,
  guestStatus,
  type GuestStatus,
  type GuestWithRsvp,
  type Wedding,
} from "@/types";

type Filter = "all" | GuestStatus;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "attending", label: "Geliyor" },
  { value: "declined", label: "Gelmiyor" },
  { value: "pending", label: "Cevap Bekleniyor" },
];

export function GuestTable({
  guests,
  wedding,
  siteUrl,
}: {
  guests: GuestWithRsvp[];
  wedding: Wedding;
  siteUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [group, setGroup] = useState("all");

  const groups = useMemo(() => {
    const unique = new Set<string>();
    for (const guest of guests) {
      if (guest.groupName) unique.add(guest.groupName);
    }
    return [...unique].sort((a, b) => a.localeCompare(b, "tr"));
  }, [guests]);

  const visible = useMemo(() => {
    // Türkçe'de büyük/küçük harf dönüşümü yerele bağlıdır (İ/ı).
    const needle = query.trim().toLocaleLowerCase("tr-TR");

    return guests.filter((guest) => {
      if (filter !== "all" && guestStatus(guest) !== filter) return false;
      if (group !== "all" && guest.groupName !== group) return false;
      if (needle === "") return true;

      // Arama: isim, telefon, grup (şartname §31).
      const haystack = [guest.name, guest.phone ?? "", guest.groupName ?? ""]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(needle);
    });
  }, [guests, query, filter, group]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label htmlFor="guest-search" className="sr-only">
          Davetli ara
        </label>
        <input
          id="guest-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="İsim, telefon veya grup ara"
          className="w-full rounded-(--button-radius) border border-beige bg-warm-white px-4 py-2.5 text-sm text-charcoal transition-colors duration-200 focus:border-gold lg:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-(--button-radius) border px-3 py-2 text-xs transition-colors duration-200 ${
                filter === option.value
                  ? "border-charcoal bg-charcoal text-warm-white"
                  : "border-beige text-graphite hover:text-charcoal"
              }`}
            >
              {option.label}
            </button>
          ))}

          {groups.length > 0 ? (
            <>
              <label htmlFor="guest-group" className="sr-only">
                Gruba göre filtrele
              </label>
              <select
                id="guest-group"
                value={group}
                onChange={(event) => setGroup(event.target.value)}
                className="rounded-(--button-radius) border border-beige bg-warm-white px-3 py-2 text-xs text-graphite"
              >
                <option value="all">Tüm gruplar</option>
                {groups.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="text-xs text-stone">
        {visible.length} davetli gösteriliyor
        {visible.length !== guests.length ? ` (toplam ${guests.length})` : ""}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-(--card-radius) border border-beige bg-warm-white px-6 py-10 text-center text-sm text-graphite">
          Aramanıza uyan davetli bulunamadı.
        </p>
      ) : (
        <>
          <DesktopTable visible={visible} wedding={wedding} siteUrl={siteUrl} />
          <MobileList visible={visible} wedding={wedding} siteUrl={siteUrl} />
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface ListProps {
  visible: GuestWithRsvp[];
  wedding: Wedding;
  siteUrl: string;
}

function DesktopTable({ visible, wedding, siteUrl }: ListProps) {
  return (
    <div className="hidden overflow-hidden rounded-(--card-radius) border border-beige bg-warm-white lg:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-beige text-xs text-stone">
          <tr>
            <Th>Davetli</Th>
            <Th>Telefon</Th>
            <Th>Grup</Th>
            <Th align="right">Limit</Th>
            <Th>Durum</Th>
            <Th align="right">Gelecek Kişi</Th>
            <Th align="right">İşlemler</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((guest) => (
            <tr
              key={guest.id}
              className="border-b border-beige last:border-b-0"
            >
              <Td>
                <span className="font-medium text-charcoal">{guest.name}</span>
              </Td>
              <Td>
                <Phone value={guest.phone} />
              </Td>
              <Td>{guest.groupName ?? <Empty />}</Td>
              <Td align="right" className="tabular-nums">
                {guest.invitationLimit}
              </Td>
              <Td>
                <StatusBadge status={guestStatus(guest)} />
              </Td>
              <Td align="right" className="tabular-nums">
                {expectedPeopleFor(guest) || <Empty />}
              </Td>
              <Td align="right">
                <div className="flex justify-end gap-2">
                  <RowActions
                    guest={guest}
                    wedding={wedding}
                    siteUrl={siteUrl}
                  />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileList({ visible, wedding, siteUrl }: ListProps) {
  return (
    <ul className="flex flex-col gap-3 lg:hidden">
      {visible.map((guest) => (
        <li
          key={guest.id}
          className="rounded-(--card-radius) border border-beige bg-warm-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-charcoal">{guest.name}</p>
              <p className="mt-1 text-xs text-graphite">
                <Phone value={guest.phone} />
              </p>
            </div>
            <StatusBadge status={guestStatus(guest)} />
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-beige pt-3 text-xs">
            <Cell term="Grup">{guest.groupName ?? <Empty />}</Cell>
            <Cell term="Limit">{guest.invitationLimit}</Cell>
            <Cell term="Gelecek">{expectedPeopleFor(guest) || <Empty />}</Cell>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <RowActions guest={guest} wedding={wedding} siteUrl={siteUrl} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RowActions({
  guest,
  wedding,
  siteUrl,
}: {
  guest: GuestWithRsvp;
  wedding: Wedding;
  siteUrl: string;
}) {
  return (
    <>
      <CopyLinkButton
        url={invitationUrl(siteUrl, guest.token)}
        label={guest.name}
      />

      <a
        href={whatsappShareUrl(wedding, guest, siteUrl)}
        target="_blank"
        rel="noreferrer noopener"
        className="rounded-(--button-radius) border border-beige px-3 py-1.5 text-xs text-graphite transition-colors duration-200 hover:border-charcoal/30 hover:text-charcoal"
      >
        WhatsApp
      </a>

      <GuestFormDialog guest={guest} triggerLabel="Düzenle" variant="ghost" />

      <DeleteGuestButton id={guest.id} name={guest.name} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 text-graphite ${align === "right" ? "text-right" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

function Cell({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-stone">{term}</dt>
      <dd className="mt-0.5 text-charcoal tabular-nums">{children}</dd>
    </div>
  );
}

function Phone({ value }: { value: string | null }) {
  if (!value) return <Empty />;
  return (
    <a href={`tel:${value}`} className="hover:text-charcoal">
      {value}
    </a>
  );
}

function Empty() {
  return <span className="text-stone">—</span>;
}
