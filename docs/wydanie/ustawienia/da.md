# Karta ustawień App Store: Danish (`da`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/da.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Danish**, kod ASC `da`; język aplikacji `da` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Danish (jeśli go nie ma: „Not Localized” → Danish → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — DNK (Denmark)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 23 / 30 znaków · App Information

```text
Bageren: Brød og surdej
```

### Podtytuł (Subtitle) · 27 / 30 znaków · App Information

```text
Bageplan og opskriftsregner
```

### Słowa kluczowe (Keywords) · 93 / 100 bajtów (88 znaków) · wersja 1.0

```text
hævning,dej,mel,rugbrød,levain,poolish,bagerprocent,pizza,påmindelse,brødbagning,hævetid
```

### Tekst promocyjny (Promotional Text) · 169 / 170 znaków · wersja 1.0

```text
Vælg, hvornår brødet skal være klar: Bageren beregner mængderne, planlægger baglæns og giver besked, når hvert trin slutter. Ingen konto, intet internet, ingen reklamer.
```

### Opis (Description) · 3287 / 4000 znaków · wersja 1.0

```text
Bageren guider dig gennem bagningen af surdejsbrød fra opskrift til færdigt brød: appen beregner mængderne, lægger planen og holder øje med tiden, mens telefonen sover. Den virker uden konto og uden internet, uden reklamer og uden sporing. Dine opskrifter, surdeje og din bagedagbog bliver kun på din telefon.

OPSKRIFTER OG MÆNGDER
Vælg en af 15 grundopskrifter (surdej, rug, gær, pizza og søde) eller din egen. Indstil antal brød eller melmængden, og Bageren angiver gram mel, vand, surdej, salt og gær. Bagerprocenten medregner mel og vand fra surdejen og fra fordejen. Bageren angiver også vandtemperaturen til den dejtemperatur, du ønsker.

PLAN FRA »KLAR«-TIDSPUNKTET
Vælg, hvornår brødet skal være klar, og Bageren regner baglæns frem til starttidspunktet for hvert trin. Fermenteringstiden afhænger af temperaturen i køkkenet. Når et trin, der kræver dine hænder, falder om natten (som standard mellem 23:00 og 07:00), foreslår Bageren en længere tid i køleskabet. Hvis der er for lidt tid, angiver Bageren det tidligst mulige tidspunkt.

TRIN-FOR-TRIN-VEJLEDNING
Bageren viser det aktuelle trin: hvad du skal gøre, hvor længe det tager, og hvad der kommer bagefter. Hvis du tillader notifikationer, giver appen besked, når et trin slutter, også når telefonen er låst. Under et trin, der kræver dine hænder, slukker vejledningsskærmen ikke. Trin med varmt kogegrej eller rå dej har en advarsel. Rugbrød (over halvdelen af melet er rugmel) har egne trin uden foldninger. Et trin, du har bekræftet ved en fejl, kan du fortryde, og når du åbner appen igen, vender den tilbage til det aktuelle trin.

SURDEJE
Hold styr på flere surdeje. Bageren angiver fodringsmængder i forholdet 1:1:1, 1:2:2, 1:3:3 eller 1:5:5. Når surdejen har fordoblet sit volumen, markerer Bageren den som klar til dejen. Efter 12 timer på køkkenbordet uden fodring minder Bageren dig om den med en notifikation. En ny surdej kan du starte dag for dag. Bageren følger et forsigtighedsprincip: ved belægning, misfarvning eller rådden lugt råder appen dig til at smide surdejen ud.

BRØDDOKTOR
Er krummen kompakt og skorpen bleg? Markér symptomerne, og Brøddoktor peger på en af 9 fejl, forklarer årsagen og fortæller, hvad du skal ændre næste gang. Fire redningsprotokoller hjælper, når dejen har problemer under fermenteringen. Surdejsdoktoren hjælper, når noget ved din surdej bekymrer dig.

BAGEDAGBOG
Bedøm hvert brød: stjerner, krumme, skorpe og smagsprofil. Bagedagbogen viser statistik, og »Bag igen« åbner den samme opskrift.

DINE DATA
Bageren gemmer de 10 seneste automatiske sikkerhedskopier på telefonen. Du kan eksportere alle data til en fil og importere dem fra en fil, og du kan eksportere din bagehistorik som CSV. Enheder: gram og °C eller ounce og °F.

GODT AT VIDE
Bageren kører på iPhone og synkroniserer ikke data mellem enheder; du flytter data med en backupfil. Uden tilladelse til notifikationer viser Bageren kun slutningen af et trin på den åbne skærm.

ADGANG OG KØB
Basic er gratis for altid, uden prøveperiode. Pro tilføjer planlægning, pleje af surdej, flere surdeje og opskrifter. Pro er et månedligt eller årligt abonnement eller et engangskøb med livstidsadgang i App Store.
Brugsbetingelser (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Sprog: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk da … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/01-plan.png` | Brødet klar, når du vil | Baglæns plan uden trin midt om natten |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/02-receptura.png` | Gram for hver ingrediens straks | Mel og vand fra surdejen tæller med i bagerprocenten |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/03-prowadzenie-ciemny.png` | Ét trin ad gangen | Hvad du skal gøre, hvor længe det tager, og besked, når trinnet slutter |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/04-doktor.png` | Hvad du kan forbedre i næste brød | Symptomer, årsag og én ændring til næste bagning |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/05-zakwasy.png` | Surdejen altid klar til tiden | Fodringsmængder og påmindelse efter 12 timer |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/06-dziennik.png` | Hver bagning gemt | Bedøm brødet og »Bag igen« med ét tryk |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/da/iphone-6.3/07-offline.png` | Uden konto og uden internet | Ingen reklamer eller sporing; data kun på din telefon |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
