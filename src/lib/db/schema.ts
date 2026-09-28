/**
 * Veritabanı şeması.
 *
 * SQLite kullanılır: tek düğünlük bir uygulama için ayrı bir servis
 * çalıştırmaya değmez. Tüm veri tek bir dosyada durur; yedek almak
 * dosyayı kopyalamaktır.
 *
 * Şema TypeScript içinde gömülü bir metin olarak tutulur, ayrı bir .sql
 * dosyası olarak değil: böylece derlenmiş çıktıya dahil olur ve dağıtımda
 * dosya kopyalama derdi çıkmaz.
 *
 * Kurallar uygulama katmanına değil veritabanına gömülür — arayüzdeki bir
 * hata veriyi bozamamalıdır.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS weddings (
  id                 TEXT    PRIMARY KEY,
  bride_name         TEXT    NOT NULL,
  groom_name         TEXT    NOT NULL,
  name_order         TEXT    NOT NULL DEFAULT 'bride_first',
  event_date         TEXT    NOT NULL,
  event_time         TEXT    NOT NULL,
  timezone           TEXT    NOT NULL DEFAULT 'Europe/Istanbul',
  venue_name         TEXT    NOT NULL,
  venue_address      TEXT,
  maps_url           TEXT,
  invitation_text    TEXT,
  theme              TEXT    NOT NULL DEFAULT 'elegant',
  cover_image        TEXT,
  primary_image      TEXT,
  gallery_images     TEXT    NOT NULL DEFAULT '[]',
  panels             TEXT    NOT NULL DEFAULT '[]',
  music_url          TEXT,
  enable_child_split INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT    NOT NULL,
  updated_at         TEXT    NOT NULL,

  CHECK (name_order IN ('bride_first', 'groom_first')),
  CHECK (theme IN ('minimal', 'romantic', 'modern', 'elegant', 'editorial')),
  CHECK (enable_child_split IN (0, 1)),
  CHECK (length(trim(bride_name)) > 0),
  CHECK (length(trim(groom_name)) > 0),
  CHECK (length(trim(venue_name)) > 0),

  -- Galeri bir JSON dizisi olmalı ve en fazla 5 fotoğraf içermeli.
  CHECK (json_valid(gallery_images)),
  CHECK (json_type(gallery_images) = 'array'),
  CHECK (json_array_length(gallery_images) <= 5),

  -- Davetiye panelleri: her biri bir çizim kartı.
  CHECK (json_valid(panels)),
  CHECK (json_type(panels) = 'array'),
  CHECK (json_array_length(panels) <= 8)
);

CREATE TABLE IF NOT EXISTS guests (
  id               TEXT    PRIMARY KEY,
  wedding_id       TEXT    NOT NULL REFERENCES weddings (id) ON DELETE CASCADE,
  name             TEXT    NOT NULL,
  phone            TEXT,
  group_name       TEXT,
  invitation_limit INTEGER NOT NULL DEFAULT 1,
  token            TEXT    NOT NULL UNIQUE,
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,

  CHECK (length(trim(name)) > 0),
  CHECK (invitation_limit >= 1)
);

-- Davetiye açılışının tek sorgusu token üzerinden gider.
CREATE UNIQUE INDEX IF NOT EXISTS guests_token_idx      ON guests (token);
CREATE        INDEX IF NOT EXISTS guests_wedding_id_idx ON guests (wedding_id);

-- 'pending' bir satır olarak saklanmaz: RSVP kaydı yoksa davetli cevap
-- vermemiş demektir. guest_id UNIQUE olduğu için "her davetli için en
-- fazla bir aktif RSVP" kuralı veritabanı seviyesinde garanti altındadır.
CREATE TABLE IF NOT EXISTS rsvps (
  id              TEXT    PRIMARY KEY,
  guest_id        TEXT    NOT NULL UNIQUE REFERENCES guests (id) ON DELETE CASCADE,
  status          TEXT    NOT NULL,
  attending_count INTEGER NOT NULL,
  adult_count     INTEGER,
  child_count     INTEGER,
  note            TEXT,
  responded_at    TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL,

  CHECK (status IN ('attending', 'declined')),

  -- Gelmeyen 0 kişi, gelen en az 1 kişi.
  CHECK (
    (status = 'declined'  AND attending_count = 0) OR
    (status = 'attending' AND attending_count >= 1)
  ),

  -- Yetişkin/çocuk ayrımı opsiyoneldir; kullanılıyorsa toplamı tutmalı.
  CHECK (
    (adult_count IS NULL AND child_count IS NULL) OR
    (adult_count >= 1 AND child_count >= 0
      AND adult_count + child_count = attending_count)
  ),

  CHECK (note IS NULL OR length(note) <= 500)
);
`;

/**
 * `attending_count <= guests.invitation_limit` kuralı iki tabloyu birden
 * ilgilendirir ve CHECK ile ifade edilemez; Zod şemasında ve Server
 * Action içinde davetli kaydı okunarak zorlanır.
 */
