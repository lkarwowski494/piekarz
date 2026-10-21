# Karta ustawień App Store: Dutch (`nl-NL`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/nl-NL.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Dutch**, kod ASC `nl-NL`; język aplikacji `nl` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Dutch (jeśli go nie ma: „Not Localized” → Dutch → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — NLD (Netherlands)
- Język dodatkowy: 2 — BEL (Belgium), SUR (Suriname)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 25 / 30 znaków · App Information

```text
Bakker: Zuurdesem & Brood
```

### Podtytuł (Subtitle) · 24 / 30 znaków · App Information

```text
Bakplanning en rekenhulp
```

### Słowa kluczowe (Keywords) · 95 / 100 bajtów (95 znaków) · wersja 1.0

```text
desem,starter,deeg,pizzadeeg,roggebrood,hydratatie,bakkerspercentage,recept,timer,rijzen,bakken
```

### Tekst promocyjny (Promotional Text) · 161 / 170 znaków · wersja 1.0

```text
Kies hoe laat je brood klaar moet zijn: Bakker berekent de hoeveelheden, plant terug en meldt het einde van elke stap. Geen account, geen internet, geen reclame.
```

### Opis (Description) · 3578 / 4000 znaków · wersja 1.0

```text
Bakker begeleidt je bij het bakken van zuurdesembrood, van recept tot brood: de app berekent de hoeveelheden, maakt een schema en houdt de tijd in de gaten terwijl je telefoon slaapt. Werkt zonder account en zonder internet, zonder advertenties en zonder tracking. Je recepten, zuurdesemstarters en dagboek blijven alleen op je telefoon.

RECEPTEN EN HOEVEELHEDEN
Kies een van de 15 basisrecepten (zuurdesem, rogge, gist, pizza en zoet) of je eigen recept. Stel het aantal broden of het meelgewicht in, en Bakker geeft de grammen meel, water, zuurdesemstarter, zout en gist. Het bakkerspercentage telt het meel en water uit de zuurdesemstarter en uit het levain mee. Bakker geeft ook de watertemperatuur voor de gewenste deegtemperatuur.

SCHEMA VANAF HET TIJDSTIP „KLAAR”
Kies wanneer het brood klaar moet zijn, en Bakker rekent voor elke stap het starttijdstip terug. De fermentatietijd hangt af van de temperatuur in je keuken. Valt een stap waarbij je zelf aan de slag moet in de nacht (standaard tussen 23:00 en 06:30), dan stelt Bakker een langere tijd in de koelkast voor. Is er te weinig tijd, dan geeft Bakker het vroegst mogelijke tijdstip.

STAP VOOR STAP BEGELEID
Bakker toont de huidige stap: wat je moet doen, hoe lang het duurt en wat daarna komt. Sta je meldingen toe, dan laat Bakker ook bij een vergrendelde telefoon weten wanneer een stap klaar is. Het begeleidingsscherm blijft aan tijdens het bakken. Stappen met heet kookgerei of rauw deeg hebben een waarschuwing. Roggebrood (meer dan de helft van het meel is roggemeel) heeft eigen stappen zonder vouwen. Een per ongeluk bevestigde stap maak je ongedaan, en als je de app opnieuw opent, start die bij de huidige stap.

ZUURDESEMSTARTERS
Beheer meerdere zuurdesemstarters. Bakker geeft de hoeveelheden om te voeden in de verhouding 1:1:1, 1:2:2, 1:3:3 of 1:5:5. Is de zuurdesemstarter in volume verdubbeld, dan markeert Bakker hem als klaar voor het deeg. Staat hij 12 uur op het aanrecht zonder te zijn gevoed, dan krijg je een herinnering via een melding. Een nieuwe zuurdesemstarter zet je dag voor dag op. Bakker hanteert het voorzorgsprincipe: bij aanslag, verkleuring of een rotte geur adviseert de app de zuurdesemstarter weg te gooien.

BRODDOKTER
Compact kruim en een bleke korst? Vink de symptomen aan, en de Broddokter wijst een van 9 bakfouten aan, legt de oorzaak uit en zegt wat je de volgende keer anders doet. Vier reddingsprotocollen helpen als het deeg tijdens de fermentatie in de problemen komt. De Starterdokter helpt als iets aan je zuurdesemstarter je zorgen baart.

BAKDAGBOEK
Beoordeel elk brood: sterren, kruim, korst en smaakprofiel. Het Bakdagboek toont statistieken, en „Opnieuw bakken” opent hetzelfde recept.

JOUW GEGEVENS
Bakker bewaart de laatste 10 automatische back-ups op je telefoon. Al je gegevens exporteer je naar een bestand en importeer je uit een bestand, en je bakgeschiedenis exporteer je als CSV. Eenheden: grammen en °C of ounces en °F.

GOED OM TE WETEN
Bakker werkt op iPhone en synchroniseert geen gegevens tussen apparaten; je zet gegevens over met een back-upbestand. Zonder toestemming voor meldingen toont Bakker het einde van een stap alleen op het geopende scherm.

TOEGANG EN AANKOOP
Volledige toegang krijg je met een maand- of jaarabonnement of een eenmalige levenslange aankoop in de App Store. Een abonnement kan beginnen met een gratis proefperiode (introductieaanbod van de App Store voor wie in aanmerking komt). Zonder aankoop kun je je bakgeschiedenis bekijken, een bestand importeren en je gegevens exporteren en verwijderen.

Talen: 35.
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

Pliki w repo. Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/01-plan.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/01-plan.png` | Brood klaar wanneer jij wilt | Teruggerekend schema zonder stappen midden in de nacht |
| 2 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/02-receptura.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/02-receptura.png` | Direct de grammen van elk ingrediënt | Meel en water uit de zuurdesemstarter tellen mee in het bakkerspercentage |
| 3 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/03-prowadzenie-ciemny.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/03-prowadzenie-ciemny.png` | Eén stap tegelijk | Wat te doen, hoe lang het duurt en een melding als de stap klaar is |
| 4 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/04-doktor.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/04-doktor.png` | Wat beter kan bij je volgende brood | Symptomen, oorzaak en één aanpassing voor je volgende baksel |
| 5 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/05-zakwasy.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/05-zakwasy.png` | Zuurdesemstarter altijd op tijd klaar | Hoeveelheden voor het voeden en een herinnering na 12 uur |
| 6 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/06-dziennik.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/06-dziennik.png` | Elk baksel vastgelegd | Beoordeel het brood en „Opnieuw bakken” met één tik |
| 7 | `docs/wydanie/zrzuty/nl-NL/iphone-6.9/07-offline.png` | `docs/wydanie/zrzuty/nl-NL/iphone-6.3/07-offline.png` | Geen account, geen internet | Geen reclame of tracking; je gegevens alleen op je telefoon |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (3): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).
