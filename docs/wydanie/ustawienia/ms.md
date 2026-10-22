# Karta ustawień App Store: Malay (`ms`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/ms.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Malay**, kod ASC `ms`; język aplikacji `ms` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Malay (jeśli go nie ma: „Not Localized” → Malay → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).
- **Weryfikacja natywna:** nazwę i podtytuł przed wysyłką sprawdza osoba mówiąca tym językiem (D-053; docs/wydanie/widocznosc.md §6 p. 5).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — MYS (Malaysia)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 22 / 30 znaków · App Information

```text
Tukang Roti: Sourdough
```

### Podtytuł (Subtitle) · 29 / 30 znaków · App Information

```text
Kalkulator Doh & Jadual Bakar
```

### Słowa kluczowe (Keywords) · 79 / 100 bajtów (79 znaków) · wersja 1.0

```text
resepi,ragi,baking,hidrasi,starter,rye,levain,pizza,penapaian,pemula,suhu,bread
```

### Tekst promocyjny (Promotional Text) · 170 / 170 znaków · wersja 1.0

```text
Tetapkan masa roti siap: Tukang Roti mengira kuantiti, menyusun pelan secara songsang dan memberitahu bila setiap langkah tamat. Tanpa akaun, tanpa internet, tanpa iklan.
```

### Opis (Description) · 3575 / 4000 znaków · wersja 1.0

```text
Tukang Roti membimbing anda melalui bakaran roti sourdough dari resipi hingga buku roti: mengira kuantiti, menyusun pelan dan menjaga masa ketika telefon tidur. Berfungsi tanpa akaun dan tanpa internet, tanpa iklan dan tanpa penjejakan. Resipi, pemula dan jurnal anda kekal hanya dalam telefon anda.

RESIPI DAN KUANTITI
Pilih satu daripada 15 resipi asas (sourdough, rai, yis, piza dan manis) atau resipi anda sendiri. Tetapkan bilangan buku roti atau berat tepung, dan Tukang Roti memberikan gram tepung, air, pemula, garam dan yis. Peratusan pembuat roti mengambil kira tepung dan air daripada pemula dan biang. Tukang Roti juga memberikan suhu air untuk suhu doh yang anda mahukan.

PELAN DARI MASA “SIAP”
Pilih bila roti perlu siap, dan Tukang Roti mengira secara songsang masa mula setiap langkah. Masa penapaian bergantung pada suhu dapur anda. Apabila langkah yang memerlukan tangan anda jatuh pada waktu malam (secara lalai antara 23:00 dan 07:00), Tukang Roti mencadangkan masa lebih lama dalam peti sejuk. Jika masa tidak mencukupi, Tukang Roti memberikan masa paling awal yang mungkin.

BIMBINGAN LANGKAH DEMI LANGKAH
Tukang Roti menunjukkan langkah semasa: apa perlu dibuat, berapa lama dan apa seterusnya. Jika anda membenarkan pemberitahuan, Tukang Roti memaklumkan tamat langkah walaupun telefon dikunci. Semasa langkah yang memerlukan tangan anda, skrin bimbingan tidak padam. Langkah dengan peralatan masak panas atau doh mentah mempunyai amaran. Roti rai (lebih separuh tepung ialah tepung rai) mempunyai langkah tersendiri tanpa lipatan. Langkah yang tersilap disahkan boleh dibatalkan, dan apabila dibuka semula, aplikasi kembali ke langkah semasa.

PEMULA
Urus beberapa pemula. Tukang Roti memberikan kuantiti pemberian makan dalam nisbah 1:1:1, 1:2:2, 1:3:3 atau 1:5:5. Apabila pemula mengembang dua kali ganda isi padu, Tukang Roti menandakannya sedia untuk doh. Selepas 12 jam di atas kaunter tanpa diberi makan, Tukang Roti mengingatkan anda melalui pemberitahuan. Pemula baharu boleh dimulakan hari demi hari. Tukang Roti mengamalkan prinsip berjaga-jaga: jika ada selaput, perubahan warna atau bau busuk, Tukang Roti menasihatkan anda membuang pemula.

DOKTOR ROTI
Remah padat dan kerak pucat? Tandakan gejala, dan Doktor Roti menunjukkan satu daripada 9 kecacatan, menerangkan puncanya dan memberitahu apa perlu diubah pada kali seterusnya. Empat protokol penyelamat membantu apabila doh bermasalah semasa penapaian. Doktor Pemula membantu apabila sesuatu tentang pemula membimbangkan anda.

JURNAL
Nilai setiap buku roti: bintang, remah, kerak dan profil rasa. Jurnal menunjukkan statistik, dan “Bakar Semula” membuka resipi yang sama.

DATA ANDA
Tukang Roti menyimpan 10 sandaran automatik terakhir dalam telefon anda. Eksport semua data ke fail dan import daripada fail, serta eksport sejarah bakaran sebagai CSV. Unit: gram dan °C atau auns dan °F.

PERLU DIKETAHUI
Tukang Roti berfungsi pada iPhone dan tidak menyegerakkan data antara peranti; pindahkan data dengan fail sandaran. Tanpa kebenaran pemberitahuan, Tukang Roti menunjukkan tamat langkah hanya pada skrin yang dibuka.

AKSES DAN PEMBELIAN
Akses penuh diberikan melalui langganan bulanan atau tahunan, atau pembelian sekali seumur hidup di App Store. Langganan mungkin bermula dengan tempoh percubaan percuma (tawaran pengenalan App Store untuk pengguna yang layak). Tanpa pembelian, anda boleh melihat sejarah bakaran, mengimport fail serta mengeksport dan memadam data anda.
Terma Penggunaan (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Bahasa: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk ms … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/01-plan.png` | Roti siap pada masa anda | Pelan songsang tanpa langkah pada tengah malam |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/02-receptura.png` | Gram setiap bahan serta-merta | Tepung dan air pemula dikira dalam peratusan pembuat roti |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/03-prowadzenie-ciemny.png` | Satu langkah pada satu masa | Apa perlu dibuat, berapa lama dan pemberitahuan apabila langkah tamat |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/04-doktor.png` | Baiki buku roti seterusnya | Gejala, punca dan satu perubahan untuk bakaran seterusnya |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/05-zakwasy.png` | Pemula sentiasa sedia tepat masa | Kuantiti pemberian makan dan peringatan selepas 12 jam |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/06-dziennik.png` | Setiap bakaran direkodkan | Nilai buku roti dan “Bakar Semula” dengan satu ketikan |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ms/iphone-6.3/07-offline.png` | Tanpa akaun dan tanpa internet | Tanpa iklan dan penjejakan; data hanya dalam telefon anda |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
