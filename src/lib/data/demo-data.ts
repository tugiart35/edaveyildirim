import type { Guest, Rsvp, Wedding } from "@/types";

/**
 * Geliştirme için örnek veri.
 *
 * Buradaki her şey admin panelinden düzenlenebilir — gerçek düğün bilgileri
 * girildiğinde bu veriye ihtiyaç kalmaz. Production'da asla yüklenmez.
 */

const WEDDING_ID = "00000000-0000-4000-8000-000000000001";

export const demoWedding: Wedding = {
  id: WEDDING_ID,
  brideName: "Ayşe",
  groomName: "Mehmet",
  nameOrder: "bride_first",
  eventDate: "2026-10-18",
  eventTime: "19:30",
  timezone: "Europe/Istanbul",
  venueName: "Çırağan Palace",
  venueAddress: "Çırağan Cad. No:32, Beşiktaş, İstanbul",
  mapsUrl: "https://maps.google.com/?q=Ciragan+Palace+Istanbul",
  invitationText:
    "Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.",
  theme: "elegant",
  // Geçici mockup görselleri (Unsplash). Gerçek fotoğraflar admin
  // panelinden yüklendiğinde `public/mock/` klasörü silinebilir.
  primaryImage: "/mock/hero.jpg",
  galleryImages: [
    "/mock/galeri-1.jpg",
    "/mock/galeri-2.jpg",
    "/mock/galeri-3.jpg",
    "/mock/galeri-4.jpg",
  ],
  musicUrl: null,
  enableChildSplit: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

interface DemoGuestSeed {
  id: string;
  name: string;
  phone: string | null;
  groupName: string | null;
  invitationLimit: number;
  token: string;
  rsvp: {
    status: Rsvp["status"];
    attendingCount: number;
    note: string | null;
  } | null;
}

const seeds: DemoGuestSeed[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    name: "Ahmet Yılmaz",
    phone: "+905551111111",
    groupName: "Arkadaşlar",
    invitationLimit: 2,
    token: "Px82Kms92n",
    rsvp: { status: "attending", attendingCount: 2, note: null },
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    name: "Mehmet Kaya",
    phone: "+905552222222",
    groupName: "Aile",
    invitationLimit: 4,
    token: "Rt74Bxq31m",
    rsvp: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    name: "Seda Demir",
    phone: "+905553333333",
    groupName: "İş",
    invitationLimit: 1,
    token: "Hd93Cvz45k",
    rsvp: {
      status: "declined",
      attendingCount: 0,
      note: "O tarihte şehir dışında olacağım, çok üzgünüm.",
    },
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    name: "Can Ailesi",
    phone: "+905554444444",
    groupName: "Akraba",
    invitationLimit: 5,
    token: "Ws28Nfy67j",
    rsvp: { status: "attending", attendingCount: 4, note: null },
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    name: "Zeynep Arslan",
    phone: null,
    groupName: "Gelin Ailesi",
    invitationLimit: 3,
    token: "Qm57Jdt89p",
    rsvp: null,
  },
];

const SEEDED_AT = "2026-01-02T09:00:00.000Z";

export const demoGuests: Guest[] = seeds.map((seed) => ({
  id: seed.id,
  weddingId: WEDDING_ID,
  name: seed.name,
  phone: seed.phone,
  groupName: seed.groupName,
  invitationLimit: seed.invitationLimit,
  token: seed.token,
  createdAt: SEEDED_AT,
  updatedAt: SEEDED_AT,
}));

export const demoRsvps: Rsvp[] = seeds
  .filter((seed) => seed.rsvp !== null)
  .map((seed) => ({
    id: `${seed.id}-rsvp`,
    guestId: seed.id,
    status: seed.rsvp!.status,
    attendingCount: seed.rsvp!.attendingCount,
    adultCount: null,
    childCount: null,
    note: seed.rsvp!.note,
    respondedAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  }));
