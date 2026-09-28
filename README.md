# Online Düğün Davetiyesi + RSVP

Tek bir düğün için dijital davetiye ve katılım takip sistemi. Davetlilere
kişiye özel bağlantı gönderilir, cevapları admin panelinden takip edilir.

Sistemin varlık sebebi tek bir sayıdır: **düğüne kaç kişi gelecek.**

---

## Özellikler

**Davetli tarafı**

- Tam ekran davetiye; kaydırdıkça üst üste yığılan kart akışı
- Kişiye özel bağlantı: `/invite/<token>` — davetli adıyla karşılanır
- Geri sayım, fotoğraf şeridi, yol tarifi
- RSVP: geliyorum / gelemiyorum, kişi sayısı, not
- Cevap düğüne kadar istenildiği zaman değiştirilebilir
- Beş tema: minimal, romantic, modern, elegant, editorial

**Admin tarafı**

- Toplam beklenen kişi, yanıt oranı, davetli dağılımı
- Cevap bekleyenler listesi (isim ve telefonla)
- Davetli ekleme, düzenleme, silme; arama ve filtreleme
- Davet bağlantısını kopyalama, WhatsApp ile gönderme
- Düğün bilgilerini ve temayı düzenleme

---

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Stil | Tailwind CSS v4 |
| Veritabanı | SQLite (`node:sqlite` — yerleşik, bağımlılık yok) |
| Auth | `node:crypto` scrypt + HMAC imzalı çerez |
| Validasyon | Zod |
| Test | Vitest |

---

## Yerel geliştirme

```bash
npm install
cp .env.example .env.local
npm run hash-password -- "şifreniz"   # çıktıyı .env.local'a yazın
npm run dev
```

Veritabanı ilk istekte `.data/wedding.db` olarak oluşur; şema ve yer
tutucu düğün kaydı otomatik gelir. Örnek davetliler isterseniz:

```bash
npm run seed
```

| Komut | İş |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production derlemesi |
| `npm test` | Birim testleri |
| `npm run lint` | ESLint |
| `npm run seed` | Örnek veri (mevcut veriyi ezmez) |
| `npm run reset-data` | Veritabanını siler |
| `npm run hash-password` | Şifre hash'i + `AUTH_SECRET` üretir |

---

## Ortam değişkenleri

Hepsi `.env.example` içinde açıklanmıştır. Özet:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | evet | Davet bağlantıları bu adresle üretilir |
| `ADMIN_EMAIL` | evet | Panel girişi |
| `ADMIN_PASSWORD_HASH` | evet | `npm run hash-password` çıktısı |
| `AUTH_SECRET` | evet | Oturum çerezini imzalar |
| `DATABASE_FILE` | hayır | Varsayılan `.data/wedding.db` |

`ADMIN_PASSWORD_HASH` ayracı `.` işaretidir, `$` değil: Next.js `.env`
dosyalarında değişken genişletmesi yapar ve `$` ile başlayan dizileri
siler.

---

## Veritabanı

Tek bir SQLite dosyası. Ayrı bir servis çalıştırmaya gerek yok.

- Şema `src/lib/db/schema.ts` içinde; uygulama açılışta kendisi uygular
- Kurallar veritabanına gömülüdür: gelmeyen 0 kişi, gelen en az 1 kişi,
  not ≤ 500 karakter, galeri ≤ 5 fotoğraf, davetli başına tek RSVP
- WAL modu açık: okuma yazmayı bloklamaz

**Yedek almak** dosyayı kopyalamaktır:

```bash
sqlite3 /data/wedding.db ".backup /yedek/wedding-$(date +%F).db"
```

`sqlite3` yoksa uygulamayı durdurup `.db`, `.db-wal`, `.db-shm`
dosyalarının üçünü birden kopyalayın.

---

## Dağıtım (Dokploy)

Depoda hazır bir `Dockerfile` var (Next.js standalone çıktısı, ~50 MB).

**1. Uygulamayı oluştur**

Dokploy → *Create Application* → depoyu bağla. Build type: **Dockerfile**.

**2. Kalıcı disk bağla** — en önemli adım

| Alan | Değer |
|---|---|
| Mount path | `/data` |

Bu yapılmazsa **her dağıtımda davetli listesi silinir.**

**3. Ortam değişkenleri**

```
NEXT_PUBLIC_SITE_URL=https://davetiye.alanadiniz.com
DATABASE_FILE=/data/wedding.db
ADMIN_EMAIL=...
ADMIN_PASSWORD_HASH=...
AUTH_SECRET=...
```

`NEXT_PUBLIC_SITE_URL` derleme sırasında gömülür; Dokploy'da *Build
Args* olarak da tanımlayın.

**4. Domain ve HTTPS**

Dokploy'un domain ayarından alan adını bağlayın, Let's Encrypt'i açın.
Oturum çerezi production'da `secure` işaretlidir — HTTPS olmadan panele
giriş yapılamaz.

**5. İlk açılış**

Şema ve yer tutucu düğün kaydı ilk istekte oluşur. `/admin` adresinden
girip **Düğün Bilgileri** sayfasından gerçek bilgileri yazın, sonra
davetlileri ekleyin.

---

## Proje yapısı

```
src/
  app/
    page.tsx                 generic davetiye
    invite/[token]/          kişiye özel davetiye
    admin/                   panel (giriş, dashboard, davetliler, ayarlar)
  components/
    invitation/              davetiye bileşenleri
    admin/                   panel bileşenleri
  lib/
    data/                    veri erişimi (repository)
    db/                      şema ve bağlantı
    auth/                    şifre ve oturum
    stats/                   dashboard hesapları
    validation/              Zod şemaları
    utils/                   token, tarih, metin
  actions/                   Server Actions
  types/
docs/superpowers/specs/      tasarım dokümanı
```

Tasarım kararları ve şartnameden sapmalar:
`docs/superpowers/specs/2026-09-27-wedding-rsvp-design.md`

---

## Gizlilik

Proje kişisel veri tutar; şu kurallar koda gömülüdür:

- Davetli listesi hiçbir public uçtan erişilebilir değil
- `/invite/<token>` yalnızca o davetlinin bilgisini döner
- Davetli adı ve token sayfa metadata'sına girmez; kişisel sayfalar
  `noindex`
- `/admin/*` oturum gerektirir (`src/proxy.ts`)
- Token'lar tahmin edilemez (10 karakter, karışan harfler çıkarılmış);
  sıralı kimlik URL'de kullanılmaz

---

## Kapsam dışı

CSV toplu import, yetişkin/çocuk ayrımı arayüzü, kurulum sihirbazı,
dosya yükleme (görseller şimdilik yol olarak girilir), çoklu düğün.
