# Karta ustawień App Store: Indonesian (`id`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/id.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Indonesian**, kod ASC `id`; język aplikacji `id` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Indonesian (jeśli go nie ma: „Not Localized” → Indonesian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — IDN (Indonesia)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 22 / 30 znaków · App Information

```text
Tukang Roti: Sourdough
```

### Podtytuł (Subtitle) · 26 / 30 znaków · App Information

```text
Kalkulator & Jadwal Adonan
```

### Słowa kluczowe (Keywords) · 80 / 100 bajtów (80 znaków) · wersja 1.0

```text
resep,ragi,baking,hidrasi,starter,rye,levain,pizza,fermentasi,timer,pemula,bread
```

### Tekst promocyjny (Promotional Text) · 170 / 170 znaków · wersja 1.0

```text
Tentukan jam roti harus siap: Tukang Roti menghitung takaran, menyusun jadwal mundur, dan memberi tahu saat tiap langkah selesai. Tanpa akun, tanpa internet, tanpa iklan.
```

### Opis (Description) · 3382 / 4000 znaków · wersja 1.0

```text
Tukang Roti memandu Anda membuat roti sourdough dari resep hingga bongkah roti: menghitung takaran, menyusun rencana, dan menjaga waktu saat ponsel tidur. Berfungsi tanpa akun dan tanpa internet, tanpa iklan dan tanpa pelacakan. Resep, starter, dan jurnal Anda hanya tersimpan di ponsel Anda.

RESEP DAN TAKARAN
Pilih salah satu dari 15 resep dasar (sourdough, gandum hitam, ragi, pizza, dan manis) atau resep sendiri. Atur jumlah bongkah roti atau berat tepung, dan Tukang Roti memberikan gram tepung, air, starter, garam, dan ragi. Persentase baker memperhitungkan tepung dan air dari starter dan dari biang. Tukang Roti juga memberikan suhu air untuk suhu adonan yang ingin Anda capai.

RENCANA DARI JAM "SIAP"
Pilih kapan roti harus siap, dan Tukang Roti menghitung mundur jam mulai setiap langkah. Lama fermentasi bergantung pada suhu dapur. Jika langkah yang membutuhkan tangan Anda jatuh pada malam hari (secara bawaan antara 23:00 dan 06:30), Tukang Roti menyarankan waktu lebih lama di kulkas. Jika waktunya kurang, Tukang Roti memberikan jam paling awal yang memungkinkan.

PANDUAN LANGKAH DEMI LANGKAH
Tukang Roti menampilkan langkah saat ini: apa yang dilakukan, berapa lama, dan apa berikutnya. Jika Anda mengizinkan notifikasi, Tukang Roti memberi tahu akhir langkah bahkan saat ponsel terkunci. Layar panduan tetap menyala selama memanggang. Langkah dengan wadah panas atau adonan mentah diberi peringatan. Roti gandum hitam (lebih dari separuh tepungnya adalah tepung gandum hitam) memiliki langkah sendiri tanpa lipatan. Langkah yang tidak sengaja dikonfirmasi dapat dibatalkan, dan saat dibuka kembali, aplikasi kembali ke langkah saat ini.

STARTER
Kelola beberapa starter. Tukang Roti memberikan takaran pemberian makan dengan rasio 1:1:1, 1:2:2, 1:3:3, atau 1:5:5. Saat volume starter berlipat dua, Tukang Roti menandainya siap untuk adonan. Setelah 12 jam di meja tanpa diberi makan, Tukang Roti mengingatkan lewat notifikasi. Starter baru dapat dibuat hari demi hari. Tukang Roti menerapkan prinsip kehati-hatian: jika ada lapisan, perubahan warna, atau bau busuk, Tukang Roti menyarankan untuk membuang starter.

DOKTER ROTI
Serat roti padat dan kulit roti pucat? Tandai gejalanya, dan Dokter Roti menunjukkan salah satu dari 9 cacat, menjelaskan penyebabnya, dan memberi tahu apa yang perlu diubah lain kali. Dokter Starter membantu saat ada sesuatu pada starter yang membuat Anda khawatir.

JURNAL
Nilai setiap bongkah roti: bintang, serat roti, kulit roti, dan profil rasa. Jurnal menampilkan statistik, dan "Panggang lagi" membuka resep yang sama.

DATA ANDA
Tukang Roti menyimpan 10 cadangan otomatis terakhir di ponsel. Semua data dapat diekspor ke file dan diimpor dari file, dan riwayat pemanggangan dapat diekspor sebagai CSV. Satuan: gram dan °C atau auns dan °F.

PERLU DIKETAHUI
Tukang Roti berjalan di iPhone dan tidak menyinkronkan data antarperangkat; data dipindahkan dengan file cadangan. Tanpa izin notifikasi, Tukang Roti menampilkan akhir langkah hanya pada layar yang terbuka.

AKSES DAN PEMBELIAN
Akses penuh tersedia lewat langganan bulanan atau tahunan, atau pembelian seumur hidup satu kali di App Store. Langganan dapat diawali uji coba gratis (penawaran perkenalan App Store bagi yang memenuhi syarat). Tanpa pembelian, Anda dapat melihat riwayat pemanggangan, mengimpor file, serta mengekspor dan menghapus data Anda.

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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk id … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/01-plan.png` | Roti siap tepat pada jam Anda | Jadwal mundur tanpa langkah di tengah malam |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/02-receptura.png` | Gram setiap bahan seketika | Tepung dan air dari starter dihitung dalam persentase baker |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/03-prowadzenie-ciemny.png` | Selangkah demi selangkah | Apa yang dilakukan, berapa lama, dan notifikasi saat langkah selesai |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/04-doktor.png` | Perbaikan untuk roti berikutnya | Gejala, penyebab, dan satu perubahan untuk hasil panggangan berikutnya |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/05-zakwasy.png` | Starter selalu siap tepat waktu | Takaran pemberian makan dan pengingat setelah 12 jam |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/06-dziennik.png` | Setiap hasil panggangan tercatat | Nilai bongkah roti dan “Panggang lagi” dengan satu ketukan |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/id/iphone-6.3/07-offline.png` | Tanpa akun dan tanpa internet | Tanpa iklan dan pelacakan; data hanya di ponsel Anda |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
