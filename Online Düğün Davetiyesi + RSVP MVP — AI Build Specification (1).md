# Online Düğün Davetiyesi + RSVP MVP
## AI Build Specification — Start to Final

## 1. Projenin amacı

Mobil öncelikli, şık ve kullanımı son derece kolay bir **online düğün davetiyesi + RSVP sistemi** geliştir.

Sistemin temel amacı:

- Davetlilere dijital düğün davetiyesi göndermek
- Her davetliye özel bir RSVP linki oluşturmak
- Davetlinin düğüne gelip gelmeyeceğini öğrenmek
- Kaç kişiyle geleceğini öğrenmek
- Toplam beklenen kişi sayısını gerçek zamanlı takip etmek
- Henüz cevap vermeyen davetlileri görmek
- Organizasyon sahibinin tüm davetli listesini bir admin panelinden yönetebilmesini sağlamak

Bu proje ilk aşamada tek bir düğün için hazırlanacak bir MVP'dir.

Ancak mimari ileride çoklu düğün / SaaS sistemine dönüştürülebilecek şekilde temiz ve modüler kurulmalıdır.

---

# 2. AI TOOL İÇİN ANA TALİMAT

Bu dokümanı alan AI coding agent:

1. Önce mevcut repository / proje klasörünü incelemeli.
2. Eğer proje yoksa sıfırdan proje oluşturmalı.
3. Kod yazmaya başlamadan önce kullanıcıdan gerekli içerik ve bilgileri istemeli.
4. Kullanıcının verdiği cevapları proje konfigürasyonuna işlemeli.
5. Eksik görsel veya içerik varsa placeholder kullanabilir ancak bunun kullanıcı tarafından değiştirilebilir olduğunu açıkça belirtmeli.
6. Kullanıcıdan teknik kararlar beklememeli.
7. Teknik stack, database schema, API yapısı, responsive tasarım, validation ve deployment-ready yapı agent tarafından kurulmalı.
8. Yalnızca mockup veya frontend demo üretmemeli.
9. Çalışan bir full-stack MVP üretmeli.
10. Davetli ekleme, RSVP cevaplama ve dashboard toplamları gerçek database üzerinden çalışmalı.
11. Build, lint ve temel fonksiyonları test etmeden işi tamamlanmış saymamalı.
12. Proje sonunda kullanıcıya:
   - nasıl çalıştırılacağını,
   - nasıl admin paneline girileceğini,
   - davetli nasıl ekleneceğini,
   - davet linkinin nasıl paylaşılacağını,
   - hangi environment variable'ların gerektiğini
   kısa ve net biçimde anlatmalı.

---

# 3. KODA BAŞLAMADAN ÖNCE KULLANICIYA SORULACAKLAR

Agent önce kullanıcıdan aşağıdaki bilgileri istemelidir.

Teknik olmayan, kolay cevaplanabilir bir form şeklinde sor.

## Zorunlu bilgiler

### Çift bilgileri

- Gelinin adı
- Damadın adı
- Davetiyede isimlerin hangi sırada gösterileceği
- Düğün tarihi
- Düğün başlangıç saati
- Düğün mekânının adı
- Mekânın açık adresi
- Google Maps bağlantısı varsa linki

### Davetiye metni

Kullanıcıya şu seçenekleri sun:

1. Kullanıcı kendi davet metnini verebilir.
2. AI kısa ve zarif bir davet metni oluşturabilir.

Örnek:

> Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.

### İletişim

Opsiyonel:

- Gelin telefon numarası
- Damat telefon numarası
- Organizasyon sorumlusu
- WhatsApp iletişim numarası

---

# 4. GÖRSEL DOSYALAR

Kullanıcıdan mümkünse aşağıdaki dosyaları iste:

## Ana fotoğraf

Tercihen:

- dikey
- yüksek çözünürlüklü
- çiftin birlikte olduğu bir fotoğraf

Kullanıcı fotoğraf vermezse zarif bir placeholder alan oluştur.

## Opsiyonel fotoğraflar

En fazla 5 adet:

- çift fotoğrafı
- nişan fotoğrafı
- save-the-date fotoğrafı
- detay fotoğrafı

## Logo / monogram

Varsa:

- PNG
- SVG

Yoksa çiftin baş harflerinden basit bir text monogram oluştur.

Örnek:

`A & M`

---

# 5. TASARIM TERCİHLERİ

Kullanıcıya teknik tasarım soruları sorma.

Yalnızca aşağıdaki basit seçimleri sor:

## Tema

Birini seçmesini iste:

- Minimal
- Romantic
- Modern
- Elegant
- Editorial

Default:

**Elegant / Modern**

## Renk

Kullanıcı özel renk belirtmezse:

- ivory
- warm white
- charcoal
- soft beige
- muted gold accent

kullan.

## Müzik

Sor:

> Davetiye açıldığında çalabilecek bir fon müziği eklemek ister misiniz?

Seçenek:

- Hayır
- Evet, müzik dosyasını yükleyeceğim

Browser autoplay kısıtlarından dolayı müzik otomatik başlamamalıdır.

Kullanıcı "müziği aç" butonuna basmalıdır.

---

# 6. TEKNOLOJİ

Default olarak aşağıdaki stack kullanılmalıdır.

## Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS

## UI

Mümkünse:

- shadcn/ui

Ancak arayüz generic SaaS dashboard görünümünde olmamalıdır.

Davetliye gösterilen sayfa özel tasarım hissi vermelidir.

## Backend

Next.js Server Actions veya Route Handlers kullanılabilir.

## Database

Tercih:

- Supabase PostgreSQL

Alternatif:

- standart PostgreSQL + Prisma

Default olarak Supabase kullanılabilir.

## Authentication

Sadece admin paneli için authentication gerekir.

Supabase Auth kullanılabilir.

Davetlinin hesap açmasına gerek yoktur.

---

# 7. RESPONSIVE TASARIM

Sistem öncelikle mobil için tasarlanmalıdır.

Hedef ekranlar:

- 375px
- 390px
- 430px
- tablet
- desktop

Davetlinin telefon üzerinden rahatça RSVP verebilmesi en önemli UX kriteridir.

---

# 8. ROUTE YAPISI

Önerilen yapı:

```text
/
```

Landing / davetiye ana sayfası.

Eğer ziyaretçi generic linkten geldiyse yalnızca davetiyeyi göster.

---

```text
/invite/[token]
```

Kişiye özel davetiye.

Örnek:

```text
/invite/8hf92ks1
```

Token üzerinden davetli bulunur.

Sayfa içerisinde mümkünse kişiselleştirme yapılır.

Örnek:

```text
Sevgili Ahmet Yılmaz,

Bu özel günümüzde sizi de aramızda görmekten mutluluk duyarız.
```

---

```text
/admin
```

Admin giriş ekranı.

---

```text
/admin/dashboard
```

Ana dashboard.

---

```text
/admin/guests
```

Davetli yönetimi.

---

```text
/admin/settings
```

Düğün bilgilerini düzenleme.

---

# 9. DAVETİYE SAYFASI

Public invitation deneyimi premium ve sade görünmelidir.

Sayfayı section bazlı oluştur.

---

## Section 1 — Hero

Tam ekran açılış.

Göster:

- çift fotoğrafı
- gelin & damat isimleri
- düğün tarihi
- kısa davet cümlesi

Örnek:

```text
Ayşe
&
Mehmet

18 Ekim 2026

Bu özel günümüzde
sizleri de aramızda görmekten mutluluk duyarız.
```

Minimal scroll indicator eklenebilir.

---

# 10. COUNTDOWN

Düğün henüz gerçekleşmediyse:

```text
Düğünümüze

21 gün
08 saat
14 dakika
```

gibi bir countdown gösterilebilir.

Countdown client-side çalışmalıdır.

Düğün tarihi geçmişse gösterme.

---

# 11. HİKÂYE / FOTOĞRAF ALANI

Opsiyonel section.

Kullanıcının verdiği fotoğraflardan sade bir editorial gallery oluştur.

Fotoğraf yoksa section tamamen gizlenebilir.

---

# 12. DÜĞÜN DETAYLARI

Göster:

```text
18 Ekim 2026
Cumartesi

19:30

Çırağan Palace
İstanbul
```

Altında:

**Yol Tarifi**

butonu olsun.

Google Maps URL'sine gider.

---

# 13. RSVP BÖLÜMÜ

Bu MVP'nin en önemli alanıdır.

Başlık:

```text
Aramızda olacak mısınız?
```

Alt metin:

```text
Planlamamızı yapabilmemiz için
katılım durumunuzu bildirmenizi rica ederiz.
```

---

# 14. RSVP AKIŞI

Kullanıcı kişisel `/invite/[token]` linkiyle geldiyse davetli zaten bilinmelidir.

Tekrar isim yazdırmak gerekmemelidir.

Göster:

```text
Ahmet Yılmaz

Sizi aramızda görebilecek miyiz?
```

İki büyük buton:

```text
Evet, katılacağım
```

ve:

```text
Ne yazık ki katılamayacağım
```

---

# 15. GELİYOR SEÇENEĞİ

"Evet" seçildikten sonra:

```text
Kaç kişi katılacaksınız?
```

sor.

Davetlinin maximum invitation limit değeri dikkate alınmalıdır.

Örneğin:

```text
invitation_limit = 4
```

ise:

```text
1
2
3
4
```

dışında seçim yapılamamalıdır.

Stepper kullanılabilir:

```text
-  2 kişi  +
```

Default:

`1`

Minimum:

`1`

Maximum:

`invitation_limit`

---

# 16. YETİŞKİN / ÇOCUK

MVP içerisinde opsiyonel ancak yapılması tavsiye edilir.

Toplam kişinin ardından:

```text
Yetişkin
Çocuk
```

sayısı belirlenebilir.

Validation:

```text
adult_count + child_count = attending_count
```

En az bir yetişkin olmalı.

Bu özellik config üzerinden kapatılabilmelidir.

---

# 17. RSVP NOTU

Opsiyonel textarea:

```text
Bize iletmek istediğiniz bir not var mı?
```

Maximum:

500 karakter.

---

# 18. RSVP ONAYI

Gönderildiğinde database'e kayıt yapılmalıdır.

Başarılı response:

```text
Teşekkür ederiz 🤍

Sizi aramızda görmek için
sabırsızlanıyoruz.

2 kişi olarak katılımınız kaydedildi.
```

Eğer gelmiyorsa:

```text
Bilgi verdiğiniz için teşekkür ederiz.

Bu özel günümüzde aramızda olamayacağınız için üzgünüz.
Sevgilerimizle.
```

---

# 19. RSVP DÜZENLEME

Davetli aynı linki tekrar açtığında daha önce verdiği cevap görülmelidir.

Örnek:

```text
Katılım durumunuz:

✓ Geliyorum
2 kişi
```

Altında:

```text
Cevabımı değiştir
```

butonu olmalıdır.

Davetli düğünden önce istediği zaman cevabını değiştirebilir.

---

# 20. DAVETLİ TOKEN SİSTEMİ

Her davetli için random ve tahmin edilmesi zor bir token oluştur.

Örnek:

```text
8Kp39PqmT2
```

Sequential id URL içerisinde kullanılmamalıdır.

Yanlış:

```text
/invite/153
```

Doğru:

```text
/invite/8Kp39PqmT2
```

Token unique olmalıdır.

---

# 21. DATABASE MODELİ

Minimum aşağıdaki tablolar oluşturulmalıdır.

---

## weddings

```text
id
bride_name
groom_name
event_date
event_time
venue_name
venue_address
maps_url
invitation_text
theme
primary_image
created_at
updated_at
```

---

## guests

```text
id
wedding_id
name
phone
group_name
invitation_limit
token
created_at
updated_at
```

`token` unique olmalıdır.

---

## rsvps

```text
id
guest_id
status
attending_count
adult_count
child_count
note
responded_at
updated_at
```

Status:

```text
pending
attending
declined
```

Her guest için maksimum bir aktif RSVP kaydı olmalıdır.

Upsert kullanılabilir.

---

# 22. ADMIN LOGIN

Admin paneli public olmamalıdır.

Authentication gerekli.

Basit yapı yeterlidir.

Login:

```text
Email
Password
```

MVP'de tek admin hesabı olabilir.

---

# 23. ADMIN DASHBOARD

Dashboard açıldığında en önemli bilgi en üstte olmalıdır:

# Toplam Beklenen Kişi

Örnek:

```text
307
```

Dashboard cards:

```text
Toplam Davetli
180

Toplam Davet Hakkı
420

Gelecek
286 kişi

Çocuk
21

Toplam Beklenen
307

Gelmeyecek
54

Cevap Beklenen
80
```

Burada "gelecek kişi" ile "davetli kaydı" kavramlarını karıştırma.

Örneğin:

Ahmet'in kaydı 1 guest olabilir.

Ancak:

```text
attending_count = 4
```

olabilir.

Dashboard toplamları daima RSVP kişi sayılarını kullanmalıdır.

---

# 24. RESPONSE ORANI

Göster:

```text
Yanıt oranı

71%
```

Formula:

```text
responded_guests / total_guests * 100
```

---

# 25. RSVP BREAKDOWN

Basit visualization veya progress bars:

```text
Geliyor
%68

Gelmiyor
%13

Cevap Bekleniyor
%19
```

Ağır chart library gerekmez.

---

# 26. DAVETLİ LİSTESİ

Admin:

```text
/admin/guests
```

tablosunda şunları görmeli:

| Davetli | Telefon | Grup | Limit | Durum | Gelecek Kişi | Link |
|---|---|---|---|---|---|---|

Örnek:

```text
Ahmet Yılmaz
+905...
Arkadaş
4
Geliyor
3
Link
```

---

# 27. DAVETLİ DURUMLARI

UI badge kullan:

```text
Geliyor
Gelmiyor
Cevap Bekleniyor
```

Renkleri erişilebilir ve sade tut.

---

# 28. DAVETLİ EKLEME

Admin panelinde:

```text
Yeni Davetli
```

butonu olmalı.

Form:

```text
Ad Soyad*
Telefon
Grup
Maksimum Davetli Sayısı*
```

Default invitation limit:

```text
1
```

Kaydettiğinde:

- guest oluştur
- unique token oluştur
- kişisel invitation URL oluştur

---

# 29. DAVETLİ DÜZENLEME

Admin değiştirebilmeli:

- isim
- telefon
- grup
- invitation limit

Davetli silinebilmeli.

Silmeden önce confirmation göster.

---

# 30. DAVETLİ GRUPLARI

Guest'e opsiyonel `group_name` eklenebilir.

Örneğin:

```text
Gelin Ailesi
Damat Ailesi
Arkadaşlar
İş
Akraba
Diğer
```

Admin serbest metin de girebilir.

---

# 31. ARAMA

Guest listesinde search input olmalıdır.

Şunlarda ara:

- isim
- telefon
- grup

---

# 32. FİLTRELER

Minimum filtreler:

```text
Tümü
Geliyor
Gelmiyor
Cevap Bekleniyor
```

Opsiyonel:

```text
Grup
```

---

# 33. KİŞİSEL DAVET LİNKİ

Her davetli için:

```text
https://domain.com/invite/TOKEN
```

oluştur.

Guest table içerisinde:

```text
Linki Kopyala
```

butonu olmalıdır.

Clipboard API kullan.

Başarı feedback:

```text
Davet linki kopyalandı.
```

---

# 34. WHATSAPP BUTONU

MVP içerisinde WhatsApp API entegrasyonu zorunlu değildir.

Ancak guest satırında:

```text
WhatsApp'ta Gönder
```

butonu bulunabilir.

`wa.me` URL kullan.

Mesaj örneği:

```text
Merhaba Ahmet,

Düğünümüzde sizi de aramızda görmekten mutluluk duyarız. 🤍

Davetiyemiz:
https://domain.com/invite/TOKEN

Katılım durumunuzu davetiye içerisinden bize iletebilirsiniz.
```

Mesaj URL encoded olarak hazırlanmalıdır.

---

# 35. CSV / EXCEL TOPLU DAVETLİ EKLEME

Bu özellik MVP açısından değerlidir.

Admin:

```text
Toplu Davetli Yükle
```

alanından CSV import yapabilmelidir.

Desteklenen kolonlar:

```text
name
phone
group
invitation_limit
```

Örnek:

```csv
name,phone,group,invitation_limit
Ahmet Yılmaz,+905551111111,Arkadaşlar,2
Mehmet Kaya,+905552222222,Aile,4
Seda Demir,+905553333333,İş,1
```

Import öncesinde preview göster.

Hatalı satır varsa belirt.

Duplicate detection:

Telefon veya aynı isim üzerinden kullanıcıya warning gösterilebilir.

Automatic hard reject zorunlu değildir.

---

# 36. SETTINGS

Admin panelinde wedding settings sayfası olmalıdır.

Düzenlenebilir:

```text
Gelin adı
Damat adı
Düğün tarihi
Saat
Mekân
Adres
Maps URL
Davetiye metni
Hero görsel
```

---

# 37. PHOTO STORAGE

Supabase Storage kullanılabilir.

Bucket:

```text
wedding-assets
```

Hero image upload edilebilir.

Validation:

- jpg
- jpeg
- png
- webp

Maximum:

10MB

Mümkünse upload sonrası optimize et.

---

# 38. SEO

Public invite pages için:

```text
title:
Ayşe & Mehmet | Düğün Davetiyesi
```

Metadata:

```text
Ayşe ve Mehmet'in düğün davetiyesi.
```

Invitation token veya guest name'i metadata içerisinde expose etme.

---

# 39. PRIVACY

Bu proje kişisel bilgi içerir.

Aşağıdaki kurallara uy:

- guest listesi public API'de expose edilmemeli
- `/invite/[token]` yalnızca ilgili guest bilgisini dönmeli
- admin routes auth protected olmalı
- database security policies yapılandırılmalı
- service role key client-side'a gönderilmemeli
- environment secrets `.env` dışında hardcode edilmemeli

---

# 40. SUPABASE RLS

Row Level Security aktif olmalıdır.

Public invitation route:

yalnızca gerekli server-side API üzerinden guest token ile çalışmalıdır.

Admin client'ın guest tablosuna uncontrolled direct access vermemesi tercih edilir.

---

# 41. VALIDATION

Zod gibi schema validation kullan.

Örnek:

```text
invitation_limit >= 1
attending_count >= 1
attending_count <= invitation_limit
note <= 500 chars
```

Declined olduğunda:

```text
attending_count = 0
```

olmalıdır.

---

# 42. ERROR STATES

Tüm önemli durumlar düzgün ele alınmalı.

Örnek:

Invalid token:

```text
Davet bağlantısı bulunamadı.

Lütfen size gönderilen bağlantıyı kontrol edin.
```

Server error:

```text
Bir sorun oluştu.
Lütfen tekrar deneyin.
```

Network loading state ekle.

Button double-submit engellenmeli.

---

# 43. ACCESSIBILITY

Minimum:

- semantic HTML
- button labels
- form labels
- keyboard navigation
- contrast
- alt text
- focus state

uygulanmalıdır.

---

# 44. ANIMASYON

Davetliye gösterilen sayfa zarif micro-animation içerebilir.

Örneğin:

- fade
- slow reveal
- subtle parallax
- scroll animation

Ancak:

- ağır olmamalı
- performansı düşürmemeli
- aşırı "template" havası vermemeli

Framer Motion kullanılabilir.

Ama zorunlu değildir.

---

# 45. VISUAL LANGUAGE

Davetli tarafı:

**Luxury editorial wedding invitation**

gibi hissettirmelidir.

Kaçınılacaklar:

- dashboard tarzı davetiye
- çok fazla card
- aşırı rounded element
- gradient overload
- neon
- generic AI design
- aşırı gölge
- popup bombardımanı

Tercih:

- geniş whitespace
- güçlü typography
- büyük çift isimleri
- premium fotoğraf kullanımı
- ince çizgiler
- yumuşak geçişler
- restrained color palette

---

# 46. TYPOGRAPHY

Başlıklarda zarif serif kullanılabilir.

Örneğin Google Fonts:

- Cormorant Garamond
- DM Serif Display
- Playfair Display

Body:

- Inter
- Manrope
- Geist

Maximum iki font ailesi kullan.

---

# 47. ADMIN UI

Admin paneli public invitation kadar dekoratif olmak zorunda değildir.

Temiz ve fonksiyonel olmalıdır.

Sidebar:

```text
Dashboard
Davetliler
Düğün Bilgileri
Çıkış
```

Mobile'da drawer kullanılabilir.

---

# 48. EMPTY STATES

Örneğin hiç guest yoksa:

```text
Henüz davetli eklemediniz.

İlk davetlinizi ekleyerek başlayın.
```

Button:

```text
Davetli Ekle
```

---

# 49. FIRST RUN / SETUP FLOW

Database tamamen boşsa admin girişinden sonra setup wizard gösterilebilir.

## Step 1

```text
Çift Bilgileri
```

## Step 2

```text
Düğün Bilgileri
```

## Step 3

```text
Davetiye Görseli
```

## Step 4

```text
İlk Davetlileri Ekleyin
```

Bu wizard opsiyoneldir ancak kullanıcı deneyimi açısından tercih edilir.

---

# 50. DEMO DATA

Development için seed script oluştur.

Örnek:

```text
Ahmet Yılmaz
limit 2
attending 2

Mehmet Kaya
limit 4
pending

Seda Demir
limit 1
declined

Can Ailesi
limit 5
attending 4
```

Production'da seed otomatik çalışmamalıdır.

---

# 51. ENVIRONMENT VARIABLES

`.env.example` oluştur.

Minimum:

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Eğer farklı architecture kullanılırsa gerekli env'leri ekle.

Secret değerleri repository'ye commit etme.

---

# 52. PROJECT STRUCTURE

Temiz klasör yapısı kullan.

Örnek:

```text
src/
  app/
    page.tsx

    invite/
      [token]/
        page.tsx

    admin/
      page.tsx

      dashboard/
        page.tsx

      guests/
        page.tsx

      settings/
        page.tsx

  components/
    invitation/
    admin/
    forms/
    ui/

  lib/
    db/
    auth/
    validation/
    utils/

  actions/

  types/
```

Bu birebir zorunlu değildir.

Ancak separation of concerns korunmalıdır.

---

# 53. COMPONENTLER

Reusable component oluştur.

Örneğin:

```text
InvitationHero
WeddingDetails
Countdown
PhotoGallery
RSVPForm
RSVPSuccess
GuestForm
GuestTable
DashboardStats
WeddingSettingsForm
CopyInvitationButton
WhatsAppShareButton
```

---

# 54. STATE YÖNETİMİ

Redux gibi ağır state manager kullanmak zorunlu değildir.

React state + Server Actions / query layer yeterlidir.

Gereksiz complexity ekleme.

---

# 55. DATE & TIME

Wedding timezone config olarak:

```text
Europe/Istanbul
```

default kullanılabilir.

Ancak kod global kullanım için değiştirilebilir olmalıdır.

---

# 56. DASHBOARD HESAPLAMALARI

Aşağıdaki değerler doğru hesaplanmalıdır.

## Total guests

```text
COUNT(guests)
```

## Total invitation capacity

```text
SUM(guests.invitation_limit)
```

## Responded guests

```text
COUNT(rsvp where status != pending)
```

## Pending guests

```text
total_guests - responded_guests
```

## Attending records

```text
COUNT(rsvp where status = attending)
```

## Expected total people

```text
SUM(rsvp.attending_count where status = attending)
```

Bu MVP için dashboarddaki en önemli sayı:

# Expected Total People

---

# 57. RSVP DAVRANIŞI

Örnek:

Ahmet:

```text
invitation_limit: 4
```

İlk cevap:

```text
status = attending
attending_count = 3
```

Dashboard:

```text
+3
```

Ahmet daha sonra cevabını:

```text
attending_count = 2
```

yaparsa dashboard otomatik:

```text
-1
```

güncellenmelidir.

Ahmet:

```text
status = declined
```

yaparsa toplamdan tamamen çıkarılmalıdır.

---

# 58. GERÇEK ZAMAN

Supabase realtime kullanılabilir ancak MVP için zorunlu değildir.

Dashboard refresh olduğunda doğru değerleri göstermesi yeterlidir.

Mutation sonrası cache invalidate edilmelidir.

---

# 59. PERFORMANCE

- Next.js Image kullan
- image optimization uygula
- gereksiz client component oluşturma
- dynamic import gerektiğinde kullan
- database query sayısını optimize et
- public invite page hızlı açılmalı

Özellikle mobil 4G bağlantısı düşünülmelidir.

---

# 60. TESTLER

En az kritik business logic test edilmelidir.

Test senaryoları:

### RSVP

- limit 4 olan kişi 5 kişi seçememeli
- attending minimum 1 olmalı
- declined attendee count 0 olmalı
- RSVP güncellenebilmeli

### Dashboard

Örneğin:

```text
Guest A = 2
Guest B = 4
Guest C = declined
```

Expected total:

```text
6
```

### Invalid token

404 / friendly error göstermeli.

---

# 61. QUALITY CHECK

Final teslimden önce agent şu komutları çalıştırmalıdır:

```text
npm install
npm run lint
npm run build
```

Varsa test:

```text
npm test
```

Hatalar varsa düzeltilmelidir.

Build başarısızken proje tamamlandı denmemelidir.

---

# 62. README

README oluştur.

İçeriği:

```text
Project
Features
Tech Stack
Local Development
Environment Variables
Database Setup
Admin Setup
Deployment
```

---

# 63. DEPLOYMENT

Proje production-ready olmalıdır.

Primary deployment:

```text
Vercel
+
Supabase
```

Ancak self-host edilebilir Next.js mimarisinde tutulmalıdır.

---

# 64. CUSTOM DOMAIN

README içerisinde kısa şekilde belirt:

```text
davetiye.domain.com
```

veya:

```text
aysemehmet.com
```

gibi custom domain kullanılabilir.

Kod domain'e bağlı yazılmamalıdır.

`NEXT_PUBLIC_SITE_URL`

üzerinden URL oluştur.

---

# 65. MVP DIŞINDA OLANLAR

İlk versiyonda aşağıdakileri geliştirme.

Bunlar gelecekte yapılabilir:

- masa planı
- QR check-in
- ödeme
- SaaS subscription
- birden fazla wedding account
- SMS gönderimi
- WhatsApp Business Cloud API automation
- AI davet metni generator
- guest photo upload
- wedding album
- seating chart
- meal preference
- push notification
- advanced analytics

MVP'yi gereksiz yere büyütme.

---

# 66. MVP ACCEPTANCE CRITERIA

Proje ancak aşağıdaki senaryolar eksiksiz çalışıyorsa tamamlanmış sayılır.

## Admin

Admin giriş yapabilir.

Admin düğün bilgilerini görebilir / düzenleyebilir.

Admin davetli ekleyebilir.

Admin davetli silebilir.

Admin invitation limit belirleyebilir.

Admin kişiye özel link oluşturabilir.

Admin linki kopyalayabilir.

Admin davetlileri listeleyebilir.

Admin cevap durumlarını görebilir.

Admin toplam beklenen kişi sayısını görebilir.

---

## Guest

Guest unique linki açabilir.

Guest kendi ismini görebilir.

Guest düğün davetiyesini görebilir.

Guest:

```text
Geliyorum
```

veya:

```text
Gelemiyorum
```

seçebilir.

Geliyorsa kişi sayısını seçebilir.

Maximum sayı invitation limit'i aşamaz.

Cevabı kaydedilir.

Sayfayı tekrar açınca mevcut cevap görünür.

Guest cevabını değiştirebilir.

---

# 67. ÖRNEK USER FLOW

Admin:

```text
Yeni Davetli

Ahmet Yılmaz
+905551234567
Arkadaşlar
Limit: 4
```

Kaydet.

System:

```text
/invite/Px82Kms92
```

üretir.

Admin WhatsApp'ta paylaşır.

---

Ahmet linke girer:

```text
Sevgili Ahmet Yılmaz,

Ayşe & Mehmet'in
düğününde sizi de aramızda görmekten mutluluk duyarız.
```

↓

```text
Aramızda olacak mısınız?
```

↓

```text
Evet
```

↓

```text
Kaç kişi?

3
```

↓

```text
Katılımınız kaydedildi.
```

Database:

```text
status: attending
attending_count: 3
```

Dashboard:

```text
Beklenen toplam kişi:
307 → 310
```

---

# 68. TASARIM HEDEFİ

Sonuç bir "form sitesi" gibi görünmemelidir.

Kullanıcı davet linkini açtığında:

> Gerçek bir premium dijital düğün davetiyesi açmış gibi hissetmelidir.

RSVP bunun içerisinde doğal bir şekilde yer almalıdır.

Admin tarafının asıl amacı ise:

> Düğüne gerçekte kaç kişinin geleceğini mümkün olduğunca doğru şekilde bilmektir.

Bu nedenle en güçlü business metric:

# TOPLAM BEKLENEN KİŞİ

olmalıdır.

---

# 69. AGENT ÇALIŞMA SIRASI

Agent projeyi aşağıdaki sırada tamamlamalıdır.

## Phase 1 — Discovery

- repository incele
- mevcut stack'i belirle
- gerekli kullanıcı bilgilerini sor
- gerekli görselleri iste

## Phase 2 — Foundation

- Next.js setup
- TypeScript
- Tailwind
- environment config
- Supabase connection

## Phase 3 — Database

- weddings
- guests
- rsvps
- indexes
- constraints
- migrations
- RLS

## Phase 4 — Admin Auth

- login
- protected admin routes

## Phase 5 — Admin Wedding Settings

- wedding data form
- image upload

## Phase 6 — Guest Management

- add
- edit
- delete
- search
- filter
- unique token
- invitation links

## Phase 7 — Public Invitation

- hero
- event details
- gallery
- map
- countdown
- responsive design

## Phase 8 — RSVP

- personalized guest
- attending / declined
- guest count
- validations
- save
- update response

## Phase 9 — Dashboard

- stats
- expected people
- response rate
- pending list

## Phase 10 — Import

- CSV import
- validation
- preview

## Phase 11 — Share

- copy invite link
- WhatsApp deeplink

## Phase 12 — QA

- test
- lint
- build
- responsive
- error handling

## Phase 13 — Documentation

- README
- `.env.example`
- setup instructions
- deployment instructions

---

# 70. USER İLE İLK KONUŞMADA SORULACAK FORM

Bu projeyi alan agent önce aşağıdaki mesajı kullanıcıya göndermelidir:

```text
Projeyi oluşturmadan önce davetiyeyi size özel hazırlayabilmem için birkaç bilgiye ihtiyacım var.

1. Gelinin adı:
2. Damadın adı:
3. Davetiyede isim sırası:
4. Düğün tarihi:
5. Düğün başlangıç saati:
6. Mekân adı:
7. Mekân adresi:
8. Google Maps linki varsa:
9. Davetiye metniniz var mı?
   - Varsa gönderin.
   - Yoksa sizin için hazırlayabilirim.
10. Tasarım tercihiniz:
   - Minimal
   - Romantic
   - Modern
   - Elegant
   - Editorial
11. Özel bir renk paletiniz var mı?
12. Ana davetiye fotoğrafınızı yükleyin.
13. İsterseniz ek olarak 1-5 fotoğraf daha yükleyebilirsiniz.
14. Müzik eklemek istiyor musunuz?
15. Davetliler için çocuk/yetişkin ayrımı yapmak istiyor musunuz?
16. Admin paneline giriş için kullanmak istediğiniz e-posta adresi nedir?

Bu bilgiler geldikten sonra teknik kararları benim vermemi istiyorsanız ekstra teknik bilgi vermenize gerek yok. Projeyi veritabanından admin paneline ve RSVP akışına kadar çalışır şekilde oluşturacağım.
```

Agent bu bilgileri aldıktan sonra tekrar aynı şeyleri sormamalıdır.

Eksik ancak zorunlu olmayan bilgi varsa uygun default kullanmalıdır.

---

# 71. FINAL DELIVERY CHECKLIST

Proje teslim edilmeden önce aşağıdakileri kontrol et.

```text
[ ] Public invitation çalışıyor
[ ] Personalized token çalışıyor
[ ] Guest RSVP çalışıyor
[ ] RSVP update çalışıyor
[ ] Invitation limit validation çalışıyor
[ ] Database persistence çalışıyor
[ ] Admin auth çalışıyor
[ ] Guest CRUD çalışıyor
[ ] Dashboard hesapları doğru
[ ] Expected guest total doğru
[ ] Search çalışıyor
[ ] Filter çalışıyor
[ ] Copy link çalışıyor
[ ] WhatsApp share çalışıyor
[ ] CSV import çalışıyor
[ ] Wedding settings çalışıyor
[ ] Image upload çalışıyor
[ ] Mobile responsive
[ ] Desktop responsive
[ ] Invalid token state hazır
[ ] Loading states hazır
[ ] Error states hazır
[ ] Empty states hazır
[ ] Secrets expose edilmiyor
[ ] npm run lint başarılı
[ ] npm run build başarılı
[ ] README tamamlandı
[ ] .env.example tamamlandı
```

---

# 72. SON TALİMAT

Bu proje için yalnızca component örnekleri, statik HTML, tasarım konsepti veya yarım çalışan prototype üretme.

Amaç:

# Çalışır durumda, gerçek veritabanına bağlı, deploy edilebilir bir MVP üretmek.

Kullanıcı yalnızca içerik, düğün bilgileri ve görselleri sağlamalıdır.

Teknik mimari ve implementasyon kararlarını agent kendisi tamamlamalıdır.

Her aşamada mevcut projeyi bozmayacak şekilde ilerle.

Mevcut repository varsa önce analiz et.

Var olan çalışan yapıları gereksiz yere yeniden yazma.

Son aşamada uygulamayı gerçek kullanıcı akışıyla test et:

```text
Admin → Guest oluştur → Linki aç → RSVP ver → Dashboard'a dön → kişi toplamının değiştiğini doğrula.
```

Bu uçtan uca senaryo çalışmadan projeyi tamamlanmış kabul etme.