# Karta ustawień App Store: English (Australia) (`en-AU`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/en-AU.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **English (Australia)**, kod ASC `en-AU`; język aplikacji `en` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → English (Australia) (jeśli go nie ma: „Not Localized” → English (Australia) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 2 — AUS (Australia), NZL (New Zealand)
- Język dodatkowy: 0 — —
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

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

### Opis (Description) · 3221 / 4000 znaków · wersja 1.0

```text
Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage. It works without an account and without the internet, with no ads and no tracking. Your recipes, starters and journal stay only on your phone.

RECIPES AND AMOUNTS
Choose one of 15 base recipes (sourdough, rye, yeast, pizza and sweet) or your own. Set the number of loaves or the flour weight, and Baker gives the grams of flour, water, starter, salt and yeast. The baker's percentage counts the flour and water in your starter and in a preferment. Baker also gives the water temperature for the dough temperature you want.

A PLAN FROM THE "READY" TIME
Choose when the bread should be ready, and Baker works back to the start time of every step. Fermentation time follows your kitchen temperature. When a hands-on step falls at night (23:00 to 06:30 by default), Baker suggests a longer time in the fridge. If there is not enough time, it gives the earliest possible ready time.

STEP-BY-STEP GUIDANCE
Baker shows the current step: what to do, how long it takes and what comes next. If you allow notifications, it tells you when a step ends even when your phone is locked. The guidance screen stays on during the bake. Steps with a hot pot or raw dough carry a safety warning. Rye bread (more than half rye flour) gets its own steps with no folding. You can undo a step confirmed by mistake, and the app returns to the current step when you open it again.

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
Full access comes with a monthly or yearly subscription or a one-time lifetime purchase on the App Store. A subscription may start with a free trial (App Store introductory offer for eligible users). Without a purchase you can browse your bake history, import a file, and export and delete your data.

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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk en-AU … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/01-plan.png` | Bread Ready When You Want It | A plan worked back from your time, with no steps at night |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/02-receptura.png` | Grams for Every Ingredient | Flour and water from your starter counted in the baker's percentage |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/03-prowadzenie-ciemny.png` | One Step at a Time | What to do, how long it takes and a notification when it ends |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/04-doktor.png` | Make Your Next Loaf Better | Symptoms, the cause and one change for your next bake |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/05-zakwasy.png` | Your Starter, Ready on Time | Feeding amounts and a reminder after 12 hours |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/06-dziennik.png` | Every Bake on Record | Rate the loaf and tap "Bake Again" |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/en-AU/iphone-6.3/07-offline.png` | No Account, No Internet | No ads or tracking; your data stays on your phone |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| AUS (Australia) | 1,99 / 9,99 / 22,99 AUD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
