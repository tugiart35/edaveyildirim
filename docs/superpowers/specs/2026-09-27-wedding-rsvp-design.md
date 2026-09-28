# Online Düğün Davetiyesi + RSVP — Tasarım Dokümanı

**Tarih:** 2026-09-27
**Durum:** Onaylandı
**Kaynak şartname:** `Online Düğün Davetiyesi + RSVP MVP — AI Build Specification (1).md`

---

## 1. Amaç ve kapsam

Tek bir düğün için, gerçek veritabanına bağlı, deploy edilebilir bir online davetiye + RSVP sistemi.

**Ürünün tek en önemli metriği:** düğüne kaç kişinin geleceği (*Toplam Beklenen Kişi*).

**Platform:** Yalnızca web. Mobil uygulama yok. Mobil öncelikli responsive tasarım (375px → desktop).

**Mimari hedef:** Tek düğünlük MVP, ancak `wedding_id` her yerde taşındığı için ileride çoklu düğün / SaaS'a genişletilebilir.

### Kapsam içi

Public davetiye sayfası, kişiye özel token'lı davetiye, RSVP alma ve güncelleme, admin auth, davetli CRUD, dashboard istatistikleri, arama/filtre, link kopyalama, WhatsApp paylaşımı, düğün ayarları, görsel yükleme, fon müziği.

### Kapsam dışı (bu turda)

| Özellik | Neden |
|---|---|
| CSV toplu import | Core akış değil; tek tek ekleme önce çalışsın |
| Yetişkin/çocuk ayrımı UI | Şema alanları hazır, arayüz sonraki turda |
| Setup wizard | Settings sayfası aynı işi görüyor |

Şartname §65'teki tüm maddeler (masa planı, QR check-in, ödeme, SaaS, SMS, WhatsApp Business API, AI metin üretici, misafir foto yükleme, album, seating chart, yemek tercihi, push notification, gelişmiş analitik) de kapsam dışıdır.

---

## 2. Teknoloji

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | Next.js 16, App Router | Şartname §6 |
| Dil | TypeScript (strict) | — |
| Stil | Tailwind CSS v4 | — |
| Admin UI | Elle yazılmış bileşenler + yerel `<dialog>` | Aşağıdaki nota bakın |
| Public UI | Tamamen özel bileşenler | Şartname §45: generic SaaS görünümü olmamalı |
| Veritabanı | SQLite (`node:sqlite`) | Tek düğün için ayrı servis gereksiz; bkz. sapma #11 |
| Dosya | Şimdilik yok (yol elle girilir) | bkz. sapma #10 |
| Auth | Özel: `node:crypto` scrypt + HMAC imzalı cookie | Tek admin için Supabase Auth'tan daha az parça; ek bağımlılık yok |
| Validasyon | Zod (paylaşılan şemalar) | Şartname §41 |
| Mutasyon | Server Actions + `revalidatePath` | Şartname §54, §58 |
| Animasyon | CSS + IntersectionObserver hook | Framer Motion'dan hafif; şartname §44 opsiyonel diyor |
| Test | Vitest | Şartname §60 |
| Font | `next/font` — Cormorant Garamond + Inter | Şartname §46, en fazla iki aile |
| Deploy | Docker / Dokploy, kalıcı disk | Kullanıcının kendi VPS'i |

**State yönetimi:** React yerel state + Server Actions. Redux / React Query yok.

**shadcn/ui kullanılmadı.** Şartname §6 "mümkünse" diyor; kendi jeton sistemimiz (`--color-*`, `--card-radius`, `--button-radius`) zaten kurulu ve shadcn kendi renk değişkenleriyle gelerek onunla çakışırdı. İhtiyaç duyulan tek karmaşık parça modal; bunun için yerel `<dialog>` öğesi kullanıldı — odak tuzağı, Esc ile kapatma ve arka planın devre dışı kalması tarayıcıdan geliyor.

> Tailwind'in reset'i tüm öğelerde `margin: 0` uyguladığı için `<dialog>`'un varsayılan `margin: auto` ortalaması kaybolur; modallerde `m-auto` açıkça verilir.

---

## 3. Güvenlik mimarisi

Bu, şartname §39-40'ın uygulanış biçimidir.

**Veritabanına yalnızca sunucudan erişilir.** SQLite dosyası sunucunun diskindedir; tarayıcıya hiçbir veritabanı istemcisi veya kimlik bilgisi gitmez. `src/lib/db/connection.ts` ve `src/lib/data/index.ts` `server-only` ile işaretlidir: bir client component'e sızarlarsa derleme hata verir.

Supabase kullanılmadığı için RLS'e gerek yoktur — ağ üzerinden erişilebilen bir veritabanı yoktur.

**Diğer kurallar:**

- `/invite/[token]` yalnızca o token'a ait davetli bilgisini döner; başka davetli verisi sızmaz.
- Davetli listesi hiçbir public endpoint'ten erişilebilir değil.
- `/admin/*` `src/proxy.ts` ile korunur (Next.js 16'da `middleware` bu isme taşındı).
- Token ve davetli adı SEO metadata'sında yer almaz; kişisel sayfalar `noindex` (şartname §38).
- Secret'lar yalnızca `.env.local` içinde; repoya boş `.env.example` girer.
- Veritabanı derleme çıktısına dahil edilmez (`outputFileTracingExcludes`) ve Docker bağlamına girmez (`.dockerignore`).

---

## 4. Veri modeli

### 4.1 `weddings`

| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `bride_name` | text NOT NULL | |
| `groom_name` | text NOT NULL | |
| `name_order` | text NOT NULL | `'bride_first'` \| `'groom_first'`, default `'bride_first'` |
| `event_date` | date NOT NULL | |
| `event_time` | time NOT NULL | |
| `timezone` | text NOT NULL | default `'Europe/Istanbul'` (şartname §55) |
| `venue_name` | text NOT NULL | |
| `venue_address` | text | |
| `maps_url` | text | |
| `invitation_text` | text | |
| `theme` | text NOT NULL | `minimal`\|`romantic`\|`modern`\|`elegant`\|`editorial`, default `'elegant'` |
| `primary_image` | text | Storage public URL |
| `gallery_images` | jsonb NOT NULL | string[], default `'[]'`, en fazla 5 (uygulama katmanında) |
| `music_url` | text | |
| `enable_child_split` | boolean NOT NULL | default `false` — alan hazır, UI sonraki turda |
| `created_at` / `updated_at` | timestamptz NOT NULL | default `now()` |

### 4.2 `guests`

| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | |
| `wedding_id` | uuid NOT NULL | FK → `weddings.id` ON DELETE CASCADE |
| `name` | text NOT NULL | |
| `phone` | text | |
| `group_name` | text | serbest metin |
| `invitation_limit` | int NOT NULL | default 1, `CHECK (invitation_limit >= 1)` |
| `token` | text NOT NULL UNIQUE | |
| `created_at` / `updated_at` | timestamptz NOT NULL | |

**İndeksler:** `token` üzerinde unique index (davetiye açılışının tek sorgusu), `wedding_id` üzerinde index.

**Token üretimi:** `nanoid`, 10 karakter, karışması kolay karakterler (`0/O`, `1/l/I`) çıkarılmış alfabe. Sequential id URL'de asla kullanılmaz (şartname §20).

### 4.3 `rsvps`

| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | |
| `guest_id` | uuid NOT NULL **UNIQUE** | FK → `guests.id` ON DELETE CASCADE |
| `status` | text NOT NULL | `'attending'` \| `'declined'` |
| `attending_count` | int NOT NULL | |
| `adult_count` | int | nullable |
| `child_count` | int | nullable |
| `note` | text | `CHECK (char_length(note) <= 500)` |
| `responded_at` | timestamptz NOT NULL | |
| `updated_at` | timestamptz NOT NULL | |

### 4.4 `pending` durumunun ele alınışı

**Şartnameden bilinçli sapma:** `pending` bir satır olarak saklanmaz. RSVP kaydı yoksa davetli "cevap bekleniyor" demektir.

Gerekçe: `guest_id` UNIQUE constraint'i upsert'ü doğal kılar, "her guest için en fazla bir aktif RSVP" (şartname §21) veritabanı seviyesinde garanti edilir, ve durum sayısı azalır. Hesaplar birebir aynı sonucu verir:

- Şartname: `responded_guests = COUNT(rsvp WHERE status != 'pending')`
- Burada: `responded_guests = COUNT(rsvps)`

UI'da durum yine üç değerlidir: `attending` / `declined` / `pending` (türetilmiş).

### 4.5 Veritabanı seviyesindeki kurallar

Uygulama katmanındaki bir hata veriyi bozamasın diye CHECK constraint'leri:

```sql
CHECK (status IN ('attending','declined'))
CHECK (
  (status = 'declined'  AND attending_count = 0) OR
  (status = 'attending' AND attending_count >= 1)
)
CHECK (
  (adult_count IS NULL AND child_count IS NULL) OR
  (adult_count >= 1 AND child_count >= 0 AND adult_count + child_count = attending_count)
)
CHECK (note IS NULL OR char_length(note) <= 500)
```

`attending_count <= invitation_limit` kuralı iki tabloyu birden ilgilendirdiği için CHECK ile ifade edilemez; Zod şemasında ve Server Action içinde (guest kaydı okunarak) zorlanır.

---

## 5. Rota yapısı

| Rota | Tip | İçerik |
|---|---|---|
| `/` | Server Component | Generic davetiye. RSVP formu yok; "Katılım bildirmek için size gönderilen kişisel bağlantıyı kullanın" notu. |
| `/invite/[token]` | Server Component + client RSVP adası | Kişiselleştirilmiş davetiye + RSVP. Geçersiz token → dostane hata sayfası. |
| `/admin` | Client form + Server Action | Giriş ekranı. Oturum açıksa `/admin/dashboard`'a yönlendirir. |
| `/admin/dashboard` | Server Component | İstatistikler. |
| `/admin/guests` | Server Component + client tablo | Davetli yönetimi. |
| `/admin/settings` | Server Component + client form | Düğün bilgileri + görsel/müzik yükleme. |

`middleware.ts`: `/admin/*` altındaki her rota oturum cookie'si ister, `/admin` hariç. Ayrı API route handler yok — tüm mutasyonlar Server Action.

---

## 6. Klasör yapısı

```
src/
  app/
    layout.tsx                 # fontlar, global stil
    page.tsx                   # generic davetiye
    invite/[token]/page.tsx
    admin/
      layout.tsx               # oturum kontrolü + sidebar
      page.tsx                 # login
      dashboard/page.tsx
      guests/page.tsx
      settings/page.tsx
  components/
    invitation/                # InvitationHero, Countdown, WeddingDetails,
                               # PhotoGallery, RSVPForm, RSVPSuccess, MusicToggle
    admin/                     # DashboardStats, GuestTable, GuestForm,
                               # WeddingSettingsForm, CopyInvitationButton,
                               # WhatsAppShareButton, AdminSidebar
    ui/                        # shadcn/ui
  lib/
    db/                        # supabase server client, sorgular
    auth/                      # hash, session, middleware yardımcıları
    validation/                # Zod şemaları
    stats/                     # computeWeddingStats (saf fonksiyon)
    utils/                     # token, tarih/saat, whatsapp mesajı, cn
  actions/                     # Server Actions
  types/
supabase/
  migrations/                  # numaralı SQL dosyaları
  seed.ts                      # yalnızca development
docs/superpowers/specs/
```

---

## 7. Bileşenler

Şartname §53'teki liste, kapsam dışı bırakılanlar çıkarılarak:

`InvitationHero`, `Countdown`, `WeddingDetails`, `PhotoGallery`, `RSVPForm`, `RSVPSuccess`, `MusicToggle`, `GuestForm`, `GuestTable`, `DashboardStats`, `WeddingSettingsForm`, `CopyInvitationButton`, `WhatsAppShareButton`.

Client bileşen yalnızca etkileşim gerektiğinde: `Countdown`, `RSVPForm`, `MusicToggle`, `GuestTable` (arama/filtre), form bileşenleri, kopyala butonu. Geri kalan her şey Server Component (şartname §59).

---

## 8. Public davetiye deneyimi

### Akış: yığılan kartlar

Sayfa aşağı akan klasik bir landing page değildir. Hero tam ekran bir **kapak** olarak durur; sonrasındaki her bölüm, üst üste yığılan bir **kart**tır.

Her kart `position: sticky` ile sırasına göre artan bir üst boşlukta durur:

```
top = index × başlık_yüksekliği + üst_pay
```

Bir sonraki kart üzerine kayarken öncekinin yalnızca başlık şeridi görünür kalır; ilerledikçe ekranın üstünde bir başlık destesi birikir. Referans: `tugiverse.online` sitesindeki PROJECT bölümünün akışı.

**Kart anatomisi**

```
┌────────────────────────────────────┐  yuvarlak köşe, ince kenarlık
│ ── DÜĞÜN            ( YOL TARİFİ ↗)│  başlık şeridi (yapışan kısım)
├────────────────────────────────────┤
│                                    │
│            içerik                  │  min-h 62svh, dikeyde ortalı
│                                    │
└────────────────────────────────────┘
```

Başlık şeridi solda hairline + aralıklı büyük harf etiket, sağda opsiyonel pill bağlantı taşır. Bölümler numaralandırılmaz — numaralar portfolyoda proje sıralamak için anlamlıdır, davetiyede liste hissi verir.

Kart içeriği varsayılan olarak okuma sütununa (`max-w-xl`) sığdırılır. Görsel içerikler `wide` bayrağıyla kartın tüm genişliğini alır.

**Kart yüksekliği bir ekranı aşmamalıdır.** Aşarsa yığılma okunmaz hale gelir: tek bir kartın içinde uzun süre kaydırılır, önceki başlıklar anlamsızca tepede birikir. Galeri bu yüzden dikey ızgara değil yatay şerittir — dört fotoğrafın dikey ızgarası kartı iki ekran boyuna çıkarıyordu.

**Kartlar**

| Kart | Etiket | Başlık eylemi | Görünürlük |
|---|---|---|---|
| Geri sayım | GERİ SAYIM | — | Düğün geçtiyse kaldırılır |
| Galeri | BİZ | — | `gallery_images` boşsa oluşturulmaz; geniş içerik |
| Detaylar | DÜĞÜN | Yol Tarifi ↗ | `maps_url` yoksa eylem gizlenir |
| RSVP | KATILIM | — | Her zaman; içerik sayfaya göre değişir |

**Geçiş hareketi**

Kart yerine otururken içeriği süzülerek gelir. `CardStack` her kaydırma karesinde her karta `--enter` yazar: `0` = henüz aşağıda, `1` = yapıştığı yerde.

```
--enter = clamp01(1 − (kartın üstü − yapışma noktası) / 280px)
```

`--enter` üç şeyi sürer:

| Hedef | Etki |
|---|---|
| `.card-content` opaklığı | 0.1 → 1 |
| `.card-content` kaydırması | 1.75rem aşağıdan 0'a |
| Kartın gölgesi | sığdan derine |

Ayrıca o anda ekranda en çok yer kaplayan kart `data-active` alır; başlığı `stone`'dan `charcoal`'a döner ve yanındaki hairline uzar. Böylece yığında hangi kartın okunduğu belli olur.

Bir kartın "ekranda kapladığı yer", kendi üstünden **bir sonraki kartın üstüne** kadar olan mesafedir — gerisi zaten sonraki kartın altında kalır. Bu olmadan yapışmış ilk kart hep en geniş görünür ve `data-active` hiç ilerlemez.

Hesabın tamamı `src/lib/stack/stack-frame.ts` içindeki saf `computeStackFrame()` fonksiyonundadır; DOM okumaları çağıran tarafta yapılır, matematik tarayıcısız test edilir.

**Teknik notlar**

- Yığılma saf CSS'tir. `CardStack`'in istemci tarafında olmasının nedenleri: geçiş ilerlemesini yazmak ve düğün geçtiğinde geri sayım kartını listeden düşürmek (sayfa statik üretildiği için bu karar sunucuda verilemez).
- Yapışkan öğeye `transform` uygulanmaz; hareket kart *içeriğine* verilir. Aksi halde transform yeni bir containing block oluşturur ve sticky riske girer.
- Yapışkan öğelerin hiçbir atası `overflow: hidden` olmamalıdır.
- `prefers-reduced-motion` açıkken dinleyici hiç kurulmaz ve içerik tam opaklıkta kalır.
- Kaydırma dinleyicisi pasiftir ve `requestAnimationFrame` ile bir kareye indirgenir.

### Diğer bölümler

- **Hero** — tam ekran kapak. Çift fotoğrafı veya monogram, isimler (`name_order`'a göre sıralı), tarih, kısa davet cümlesi, ince scroll göstergesi. Kişisel linkte davetli adıyla selamlama. İlk kart hero'nun altına negatif boşlukla biner.
- **Footer** — yığının altında, monogram ve kapanış satırı.
- **Müzik** — sabit konumda küçük toggle. Autoplay yok; kullanıcı başlatır (şartname §5). `music_url` yoksa gizlenir.

### Tasarım dili

Geniş whitespace, ince ayraç çizgileri, büyük çift isimleri, tam genişlikte fotoğraflar.

Zemin, kartlardan belirgin biçimde daha koyudur; aksi halde yığılan kartlar "bölüm" gibi okunur, kart gibi değil.

### Temalar

Şartname §5'teki beş tema yalnızca renk değiştirmez — başlık fontu, harf ağırlığı, harf aralığı, köşe yarıçapı ve buton biçimi de değişir. Hepsi CSS değişkeni olarak `[data-theme="…"]` altında tanımlıdır; `data-theme` kök öğeye yazılır ve Tailwind yardımcıları `var(--color-*)` referansı derlediği için tüm arayüz yeniden renklenir.

| Tema | Zemin | Vurgu | Başlık | Köşe | Buton |
|---|---|---|---|---|---|
| **elegant** *(varsayılan)* | ivory `#f4efe5` | muted gold | Cormorant 300 | 1.75rem | 2px |
| **minimal** | soğuk beyaz `#f2f2f1` | gri | Inter 300, sıkı | 0.375rem | 2px |
| **romantic** | blush `#f8eeea` | gül kurusu | Cormorant 300 | 2.5rem | pill |
| **modern** | soğuk gri `#e9e9e6` | mürekkep (tek renk) | Inter 500, çok sıkı | 0.125rem | köşeli |
| **editorial** | sıcak kağıt `#f0e9dc` | terracotta | Cormorant 400 | 0 | köşeli |

İki font ailesi kuralı korunur (şartname §46): her tema Cormorant veya Inter'i başlık olarak kullanır, gövde her zaman Inter'dir.

Başlık tipografisi `font-display` yardımcısı yerine `.type-display` sınıfıyla yazılır; aile, ağırlık ve harf aralığının üçü birden temaya bağlıdır.

Admin paneli davetiye temasından etkilenmemelidir; kendi layout'unda `data-theme` değerini sıfırlar.

Kaçınılacaklar (şartname §45): dashboard hissi, card yığını, aşırı yuvarlatma, gradient/neon, ağır gölge, popup.

Animasyon: bölümler viewport'a girince fade + hafif yukarı kayma, IntersectionObserver ile. `prefers-reduced-motion` desteklenir.

### SEO

```
title:       "{Gelin} & {Damat} | Düğün Davetiyesi"
description: "{Gelin} ve {Damat}'ın düğün davetiyesi."
```

Token ve davetli adı metadata'ya asla girmez. `/invite/[token]` için `robots: noindex`.

---

## 9. RSVP akışı

### Durumlar

| Durum | Gösterim |
|---|---|
| Cevap yok | "Sevgili {Ad}, aramızda olacak mısınız?" + iki büyük buton |
| Evet seçildi | Kişi sayısı stepper'ı (`−  2 kişi  +`), opsiyonel not, Gönder |
| Hayır seçildi | Opsiyonel not, Gönder |
| Kaydedildi (attending) | "Teşekkür ederiz 🤍 … {n} kişi olarak katılımınız kaydedildi." |
| Kaydedildi (declined) | "Bilgi verdiğiniz için teşekkür ederiz. …" |
| Tekrar ziyaret | Mevcut cevap özeti + "Cevabımı değiştir" butonu |

### Stepper kuralları

Default 1, minimum 1, maksimum `invitation_limit`. `invitation_limit = 1` ise stepper gizlenir, sayı sabit 1 gösterilir.

### Validasyon (Zod, istemci + sunucu)

```
status ∈ {attending, declined}
status = attending  → 1 <= attending_count <= guest.invitation_limit
status = declined   → attending_count = 0
note                → <= 500 karakter
```

Sunucu tarafı `invitation_limit`'i istemciye güvenmeden veritabanından okur.

### Kalıcılık

`guest_id` üzerinde upsert. `responded_at` ilk cevapta yazılır, sonraki güncellemelerde korunur; `updated_at` her seferinde yenilenir. Başarıdan sonra `revalidatePath('/admin/dashboard')` ve `revalidatePath('/admin/guests')`.

### Hata ve yükleme durumları

Geçersiz token → "Davet bağlantısı bulunamadı. Lütfen size gönderilen bağlantıyı kontrol edin." Sunucu hatası → "Bir sorun oluştu. Lütfen tekrar deneyin." Gönderim sırasında buton `disabled` + spinner; çift gönderim engellenir (şartname §42).

---

## 10. Admin paneli

### 10.1 Auth

`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` ve `AUTH_SECRET` env'de tutulur; hiçbiri koda gömülmez ve hiçbiri tarayıcıya gönderilmez.

**Şifre:** Node'un yerleşik `scrypt`'i. Ek bağımlılık yok, bcrypt kadar güvenli. Doğrulama sabit zamanlı.

**Oturum:** `node:crypto` HMAC-SHA256 ile imzalı jeton, 7 gün ömürlü, `httpOnly` + `secure` (production) + `sameSite=lax` cookie. Payload yalnızca bitiş zamanını taşır — tek admin olduğu için kimlik bilgisi gereksiz.

**Hash biçimi:** `scrypt.<tuz>.<anahtar>`, base64url.

> Ayraç bcrypt geleneğindeki `$` **değildir**. Next.js `.env` dosyalarında değişken genişletmesi yapar ve `$...` dizilerini değişken referansı sanıp siler — hash uygulamaya ulaşmadan bozulur. base64url nokta içermediği için `.` güvenli ayraçtır. `AUTH_SECRET` de aynı nedenle hex üretilir.

**Koruma:** `src/proxy.ts` (Next.js 16'da `middleware` bu isme taşındı, yalnızca Node.js çalışma zamanında koşar). `/admin/*` altındaki her rota oturum ister; giriş ekranının kendisi (`/admin`) hariç. Girişten sonra dönülecek yol `?devam=` ile taşınır ve yalnızca `/admin/` ile başlayan değerler kabul edilir (açık yönlendirme koruması).

Hash ve secret üretmek için: `npm run hash-password -- "şifreniz"`.

### 10.2 Dashboard

En üstte tek büyük rakam: **Toplam Beklenen Kişi**.

Altında kartlar: Toplam Davetli, Toplam Davet Hakkı, Gelecek (kişi), Gelmeyecek (davetli), Cevap Bekleyen (davetli).

Yanıt oranı: `responded_guests / total_guests * 100`, yüzde olarak.

Breakdown: Geliyor / Gelmiyor / Cevap Bekleniyor için CSS progress bar. Chart kütüphanesi yok (şartname §25).

**Hesaplama:** Tek sorgu `guests LEFT JOIN rsvps`, ardından saf TypeScript fonksiyonu:

```ts
computeWeddingStats(rows): {
  totalGuests, totalCapacity, respondedGuests, pendingGuests,
  attendingGuests, decliningGuests, expectedPeople, responseRate
}
```

Saf fonksiyon olması, şartname §60'taki testleri veritabanı olmadan yazmayı mümkün kılar.

Kavram ayrımı (şartname §23): "davetli kaydı" ≠ "gelecek kişi". `expectedPeople` daima `SUM(rsvps.attending_count WHERE status='attending')`.

### 10.3 Davetli listesi

Tablo kolonları: Davetli | Telefon | Grup | Limit | Durum | Gelecek Kişi | İşlemler.

Durum badge'leri: Geliyor (yeşil) / Gelmiyor (gri) / Cevap Bekleniyor (amber). Sade, WCAG AA kontrastlı.

Arama: ad, telefon, grup üzerinde. Filtre: Tümü / Geliyor / Gelmiyor / Cevap Bekleniyor + grup seçici. Arama ve filtre istemci tarafında (MVP ölçeğinde birkaç yüz kayıt).

Satır işlemleri: Düzenle, Sil (onay dialogu ile), Linki Kopyala, WhatsApp'ta Gönder.

**Link kopyalama:** `${NEXT_PUBLIC_SITE_URL}/invite/${token}`, Clipboard API, toast: "Davet linki kopyalandı."

**WhatsApp:** `https://wa.me/{phone}?text={encodeURIComponent(mesaj)}`. Telefon yoksa numara olmadan `wa.me/?text=`. Mesaj şablonu şartname §34'teki gibi.

### 10.4 Boş durum

"Henüz davetli eklemediniz. İlk davetlinizi ekleyerek başlayın." + "Davetli Ekle" butonu.

### 10.5 Davetli ekleme / düzenleme

Form: Ad Soyad*, Telefon, Grup, Maksimum Davetli Sayısı* (default 1). Kayıtta unique token üretilir ve kişisel URL oluşturulur.

Düzenlemede ad, telefon, grup, limit değiştirilebilir; token sabit kalır. Limit mevcut `attending_count`'un altına düşürülürse uyarı gösterilir ama engellenmez — admin bilinçli karar verir.

### 10.6 Settings

Düzenlenebilir: gelin adı, damat adı, isim sırası, tarih, saat, mekân, adres, maps URL, davetiye metni, tema, hero görsel, galeri görselleri, müzik dosyası.

**Yükleme:** Supabase Storage `wedding-assets` bucket'ı, Server Action üzerinden (service role). Kabul: jpg, jpeg, png, webp. Maksimum 10MB. Görseller `next/image` ile servis edilir.

### 10.7 Admin UI

Sidebar: Dashboard, Davetliler, Düğün Bilgileri, Çıkış. Mobilde drawer. Temiz ve fonksiyonel; public taraf kadar dekoratif olmasına gerek yok (şartname §47).

---

## 11. Erişilebilirlik

Semantic HTML, her form alanı için `<label>`, buton `aria-label`'ları, klavye navigasyonu, görünür focus ring, WCAG AA kontrast, tüm görsellerde `alt`, `prefers-reduced-motion` desteği.

---

## 12. Testler

Vitest ile, saf fonksiyonlar üzerinde (şartname §60):

**RSVP validasyonu**
- `invitation_limit = 4` olan davetli 5 kişi seçemez
- `attending` durumunda `attending_count` en az 1
- `declined` durumunda `attending_count = 0`
- Not 500 karakteri aşamaz

**Dashboard hesabı**
- Guest A attending 2, Guest B attending 4, Guest C declined → `expectedPeople = 6`
- Yanıt oranı doğru hesaplanır
- Cevap vermemiş davetli `pending` sayılır

**Token**
- Üretilen token'lar unique ve 10 karakter
- Karışması kolay karakterler içermez

Geçersiz token davranışı manuel/uçtan uca doğrulanır.

---

## 13. Environment değişkenleri

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
AUTH_SECRET=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` yok — bölüm 3'teki karar gereği tarayıcı Supabase'e hiç bağlanmıyor.

Tüm URL'ler `NEXT_PUBLIC_SITE_URL` üzerinden üretilir; kod hiçbir domain'e bağlı yazılmaz (şartname §64).

---

## 14. Uygulama adımları

Kullanıcı kararı: **önce frontend, sonra backend.** Bunun boşa iş olmaması için veri erişimi baştan soyutlanır.

### 14.1 Veri katmanı soyutlaması

`src/lib/data/` altında tüm veri erişimi **async fonksiyonlar** olarak tanımlanır:

```ts
getWedding(): Promise<Wedding>
updateWedding(input): Promise<Wedding>
listGuests(): Promise<GuestWithRsvp[]>
getGuestByToken(token): Promise<GuestWithRsvp | null>
createGuest(input): Promise<Guest>
updateGuest(id, input): Promise<Guest>
deleteGuest(id): Promise<void>
saveRsvp(guestId, input): Promise<Rsvp>
```

Frontend fazında bu fonksiyonlar diskteki JSON dosyasından (`.data/dev-store.json`, gitignore'lu) okur/yazar. Backend fazında yalnızca bu dosyanın içi Supabase çağrılarıyla değiştirilir — imzalar ve UI değişmez.

Server Actions ilk günden kullanılır. Yani RSVP gerçekten kalıcı olarak kaydedilir, dashboard sayıları gerçekten değişir; altındaki depo geçici olarak JSON dosyasıdır.

### 14.2 Frontend fazı

| Adım | İçerik | Bitiş kriteri |
|---|---|---|
| **1** | Proje iskeleti: Next.js, TS, Tailwind, fontlar, klasör yapısı, tipler, JSON veri katmanı, demo veri | `npm run dev` açılıyor, veri katmanı okunuyor |
| **2** | Public davetiye: hero, countdown, detaylar, galeri, harita, animasyon, SEO | Davetiye 375px–desktop arası düzgün görünüyor |
| **3** | RSVP: akış, stepper, validasyon, kayıt, düzenleme, hata/yükleme durumları + testler | Uçtan uca RSVP çalışıyor (JSON deposuna) |
| **4** | Admin layout + sidebar + login ekranı (UI, geçici doğrulama) | `/admin` gezinilebiliyor |
| **5** | Dashboard: `computeWeddingStats`, kartlar, yanıt oranı, breakdown + testler | Sayılar doğru, testler geçiyor |
| **6** | Davetli yönetimi: CRUD, token, arama, filtre, link kopyala, WhatsApp, boş durum | Davetli eklenip kişisel link üretilebiliyor |
| **7** | Settings: form, tema seçimi, galeri yönetimi, müzik | Panelden tüm içerik düzenlenebiliyor ✓ |

### 14.3 Backend fazı

| Adım | İçerik | Bitiş kriteri |
|---|---|---|
| **8** | *Kullanıcı:* Supabase projesi açar, URL + service role key verir. Migration SQL, RLS, CHECK'ler, indeksler, seed | DB kurulu, demo veri yüklü |
| **9** | Gerçek auth: bcrypt hash script, session JWT, middleware | `/admin` gerçekten korunuyor |
| **10** | `src/lib/data/` implementasyonunu Supabase'e çevir | UI değişmeden gerçek DB'ye bağlanıyor |
| **11** | Supabase Storage: hero ve galeri görselleri, müzik dosyası yükleme | Panelden dosya yüklenebiliyor |
| **12** | QA: lint, build, test, responsive kontrol, uçtan uca senaryo, README, `.env.example` | Teslim checklist'i tamam |

---

## 15. Kabul kriterleri

Şartname §66 ve §71 esas alınır. Proje ancak şu uçtan uca senaryo çalıştığında tamamlanmış sayılır (şartname §72):

> Admin giriş yapar → davetli oluşturur → kişisel linki açar → RSVP verir → dashboard'a döner → *Toplam Beklenen Kişi* değerinin doğru değiştiğini görür.

Teslimden önce çalıştırılacak komutlar:

```bash
npm install
npm run lint
npm run build
npm test
```

Build veya lint hatalıyken proje tamamlanmış sayılmaz.

---

## 16. Şartnameden bilinçli sapmalar

| # | Şartname | Bu tasarım | Gerekçe |
|---|---|---|---|
| 1 | §21: `rsvps.status` `pending` içerir | `pending` satır olarak saklanmaz, türetilir | UNIQUE constraint ile upsert doğallaşır; hesaplar birebir aynı |
| 2 | §6, §22: Supabase Auth | Özel `node:crypto` scrypt + HMAC cookie | Tek admin için daha az parça, ek bağımlılık yok; ileride Supabase Auth'a geçiş kolay |
| 3 | §51: Supabase env değişkenleri | `DATABASE_FILE` | Supabase kullanılmıyor |
| 4 | §44: Framer Motion önerisi | CSS + kaydırmaya bağlı `--enter` ilerlemesi | Daha küçük bundle; mobil 4G hedefi (§59) |
| 5 | §16: yetişkin/çocuk ayrımı | Şema alanları var, UI yok | Kapsam kararı |
| 6 | §35: CSV import | Yok | Kapsam kararı |
| 7 | §49: setup wizard | Yok | Settings sayfası aynı işlevi görüyor |
| 8 | §3, §70: kod öncesi içerik formu | Placeholder içerikle başlanır | İçerik admin panelinden düzenlenebilir; geliştirme beklemez |
| 9 | §6: shadcn/ui "mümkünse" | Elle yazılmış bileşenler + yerel `<dialog>` | Kendi jeton sistemimizle çakışırdı; tek karmaşık parça modal ve o tarayıcıdan geliyor |
| 10 | §37: görseller Storage'dan | Dosya yolu elle yazılır | Yükleme sonraki turda; form alanları aynı kalıp yanına buton alacak |
| 11 | §6, §63: Supabase + Vercel | SQLite + kendi VPS (Dokploy) | Tek seferlik bir düğün için ayrı bir veritabanı servisi ve hesap gereksiz. Tüm veri tek dosyada; yedek almak dosyayı kopyalamak. Kısıt: uygulama tek container'da çalışmalı. |
