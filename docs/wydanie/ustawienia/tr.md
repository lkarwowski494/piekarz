# Karta ustawień App Store: Turkish (`tr`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/tr.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Turkish**, kod ASC `tr`; język aplikacji `tr` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Turkish (jeśli go nie ma: „Not Localized” → Turkish → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 2 — CYP (Cyprus), TUR (Türkiye)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 26 / 30 znaków · App Information

```text
Fırıncı: Ekşi Mayalı Ekmek
```

### Podtytuł (Subtitle) · 29 / 30 znaków · App Information

```text
Hamur hesabı ve pişirme planı
```

### Słowa kluczowe (Keywords) · 98 / 100 bajtów (92 znaków) · wersja 1.0

```text
hidrasyon,tarif,çavdar,levain,pizza,zamanlayıcı,fırın,yüzde,somun,maya,mayalama,fermantasyon
```

### Tekst promocyjny (Promotional Text) · 167 / 170 znaków · wersja 1.0

```text
Ekmeğin hazır olacağı saati ayarlayın: Fırıncı miktarları hesaplar, planı geriye doğru oluşturur ve her adımın sonunu haber verir. Hesap yok, internet yok, reklam yok.
```

### Opis (Description) · 3309 / 4000 znaków · wersja 1.0

```text
Fırıncı, ekşi mayalı ekmek pişirirken tariften somuna kadar size rehberlik eder: miktarları hesaplar, planı oluşturur ve telefonunuz uykudayken bile zamanı takip eder. Hesap ve internet gerektirmeden, reklamsız ve takipsiz çalışır. Tarifleriniz, ekşi mayalarınız ve günlüğünüz yalnızca telefonunuzda kalır.

TARİFLER VE MİKTARLAR
15 temel tariften birini (ekşi mayalı, çavdar, mayalı, pizza ve tatlı) ya da kendi tarifinizi seçersiniz. Somun sayısını veya un miktarını ayarlarsınız; Fırıncı size un, su, ekşi maya, tuz ve mayanın gram cinsinden miktarını verir. Fırıncı yüzdesi, ekşi mayadaki ve maya hamurundaki un ile suyu da hesaba katar. Fırıncı, ulaşmak istediğiniz hamur sıcaklığı için gereken su sıcaklığını da söyler.

“HAZIR” SAATİNDEN PLAN
Ekmeğin ne zaman hazır olacağını seçersiniz; Fırıncı her adımın başlangıç saatini geriye doğru hesaplar. Fermantasyon süresi mutfağınızın sıcaklığına bağlıdır. Elinizle yapmanız gereken bir adım geceye denk gelirse (varsayılan olarak 23:00 ile 07:00 arası), Fırıncı buzdolabında daha uzun bir süre önerir. Süre yetmiyorsa mümkün olan en erken saati söyler.

ADIM ADIM REHBERLİK
Fırıncı mevcut adımı gösterir: ne yapılacağını, ne kadar süreceğini ve sonra ne geleceğini. Bildirimlere izin verirseniz telefon kilitliyken de adımın bittiğini haber verir. Elinizle yapmanız gereken bir adımda rehberlik ekranı kapanmaz. Sıcak kap veya çiğ hamur içeren adımlarda uyarı bulunur. Çavdar ekmeğinin (unun yarısından fazlası çavdar unu) katlama içermeyen kendi adımları vardır. Yanlışlıkla onayladığınız bir adımı geri alabilirsiniz; uygulamayı yeniden açtığınızda mevcut adıma dönülür.

EKŞİ MAYALAR
Birden fazla ekşi mayayı takip edersiniz. Fırıncı besleme miktarlarını 1:1:1, 1:2:2, 1:3:3 veya 1:5:5 oranında verir. Ekşi maya hacmini ikiye katladığında Fırıncı onu hamura hazır olarak işaretler. Mutfak tezgâhında 12 saat beslenmeden kalırsa bir bildirimle hatırlatır. Yeni bir ekşi mayayı gün gün başlatabilirsiniz. Fırıncı ihtiyat ilkesini uygular: tabaka, renk değişimi veya çürük koku varsa ekşi mayayı atmanızı önerir.

EKMEK DOKTORU
Ekmek içi sıkı, kabuk soluk mu? Belirtileri işaretlersiniz; Ekmek Doktoru 9 kusurdan birini belirler, nedenini açıklar ve bir dahaki sefere neyi değiştirmeniz gerektiğini söyler. Ekşi maya doktoru, ekşi mayanızda sizi endişelendiren bir şey olduğunda yardımcı olur.

GÜNLÜK
Her somunu değerlendirirsiniz: yıldızlar, ekmek içi, kabuk ve lezzet profili. Günlük istatistikleri gösterir; “Tekrar Pişir” aynı tarifi açar.

VERİLERİNİZ
Fırıncı son 10 otomatik yedeği telefonunuzda saklar. Tüm verilerinizi bir dosyaya dışa aktarabilir ve dosyadan içe aktarabilir, pişirme geçmişinizi CSV olarak dışa aktarabilirsiniz. Birimler: gram ve °C ya da ons ve °F.

BİLMENİZDE FAYDA VAR
Fırıncı iPhone'da çalışır ve verileri cihazlar arasında eşitlemez; verileri yedek dosyasıyla taşırsınız. Bildirim izni olmadan Fırıncı adımın bittiğini yalnızca açık ekranda gösterir.

ERİŞİM VE SATIN ALMA
Tam erişim, App Store'da aylık veya yıllık abonelik ya da tek seferlik ömür boyu satın alma ile sağlanır. Abonelik ücretsiz deneme süresiyle başlayabilir (uygun kullanıcılar için App Store tanıtım teklifi). Satın alma yapmadan pişirme geçmişinizi görüntüleyebilir, dosya içe aktarabilir, verilerinizi dışa aktarabilir ve silebilirsiniz.

Diller: 35.
```

### Co nowego (What’s New in This Version)

nie dotyczy wersji 1.0: Apple — „This property isn’t available for the first version of the app”. Od 1.0.1 tekst z listy zmian według `docs/wydanie/sklep.md` §5.

### Privacy Policy URL · App Information

```text
https://apps4brew.com/piekarz/privacy.html
```

### Support URL · wersja 1.0

```text
https://apps4brew.com/piekarz/support.html
```

## Kategoria (raz dla całej aplikacji, nie na lokalizację)

Primary Category: **Food & Drink**; Secondary Category: **Productivity** (D-055; docs/15-app-store.md §3).

## Zrzuty ekranu (7 na klasę, kolejność D-055)

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk tr … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/01-plan.png` | Ekmeğiniz istediğiniz saatte hazır | Gece yarısı adım olmadan geriye doğru plan |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/02-receptura.png` | Her malzemenin gramı anında | Ekşi mayadaki un ve su fırıncı yüzdesine dahil |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/03-prowadzenie-ciemny.png` | Her seferinde tek adım | Ne yapılacağı, ne kadar süreceği ve adım sonu bildirimi |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/04-doktor.png` | Sonraki somunda neyi iyileştirmeli | Belirtiler, neden ve sonraki pişirme için tek değişiklik |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/05-zakwasy.png` | Ekşi mayanız her zaman vaktinde hazır | Besleme miktarları ve 12 saat sonra hatırlatma |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/06-dziennik.png` | Her pişirme kayıtlı | Somunu puanlayın, tek dokunuşla “Tekrar Pişir” |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/tr/iphone-6.3/07-offline.png` | Hesap yok, internet yok | Reklam ve takip yok; verileriniz yalnızca telefonunuzda |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (2): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
