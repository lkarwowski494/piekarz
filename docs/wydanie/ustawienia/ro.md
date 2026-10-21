# Karta ustawień App Store: Romanian (`ro`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/ro.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Romanian**, kod ASC `ro`; język aplikacji `ro` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Romanian (jeśli go nie ma: „Not Localized” → Romanian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — ROU (Romania)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 21 / 30 znaków · App Information

```text
Brutar: Pâine cu maia
```

### Podtytuł (Subtitle) · 29 / 30 znaków · App Information

```text
Plan de coacere și calculator
```

### Słowa kluczowe (Keywords) · 95 / 100 bajtów (91 znaków) · wersja 1.0

```text
pizza,hidratare,aluat,secară,levain,poolish,temporizator,rețetă,fermentare,drojdie,franzelă
```

### Tekst promocyjny (Promotional Text) · 165 / 170 znaków · wersja 1.0

```text
Setează ora la care vrei pâinea gata: Brutar calculează cantitățile, face planul invers și te anunță la finalul fiecărui pas. Fără cont, fără internet, fără reclame.
```

### Opis (Description) · 3203 / 4000 znaków · wersja 1.0

```text
Brutar te ghidează prin coacerea pâinii cu maia naturală, de la rețetă la pâine: calculează cantitățile, face planul și ține evidența timpului când telefonul doarme. Funcționează fără cont și fără internet, fără reclame și fără urmărire. Rețetele, maialele și jurnalul tău rămân doar pe telefonul tău.

REȚETE ȘI CANTITĂȚI
Alegi una dintre cele 15 rețete de bază (cu maia, de secară, cu drojdie, pizza și dulci) sau una proprie. Setezi numărul de pâini sau masa făinii, iar Brutar îți dă gramele de făină, apă, maia, sare și drojdie. Procentele brutărești includ făina și apa din maia și din levain. Brutar îți dă și temperatura apei pentru temperatura aluatului pe care vrei s-o obții.

PLAN DE LA ORA „GATA”
Alegi când trebuie să fie gata pâinea, iar Brutar calculează invers ora de start a fiecărui pas. Durata fermentării depinde de temperatura din bucătărie. Când un pas care are nevoie de mâinile tale cade noaptea (implicit între 23:00 și 07:00), Brutar îți propune un timp mai lung la frigider. Când timpul nu ajunge, îți dă cea mai devreme oră posibilă.

GHIDARE PAS CU PAS
Brutar îți arată pasul curent: ce ai de făcut, cât durează și ce urmează. Dacă permiți notificările, te anunță la finalul pasului și când telefonul e blocat. Într-un pas care are nevoie de mâinile tale, ecranul de ghidare nu se stinge. Pașii cu vas fierbinte sau aluat crud au un avertisment. Pâinea de secară (peste jumătate din făină este făină de secară) are pași proprii, fără împăturire. Un pas confirmat din greșeală îl poți anula, iar la redeschidere aplicația revine la pasul curent.

MAIA NATURALĂ
Poți ține mai multe maiale. Brutar îți dă cantitățile pentru hrănire în proporție de 1:1:1, 1:2:2, 1:3:3 sau 1:5:5. Când maiaua își dublează volumul, Brutar o marchează ca gata pentru aluat. După 12 ore pe blat fără hrănire, îți amintește de ea printr-o notificare. O maia nouă o pornești zi de zi. Brutar aplică principiul precauției: la depunere, decolorare sau miros de putred te sfătuiește să arunci maiaua.

DOCTORUL PÂINII
Miezul e compact, iar coaja palidă? Bifezi simptomele, iar Doctorul Pâinii indică unul dintre cele 9 defecte, explică cauza și îți spune ce să schimbi data viitoare. Doctorul maiei te ajută când ceva la maia te neliniștește.

JURNAL
Evaluezi fiecare pâine: stele, miez, coajă și profil de gust. Jurnalul arată statistici, iar „Coace din nou” deschide aceeași rețetă.

DATELE TALE
Brutar păstrează pe telefon ultimele 10 copii de rezervă automate. Poți exporta toate datele într-un fișier și le poți importa din fișier, iar istoricul coacerilor îl poți exporta ca CSV. Unități: grame și °C sau uncii și °F.

BINE DE ȘTIUT
Brutar funcționează pe iPhone și nu sincronizează datele între dispozitive; datele le muți cu fișierul de backup. Fără permisiunea pentru notificări, Brutar arată finalul pasului doar pe ecranul deschis.

ACCES ȘI ACHIZIȚIE
Accesul complet îl oferă un abonament lunar sau anual ori o achiziție unică pe viață în App Store. Abonamentul poate începe cu o perioadă de probă gratuită (ofertă introductivă App Store pentru utilizatorii eligibili). Fără achiziție poți răsfoi istoricul coacerilor, importa un fișier, precum și exporta și șterge datele tale.

Limbi: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk ro … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/01-plan.png` | Pâinea gata la ora ta | Plan invers, fără pași în miezul nopții |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/02-receptura.png` | Gramele fiecărui ingredient, imediat | Făina și apa din maia naturală, incluse în procentele brutărești |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/03-prowadzenie-ciemny.png` | Un pas pe rând | Ce ai de făcut, cât durează și notificare la finalul pasului |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/04-doktor.png` | Ce să corectezi la următoarea pâine | Simptome, cauză și o singură schimbare pentru următoarea coacere |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/05-zakwasy.png` | Maia naturală mereu gata la timp | Cantități pentru hrănire și memento după 12 ore |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/06-dziennik.png` | Fiecare coacere, consemnată | Evaluarea pâinii și „Coace din nou” dintr-o atingere |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ro/iphone-6.3/07-offline.png` | Fără cont și fără internet | Fără reclame și urmărire; datele doar pe telefonul tău |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
