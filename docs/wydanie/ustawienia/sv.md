# Karta ustawień App Store: Swedish (`sv`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/sv.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Swedish**, kod ASC `sv`; język aplikacji `sv` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Swedish (jeśli go nie ma: „Not Localized” → Swedish → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — SWE (Sweden)
- Język dodatkowy: 0 — —
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 22 / 30 znaków · App Information

```text
Bagaren: Bröd & Surdeg
```

### Podtytuł (Subtitle) · 26 / 30 znaków · App Information

```text
Bakplan, degkalkyl & timer
```

### Słowa kluczowe (Keywords) · 100 / 100 bajtów (95 znaków) · wersja 1.0

```text
jäsning,deg,mjöl,rågbröd,levain,poolish,bakprocent,limpa,degtemperatur,påminnelse,pizza,bakning
```

### Tekst promocyjny (Promotional Text) · 161 / 170 znaków · wersja 1.0

```text
Ställ in när brödet ska vara klart: Bagaren räknar ut mängderna, planerar bakåt och säger till när varje steg är slut. Inget konto, inget internet, ingen reklam.
```

### Opis (Description) · 3201 / 4000 znaków · wersja 1.0

```text
Bagaren guidar dig genom surdegsbaket från recept till limpa: räknar ut mängderna, gör upp en plan och håller koll på tiden när telefonen sover. Fungerar utan konto och utan internet, utan reklam och utan spårning. Dina recept, surdegsgrunder och din dagbok stannar bara i din telefon.

RECEPT OCH MÄNGDER
Du väljer ett av 15 grundrecept (surdeg, råg, jäst, pizza och söta) eller ett eget. Du anger antal limpor eller mjölvikt, och Bagaren ger dig gram mjöl, vatten, surdegsgrund, salt och jäst. Bagarprocenten räknar med mjölet och vattnet i surdegsgrunden och i fördegen. Bagaren anger också vattentemperaturen för den degtemperatur du vill uppnå.

PLAN FRÅN TIDEN ”KLART”
Du väljer när brödet ska vara klart, och Bagaren räknar bakåt fram starttiden för varje steg. Jästiden beror på temperaturen i köket. Om ett steg som kräver dina händer infaller på natten (som standard mellan 23:00 och 07:00) föreslår Bagaren en längre tid i kylskåpet. Om tiden inte räcker anger Bagaren den tidigaste möjliga tiden.

STEG FÖR STEG
Bagaren visar det aktuella steget: vad du ska göra, hur lång tid det tar och vad som kommer sedan. Om du tillåter notiser säger Bagaren till när steget är slut, även när telefonen är låst. I ett steg som kräver dina händer släcks inte guideskärmen. Steg med hett kärl eller rå deg har en varning. Rågbröd (mer än hälften av mjölet är rågmjöl) har egna steg utan vikningar. Ett steg som du bekräftat av misstag kan du ångra, och när du öppnar appen igen återgår den till det aktuella steget.

SURDEGSGRUNDER
Du kan ha flera surdegsgrunder. Bagaren anger mängderna för matning i förhållandet 1:1:1, 1:2:2, 1:3:3 eller 1:5:5. När surdegsgrunden har fördubblat sin volym markerar Bagaren den som redo för degen. Efter 12 timmar på bänken utan matning påminner Bagaren dig med en notis. En ny surdegsgrund startar du dag för dag. Bagaren följer försiktighetsprincipen: vid beläggning, missfärgning eller ruttnande lukt rekommenderar Bagaren att du slänger surdegsgrunden.

BRÖDDOKTORN
Kompakt inkråm och blek skorpa? Du markerar symtomen, och Bröddoktorn pekar ut ett av 9 fel, förklarar orsaken och anger vad du ska ändra nästa gång. Fyra räddningsprotokoll hjälper när degen får problem under jäsningen. Surdegsdoktorn hjälper när något med surdegsgrunden oroar dig.

BAKDAGBOK
Du betygsätter varje limpa: stjärnor, inkråm, skorpa och smakprofil. Bakdagboken visar statistik, och ”Baka igen” öppnar samma recept.

DINA DATA
Bagaren sparar de 10 senaste automatiska säkerhetskopiorna i telefonen. Du kan exportera all data till en fil och importera från en fil, och exportera bakhistoriken som CSV. Enheter: gram och °C eller uns och °F.

BRA ATT VETA
Bagaren fungerar på iPhone och synkar inte data mellan enheter; du flyttar data med en säkerhetskopia. Utan tillstånd för notiser visar Bagaren slutet på ett steg bara när skärmen är öppen.

ÅTKOMST OCH KÖP
Basic är gratis för alltid, utan provperiod. Pro lägger till planering, skötsel av surdegsgrunden, fler surdegsgrunder och fler recept. Pro är ett månads- eller årsabonnemang eller ett engångsköp för livstid i App Store.
Användarvillkor (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Språk: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk sv … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/01-plan.png` | Brödet klart när du vill | Bakåtschema utan steg mitt i natten |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/02-receptura.png` | Gram för varje ingrediens direkt | Mjöl och vatten i surdegsgrunden räknas in i bagarprocenten |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/03-prowadzenie-ciemny.png` | Ett steg i taget | Vad du ska göra, hur lång tid det tar och en notis när steget är slut |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/04-doktor.png` | Förbättra nästa limpa | Symtom, orsak och en ändring till nästa bak |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/05-zakwasy.png` | Surdegsgrunden alltid redo i tid | Mängder för matning och påminnelse efter 12 timmar |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/06-dziennik.png` | Varje bak sparat | Betygsätt limpan och ”Baka igen” med ett tryck |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sv/iphone-6.3/07-offline.png` | Inget konto, inget internet | Ingen reklam eller spårning; data bara i din telefon |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).
