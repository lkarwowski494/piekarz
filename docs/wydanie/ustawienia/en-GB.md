# Karta ustawień App Store: English (U.K.) (`en-GB`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/en-GB.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **English (U.K.)**, kod ASC `en-GB`; język aplikacji `en` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → English (U.K.) (jeśli go nie ma: „Not Localized” → English (U.K.) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).
- **Weryfikacja natywna (nazwa pod ikoną, rola 09):** języki aplikacji bez lokalizacji strony App Store — bułgarski, estoński, litewski, łotewski, serbski. Ich storefronty (m.in. BGR, EST, LTU, LVA, SRB) pokazują tę kartę albo kartę języka dodatkowego; nazwę pod ikoną w tych językach sprawdza osoba mówiąca językiem.

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 135 — AFG (Afghanistan), ALB (Albania), DZA (Algeria), AGO (Angola), AIA (Anguilla), ATG (Antigua and Barbuda), ARM (Armenia), AZE (Azerbaijan), BHS (Bahamas), BHR (Bahrain), BRB (Barbados), BLR (Belarus), BEL (Belgium), BLZ (Belize), BEN (Benin), BMU (Bermuda), BTN (Bhutan), BIH (Bosnia and Herzegovina), BWA (Botswana), VGB (British Virgin Islands), BRN (Brunei), BGR (Bulgaria), BFA (Burkina Faso), KHM (Cambodia), CPV (Cape Verde), CYM (Cayman Islands), TCD (Chad), COD (Congo, Democratic Republic of the), COG (Congo, Republic of the), HRV (Croatia), CYP (Cyprus), CZE (Czechia), DNK (Denmark), DMA (Dominica), EGY (Egypt), EST (Estonia), SWZ (Eswatini), FJI (Fiji), FIN (Finland), GMB (Gambia), GEO (Georgia), GHA (Ghana), GRC (Greece), GRD (Grenada), GNB (Guinea-Bissau), GUY (Guyana), HUN (Hungary), ISL (Iceland), IND (India), IDN (Indonesia), IRQ (Iraq), IRL (Ireland), ISR (Israel), JAM (Jamaica), JOR (Jordan), KAZ (Kazakhstan), KEN (Kenya), XKS (Kosovo), KWT (Kuwait), KGZ (Kyrgyzstan), LAO (Laos), LVA (Latvia), LBN (Lebanon), LBR (Liberia), LBY (Libya), LTU (Lithuania), LUX (Luxembourg), MDG (Madagascar), MWI (Malawi), MYS (Malaysia), MDV (Maldives), MLI (Mali), MLT (Malta), MRT (Mauritania), MUS (Mauritius), FSM (Micronesia), MDA (Moldova), MNG (Mongolia), MNE (Montenegro), MSR (Montserrat), MAR (Morocco), MOZ (Mozambique), MMR (Myanmar), NAM (Namibia), NRU (Nauru), NPL (Nepal), NER (Niger), NGA (Nigeria), MKD (North Macedonia), NOR (Norway), OMN (Oman), PAK (Pakistan), PLW (Palau), PNG (Papua New Guinea), PHL (Philippines), POL (Poland), QAT (Qatar), ROU (Romania), RWA (Rwanda), STP (Sao Tome and Principe), SAU (Saudi Arabia), SEN (Senegal), SRB (Serbia), SYC (Seychelles), SLE (Sierra Leone), SGP (Singapore), SVK (Slovakia), SVN (Slovenia), SLB (Solomon Islands), ZAF (South Africa), LKA (Sri Lanka), KNA (St. Kitts and Nevis), LCA (St. Lucia), VCT (St. Vincent and the Grenadines), SUR (Suriname), TJK (Tajikistan), TZA (Tanzania), THA (Thailand), TON (Tonga), TTO (Trinidad and Tobago), TUN (Tunisia), TUR (Türkiye), TKM (Turkmenistan), TCA (Turks and Caicos Islands), UGA (Uganda), UKR (Ukraine), ARE (United Arab Emirates), GBR (United Kingdom), URY (Uruguay), UZB (Uzbekistan), VUT (Vanuatu), VNM (Vietnam), YEM (Yemen), ZMB (Zambia), ZWE (Zimbabwe)
- Język dodatkowy: 37 — ARG (Argentina), AUS (Australia), AUT (Austria), BOL (Bolivia), BRA (Brazil), CMR (Cameroon), CHL (Chile), CHN (China mainland) — niedostępny (D-057), COL (Colombia), CRI (Costa Rica), CIV (Cote d’Ivoire), DOM (Dominican Republic), ECU (Ecuador), SLV (El Salvador), FRA (France), GAB (Gabon), DEU (Germany), GTM (Guatemala), HND (Honduras), HKG (Hong Kong), ITA (Italy), MAC (Macau), MEX (Mexico), NLD (Netherlands), NZL (New Zealand), NIC (Nicaragua), PAN (Panama), PRY (Paraguay), PER (Peru), PRT (Portugal), KOR (Republic of Korea), RUS (Russia), ESP (Spain), SWE (Sweden), CHE (Switzerland), TWN (Taiwan), VEN (Venezuela)
- Dostępność: wszystkie storefronty tej karty poza oznaczonymi „niedostępny” (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 30 / 30 znaków · App Information

```text
Baker: Sourdough Bread Planner
```

### Podtytuł (Subtitle) · 29 / 30 znaków · App Information

```text
Dough Calculator & Bake Timer
```

### Słowa kluczowe (Keywords) · 100 / 100 bajtów (100 znaków) · wersja 1.0

```text
starter,hydration,schedule,levain,tracker,feeding,loaf,recipe,rye,pizza,proving,wholemeal,percentage
```

### Tekst promocyjny (Promotional Text) · 161 / 170 znaków · wersja 1.0

```text
Set the time you want bread ready: Baker works out the amounts, plans every step back from it and tells you when each step ends. No account, no internet, no ads.
```

### Opis (Description) · 3185 / 4000 znaków · wersja 1.0

```text
Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. It works without an account and without the internet, with no ads and no tracking. Your recipes, starters and journal stay only on your phone.

RECIPES AND AMOUNTS
Choose one of 15 base recipes (sourdough, rye, yeast, pizza and sweet) or your own. Set the number of loaves or the flour weight, and Baker gives the grams of flour, water, starter, salt and yeast. The baker's percentage counts the flour and water in your starter and in a preferment. Baker also gives the water temperature for the dough temperature you want.

A PLAN FROM THE "READY" TIME
Choose when the bread should be ready, and Baker works back to the start time of every step. Fermentation time follows your kitchen temperature. When a hands-on step falls at night (23:00 to 07:00 by default), Baker suggests a longer time in the fridge. If there is not enough time, it gives the earliest possible ready time.

STEP-BY-STEP GUIDANCE
Baker shows the current step: what to do, how long it takes and what comes next. If you allow notifications, it tells you when a step ends even when your phone is locked. During a hands-on step, the guidance screen stays on. Steps with a hot pot or raw dough carry a safety warning. Rye bread (more than half rye flour) gets its own steps with no folding. You can undo a step confirmed by mistake, and the app returns to the current step when you open it again.

STARTERS
Keep several starters. Baker gives feeding amounts for a 1:1:1, 1:2:2, 1:3:3 or 1:5:5 ratio. When the starter has doubled in volume, Baker marks it ready for the dough. After 12 hours on the counter without a feeding, a notification reminds you. You can start a new starter day by day. Baker follows a precautionary rule: with any film, discolouration or rotten smell, it advises you to throw the starter away.

BREAD DOCTOR
Dense crumb and a pale crust? Mark the symptoms, and the Bread Doctor names one of 9 defects, explains the cause and says what to change next time. Four rescue protocols help with dough that is in trouble during fermentation. The Starter Doctor helps when something about your starter worries you.

JOURNAL
Rate each loaf: stars, crumb, crust and flavour profile. The Journal shows statistics, and "Bake Again" opens the same recipe.

YOUR DATA
Baker keeps the last 10 automatic backups on your phone. You can export all your data to a file, import it from a file and export your bake history as CSV. Units: grams and °C or ounces and °F.

GOOD TO KNOW
Baker runs on iPhone and does not sync between devices; you move data with a backup file. Without permission for notifications, Baker shows the end of a step only on the open screen.

ACCESS AND PURCHASE
Free Basic forever. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Baker is available in 35 languages, including English, Polish, German, French, Spanish, Italian, Portuguese and Japanese.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk en-GB … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/01-plan.png` | Bread Ready When You Want It | A plan worked back from your time, with no steps at night |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/02-receptura.png` | Grams for Every Ingredient | Flour and water from your starter counted in the baker's percentage |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/03-prowadzenie-ciemny.png` | One Step at a Time | What to do, how long it takes and a notification when it ends |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/04-doktor.png` | Make Your Next Loaf Better | Symptoms, the cause and one change for your next bake |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/05-zakwasy.png` | Your Starter, Ready on Time | Feeding amounts and a reminder after 12 hours |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/06-dziennik.png` | Every Bake on Record | Rate the loaf and tap "Bake Again" |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-GB/iphone-6.3/07-offline.png` | No Account, No Internet | No ads or tracking; your data stays on your phone |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| POL (Poland) | 4,99 / 29,99 / 79,99 PLN | D-038, docs/wydanie/ceny.json |
| GBR (United Kingdom) | 0,99 / 6,99 / 14,99 GBP | D-038, docs/wydanie/ceny.json |
| AUS (Australia) | 1,99 / 9,99 / 22,99 AUD | D-038, docs/wydanie/ceny.json |
| FRA (France) | 0,99 / 7,99 / 17,99 EUR | D-038, docs/wydanie/ceny.json |
| DEU (Germany) | 0,99 / 7,99 / 17,99 EUR | D-038, docs/wydanie/ceny.json |
| MEX (Mexico) | 19 / 149 / 299 MXN | D-038, docs/wydanie/ceny.json |
| ESP (Spain) | 0,99 / 7,99 / 17,99 EUR | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (164): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
