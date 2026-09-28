-- Online Düğün Davetiyesi + RSVP — ilk şema
--
-- Supabase SQL Editor'a yapıştırıp çalıştırın veya:
--     supabase db push
--
-- Kurallar uygulama katmanına değil veritabanına gömülür: arayüzdeki bir
-- hata veriyi bozamamalıdır.

-- ---------------------------------------------------------------------------
-- weddings
-- ---------------------------------------------------------------------------

create table if not exists public.weddings (
  id                 uuid primary key default gen_random_uuid(),
  bride_name         text        not null,
  groom_name         text        not null,
  name_order         text        not null default 'bride_first',
  event_date         date        not null,
  event_time         time        not null,
  timezone           text        not null default 'Europe/Istanbul',
  venue_name         text        not null,
  venue_address      text,
  maps_url           text,
  invitation_text    text,
  theme              text        not null default 'elegant',
  primary_image      text,
  gallery_images     jsonb       not null default '[]'::jsonb,
  music_url          text,
  enable_child_split boolean     not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint weddings_name_order_check
    check (name_order in ('bride_first', 'groom_first')),

  constraint weddings_theme_check
    check (theme in ('minimal', 'romantic', 'modern', 'elegant', 'editorial')),

  -- Galeri bir dizi olmalı ve en fazla 5 fotoğraf içermeli (şartname §4).
  constraint weddings_gallery_is_array
    check (jsonb_typeof(gallery_images) = 'array'),

  constraint weddings_gallery_max
    check (jsonb_array_length(gallery_images) <= 5)
);

-- ---------------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------------

create table if not exists public.guests (
  id               uuid primary key default gen_random_uuid(),
  wedding_id       uuid        not null references public.weddings (id) on delete cascade,
  name             text        not null,
  phone            text,
  group_name       text,
  invitation_limit integer     not null default 1,
  token            text        not null unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint guests_name_not_blank
    check (length(btrim(name)) > 0),

  constraint guests_invitation_limit_positive
    check (invitation_limit >= 1)
);

-- Davetiye açılışının tek sorgusu token üzerinden gider.
create unique index if not exists guests_token_key on public.guests (token);
create index if not exists guests_wedding_id_idx on public.guests (wedding_id);

-- ---------------------------------------------------------------------------
-- rsvps
--
-- `pending` bir satır olarak saklanmaz: RSVP kaydı yoksa davetli cevap
-- vermemiş demektir. guest_id UNIQUE olduğu için "her davetli için en
-- fazla bir aktif RSVP" (şartname §21) veritabanı seviyesinde garanti.
-- ---------------------------------------------------------------------------

create table if not exists public.rsvps (
  id              uuid primary key default gen_random_uuid(),
  guest_id        uuid        not null unique
                    references public.guests (id) on delete cascade,
  status          text        not null,
  attending_count integer     not null,
  adult_count     integer,
  child_count     integer,
  note            text,
  responded_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint rsvps_status_check
    check (status in ('attending', 'declined')),

  -- Gelmeyen 0 kişi, gelen en az 1 kişi (şartname §41).
  constraint rsvps_count_matches_status
    check (
      (status = 'declined'  and attending_count = 0) or
      (status = 'attending' and attending_count >= 1)
    ),

  -- Yetişkin/çocuk ayrımı opsiyoneldir; kullanılıyorsa toplamı tutmalı.
  constraint rsvps_child_split_consistent
    check (
      (adult_count is null and child_count is null) or
      (adult_count >= 1 and child_count >= 0
        and adult_count + child_count = attending_count)
    ),

  constraint rsvps_note_length
    check (note is null or char_length(note) <= 500)
);

-- `attending_count <= guests.invitation_limit` kuralı iki tabloyu birden
-- ilgilendirdiği için CHECK ile ifade edilemez; Zod şemasında ve Server
-- Action içinde davetli kaydı okunarak zorlanır.

-- ---------------------------------------------------------------------------
-- updated_at otomatiği
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists weddings_touch_updated_at on public.weddings;
create trigger weddings_touch_updated_at
  before update on public.weddings
  for each row execute function public.touch_updated_at();

drop trigger if exists guests_touch_updated_at on public.guests;
create trigger guests_touch_updated_at
  before update on public.guests
  for each row execute function public.touch_updated_at();

drop trigger if exists rsvps_touch_updated_at on public.rsvps;
create trigger rsvps_touch_updated_at
  before update on public.rsvps
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (şartname §39-40)
--
-- RLS her tabloda açık ve HİÇBİR policy tanımlı DEĞİL. Policy yokluğu
-- erişimin reddi demektir: anon ve authenticated rolleri hiçbir satırı
-- okuyamaz veya yazamaz.
--
-- Uygulama veritabanına yalnızca sunucudan, service_role anahtarıyla
-- erişir; o rol RLS'i baypas eder. Anahtar bir şekilde sızsa bile
-- tarayıcıdan gelen anon anahtarla veri okunamaz.
--
-- Buraya policy eklemeyin. Davetli listesi public bir endpoint'ten
-- erişilebilir hale gelirse tüm gizlilik modeli çöker.
-- ---------------------------------------------------------------------------

alter table public.weddings force row level security;
alter table public.guests   force row level security;
alter table public.rsvps    force row level security;

alter table public.weddings enable row level security;
alter table public.guests   enable row level security;
alter table public.rsvps    enable row level security;
